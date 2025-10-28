"use server";
import { ProductionDataType } from "@/app/(dashboard)/analytics/daily-achivement3/components/analytics-chart";
import { poolForPortal } from "@/lib/postgres";


export async function getObbSheetID(obbSheetId: string): Promise<{id:string, name:string}> {

  
  {
   
try {

 
  const query = `
     SELECT oo.id,oo.name
  FROM "ProductionLine" pl 
  INNER JOIN "ObbSheet" oo 
  ON pl.id = oo."productionLineId"
  WHERE oo."isActive"=true and oo.id=$1
  order by oo."createdAt" desc
  `;
  const values = [obbSheetId];

  const result = await poolForPortal.query(query, values);

  // console.log("DATAaa: ", result.rows);
  return new Promise((resolve) => resolve(result.rows[0] as {id:string, name:string}));
  
  
} catch (error) {
  console.error("[TEST_ERROR]", error);
  throw error;
}
finally{
 
}
}

}

export async function getData(obbsheetid:string,date:string) : Promise<ProductionDataType[]>   {


  try {
  
    const query = `
   SELECT SUM(pd."productionCount") as count,concat(oo."seqNo",'-',o.name ) as name ,oo.target
  FROM "ProductionData" pd
  INNER JOIN "ObbOperation" oo ON pd."obbOperationId" = oo.id
  INNER JOIN "ObbSheet" os ON oo."obbSheetId" = os.id
  INNER JOIN "Operation" o ON o.id= oo."operationId"
  WHERE os.id = $1 and pd.timestamp like $2
  group by o.name,oo.target,oo."seqNo" order by  oo."seqNo" ;
    `;
    const values = [obbsheetid,date];

    const result = await poolForPortal.query(query,values);

    // console.log("DATAaa: ", result.rows);
    return new Promise((resolve) => resolve(result.rows as ProductionDataType[]));
    
    
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }

}