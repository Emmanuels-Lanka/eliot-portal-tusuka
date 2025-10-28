"use server"
import { db } from "@/lib/db";

export async function getData(obbsheetid:string,date:string) {
    try {
        const startDate = `${date} 00:00:00`; // Start of the day
         const endDate = `${date} 23:59:59`; // End of the day
        const data = await db.productionEfficiency.findMany({
            where:{
                timestamp:{
                    gte:startDate,
                    lte:endDate
                },
                obbOperation:{
                    obbSheetId:obbsheetid
                }
            },
            select:{
                timestamp:true,
                totalPcs:true,
                obbOperationId:true,
                operator:{
                    select:{
                        id:true,
                        name:true
                    }
                },
                obbOperation:{
                    select:{
                        seqNo:true,
                        target:true,
                        sewingMachine:{
                            select:{
                                serialNumber:true
                            },

                        },
                        operation:{
                            select:{
                                name:true
                            }
                        }
                    }
                }
            }
        })

        return data
    } catch (error) {
        console.error("Error in getData:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}