"use server";
import { DataRecord, EfficiencyData } from "./barchart";
import { ObbSheet } from "@prisma/client";
import { poolForPortal, poolForRFID } from "@/lib/postgres";
import { db } from "@/lib/db";

type defects = {
  count: number;
  operator: string;
  part: string;
};
type defcount = {
  total: number;
};

type obb = ObbSheet & {
  unit: string;
  line: string;
};

export type ProdData = {
  operation: string;
  operatorRfid: string;
  seqNo: number;
  smv: number;
  sum: string;
  timestamp: string;
};
export type LogData = {
  eid: string;
  logout: string;
  login: string;
  name: string;
  offstandtime: string;
  operatorRfid: string;
};

export type OperatorRfidData = {
  operatorRfid: string;

  login: string;

  logout: string;

  offstandtime: string;

  name: string;

  sum: number;

  operation: string;

  smv: number;
  eid: string;
  seqNo: string;
};

export async function getObb(
  unit: any
): Promise<{ id: string; name: string }[]> {
  try {
    const query = `
          select pl.id id, pl.name name from "ProductionLine" pl
          inner join "Unit" u on u.id = pl."unitId"
          where pl."unitId" = $1
          order by pl.name
      `;
    const values = [unit];

    const result = await poolForPortal.query(query, values);

    // console.log("DATAaa: ", result.rows);
    return new Promise((resolve) =>
      resolve(result.rows as { id: string; name: string }[])
    );
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  } finally {
  }
}

export async function getObbData(obbSheet: string): Promise<obb[]> {
  try {
    const query = `
       select u.name unit, pl."name" line,os.* from "Unit" u
inner join "ProductionLine" pl on pl."unitId" = u.id
inner join "ObbSheet" os on os."productionLineId" = pl.id
where pl.id = $1
    `;
    const values = [obbSheet];

    const result = await poolForPortal.query(query, values);

    // console.log("DATAaa: ", result.rows);
    return new Promise((resolve) => resolve(result.rows as obb[]));
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }
}
export async function getUnit(): Promise<{ id: string; name: string }[]> {
  try {
    const query = `
      select id as id , name as name from "Unit" u 


 order by "name" asc
    `;
    const values = [];

    const result = await poolForPortal.query(query);

    // console.log("DATAaa: ", result.rows);
    return new Promise((resolve) =>
      resolve(result.rows as { id: string; name: string }[])
    );
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }
}

export async function getProducts(
  date: string,
  obbSheet: string
): Promise<DataRecord[]> {
  try {
    const query = `
       select oo."seqNo",pd."operatorRfid",o.name name,opn."name" operation,oo.smv,sum(pd."productionCount") count,oo."obbSheetId" from "ProductionData" pd 
inner join "Operator" o on o.rfid = pd."operatorRfid"
inner join "ObbOperation" oo on oo.id = pd."obbOperationId"
inner join "Operation" opn on opn.id = oo."operationId"
INNER JOIN "ObbSheet" os ON oo."obbSheetId" = os.id 
where pd.timestamp like $1 and os.id = $2
group by pd."operatorRfid",o.name,oo.smv,oo."seqNo",opn."name",oo."obbSheetId"
order by oo."seqNo"
    `;
    const values = [date + "%", obbSheet];

    const result = await poolForPortal.query(query, values);

    // console.log("DATAaa: ", result.rows);
    return new Promise((resolve) => resolve(result.rows as DataRecord[]));
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }
}

export async function getLogin(
  dateFrom: string,
  dateTo: string,
  obbSheet: string
): Promise<LogData[]> {
  try {
    const fixedDateFrom = `${dateFrom} 00:00:00`;
    const fixedDateTo = `${dateTo} 23:59:59`;

    const query = `
      select oet."operatorRfid",o.name,o."employeeId" eid,
             MIN(oet."loginTimestamp") login,
             MAX(oet."logoutTimestamp") logout,
             MAX(oet."offStandTime") offStandTime
      from "OperatorEffectiveTime" oet
      inner join "Operator" o on o.rfid = oet."operatorRfid"
      where oet."loginTimestamp" BETWEEN $1 AND $2
      and oet."logoutTimestamp" is not null
      group by oet."operatorRfid",o.name,eid
    `;
    const values = [fixedDateFrom, fixedDateTo];
    const result = await poolForPortal.query(query, values);
    return result.rows as LogData[];
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }
}

export async function getNew(
  dateFrom: string,
  dateTo: string,
  obbSheet: string
): Promise<ProdData[]> {
  try {
    const fixedDateFrom = `${dateFrom} 00:00:00`;
    const fixedDateTo = `${dateTo} 23:59:59`;

    const query = `
      SELECT DISTINCT ON (pd."operatorRfid") 
             pd."operatorRfid",
             pd."totalPcs" AS sum,
             pd."timestamp",
             o.name AS operation,
             oo.smv,
             oo."seqNo",
             pl.name
      FROM "ProductionEfficiency" pd
      INNER JOIN "ObbOperation" oo ON oo.id = pd."obbOperationId"
      INNER JOIN "Operation" o ON o.id = oo."operationId"
      INNER JOIN "ObbSheet" os ON os.id = oo."obbSheetId"
      INNER JOIN "ProductionLine" pl ON pl.id = os."productionLineId"
      WHERE pd."timestamp" BETWEEN $2 AND $3
      AND pl.id = $1
      ORDER BY pd."operatorRfid", pd."timestamp" DESC
    `;
    const values = [obbSheet, fixedDateFrom, fixedDateTo];
    const result = await poolForPortal.query(query, values);
    return result.rows as ProdData[];
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }
}

export async function getFinalData(
  date: string,
  obbSheet: string
): Promise<OperatorRfidData[]> {
  // date:string,obbSheet:string

  // console.log(date+"%",obbSheet)
  {
    try {
      const query = `
       select oet."operatorRfid", MIN(oet."loginTimestamp") AS login,
    MAX(oet."logoutTimestamp") AS logout,oet."offStandTime",o.name,
    sum(pd."productionCount"),opn.name operation,oo.smv,o."employeeId" eid,oo."seqNo"
    
    from "OperatorEffectiveTime" oet
inner join "Operator" o on o."rfid" = oet."operatorRfid"
inner join "ProductionData" pd on pd."operatorRfid" = o."rfid"
inner join "ObbOperation" oo on oo."id" = pd."obbOperationId"
inner join "Operation" opn on opn."id" = oo."operationId"



where oet."loginTimestamp" like $2 and pd."timestamp" like $2 
and oo."obbSheetId" = $1 AND oet."logoutTimestamp" IS NOT NULL

group by oet."operatorRfid",oet."offStandTime",o.name,operation,oo.smv,eid,oo."seqNo"
order by eid desc
        `;
      const values = [obbSheet, date + "%"];

      const result = await poolForPortal.query(query, values);

      // console.log("DATAaa: ", result.rows);
      return new Promise((resolve) =>
        resolve(result.rows as OperatorRfidData[])
      );
    } catch (error) {
      console.error("[TEST_ERROR]", error);
      throw error;
    } finally {
    }
  }
}



export async function getAllData (date:string,lineId:string){
  try {
    const fixedDateFrom = `${date} 00:00:00`; 
    const fixedDateTo = `${date} 23:59:59`;

    const prodDate = await db.productionEfficiency.findMany({
      where:{
        timestamp:{
          gte:fixedDateFrom,
          lte:fixedDateTo
        },
        
        obbOperation:{
          obbSheet:{
            productionLineId:lineId
          }
        }
        
        
      },
      include:{
        operator:{
          select:{
            rfid:true,
            name:true,
            employeeId:true
          }
        },
        obbOperation:{
          select:{
            seqNo:true,
            smv:true,
            operation:{
              select:{
                name:true
              }
            }

          }
         
          
        },
        
      }, orderBy:{
        operatorRfid: 'asc',
        
       }
      
    })

    const rfids = Array.from(new Set(prodDate.map(d => d.operatorRfid)));
    // Sort prodDate so the latest timestamp is first

    

    const data = await db.operatorEffectiveTime.findMany({
       where :{
        loginTimestamp:{
          gte:fixedDateFrom,
          lte:fixedDateTo
        },
        logoutTimestamp:{
          not:null,
          
        },
        operatorRfid:{
          in:rfids
        }
       },
       include:{
        operator:{
          select:{
            rfid:true,
            name:true,
            employeeId:true
          }
        }
       },
       orderBy:{
        operatorRfid: 'asc'
       }
      
    })
    
    prodDate.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Step 1: Group prodDate by operatorRfid and then by operation
const grouped: {
  [operatorRfid: string]: {
    [operation: string]: typeof prodDate
  }
} = {};

for (const item of prodDate) {
  const rfid = item.operatorRfid;
  const operation = item.obbOperation?.operation?.name || "Unknown";
  if (!grouped[rfid]) grouped[rfid] = {};
  if (!grouped[rfid][operation]) grouped[rfid][operation] = [];
  grouped[rfid][operation].push(item);
}

// Step 2: Create a map for fast access (optional, if you want flat access)
const prodDateMap = new Map<
  string,
  { [operation: string]: typeof prodDate }
>();
for (const [operatorRfid, opObj] of Object.entries(grouped)) {
  if (operatorRfid) {
    prodDateMap.set(operatorRfid, opObj);
  }
}

// Step 3: Merge production data into operatorEffective records
const merged = data.map(d => {
  const prod = prodDateMap.get(d.operatorRfid) || {};
  return {
    ...d,
    prod, // prod is now an object: { operationName: [prodData, ...], ... }
  };
});
    
    return {merged}

  } catch (error) {
    
  }
}

export async function fetchLineEndPass(lineId:string,date:string) {

 try {
   
    const query = `select count(*) from "ProductDefect" pd
inner join "Product" p on p.id = pd."productId"
inner join "GmtData" g on g."id" = p."frontGmtId"
where g."lineId" = $1 and pd."timestamp" like $2
and pd."qcStatus" = 'pass' and pd.part = 'line-end'`


    const values = [lineId, date+"%"];
    const result = await poolForRFID.query(query, values);
    console.log(result.rows)
    return result.rows[0];
  } catch (error) {
    console.error("[TEST_ERROR]", error);
    throw error;
  }
}

export async function getStyleDataByLine(productionLineId: string, date: string){
  try {
        const startDate = `${date} 00:00:00`; // Start of the day
    const endDate = `${date} 23:59:59`; // End of the day

    const uniqueSheets = await db.productionEfficiency.findMany({
  where: {
    obbOperation: { obbSheet: { productionLineId: productionLineId } },
    timestamp: { gte: startDate, lte: endDate }
  },
  select: {
    obbOperation: {
      select: {
        obbSheet: true
      }
    }
  },
  distinct: [] 
})


console.log(uniqueSheets,"aaaa")
return uniqueSheets;
  } catch (error) {
    
  }
}



export async function fetchDirectProductionOpData(productionLineId: string, date: string) {
   
   
    if (!productionLineId || !date) {
        throw new Error("Missing required parameters: obbSheetId or date");
    }

    const startDate = `${date} 00:00:00`; // Start of the day
    const endDate = `${date} 23:59:59`; // End of the day


    try {
        const productionData = await db.productionEfficiency.findMany({
            where: {
                obbOperation: { obbSheet:{
                  productionLineId:productionLineId
                } },
                timestamp: { gte: startDate, lte: endDate }
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