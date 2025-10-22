"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SelectObbSheetAndDate from "./select-style-and-date";
import {
  EmployeeRecord,
  fetchDirectOpProductionData,
  getNewData,
  newData,
} from "./actions";
import { getFormattedTime } from "@/lib/utils-time";
import { getObbData } from "../../line-efficiency/_components/actions";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TableCompo from "./reportCompo";

interface ProcessedData {
  total?: number;
  operator: string;
  data: {
    diff: number;
    eff: number;
    production_date: string;
    operatorRfid: string;
    daily_total: number;
    name: string;
    LoginDate: string;
    smv: number;
    LoginTimestamp: Date;
    LogoutTimestamp: Date;
    date: string;
  }[];
}

interface AnalyticsChartProps {
  obbSheets:
    | {
        id: string;
        name: string;
      }[]
    | null;
  operators: EmployeeRecord[];
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
  lunchBreakTime:string;
  session: any;
  operatorRfid: string;
  login: string;
  logout: string;
  operation: string;
  machine: string;
  data: ProdData[];
  duration: number;
}

type SessionData = SessionGroup[];

const NewReportTable = ({ obbSheets, operators }: AnalyticsChartProps) => {
  const [startdate, setStartDate] = React.useState<string>("");
  const [enddate, setendDate] = React.useState<string>("");
  const [data, setData] = React.useState<{
    totalEfficiency: number;
    totalEarnMins: number;
    totalAvailableMins: number;
  }>();

  const [selectedDate, setSelectedDate] = useState("");

  const [obbSheetData, setObbSheetData] = useState<any>();
  const [operationData, setOperationData] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFetchProductions = async (data: {
    operatorId: string;
    date: Date;
    endDate: Date;
  }) => {
    const start = getFormattedTime(data.date.toString());
    const end = getFormattedTime(data.endDate.toString());
    setStartDate(start)
    setendDate(end)
    const ProdData = await fetchDirectOpProductionData(
      data.operatorId,
      start,
      end
    );
    console.log(ProdData);

    const grouped = groupBySessions(ProdData.data);
    console.log("Grouped Sessions:", grouped);

    const processed = processData(grouped);
    // setOperationData(processed);
    console.log("Processed Operation Data:", processed.length);
    console.log("Processed Operation Data:", processed);

    const totEFF = getTotalEfficiency(processed);
    console.log("totEff", totEFF);
    setData(totEFF)
    setOperationData(markMultipleOperations(processed));
  };

  function getTotalEfficiency(processed: ProcessedData) {
    const sessionMap = new Map<
      string,
      { earnMins: number; availableMins: number }
    >();

    processed.forEach((record) => {
      const sessionKey = `${record.loginDate}-${record.logoutDate}-${record.availableMins}`;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          earnMins: 0,
          availableMins: record.availableMins,
        });
      }

      sessionMap.get(sessionKey)!.earnMins += record.earnMins;
    });

    let totalEarnMins = 0;
    let totalAvailableMins = 0;

    sessionMap.forEach((session) => {
      totalEarnMins += session.earnMins;
      totalAvailableMins += session.availableMins;
    });


    
  const totalEfficiency = totalAvailableMins > 0 ? (totalEarnMins / totalAvailableMins) * 100 : 0;
  
     return {
    totalEarnMins: Math.round(totalEarnMins * 100) / 100,
    totalAvailableMins: Math.round(totalAvailableMins * 100) / 100,
    totalEfficiency: Math.round(totalEfficiency * 100) / 100
  };
  }

  type ProcessedData = {
    loginDate: string;
    logoutDate: string;
    operator: string;
    operatorId: string;
    operation: string;
    smv: number;
    earnMins: number;
    availableMins: number;
    efficiency: number;
    totalPcs: number;
    machine: string;
  }[];

  function markMultipleOperations(processed: ProcessedData): ProcessedData {
    // Create a map to group records by session (loginDate + logoutDate + availableMins)
    const sessionMap = new Map<string, ProcessedData>();

    processed.forEach((record) => {
      const sessionKey = `${record.loginDate}-${record.logoutDate}-${record.availableMins}`;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, []);
      }
      sessionMap.get(sessionKey)!.push(record);
    });

    // Mark operations that have multiple operations in the same session
    return processed.map((record) => {
      const sessionKey = `${record.loginDate}-${record.logoutDate}-${record.availableMins}`;
      const sessionRecords = sessionMap.get(sessionKey)!;

      // If there are multiple operations in the same session, mark them
      const hasMultipleOperations = sessionRecords.length > 1;

      return {
        ...record,
        operation:
          hasMultipleOperations && !record.operation.startsWith("*")
            ? `*${record.operation}`
            : record.operation,
      };
    });
  }

  function timeStringToMinutes(timeString: string | null | undefined): number {
  if (!timeString) {
    return 0;
  }

  const timeParts = timeString.split(" ");

  let totalMinutes = 0;

  for (const part of timeParts) {
    const value = parseInt(part); // Get the numeric value

    if (part.includes("h")) {
      totalMinutes += value * 60; // Convert hours to minutes
    } else if (part.includes("m")) {
      totalMinutes += value; // Add minutes
    } else if (part.includes("s")) {
      totalMinutes += Math.floor(value / 60); // Convert seconds to minutes
    }
  }

  return Number(totalMinutes.toFixed(2));
}

  const groupBySessions = (productionData: any[]): SessionData => {
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
            lunchBreakTime: matchedSession.lunchBreakTime,
            operatorRfid: matchedSession.operatorRfid,
            login: matchedSession.loginTimestamp,
            logout: matchedSession.logoutTimestamp,
            duration:
              (new Date(matchedSession.logoutTimestamp).getTime() -
                new Date(matchedSession.loginTimestamp).getTime()) /
              60000,
            operation: record.obbOperation.operation.name,
            machine: record.obbOperation.sewingMachine.machineId,
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

const processData = (sessions: SessionData) => {
  // Group sessions by operator and date first
  const dailyGroups = sessions.reduce((acc, session) => {
    const loginDate = new Date(session.login).toDateString(); // Get date part only
    const operatorId = session.data[0]?.operator.employeeId;
    
    if (!operatorId) return acc;
    
    const groupKey = `${operatorId}_${loginDate}`;
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    
    acc[groupKey].push(session);
    return acc;
  }, {} as Record<string, SessionData>);

  const result: any[] = [];
  
  // Track last known totalPcs for each operator-operation combination across the entire day
  const lastSessionTotals: Record<string, Record<string, number>> = {}; // operatorId -> operation -> lastTotal

  // Process each daily group
  Object.keys(dailyGroups).forEach(groupKey => {
    const dailySessions = dailyGroups[groupKey];
    
    // Sort sessions by login time within the same date
    const sortedSessions = dailySessions.sort((a, b) => 
      new Date(a.login).getTime() - new Date(b.login).getTime()
    );

    // Process each session
    for (const session of sortedSessions) {
      const lunchBreakTime = timeStringToMinutes(session.lunchBreakTime);
      const availableMins = session.duration - lunchBreakTime;
      const availableMinswithLunch = session.duration;

      // Group session data by operation to handle multiple operations per session
      const operationGroups: Record<string, typeof session.data> = {};
      
      for (const record of session.data) {
        const operationName = record.obbOperation.operation.name;
        if (!operationGroups[operationName]) {
          operationGroups[operationName] = [];
        }
        operationGroups[operationName].push(record);
      }

      // Process each operation within this session
      for (const [operationName, records] of Object.entries(operationGroups)) {
        // Since data is sorted DESC (latest first), reverse the understanding:
        const latestRecord = records[0]; // This is actually the latest/end of session
        const earliestRecord = records[records.length - 1]; // This is actually the earliest/start
        
        const operatorId = latestRecord.operator.employeeId;
        const smv = latestRecord.obbOperation.smv;
        
        // Initialize operator tracking if not exists
        if (!lastSessionTotals[operatorId]) {
          lastSessionTotals[operatorId] = {};
        }

        // Get the current session's end total
        const currentSessionEndTotal = latestRecord.totalPcs;
        const sessionStartTotal = records.length > 1 ? earliestRecord.totalPcs : 0;
        
        // Calculate production within this session
        let sessionProduction = 0;
        if (currentSessionEndTotal >= sessionStartTotal) {
          sessionProduction = currentSessionEndTotal - sessionStartTotal;
        } else {
          sessionProduction = currentSessionEndTotal;
        }

        // Get previous session total for this specific operation on this date
        const prevSessionTotal = lastSessionTotals[operatorId][operationName] || 0;
        
        let netPcs = 0;
        
        // Key logic: If we have a previous session total, check for reset
        if (prevSessionTotal > 0) {
          // Check if there was a reset (session started from 0 or low number)
          if (sessionStartTotal === 0 || sessionStartTotal < prevSessionTotal) {
            // Reset detected - use the entire current session's end total as production
            netPcs = currentSessionEndTotal;
          } else {
            // No reset - calculate incremental production from previous session
            netPcs = Math.max(currentSessionEndTotal - prevSessionTotal, 0);
          }
        } else {
          // First session for this operator-operation combination on this date
          netPcs = currentSessionEndTotal;
        }

        // Update the last known total for this operator-operation
        lastSessionTotals[operatorId][operationName] = currentSessionEndTotal;

        const earnMins = Number((netPcs * smv).toFixed(2));
        const efficiency = availableMins > 0 ? (earnMins / availableMins) * 100 : 0;

        result.push({
          loginDate: session.login,
          logoutDate: session.logout,
          operator: latestRecord.operator.name,
          operatorId: operatorId,
          operation: operationName,
          smv,
          earnMins,
          availableMins,
          availableMinswithLunch,
          efficiency: Number(efficiency.toFixed(2)),
          totalPcs: netPcs, // Actual production for this session
          machine: session.machine,
          
          // Additional debugging fields (can be removed later)
          sessionLogin: session.login,
          sessionDuration: session.duration,
          recordsInSession: records.length,
          sessionStartTotal,
          currentSessionEndTotal,
          prevSessionTotal,
          sessionProduction, // Production calculated within session only
        });
      }
    }
    
    // Reset totals for next date group (since we're processing by date)
    Object.keys(lastSessionTotals).forEach(operatorId => {
      lastSessionTotals[operatorId] = {};
    });
  });

  return result.sort((a, b) => {
    // Sort by operator ID first, then by login date, then by operation
    if (a.operatorId !== b.operatorId) {
      return a.operatorId.localeCompare(b.operatorId);
    }
    if (a.loginDate !== b.loginDate) {
      return new Date(a.loginDate).getTime() - new Date(b.loginDate).getTime();
    }
    return a.operation.localeCompare(b.operation);
  });
};

 

  // const handleDownloadPDF = async () => {
  //   if (!reportRef.current || !data.length) return;

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     const canvas = await html2canvas(reportRef.current, {
  //       scale: 2,
  //       logging: false,
  //       useCORS: true
  //     } as any);

  //     const imgWidth = 210 -20; // A4 width in mm
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);

  //     const fileName = `Operator_Monthly_Efficiency_Report_${data[0].name}_${startdate}_${enddate}.pdf`;
  //     pdf.save(fileName);
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // };

  return (
    <div>
      <div>
        <SelectObbSheetAndDate
          operators={operators}
          handleSubmit={handleFetchProductions}
        />

        {operationData.length > 0 && (
          <TableCompo
            operationData={operationData}
            obbSheetData={obbSheetData}
            enddate={enddate}
            startdate={startdate}
            data={data}
          />
        )}
      </div>
    </div>
  );
};

export default NewReportTable;
