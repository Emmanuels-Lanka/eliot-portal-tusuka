"use client";

import React, { useState } from "react";
import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";

import { fetchDirectProductionData } from "@/actions/efficiency-direct-action";

import SelectUnitLineAndDate from "@/components/dashboard/common/select-unit-line-and-date";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";

import { TableCompo } from "./TableCompo";
import DayProductionReportFactoryWiseViewer from "./viewer";
import { fetchLineEndPass, getStyleDataByLine } from "./actions";
import { fetchDirectProductionOpData } from "../../daily-report/_components/actions";

interface AnalyticsChartProps {
  obbSheets:
    | {
        id: string;
        name: string;
      }[]
    | null;
}

interface ProdData {
  operatorRfid: string;
  timestamp: string;
  totalPcs: number;
  operator: {
    designation: string;
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
      code: string;
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
  offStandTime: string;
  productionDownTime: string;
  mechanicDownTime: string;
}

// New interface for operation detail rows
interface OperationDetail {
  type: "operation";
  operator: string;
  offStandTime: number;
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
  code: string;
  desi: string;
  mechDown: number;
  prodDown: number;
}

// New interface for summary rows
interface OperatorSummary {
  type: "summary";
  operator: string;
  totalOnStandEfficiency: number;
  totalOffStandMins: number;
  operatorId: string;
  totalEarnMins: number;
  totalAvailableMins: number;
  efficiency: number;
  operationCount: number;
  totalPcs: number;
  code: string;
  desi: string;
  totalmechDown: number;
  totalprodDown: number;
}

// Combined type for table data
type TableRow = OperationDetail | OperatorSummary;

type SessionData = SessionGroup[];

const DailyRepCompo = ({ obbSheets }: AnalyticsChartProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [lineEndData, setlineEndData] = useState(0);
  const [obbSheetData, setObbSheetData] = useState<any>();
  const [obbSmvInfo, setObbSmvInfo] = useState<{ name: string;
  totalSMV: number}[]>([]);
  const [operationData, setOperationData] = useState<TableRow[]>([]);
  const [reportData, setReportData] = useState<
    { obbSheet: any; data: any[] }[]
  >([]);

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
    unit,
    lineId,
    date,
  }: {
    unit: string;
    lineId: string;
    date: Date;
  }) => {
    date.setDate(date.getDate() + 1);
    const formattedDate = date.toISOString().split("T")[0];

    setSelectedDate(formattedDate);

    // const obbData = await getObbDetails(obbSheetId);
    // setObbSheetData(obbData);
    // console.log("OBB Details:", obbData);

    const response = await fetchDirectProductionOpData(lineId, formattedDate);
    console.log(response)
   
 
    setObbSheetData(response.line?.name);

    console.log("Raw Production Data:", response.data);

    const grouped = groupBySessions(response.data);
    console.log("Grouped Sessions:", grouped);

    const processed = processData(grouped);
    console.log("Processed Operation Data:", processed.length);
    console.log("Processed Operation Data:", processed);

    const finalData = createGroupedTableData(processed);


    


    // console.log("Final Grouped Data:", finalData);
    const sessionTotals = calculateSessionTotals(processed);
    setOperationData(finalData);
    console.log("Session Totals:", sessionTotals);
    setReportData(reportData);

    setTimeout(() => {
      // console.log("State after updates:");
      // console.log("selectedDate state:", selectedDate);
      // console.log("obbSheetData state:", obbSheetData);
      // console.log("operationData state length:", operationData.length);

      const pdfElement = generatePdfReport(
        finalData,
        response.line?.name,
        formattedDate,
       
      );
      setPdfLink(pdfElement);
    }, 10);
  };

  function calculateSessionTotals(data: ReturnType<typeof processData>): any {
    const sessionMap = new Map<
      string,
      {
        availableMins: number;
        offStandMins: number;
        earnMins: number;
        operations: Set<string>;
      }
    >();

    // Process each entry to group by unique sessions
    data.forEach((entry) => {
      const { operatorId, availableMins, earnMins, operation } = entry;

      // Create unique session key using operatorRfid and availableMins
      // This assumes same operator with same duration = same session
      const sessionKey = `${operatorId}_${availableMins}_${operation}`;

      if (!sessionMap.has(sessionKey)) {
        // First time seeing this session
        sessionMap.set(sessionKey, {
          availableMins,
          offStandMins: 0,
          earnMins,
          operations: new Set([operation]),
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

    sessionMap.forEach((session) => {
      totalAvailableMins += session.availableMins;
      totalEarnMins += session.earnMins;
      totalOffStandMins += session.offStandMins;
    });

    // Convert to hours
    const totalAvailableHours = Number((totalAvailableMins / 60).toFixed(2));
    const totalProductionStandardHours = Number(
      (totalEarnMins / 60).toFixed(2)
    );
    const totalOffStandHours = Number((totalOffStandMins / 60).toFixed(2));

    // Calculate efficiencies
    const totalOverallEfficiency =
      totalAvailableMins > 0
        ? Number(((totalEarnMins / totalAvailableMins) * 100).toFixed(2))
        : 0;

    const adjustedAvailableMins = totalAvailableMins - totalOffStandMins;
    const totalOnStandEfficiency =
      adjustedAvailableMins > 0
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
      totalOffStandMins,
    };
  }

  // MODIFIED: This function now sorts operators by efficiency (high to low)
  const createGroupedTableData = (
    processedData: OperationDetail[]
  ): TableRow[] => {
    const operatorGroups: { [operatorId: string]: OperationDetail[] } = {};

    // 1. Group operations by operator ID
    processedData.forEach((item) => {
      if (!operatorGroups[item.operatorId]) {
        operatorGroups[item.operatorId] = [];
      }
      operatorGroups[item.operatorId].push(item);
    });

    // 2. Create operator "blocks" containing their details and a summary row
    const operatorBlocks: {
      summary: OperatorSummary;
      details: OperationDetail[];
    }[] = [];

    Object.keys(operatorGroups).forEach((operatorId) => {
      const operations = operatorGroups[operatorId];
      const detailRows: OperationDetail[] = [];

      const isDuplicateOperator = operations.length > 1;

      // Create detail rows for each operation
      operations.forEach((operation) => {
        detailRows.push({
          ...operation,
          operator:
            isDuplicateOperator && !operation.operator.startsWith("*")
              ? `*${operation.operator}`
              : operation.operator,
        });
      });

      // Group by session to calculate unique available minutes
      const sessionGroups: { [sessionId: string]: OperationDetail[] } = {};
      operations.forEach((op) => {
        if (!sessionGroups[op.sessionId]) {
          sessionGroups[op.sessionId] = [];
        }
        sessionGroups[op.sessionId].push(op);
      });

      // Calculate totals for the summary row
      const totalEarnMins = operations.reduce(
        (sum, op) => sum + op.earnMins,
        0
      );
      const totalPcs = operations.reduce((sum, op) => sum + op.totalPcs, 0);

      const totalAvailableMins = Object.values(sessionGroups).reduce(
        (sum, sessionOps) => sum + sessionOps[0].availableMins,
        0
      );
      const totalOffStandMins = Object.values(sessionGroups).reduce(
        (sum, sessionOps) => sum + sessionOps[0].offStandTime,
        0
      );
      const totalprodDown = Object.values(sessionGroups).reduce(
        (sum, sessionOps) => sum + sessionOps[0].prodDown,
        0
      );
      const totalmechDown = Object.values(sessionGroups).reduce(
        (sum, sessionOps) => sum + sessionOps[0].mechDown,
        0
      );

      const efficiency =
        totalAvailableMins > 0
          ? (totalEarnMins / totalAvailableMins) * 100
          : 0;
      const adjustedAvailableMins = totalAvailableMins - totalOffStandMins;
      const totalOnStandEfficiency =
        adjustedAvailableMins > 0
          ? (totalEarnMins / adjustedAvailableMins) * 100
          : 0;

      const summaryRow: OperatorSummary = {
        type: "summary",
        operator: operations[0].operator.replace("*", ""),
        operatorId,
        totalPcs,
        totalOffStandMins: totalOffStandMins / 60,
        totalEarnMins: totalEarnMins / 60,
        totalprodDown: totalprodDown / 60,
        totalmechDown: totalmechDown / 60,
        totalAvailableMins: totalAvailableMins / 60,
        totalOnStandEfficiency: Number(totalOnStandEfficiency.toFixed(2)),
        efficiency: Number(efficiency.toFixed(2)),
        operationCount: new Set(operations.map((op) => op.operation)).size,
        code: operations[0].code,
        desi: operations[0].desi,
      };

      operatorBlocks.push({ summary: summaryRow, details: detailRows });
    });

    // 3. Sort the blocks based on the summary efficiency in descending order
    operatorBlocks.sort((a, b) => b.summary.efficiency - a.summary.efficiency);

    // 4. Flatten the sorted blocks back into a single array for the table
    const result: TableRow[] = [];
    operatorBlocks.forEach((block) => {
      result.push(...block.details, block.summary);
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
        const productionDownTime = matchedSession.productionDownTime;
        const mechanicDownTime = matchedSession.mechanicDownTime;

        if (!sessionGroups[key]) {
          sessionGroups[key] = {
            session: matchedSession,
            operatorRfid: matchedSession.operatorRfid,
            login: matchedSession.loginTimestamp,
            logout: matchedSession.logoutTimestamp,
            lunchBreakTime: matchedSession.lunchBreakTime,
            offStandTime: matchedSession.offStandTime,
            productionDownTime: productionDownTime,
            mechanicDownTime: mechanicDownTime,
            duration: Math.min(
              (new Date(matchedSession.logoutTimestamp).getTime() -
                new Date(matchedSession.loginTimestamp).getTime()) /
                60000,
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

  const processData = (sessions: any[]): OperationDetail[] => {
  const sortedSessions = [...sessions].sort((a, b) => {
    const opCompare = a.operatorRfid.localeCompare(b.operatorRfid);
    if (opCompare !== 0) return opCompare;
    return new Date(a.login).getTime() - new Date(b.login).getTime();
  });

  const aggregated: Record<string, any> = {};
  const lastSessionTotals: Record<string, Record<string, number>> = {};

  for (const session of sortedSessions) {
    const lunchBreakTime = timeStringToMinutes(session.lunchBreakTime);
    const availableMins = session.duration - lunchBreakTime;
    const availableMinswithLunch = session.duration;
    const offStandTime = timeStringToMinutes(session.offStandTime);
    const prodDown = timeStringToMinutes(session.productionDownTime);
    const mechDown = timeStringToMinutes(session.mechanicDownTime);

    const operationGroups: Record<string, typeof session.data> = {};
    for (const record of session.data) {
      const operationName = record.obbOperation.operation.name;
      if (!operationGroups[operationName]) operationGroups[operationName] = [];
      operationGroups[operationName].push(record);
    }

    for (const [operationName, records] of Object.entries(operationGroups)) {
      const latestRecord = records[0];
      const operatorId = latestRecord.operator.employeeId;
      const smv = latestRecord.obbOperation.smv;

      // Safely access machineId
      const machine = latestRecord.obbOperation.sewingMachine
        ? latestRecord.obbOperation.sewingMachine.machineId
        : "N/A"; // fallback if no machine

      const code = latestRecord.obbOperation.operation.code;
      const desi = latestRecord.operator.designation;

      if (!lastSessionTotals[operatorId]) lastSessionTotals[operatorId] = {};
      const prevSessionTotal = lastSessionTotals[operatorId][operationName] || 0;
      const currentSessionEndTotal = latestRecord.totalPcs;
      const sessionStartTotal = records.length > 1 ? records[records.length - 1].totalPcs : 0;

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

      const key = `${operatorId}-${operationName}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          type: "operation",
          operator: latestRecord.operator.name,
          operatorId,
          operation: operationName,
          smv,
          totalPcs: netPcs,
          earnMins,
          machine,
          availableMins,
          availableMinswithLunch,
          offStandTime,
          prodDown,
          mechDown,
          lunchBreakTime,
          code,
          desi,
        };
      } else {
        const agg = aggregated[key];
        agg.totalPcs += netPcs;
        agg.earnMins += earnMins;
        agg.availableMins += availableMins;
        agg.availableMinswithLunch += availableMinswithLunch;
        agg.offStandTime += offStandTime;
        agg.prodDown += prodDown;
        agg.mechDown += mechDown;
        agg.lunchBreakTime += lunchBreakTime;
      }
    }
  }

  return Object.values(aggregated).sort((a, b) =>
    a.operatorId.localeCompare(b.operatorId)
  );
};


  const generatePdfReport = (
    operationData: any,
    obbSheetData: any,
    selectedDate: string,
  
  ) => {
    return (
      <PDFDownloadLink
        document={
          <TableCompo
            operationData={operationData}
            obbSheetData={obbSheetData}
            selectedDate={selectedDate}
            lineEndData={lineEndData}
            obbSmvInfo={obbSmvInfo}
          />
        }
        fileName="DailylineindividualEfficiencyReport.pdf"
      >
        {({ loading }) =>
          loading ? "Preparing document..." : "Download PDF Report"
        }
      </PDFDownloadLink>
    );
  };


function  extractObbSheetInfo(data: any[]): any[] {
  return data.map(item => {
    const sheet = item.obbOperation.obbSheet;
    return {
      name: sheet.name,
      totalSMV: sheet.totalSMV
    };
  });
}


  











  return (
    <div className="p-4 space-y-4">
      <SelectUnitLineAndDate handleSubmit={handleFetchProductions} />
      {operationData.length > 0 && (
        <>
          {/* <TableCompo operationData={operationData} obbSheetData={obbSheetData} selectedDate={selectedDate}/> */}
          <div className="space-x-4">
            {pdfLink && <Button variant="default">{pdfLink}</Button>}
          </div>
          <div className="w-full pdf-viewer">
            <DayProductionReportFactoryWiseViewer
              operationData={operationData}
              obbSheetData={obbSheetData}
              lineEndData={lineEndData}
              selectedDate={selectedDate}
              obbSmvInfo={obbSmvInfo}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DailyRepCompo;