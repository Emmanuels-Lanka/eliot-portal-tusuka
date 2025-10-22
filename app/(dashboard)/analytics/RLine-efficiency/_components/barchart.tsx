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

const BarChartGraphEfficiencyRate = ({
  date,
  obbSheet,
}: BarChartGraphProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(50);
  const [isSubmitting, setisSubmitting] = useState<boolean>(false);
  const [obbData, setObbData] = useState<ObbSheet[]>([]);
  const [reportDate,setReportDate] = useState<string>((""))
 

 


  const Fetchdata = async () => {
    try {
      setisSubmitting(true);


      const data = await getAllData(date.from,obbSheet)
      console.log(data?.merged)
      setReportDate(date.from)
      calcTotalTime(data?.merged ?? [])




      
      // const login = await getLogin(date.from, date.to, obbSheet);
      // const newd = await getNew(date.from, date.to, obbSheet);

      // const newMapLast = newd.flatMap((n) => {
      //   const foundEntries = login.filter(
      //     (l) => l.operatorRfid === n.operatorRfid
      //   );
      //   if (foundEntries.length > 0) {
      //     return foundEntries.map((found) => ({
      //       ...n,
      //       name: found.name, // Add the name from the second query
      //       eid: found.eid, // Add the employee ID from the second query
      //       login: found.login, // Add the min login timestamp
      //       logout: n.timestamp, // Add the max logout timestamp
      //       offStandTime: found.offstandtime, // Add the off-stand time
      //     }));
      //   }
      //   return []; // Skip entries without matching `login` data
      // });

      // console.log("first",newMapLast)
      const obbData = await getObbData(obbSheet);
      setObbData(obbData);

      // console.log("obbData",obbData)

      // const newMap = newMapLast.map((d) => {
      //   const production = Number(d.sum);

      //   const earnMins = production * d.smv;
      //   const earnHours = Number((earnMins / 60).toFixed(2));

      //   const { hours, minutes } = timeDifferenceInMinutes(d.login, d.logout);

      //   const offStand = timeStringToMinutes(d.offStandTime);
      //   const offStandHours = Number((offStand / 60).toFixed(2));

      //   const ovlEff = Math.max(
      //     0,
      //     Number(((earnMins / minutes) * 100).toFixed(2))
      //   );
      //   const onStndEff = Math.max(
      //     0,
      //     Number(((earnMins / (minutes - offStand)) * 100).toFixed(2))
      //   );

      //   return {
      //     ...d,
      //     production: production,
      //     earnMins,
      //     minutes,
      //     hours,
      //     offStand,
      //     ovlEff,
      //     onStndEff,
      //     earnHours,
      //     offStandHours,
      //   };
      // });

      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setisSubmitting(false);
  };

  const calcTotalTime = (data:any [])=>{


     const groupedByOperator = new Map<string, any[]>();

  // Step 1: Group by operatorRfid
  for (const entry of data) {
    if (!groupedByOperator.has(entry.operatorRfid)) {
      groupedByOperator.set(entry.operatorRfid, []);
    }
    groupedByOperator.get(entry.operatorRfid)!.push(entry);
  }

const result: any[] = []; 

for (const [operatorRfid, records] of Array.from(groupedByOperator.entries())) {
    const operator = records[0].operator;
    
    // Step 2: Get earliest login and latest logout
    const loginTimes = records.map(r => new Date(r.loginTimestamp));
    const logoutTimes = records.map(r => new Date(r.logoutTimestamp));

    const earliestLogin = new Date(Math.min(...loginTimes.map(d => d.getTime())));
    const latestLogout = new Date(Math.max(...logoutTimes.map(d => d.getTime())));

    const { hours, minutes } = timeDifferenceInMinutes(earliestLogin.toString(), latestLogout.toString());

    const totalTimeMins = minutes
    const offStand = timeStringToMinutes(records[0].offStandTime);

    const prod = records[0].prod;


   const operations = Object.entries(prod) as [string, any[]][];

    const hasMultipleOps = operations.length > 1;

    operations.forEach(([operationName, prodEntries], index) => {
      const pin = hasMultipleOps  ? "* " : "";
      const opId =  prodEntries[0].operator.employeeId; // ← add this line
      const seqNo = prodEntries[0].obbOperation.seqNo;
      const firstEntry = prodEntries[0];
      const totalProduction = Number(firstEntry.totalPcs);
      const smv = Number(firstEntry.obbOperation.smv);

      const earnMins = totalProduction * smv;
      const earnHours = Number((earnMins / 60).toFixed(2));
      const offStandHours = Number((offStand / 60).toFixed(2));

      const ovlEff = Math.max(0, Number(((earnMins / minutes) * 100).toFixed(2)));
      const onStndEff = Math.max(0, Number(((earnMins / (minutes - offStand)) * 100).toFixed(2)));

      result.push({
        date:date.from,
        opId,
        seqNo,
        operator,
        operatorRfid,
        operation: operationName,
        production: totalProduction,
        earnMins,
        earnHours,
        totalTimeMins,
        minutes,
        hours,
        offStand,
        offStandHours,
        ovlEff,
        onStndEff,
        login: earliestLogin.toString(),
        logout: latestLogout.toString(),
        smv
      });
    });


    // console.log(earliestLogin,latestLogout,operator,operatorRfid,)
  }
  console.log(result)


  setChartData(result);




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
              <TableDemo date={date} obbData={obbData} tableProp={chartData} />
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

export default BarChartGraphEfficiencyRate;
