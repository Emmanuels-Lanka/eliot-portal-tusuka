

"use server";




export type ProductionData = {
    counts: number; // Total production count (SUM of productionCount)
    operator: string;   // Name of the operator
    operation: string; // ID of the operation in the OBB sheet
    operationName: string;   // Name of the operation
    smv: number;    // Standard Minute Value (SMV) for the operation
  };


  export type getCountType = {

    production_date: string;

    operatorRfid: string;

    daily_total: number;

    name: string;
    LoginDate:string;
    smv : number


}; 
export type getDateTypes = {

    operatorRfid: string;

    LoginTimestamp: Date;

    LogoutTimestamp: Date;

    date: string;
    LoginDate:string;

};
type ReportData = {
  id: string;
  operatorname: string;
  operationname: string;
  count: number;
  smv: number;
  target: number;
  efficiency: number;
  achievements: string;
  unitname: string;
  style: string;
  machineid: string;
  linename: string;
  buyer: string;
  employeeId: string;
  rfid:string;
  seqNo: string;
  first: any;
  last: any;
};
export async function getDailyData(obbsheetid:string,startDate:string,endDate:string)  : Promise<ReportData[]>   {
    
    try {
  
        const query = `
         SELECT 
    opr.id,
    obbop."seqNo",
    opr.name AS operatorname,
    op.name AS operationname,
    SUM(pd."productionCount") AS count,
    obbop.smv AS smv,
    obbop.target,
    unt.name AS unitname,
    obbs.style AS style,
    obbs.name,
    sm."machineId" AS machineid,
    pl.name AS linename,
    obbs.buyer,
    opr."employeeId",
    os.first_login AS first,  -- Earliest timestamp from subquery
    MAX(pd."timestamp") AS last  -- Latest timestamp in the group
FROM "ProductionData" pd
INNER JOIN "Operator" opr ON pd."operatorRfid" = opr.rfid 
INNER JOIN "ObbOperation" obbop ON pd."obbOperationId" = obbop.id
INNER JOIN "ObbSheet" obbs ON obbop."obbSheetId" = obbs.id
INNER JOIN "Operation" op ON obbop."operationId" = op.id
INNER JOIN "Unit" unt ON obbs."unitId" = unt.id
INNER JOIN "SewingMachine" sm ON obbop."sewingMachineId" = sm.id
INNER JOIN "ProductionLine" pl ON pl.id = obbs."productionLineId"
-- Subquery to get the earliest LoginTimestamp for each operator within the date range
LEFT JOIN (
    SELECT 
        "operatorRfid",
        MIN("LoginTimestamp") AS first_login
    FROM "OperatorSession"
    WHERE "LoginTimestamp" BETWEEN '2024-12-01%' AND '2024-12-03%'
    GROUP BY "operatorRfid"
) AS os ON os."operatorRfid" = opr.rfid
WHERE pd."timestamp" BETWEEN '2024-12-01%' AND '2024-12-03%' 
    AND obbs.id = 'm39kvtz3-GXrCcRB8Ft0Q' 
GROUP BY 
    opr.id, 
    opr.name, 
    op.name, 
    obbop."seqNo", 
    obbop.smv, 
    obbop.target, 
    unt.name, 
    obbs.style, 
    sm.id, 
    pl.name, 
    obbs.buyer, 
    opr."employeeId", 
    os.first_login,obbs.name
ORDER BY obbop."seqNo";

        `;
        const values = [obbsheetid];
    
        const result = await poolForPortal.query(query, values);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as ReportData[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }

}

export async function getEffData(obbsheetid:string,startDate:string,endDate:string)  : Promise<ProductionData[]>   {
    
    try {
  
        const query = `
         select sum(pd."productionCount") counts,op."name" operator,
 pd."obbOperationId",o.name operation,oo.smv,oo."seqNo",op."employeeId" from "ProductionData" pd
    inner join "Operator" op on op."rfid" = pd."operatorRfid"
    inner join "ObbOperation" oo on oo.id = pd."obbOperationId"
    INNER JOIN 
        "Operation" o ON o.id = oo."operationId"
    where pd.timestamp BETWEEN $2 AND $3
    and oo."obbSheetId" = $1
    group by op."name",pd."obbOperationId",o.name,oo.smv,oo."seqNo",op."employeeId"
    HAVING 
        sum(pd."productionCount") > 0
    order by counts desc
        `;
        const values = [obbsheetid,startDate,endDate];
    
        const result = await poolForPortal.query(query, values);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as ProductionData[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }
    
}



export async function getCount(obbsheetid:string,startDate:string,endDate:string)  : Promise<getCountType[]>   {
  
    startDate = startDate + " 00:00:00";
    endDate = endDate + " 23:59:59"; 

    try {
  
        const query = `
         SELECT 
    DATE("timestamp") AS production_date, 
    "operatorRfid",
    SUM("productionCount") AS daily_total,op."name",
     SUBSTRING("timestamp" FROM 1 FOR 10) AS "LoginDate",oo.smv
FROM "ProductionData" pd
inner join "Operator" op on op.rfid = pd."operatorRfid"
inner join "ObbOperation" oo on oo."id" = pd."obbOperationId"
WHERE "timestamp" BETWEEN '2024-12-01 00:00:00' AND '2024-12-03 23:59:59' and "operatorRfid" <> 'OP-00000'
 and oo."obbSheetId" = 'm39kvtz3-GXrCcRB8Ft0Q'
GROUP BY production_date, "operatorRfid",name,"LoginDate",oo.smv
HAVING SUM("productionCount") IS NOT NULL AND SUM("productionCount") > 0
ORDER BY production_date, "operatorRfid";
        `;
        // const values = [obbSheet];
    
        const result = await poolForPortal.query(query);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as getCountType[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }
    
}

export async function getTimeslot(obbsheetid:string,startDate:string,endDate:string)  : Promise<getDateTypes[]>   {
    
 
    startDate = startDate + " 00:00:00";
    endDate = endDate + " 23:59:59"; 

    try {
  
        const query = `
         SELECT "operatorRfid", 
       "LoginTimestamp"::timestamp, 
       "LogoutTimestamp"::timestamp,
       Date("LoginTimestamp") ,
        SUBSTRING("LoginTimestamp" FROM 1 FOR 10) AS "LoginDate"
FROM "OperatorSession" os
inner join "ObbOperation" oo on oo."id" = os."obbOperationId"
WHERE "LoginTimestamp" BETWEEN '2024-12-01 00:00:00' AND '2024-12-03 23:59:59'  
and oo."obbSheetId" = 'm39kvtz3-GXrCcRB8Ft0Q' and "operatorRfid" <> 'OP-00000'
  AND "LoginTimestamp" IS NOT NULL
  AND "LogoutTimestamp" IS NOT NULL
order by "operatorRfid"
        `;
        const values = [];
    
        const result = await poolForPortal.query(query);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as getDateTypes[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }
   
}




import { db } from "@/lib/db";

import { poolForPortal } from "@/lib/postgres";

export const getPrisma = async ()=>{

    const op = await db.operator.findMany({
        where: {
            rfid: { not: "OP-00000" },
            operatorSessions: {
                every: {
                    LoginTimestamp: {
                        gte: "2024-12-01 00:00:00",
                        lte: "2024-12-03 23:59:59"
                    }
                }
            },
            productionData: {
                every: {
                    obbOperation: {
                        obbSheetId: "m39kvtz3-GXrCcRB8Ft0Q"
                    }
                }
            }
        },
        include: {
            operatorSessions: true,
            productionData: true
        }
        });

    return op

}


