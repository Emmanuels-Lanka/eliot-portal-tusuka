"use server";
import { ProductionDataType } from "../../daily-achivement3/components/analytics-chart";
import { poolForPortal } from "@/lib/postgres";


export async function getData(obbsheetid:string,date:string) : Promise<ProductionDataType[]>   {
   

    try {
  
        const query = `
         SELECT 
            pd."id",
            pd."productionCount" as count,
            pd."timestamp",
            oo."id" as "obbOperationId",
            oo."seqNo",
            oo."target",
            oo."smv",
            concat(oo."seqNo",'-',o.name ) as "name",
            op."name" as "operatorName",
            op."employeeId" as "operatorEmployeeId",
            op."rfid" as "operatorRfid"
        FROM "ProductionData" pd
        INNER JOIN "ObbOperation" oo ON pd."obbOperationId" = oo.id
        INNER JOIN "ObbSheet" os ON oo."obbSheetId" = os.id
        INNER JOIN "Operation" o ON o.id = oo."operationId"
        LEFT JOIN "Operator" op ON pd."operatorRfid" = op.id
        WHERE os.id = $1 AND pd.timestamp LIKE  $2

        ORDER BY oo."seqNo" ASC;
        `;
        const values = [obbsheetid,date];
    
        const result = await poolForPortal.query(query, values);
    
        // console.log("DATAaa: ", result.rows);
        return new Promise((resolve) => resolve(result.rows as ProductionDataType[]));
        
        
      } catch (error) {
        console.error("[TEST_ERROR]", error);
        throw error;
      }
   
   
   
}