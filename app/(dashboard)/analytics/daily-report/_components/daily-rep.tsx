"use client";

import React, { useState } from "react";
import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";

import { fetchDirectProductionData } from "@/actions/efficiency-direct-action";
import { fetchDirectProductionOpData, getObbDetails } from "./actions";
import SelectUnitLineAndDate from "@/components/dashboard/common/select-unit-line-and-date";
import { TableCompo } from "./TableCompo";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import DayProductionReportFactoryWiseViewer from "./viewer";

interface AnalyticsChartProps {
  obbSheets: {
    id: string;
    name: string;
  }[] | null;
}

interface ProdData {
  operatorRfid: string;
  timestamp: string;
  totalPcs: number;
  operator: {
    rfid: string;
    name: string;
    employeeId: string;
    operatorSessions: {
      id: string;
      operatorRfid: string;
      LoginTimestamp: string;
      LogoutTimestamp: string;
    }[];
  };
  obbOperation: {
    id: string;
    smv: number;
    operation: {
      name: string;
    };
    sewingMachine: {
      machineId: string;
    };
  };
}

interface SessionGroup {
  session: any;
  lunchBreakTime: string;
  operatorRfid: string;
  login: string;
  logout: string;
  operation: string;
  machine?: string;
  data: ProdData[];
  duration: number;
}

// New interface for operation detail rows
interface OperationDetail {
  type: 'operation';
  operator: string;
  operatorId: string;
  operation: string;
  smv: number;
  earnMins: number;
  availableMins: number;
  totalPcs: number;
  machine?: string;
  lunchBreakTime: number;
  availableMinswithLunch: number;
  sessionLogin: string;
  sessionLogout: string;
  sessionId: string; // Add unique session identifier
  sessionDuration: number;
  recordsInSession: number;
  sessionStartTotal: number;
  currentSessionEndTotal: number;
  prevSessionTotal: number;
}

// New interface for summary rows
interface OperatorSummary {
  type: 'summary';
  operator: string;
  operatorId: string;
  totalEarnMins: number;
  totalAvailableMins: number;
  efficiency: number;
  operationCount: number;
  totalPcs:number
}

// Combined type for table data
type TableRow = OperationDetail | OperatorSummary;

type SessionData = SessionGroup[];

const DailyRepCompo = ({ obbSheets }: AnalyticsChartProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [obbSheetId, setObbSheetId] = useState("");
  const [obbSheetData, setObbSheetData] = useState<any>();
  const [operationData, setOperationData] = useState<TableRow[]>([]);
    const [reportData, setReportData] = useState<{ obbSheet: any; data: any[] }[]>([]);

    const [pdfLink, setPdfLink] = useState<JSX.Element | null>(null);

  function timeStringToMinutes(timeString: string | null | undefined): number {
    if (!timeString) {
      return 0;
    }

    const timeParts = timeString.split(" ");
    let totalMinutes = 0;

    for (const part of timeParts) {
      const value = parseInt(part);

      if (part.includes("h")) {
        totalMinutes += value * 60;
      } else if (part.includes("m")) {
        totalMinutes += value;
      } else if (part.includes("s")) {
        totalMinutes += Math.floor(value / 60);
      }
    }

    return Number(totalMinutes.toFixed(2));
  }

  const handleFetchProductions = async ({
    unit,lineId,
    date,
  }: {
    unit: string;
    lineId:string
    date: Date;
  }) => {
    date.setDate(date.getDate() + 1);
    const formattedDate = date.toISOString().split("T")[0];

    setSelectedDate(formattedDate);

    // const obbData = await getObbDetails(obbSheetId);
    // setObbSheetData(obbData);
    // console.log("OBB Details:", obbData);

    const response = await fetchDirectProductionOpData(lineId, formattedDate);


    setObbSheetData(response.line?.name);

    console.log("Raw Production Data:", response.data);
    
    const grouped = groupBySessions(response.data);
    console.log("Grouped Sessions:", grouped);

    const processed = processData(grouped);
    console.log("Processed Operation Data:", processed.length);
    console.log("Processed Operation Data:", processed);

    const finalData = createGroupedTableData(processed);
    console.log("Final Grouped Data:", finalData);
    const sessionTotals = calculateSessionTotals(processed);
    setOperationData(finalData);
        console.log('Session Totals:', sessionTotals);
                    setReportData(reportData);


        setTimeout(() => {
    console.log('State after updates:');
    console.log('selectedDate state:', selectedDate);
    console.log('obbSheetData state:', obbSheetData);
    console.log('operationData state length:', operationData.length);
    
    const pdfElement = generatePdfReport(finalData, response.line?.name, formattedDate);
    setPdfLink(pdfElement);
  }, 10);
     
  };



  function calculateSessionTotals(data: ReturnType<typeof processData>): any {
  const sessionMap = new Map<string, {
    availableMins: number;
    offStandMins: number;
    earnMins: number;
    operations: Set<string>;
  }>();

  // Process each entry to group by unique sessions
  data.forEach(entry => {
    const { operatorId, availableMins, earnMins, operation } = entry;
    
    // Create unique session key using operatorRfid and availableMins
    // This assumes same operator with same duration = same session
    const sessionKey = `${operatorId}_${availableMins}_${operation}`;

    if (!sessionMap.has(sessionKey)) {
      // First time seeing this session
      sessionMap.set(sessionKey, {
        availableMins,
        offStandMins:  0,
        earnMins,
        operations: new Set([operation])
      });
    } else {
      // Session already exists, add earn minutes but keep same available/offstand time
      const session = sessionMap.get(sessionKey)!;
      session.earnMins += earnMins;
      session.operations.add(operation);
    }
  });

  // Calculate totals from unique sessions
  let totalAvailableMins = 0;
  let totalEarnMins = 0;
  let totalOffStandMins = 0;

  sessionMap.forEach(session => {
    totalAvailableMins += session.availableMins;
    totalEarnMins += session.earnMins;
    totalOffStandMins += session.offStandMins;
  });

  // Convert to hours
  const totalAvailableHours = Number((totalAvailableMins / 60).toFixed(2));
  const totalProductionStandardHours = Number((totalEarnMins / 60).toFixed(2));
  const totalOffStandHours = Number((totalOffStandMins / 60).toFixed(2));

  // Calculate efficiencies
  const totalOverallEfficiency = totalAvailableMins > 0 
    ? Number(((totalEarnMins / totalAvailableMins) * 100).toFixed(2))
    : 0;

  const adjustedAvailableMins = totalAvailableMins - totalOffStandMins;
  const totalOnStandEfficiency = adjustedAvailableMins > 0
    ? Number(((totalEarnMins / adjustedAvailableMins) * 100).toFixed(2))
    : 0;

  return {
    totalAvailableHours,
    totalProductionStandardHours,
    totalOffStandHours,
    totalOverallEfficiency,
    totalOnStandEfficiency,
    totalAvailableMins,
    totalEarnMins,
    totalOffStandMins
  };
}

  // New function to create grouped table data with summaries
  const createGroupedTableData = (processedData: OperationDetail[]): TableRow[] => {
    const result: TableRow[] = [];
    const operatorGroups: { [operatorId: string]: OperationDetail[] } = {};

    // Group by operator
    processedData.forEach(item => {
      if (!operatorGroups[item.operatorId]) {
        operatorGroups[item.operatorId] = [];
      }
      operatorGroups[item.operatorId].push(item);
    });

    // Sort operators by ID
    const sortedOperatorIds = Object.keys(operatorGroups).sort();

    // Process each operator group
    sortedOperatorIds.forEach(operatorId => {
      const operations = operatorGroups[operatorId];
      
      // Mark duplicates if operator has multiple operations
      const isDuplicateOperator = operations.length > 1;
      
      // Add individual operation rows
      operations.forEach(operation => {
        result.push({
          ...operation,
          operator: isDuplicateOperator && !operation.operator.startsWith('*') 
            ? `*${operation.operator}` 
            : operation.operator
        });
      });

      // Calculate total available mins considering session overlap
      const totalEarnMins = operations.reduce((sum, op) => sum + op.earnMins, 0);
      const totalPcs = operations.reduce((sum, op) => sum + op.totalPcs, 0);
      
      // Group by session to avoid double-counting available minutes for same session
      const sessionGroups: { [sessionId: string]: OperationDetail[] } = {};
      operations.forEach(op => {
        if (!sessionGroups[op.sessionId]) {
          sessionGroups[op.sessionId] = [];
        }
        sessionGroups[op.sessionId].push(op);
      });
      
      // Sum available minutes only once per unique session
      const totalAvailableMins = Object.values(sessionGroups).reduce((sum, sessionOps) => {
        // For each session, take available minutes only once (they should be the same for same session)
        return sum + sessionOps[0].availableMins;
      }, 0);
      
      const efficiency = totalAvailableMins > 0 ? (totalEarnMins / totalAvailableMins) * 100 : 0;
          const uniqueOperationNames = new Set(operations.map(op => op.operation));

      const summaryRow: OperatorSummary = {
        type: 'summary',
        operator: operations[0].operator.replace('*', ''), // Remove asterisk for summary
        operatorId,
        totalPcs,
        totalEarnMins: Number(totalEarnMins/60),
        totalAvailableMins: Number(totalAvailableMins/60),
        efficiency: Number(efficiency.toFixed(2)),
              operationCount: uniqueOperationNames.size
      };

      result.push(summaryRow);
    });

    return result;
  };

  const groupBySessions = (productionData: any[]): SessionData => {
    console.log(productionData);
    const sessionGroups: Record<string, SessionGroup> = {};

    productionData.forEach((record) => {
      const recordTime = new Date(record.timestamp).getTime();
      const sessions = record.operator?.OperatorEffectiveTime || [];

      const matchedSession = sessions.find((session: any) => {
        const loginTime = new Date(session.loginTimestamp).getTime();
        const logoutTime = new Date(session.logoutTimestamp).getTime();
        return loginTime <= recordTime && recordTime <= logoutTime;
      });

      if (matchedSession) {
        const sessionId = matchedSession.id;
        const operationId = record.obbOperation?.id;
        const key = `${sessionId}_${operationId}`;

        if (!sessionGroups[key]) {
          sessionGroups[key] = {
            session: matchedSession,
            operatorRfid: matchedSession.operatorRfid,
            login: matchedSession.loginTimestamp,
            logout: matchedSession.logoutTimestamp,
            lunchBreakTime: matchedSession.lunchBreakTime,
            
            duration: Math.min(
              (new Date(matchedSession.logoutTimestamp).getTime() -
                new Date(matchedSession.loginTimestamp).getTime()) / 60000,
              1440
            ),
            operation: record.obbOperation.operation.name,
            data: [],
          };
        }

        sessionGroups[key].data.push(record);
      }
    });

    return Object.values(sessionGroups).sort((a, b) =>
      a.operatorRfid.localeCompare(b.operatorRfid)
    );
  };

const processData = (sessions: SessionData): OperationDetail[] => {
  const sortedSessions = [...sessions].sort((a, b) => {
    const opCompare = a.operatorRfid.localeCompare(b.operatorRfid);
    if (opCompare !== 0) return opCompare;
    return new Date(a.login).getTime() - new Date(b.login).getTime();
  });

  const result: OperationDetail[] = [];
  const lastSessionTotals: Record<string, Record<string, number>> = {};

  for (const session of sortedSessions) {
    const lunchBreakTime = timeStringToMinutes(session.lunchBreakTime);
    const availableMins = session.duration - lunchBreakTime;
    const availableMinswithLunch = session.duration;

    // Safely access the machineId (handle null sewingMachine)
    const machine =
      session.data?.[0]?.obbOperation?.sewingMachine?.machineId ?? "N/A";

    const operationGroups: Record<string, typeof session.data> = {};

    for (const record of session.data) {
      const operationName = record.obbOperation.operation.name;
      if (!operationGroups[operationName]) {
        operationGroups[operationName] = [];
      }
      operationGroups[operationName].push(record);
    }

    for (const [operationName, records] of Object.entries(operationGroups)) {
      const latestRecord = records[0];
      const earliestRecord = records[records.length - 1];

      const operatorId = latestRecord.operator.employeeId;
      const smv = latestRecord.obbOperation.smv;

      if (!lastSessionTotals[operatorId]) {
        lastSessionTotals[operatorId] = {};
      }

      const currentSessionEndTotal = latestRecord.totalPcs;
      const sessionStartTotal = records.length > 1 ? earliestRecord.totalPcs : 0;

      let sessionProduction = 0;
      if (currentSessionEndTotal >= sessionStartTotal) {
        sessionProduction = currentSessionEndTotal - sessionStartTotal;
      } else {
        sessionProduction = currentSessionEndTotal;
      }

      const prevSessionTotal = lastSessionTotals[operatorId][operationName] || 0;

      let netPcs = 0;
      if (prevSessionTotal > 0) {
        if (sessionStartTotal === 0 || sessionStartTotal < prevSessionTotal) {
          netPcs = currentSessionEndTotal;
        } else {
          netPcs = Math.max(currentSessionEndTotal - prevSessionTotal, 0);
        }
      } else {
        netPcs = currentSessionEndTotal;
      }

      lastSessionTotals[operatorId][operationName] = currentSessionEndTotal;

      const earnMins = Number((netPcs * smv).toFixed(2));

      // Safely re-check machine for each record in case structure differs
      const safeMachine =
        latestRecord?.obbOperation?.sewingMachine?.machineId ?? machine;

      result.push({
        type: "operation",
        operator: latestRecord.operator.name,
        operatorId,
        operation: operationName,
        smv,
        earnMins,
        availableMins,
        totalPcs: netPcs,
        machine: safeMachine,
        lunchBreakTime,
        availableMinswithLunch,
        sessionLogin: session.login,
        sessionLogout: session.logout,
        sessionId: session.session.id,
        sessionDuration: session.duration,
        recordsInSession: records.length,
        sessionStartTotal,
        currentSessionEndTotal,
        prevSessionTotal,
      });
    }
  }

  return result.sort((a, b) => a.operatorId.localeCompare(b.operatorId));
};


  
const generatePdfReport = (operationData: any, obbSheetData: any, selectedDate: string) => {
  return (
    <PDFDownloadLink
      document={
        <TableCompo
          operationData={operationData}
          obbSheetData={obbSheetData}
          selectedDate={selectedDate}
        />
      }
      fileName="Overall_Efficiency_Report.pdf"
    >
      {({ loading }) => (loading ? "Preparing document..." : "Download PDF Report")}
    </PDFDownloadLink>
  );
};
  return (
    <div className="p-4 space-y-4">
      <SelectUnitLineAndDate handleSubmit={handleFetchProductions} />
      {operationData.length > 0 && (
<>
 {/* <TableCompo operationData={operationData} obbSheetData={obbSheetData} selectedDate={selectedDate}/> */}
 <div className='space-x-4'>
                        {pdfLink && (
                            <Button variant="default">
                                {pdfLink}
                            </Button>
                        )}
                    </div>
                    <div className='w-full pdf-viewer'>
                                            <DayProductionReportFactoryWiseViewer operationData={operationData} obbSheetData={obbSheetData} selectedDate={selectedDate}/>

                    </div>
</>
        
       
      )}
    </div>
  );
};

export default DailyRepCompo;