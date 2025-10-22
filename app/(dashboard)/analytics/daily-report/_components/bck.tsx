// "use client";

// import React, { useState } from "react";
// import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";
// import TableCompo from "./TableCompo";
// import { fetchDirectProductionData } from "@/actions/efficiency-direct-action";
// import { getObbDetails } from "./actions";

// interface AnalyticsChartProps {
//   obbSheets: {
//     id: string;
//     name: string;
//   }[] | null;
// }

// interface ProdData {
//   operatorRfid: string;
//   timestamp: string;
//   totalPcs: number;
//   operator: {
//     rfid: string;
//     name: string;
//     employeeId: string;
//     operatorSessions: {
//       id: string;
//       operatorRfid: string;
//       LoginTimestamp: string;
//       LogoutTimestamp: string;
//     }[];
//   };
//   obbOperation: {
//     id: string;
//     smv: number;
//     operation: {
//       name: string;
//     };
//     sewingMachine: {
//       machineId: string;
//     };
//   };
// }

// interface SessionGroup {
//   session: any;
//   operatorRfid: string;
//   login: string;
//   logout: string;
//   operation: string;
//   machine?: string;
//   data: ProdData[];
//   duration: number;
// }

// type SessionData = SessionGroup[];

// const DailyRepCompo = ({ obbSheets }: AnalyticsChartProps) => {
//   const [selectedDate, setSelectedDate] = useState("");
//   const [obbSheetId, setObbSheetId] = useState("");
//   const [obbSheetData, setObbSheetData] = useState<any>();
//   const [operationData, setOperationData] = useState<any[]>([]);

//   const handleFetchProductions = async ({
//     obbSheetId,
//     date,
//   }: {
//     obbSheetId: string;
//     date: Date;
//   }) => {
//     // Adjust date
//     date.setDate(date.getDate() + 1);
//     const formattedDate = date.toISOString().split("T")[0];

//     // Save selected values
//     setSelectedDate(formattedDate);
//     setObbSheetId(obbSheetId);

//     // Fetch OBB details
//     const obbData = await getObbDetails(obbSheetId);
//     setObbSheetData(obbData);
//     console.log("OBB Details:", obbData);

//     // Fetch raw production data
//     const response = await fetchDirectProductionData(obbSheetId, formattedDate);
//     console.log("Raw Production Data:", response.data);

//     // Group and process data
//     const grouped = groupBySessions(response.data);
//     console.log("Grouped Sessions:", grouped);

//     const processed = processData(grouped);
//     // setOperationData(processed);
//     console.log("Processed Operation Data:", processed.length);
//     console.log("Processed Operation Data:", processed);

//     const summaries = summarizeEfficiencies(processed);
//     console.log("qqqq",summaries);
    
//     setOperationData(markDuplicateOperators(processed));

//   };



//   function markDuplicateOperators(processed: any): any {
//   // Count occurrences of each operatorId
//   const operatorCounts = new Map<string, number>();
  
//   processed.forEach((record:any)  => {
//     const count = operatorCounts.get(record.operatorId) || 0;
//     operatorCounts.set(record.operatorId, count + 1);
//   });
  
//   // Mark operators that appear more than once
//   return processed.map((record:any) => {
//     const isDuplicate = operatorCounts.get(record.operatorId)! > 1;
    
//     return {
//       ...record,
//       operator: isDuplicate && !record.operator.startsWith('*') 
//         ? `*${record.operator}` 
//         : record.operator
//     };
//   });
// }
//   const groupBySessions = (productionData: any[]): SessionData => {
//     const sessionGroups: Record<string, SessionGroup> = {};

//     productionData.forEach((record) => {
//       const recordTime = new Date(record.timestamp).getTime();
//       const sessions = record.operator?.operatorSessions || [];

//       const matchedSession = sessions.find((session:any) => {
//         const loginTime = new Date(session.LoginTimestamp).getTime();
//         const logoutTime = new Date(session.LogoutTimestamp).getTime();
//         return loginTime <= recordTime && recordTime <= logoutTime;
//       });

//       if (matchedSession) {
//         const sessionId = matchedSession.id;
//         const operationId = record.obbOperation?.id;
//         const key = `${sessionId}_${operationId}`;

//         if (!sessionGroups[key]) {
//           sessionGroups[key] = {
//             session: matchedSession,
//             operatorRfid: matchedSession.operatorRfid,
//             login: matchedSession.LoginTimestamp,
//             logout: matchedSession.LogoutTimestamp,
//             duration:
//               (new Date(matchedSession.LogoutTimestamp).getTime() -
//                 new Date(matchedSession.LoginTimestamp).getTime()) /
//               60000,
//             operation: record.obbOperation.operation.name,
//             // machine: record.obbOperation.sewingMachine.machineId,
//             data: [],
//           };
//         }

//         sessionGroups[key].data.push(record);
//       }
//     });

//     return Object.values(sessionGroups).sort((a, b) =>
//       a.operatorRfid.localeCompare(b.operatorRfid)
//     );
//   };

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
//     const firstRecord = session.data[0];
//     const operatorId = firstRecord.operator.employeeId;
//     const operationName = firstRecord.obbOperation.operation.name;
//     const smv = firstRecord.obbOperation.smv;
//     const key = `${operatorId}_${operationName}`;

//     const currentTotal = firstRecord.totalPcs;
//     const prevTotal = lastCounts[key] ?? 0;
//     const netPcs = Math.max(currentTotal - prevTotal, 0); // Ensure not negative
//     lastCounts[key] = currentTotal;

//     const earnMins = Number((netPcs * smv).toFixed(2));
//     const availableMins = session.duration;
//     const efficiency = availableMins > 0 ? (earnMins / availableMins) * 100 : 0;

//     result.push({
//       operator: firstRecord.operator.name,
//       operatorId: operatorId,
//       operation: operationName,
//       smv,
//       earnMins,
//       availableMins,
//       efficiency,
//       totalPcs: netPcs,
//       machine: session.machine,
//     });
//   }

//   return result.sort((a, b) => a.operatorId.localeCompare(b.operatorId));
// };



//   type OperatorSummary = {
//   operator: string;
//   operatorId: string;
//   totalEarnMins: number;
//   totalAvailableMins: number;
//   efficiency: number;
// };

// function summarizeEfficiencies(data: ReturnType<typeof processData>): OperatorSummary[] {
//   const summaryMap: { [operatorId: string]: OperatorSummary } = {};

//   data.forEach(entry => {
//     const { operator, operatorId, earnMins, availableMins } = entry;

//     if (!summaryMap[operatorId]) {
//       summaryMap[operatorId] = {
//         operator,
//         operatorId,
//         totalEarnMins: 0,
//         totalAvailableMins: availableMins,
//         efficiency: 0 // placeholder, will calculate later
//       };
//     }

//     summaryMap[operatorId].totalEarnMins += earnMins;
//     // summaryMap[operatorId].totalAvailableMins + availableMins;
//   });

//   return Object.values(summaryMap).map(entry => {
//     const efficiency = (entry.totalEarnMins / entry.totalAvailableMins) * 100;
//     return {
//       ...entry,
//       efficiency: Number(efficiency.toFixed(2))
//     };
//   });
// }

//   return (
//     <div className="p-4 space-y-4">
//       <SelectObbSheetAndDate obbSheets={obbSheets} handleSubmit={handleFetchProductions} />
//       {operationData.length > 0 && (
//         <TableCompo operationData={operationData} obbSheetData={obbSheetData} selectedDate={selectedDate}/>
//       )}
//     </div>
//   );
// };

// export default DailyRepCompo;
