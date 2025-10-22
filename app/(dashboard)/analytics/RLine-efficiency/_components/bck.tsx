"use client";
// import { FaPlus, FaMinus } from 'react-icons/fa';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { use, useEffect, useState } from "react";
import {
    fetchDirectProductionOpData,
  getAllData,
  getFinalData,
  getLogin,
  getNew,
  getObbData,
  OperatorRfidData,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import React, { useRef } from "react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { count } from "console";
import { TableDemo } from "./table-compo";
import { ObbSheet } from "@prisma/client";

const chartConfig = {
  target: {
    label: "No of Target",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Defects Per Hundred Units   ",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;
type BarChartData = {
  name: string;
  count: number;
  target: number;
  ratio: number;
  seqNo?: string;
};
interface BarChartGraphProps {
  date: { from: string; to: string };
  obbSheet?: any;
  unit?: string;
}

export type defectData = {
  target: number;
  count: number;
};
export type EfficiencyData = {
  operatorRfid: string;
  name: string;
  login: string;
  logout: string;
  offStandTime: string;
  downTime: string;
  mechanic: string;
};

export interface DataRecord {
  seqNo: number;

  operatorRfid: string;

  operation: string;
  name: string;

  smv: number;

  count: number;

  type: string;
}

export interface TablePropType {
  operation: string;
  smv: number;
  count: number;
  availableHours: number;
  offStand: number;
  onStndEff: number;
  operator: string;
  ovlEff: number;
  stdHours: number;
  seqNo: number;
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
  operatorRfid: string;
  login: string;
  logout: string;
  operation: string;
  machine?: string;
  data: ProdData[];
  duration: number;
  offStandTime:string;
  lunchBreakTime?:string;
}

type SessionData = SessionGroup[];

export type ExtendedOperatorRfidData = OperatorRfidData & {
  production: number;
  earnMins: number;
  minutes: number;
  hours: number;
  offStand: number;
  ovlEff: number;
  onStndEff: number;
  earnHours: number;
  offStandHours: number;
  operator:any
  opId:string
  date:string
};
  type OperatorSummary = {
  operator: string;
  operatorId: string;
  totalEarnMins: number;
  totalAvailableMins: number;
  efficiency: number;
  onStandEfficiency:number
};
export interface tableType {
  earnMinute: number;

  logout: string;

  login: string;

  name: string;

  offStandTime: string;

  operatorRfid: string;

  seqNo: number;

  smv: number;

  count: string;
}

function timeDifferenceInMinutes(
  minTime: string,
  maxTime: string
): { hours: number; minutes: number } {
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);

  let diffMs = maxDate.getTime() - minDate.getTime();

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0 };
  }

  // Total minutes before deduction
  let totalMinutes = diffMs / (1000 * 60);

  // Subtract 1 hour for lunch if over 2 hours
  if (totalMinutes > 120) {
    totalMinutes -= 60;
  }

  // Cap at 1440 minutes (24 hours)
  totalMinutes = Math.min(totalMinutes, 1440);

  const hours = Number((totalMinutes / 60).toFixed(2));
  const minutes = Math.round(totalMinutes);

  return {
    hours,
    minutes
  };
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

const BarChartGraphEfficiencyRatetst = ({
  date,
  obbSheet,
}: BarChartGraphProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(50);
  const [isSubmitting, setisSubmitting] = useState<boolean>(false);
  const [obbData, setObbData] = useState<ObbSheet[]>([]);
  const [footerData,setfooterData] = useState<SessionTotals>()
 

 


  const Fetchdata = async () => {
    try {
      setisSubmitting(true);

        const prodData = await fetchDirectProductionOpData(obbSheet,date.from)
        console.log(",a",prodData)
        console.log("asdasd",obbSheet)
        const grouped = groupBySessions(prodData.data);
        console.log("Grouped Sessions:", grouped);

        const processed = processData(grouped);
    // setOperationData(processed);
        console.log("Processed Operation Data:", processed.length);
        console.log("Processed Operation Data:", processed);



        const summaries = summarizeEfficiencies(processed);
        console.log("qqqq",summaries);

        const sessionTotals = calculateSessionTotals(processed);
        console.log('Session Totals:', sessionTotals);
          setChartData(summaries);
        setfooterData(sessionTotals)

        // const data = await getAllData(date.from,obbSheet)
        // console.log(data?.merged)
        // setReportDate(summaries)
        // calcTotalTime(data?.merged ?? [])




      

      const obbData = await getObbData(obbSheet);
      setObbData(obbData);

     
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setisSubmitting(false);
  };


  type SessionTotals = {
  totalAvailableHours: number;
  totalProductionStandardHours: number;
  totalOffStandHours: number;
  totalOverallEfficiency: number;
  totalOnStandEfficiency: number;
  totalAvailableMins: number;
  totalEarnMins: number;
  totalOffStandMins: number;
};

function calculateSessionTotals(data: ReturnType<typeof processData>): SessionTotals {
  const sessionMap = new Map<string, {
    availableMins: number;
    offStandMins: number;
    earnMins: number;
    operations: Set<string>;
  }>();

  // Process each entry to group by unique sessions
  data.forEach(entry => {
    const { operatorRfid, availableMins, offStandTime, earnMins, operation } = entry;
    
    // Create unique session key using operatorRfid and availableMins
    // This assumes same operator with same duration = same session
    const sessionKey = `${operatorRfid}_${availableMins}`;

    if (!sessionMap.has(sessionKey)) {
      // First time seeing this session
      sessionMap.set(sessionKey, {
        availableMins,
        offStandMins: offStandTime ?? 0,
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




   const groupBySessions = (productionData: any[]): SessionData => {

    console.log(productionData)
    const sessionGroups: Record<string, SessionGroup> = {};

    productionData.forEach((record) => {
      const recordTime = new Date(record.timestamp).getTime();
      const sessions = record.operator?.OperatorEffectiveTime || [];

      const matchedSession = sessions.find((session:any) => {
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
            offStandTime: matchedSession.offStandTime,
            lunchBreakTime: matchedSession.lunchBreakTime,
            duration:
              Math.min(
                    (new Date(matchedSession.logoutTimestamp).getTime() -
                      new Date(matchedSession.loginTimestamp).getTime()) / 60000,
                    1440
                  ),
            operation: record.obbOperation.operation.name,
            // machine: record.obbOperation.sewingMachine.machineId,
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
  // Sort all sessions by operatorId and login time (ascending - oldest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const opCompare = a.operatorRfid.localeCompare(b.operatorRfid);
    if (opCompare !== 0) return opCompare;
    return new Date(a.login).getTime() - new Date(b.login).getTime();
  });

  const result: any[] = [];
  
  // Track last known totalPcs for each operator-operation combination across sessions
  const lastSessionTotals: Record<string, Record<string, number>> = {}; // operatorId -> operation -> lastTotal

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

      // Get previous session total for this specific operation
      const prevSessionTotal = lastSessionTotals[operatorId][operationName] || 0;
      
      let netPcs = 0;
      
      // Key logic: If we have a previous session total, check for reset
      if (prevSessionTotal > 0) {
        // Check if there was a reset (session started from 0 or low number)
        if (sessionStartTotal === 0 || sessionStartTotal < prevSessionTotal) {
          // Reset detected - use the entire current session's end total as production
          netPcs = currentSessionEndTotal;
        } else {
          // No reset - calculate incremental production
          netPcs = Math.max(currentSessionEndTotal - prevSessionTotal, 0);
        }
      } else {
        // First session for this operator-operation combination
        netPcs = currentSessionEndTotal;
      }

      // Update the last known total for this operator-operation
      lastSessionTotals[operatorId][operationName] = currentSessionEndTotal;
      const offStandTime = timeStringToMinutes(session.offStandTime)
      const earnMins = Number((netPcs * smv).toFixed(2));
      const efficiency = availableMins > 0 ? (earnMins / availableMins) * 100 : 0;

      result.push({
        operator: latestRecord.operator.name,
        offStandTime,
        operatorId: operatorId,
        operation: operationName,
        smv,
        earnMins,
        availableMins,
        efficiency,
        totalPcs: netPcs,
        machine: session.machine,
        lunchBreakTime,
        availableMinswithLunch,
        sessionLogin: session.login, // Add this for debugging
        sessionDuration: session.duration,
        recordsInSession: records.length, // Add this for debugging
        sessionStartTotal, // Add for debugging
        currentSessionEndTotal, // Add for debugging  
        prevSessionTotal, // Add for debugging
      });
    }
  }

  return result.sort((a, b) => a.operatorId.localeCompare(b.operatorId));
};


// const processData = (sessions: SessionData) => {
//   // Sort all sessions by operatorId, operation, and login time
//   const sorted = [...sessions].sort((a, b) => {
//     const opCompare = a.operatorRfid.localeCompare(b.operatorRfid);
//     if (opCompare !== 0) return opCompare;
//     return new Date(a.login).getTime() - new Date(b.login).getTime();
//   });

//   const result: any[] = [];
//   const lastCounts: Record<string, number> = {}; // key: operatorId_operation
  
//   for (const session of sorted) {
//     const operatorRfid = session.data[0].operatorRfid
//     const firstRecord = session.data[0];
//     const operatorId = firstRecord.operator.employeeId;
//     const operationName = firstRecord.obbOperation.operation.name;
//     const smv = firstRecord.obbOperation.smv;
//     const key = `${operatorId}_${operationName}`;
//     const offStandTime = timeStringToMinutes(session.offStandTime)
//     const lunchBreakTime = timeStringToMinutes(session.lunchBreakTime)
//     const currentTotal = firstRecord.totalPcs;
//     const prevTotal = lastCounts[key] ?? 0;
//     const netPcs = Math.max(currentTotal - prevTotal, 0); // Ensure not negative
//     lastCounts[key] = currentTotal;

//     const earnMins = Number((netPcs * smv).toFixed(2));
//     const availableMins = session.duration-lunchBreakTime;
//     const availableMinswithLunch = session.duration;
//     const efficiency = availableMins > 0 ? (earnMins / availableMins) * 100 : 0;

//     result.push({
//       operator: firstRecord.operator.name,
//       operatorId: operatorId,
//       operation: operationName,
//       smv,
//       earnMins,
//       availableMins,
//       availableMinswithLunch,
//       efficiency,
//       totalPcs: netPcs,
//       machine: session.machine,
//       offStandTime:offStandTime,
//       operatorRfid:operatorRfid,
//       lunchBreakTime
      
//     });
//   }

//   return result.sort((a, b) => a.operatorId.localeCompare(b.operatorId));
// };

function summarizeEfficiencies(data: ReturnType<typeof processData>): (OperatorSummary & { operations: string })[] {
  const summaryMap: {
    [operatorId: string]: OperatorSummary & {
      totalOffStandMins: number,
      seenSessions: Set<string>,
      operationsSet: Set<string>,
      sessionDetails: Map<string, {
        availableMins: number,
        offStandMins: number,
        operationsInSession: Set<string>
      }>
      lunchBreakTime:number
    }
  } = {};

  data.forEach(entry => {
    const { operator, operatorId, earnMins, availableMins, offStandTime, operation, operatorRfid,lunchBreakTime } = entry;

    // Create a unique session identifier using operatorRfid and availableMins
    // This assumes that same operator with same availableMins = same session
    const sessionKey = `${operatorRfid}_${availableMins}`;

    if (!summaryMap[operatorId]) {
      summaryMap[operatorId] = {
        operator,
        operatorId,
        totalEarnMins: 0,
        totalAvailableMins: 0,
        totalOffStandMins: 0,
        efficiency: 0,
        onStandEfficiency: 0,
        seenSessions: new Set(),
        operationsSet: new Set(),
        sessionDetails: new Map(),
        lunchBreakTime:0
      };
    }

    const summary = summaryMap[operatorId];

    // Always add earned minutes regardless of session
    summary.totalEarnMins += earnMins;
    summary.operationsSet.add(operation);

    // Handle session-based time calculation
    if (!summary.sessionDetails.has(sessionKey)) {
      // First time seeing this session
      summary.sessionDetails.set(sessionKey, {
        availableMins,
        offStandMins: offStandTime ?? 0,
        operationsInSession: new Set([operation])
      });
      
      // Add the session time only once
      summary.totalAvailableMins += availableMins;
      summary.totalOffStandMins += offStandTime ?? 0;
      summary.lunchBreakTime+= lunchBreakTime??0;
      summary.seenSessions.add(sessionKey);
    } else {
      // Session already exists, just add the operation to the set
      const sessionDetail = summary.sessionDetails.get(sessionKey)!;
      sessionDetail.operationsInSession.add(operation);
    }
  });

  return Object.values(summaryMap).map(({ seenSessions, operationsSet, sessionDetails, ...entry }) => {
    const { totalEarnMins, totalAvailableMins, totalOffStandMins,lunchBreakTime } = entry;

    const efficiency = totalAvailableMins > 0 ? (totalEarnMins / totalAvailableMins) * 100 : 0;
    const adjustedAvailable = totalAvailableMins - totalOffStandMins;
    const onStandEfficiency = adjustedAvailable > 0
      ? (totalEarnMins / adjustedAvailable) * 100
      : 0;

    return {
      operator: entry.operator,
      operatorId: entry.operatorId, 
      totalEarnMins,
      totalAvailableMins,
      totalOffStandMins,
      efficiency: Number(efficiency.toFixed(2)),
      onStandEfficiency: Number(onStandEfficiency.toFixed(2)),
      operations: Array.from(operationsSet).join(', '),
      lunchBreakTime
    };
  });
}



  

  useEffect(() => {
    Fetchdata();
  }, [date, obbSheet]);

  return (
    <div>
      {/* Loader */}
      {isSubmitting && (
        <div className="flex justify-center items-center w-full mt-8">
          <Loader2 className="animate-spin w-7 h-7" />
        </div>
      )}

      {/* Table / No Data */}
      {!isSubmitting && (
        <>
          {chartData.length > 0 ? (
            <div className="mb-16 p-8 bg-slate-100 rounded-lg border">
              <TableDemo date={date} obbData={obbData} tableProp={chartData} footerData={footerData} />
            </div>
          ) : (
            <div className="flex justify-center items-center mt-12 w-full">
              <p className="text-center text-slate-500">No Data Available.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BarChartGraphEfficiencyRatetst;
