"use server";
import { poolForPortal } from "@/lib/postgres";


import { db } from "@/lib/db";

export async function fetchDirectOpProductionData( operatorID:string ,start: string,end: string) {
   
   
    if (!operatorID || !start || !end) {
        throw new Error("Missing required parameters: obbSheetId or date");
    }

    const startDate = `${start} 00:00:00`; // Start of the day
    const endDate = `${end} 23:59:59`; // End of the day


    try {
        const productionData = await db.productionEfficiency.findMany({
            where: {
                
                timestamp: { gte: startDate, lte: endDate },
                operator:{
                  id:operatorID
                }
            },
            include: {
                operator: {
                    select: {
                        name: true,
                        employeeId: true,
                        rfid: true,
                        OperatorEffectiveTime:{
                          where:{
                            loginTimestamp:{
                              gte:startDate,
                              lte:endDate
                            }
                          }
                        }
                    }
                },
                obbOperation: {
                    select: {
                        id: true,
                        seqNo: true,
                        target: true,
                        smv: true,
                        part: true,
                        operation: { select: { name: true } },
                        sewingMachine: { select: { machineId: true } }
                    }
                }                
            },
            orderBy: { createdAt: "desc" }
        });

     

        return { data: productionData, message: "Production data fetched successfully" };
    } catch (error) {
        console.error("[PRODUCTION_EFFICIENCY_ERROR]", error);
        throw new Error("Internal Server Error");
    }


}




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


export interface newData {
    obbOperationId: string;
    LoginTimestamp: Date;
    LogoutTimestamp: Date;
    operation: string;
    smv: number;
    production_date: Date;
    daily_production: number;
    type: string;
    obbSheetId:string
}

export type getDateTypes = {

    operatorRfid: string;

    LoginTimestamp: Date;

    LogoutTimestamp: Date;

    date: string;
    LoginDate:string;

};




export async function getNewData(startdate :string,enddate :string,operatorId:string)  : Promise<newData[]>   {
    

    {
        
      try {
    

        const query = `
         SELECT 
    o.name,
    o.rfid,
    pd."obbOperationId",
    SUM(pd."productionCount") AS daily_production,
    DATE(pd.timestamp) AS production_date,
    os."LoginTimestamp",
    os."LogoutTimestamp",
    SUBSTRING("LoginTimestamp" FROM 1 FOR 10) AS "LoginDate",
    oo.smv,opn.name operation,oo."obbSheetId", o."employeeId"
FROM 
    "Operator" o
INNER JOIN 
    "OperatorSession" os ON os."operatorRfid" = o.rfid
INNER JOIN 
    "ProductionData" pd ON pd."operatorRfid" = o.rfid
    AND pd.timestamp BETWEEN os."LoginTimestamp" AND os."LogoutTimestamp"  -- Ensure production data is within login-logout period
INNER JOIN "ObbOperation" oo on oo.id = pd."obbOperationId"
INNER JOIN "Operation" opn on opn.id = oo."operationId"
inner join "ObbSheet" obs on obs.id = oo."obbSheetId"


WHERE 
    o.id = $3
    AND pd.timestamp BETWEEN $1 AND $2  -- Ensure production data is within the desired period
    AND os."LoginTimestamp" BETWEEN $1 AND $2  -- Ensure sessions are within the desired period
GROUP BY  
    o.name,
    o.rfid,
    pd."obbOperationId",
    DATE(pd.timestamp),  -- Use DATE expression directly in GROUP BY
    os."LoginTimestamp",
    os."LogoutTimestamp",
    oo.smv,operation,oo."obbSheetId", o."employeeId"
ORDER BY 
    production_date;
        `;
        const values = [startdate,enddate,operatorId];
    
        const result = await poolForPortal.query(query, values);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as newData[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }
      finally{
   
      }}


  
}


export interface EmployeeRecord {
    id: string;
    name: string;
    employeeId: string;
    rfid: string;
    ts: Date;
    type: string;
}

export async function getEmployee()  : Promise<EmployeeRecord[]>   {
    
    try {
  
        const query = `
          select id,name,"employeeId",rfid from "Operator"
        `;
        // const values = [obbSheet];
    
        const result = await poolForPortal.query(query);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as EmployeeRecord[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }
  
}



