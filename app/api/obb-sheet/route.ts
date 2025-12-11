import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generateUniqueId } from "@/actions/generate-unique-id";

export async function POST(
    req: Request,
) {
    try {
        const { 
            version, unitId, productionLineId, indEngineer, supervisor1, supervisor2, supervisor3, supervisor4, mechanic, qualityIns, accInputMan, fabInputMan, lineChief, 
            buyer, style, item, operators, helpers, startingDate, endingDate, workingHours, factoryStartTime, factoryStopTime, bundleTime, personalAllowance,
            efficiencyLevel1, efficiencyLevel2, efficiencyLevel3, itemReference, totalMP, totalSMV, availableMinPerHour, obbOperationsNo, bottleNeckTarget, target100, 
            ucl, lcl, balancingLoss, balancingRatio, colour, supResponseTime, mecResponseTime, qiResponseTime,intervalStartTime,intervalStopTime,lineTarget
        } = await req.json();

        let id = generateUniqueId();

        const existingSheetByID = await db.obbSheet.findUnique({
            where: {
                id
            }
        });

        if (existingSheetByID) {
            return new NextResponse("Obb sheet is already exist!", { status: 409 })
        }

        // Fetch the line name
        const line = await db.productionLine.findUnique({
            where: {
                id: productionLineId
            }
        });

        const name = `${line?.name}-${style}-v${version}`

        const newSheet = await db.obbSheet.create({
            data: {
                id, version, name, unitId, productionLineId, 
                indEngineerId: indEngineer, 
                supervisorFrontId: supervisor1, 
                supervisorBackId: supervisor2,
                supervisorAssemblyId: supervisor3,
                supervisorLineEndId: supervisor4,
                mechanicId: mechanic, 
                qualityInsId: qualityIns, 
                accInputManId: accInputMan, 
                fabInputManId: fabInputMan, 
                lineChiefId: lineChief,
                lineTarget,
                intervalStopTime,intervalStartTime,
                buyer, style, item, operators, helpers, startingDate, endingDate, factoryStartTime, factoryStopTime, workingHours: parseFloat(workingHours), bundleTime, personalAllowance,
                efficiencyLevel1, efficiencyLevel2, efficiencyLevel3, itemReference, totalMP, totalSMV: parseFloat(totalSMV), availableMinPerHour, obbOperationsNo, bottleNeckTarget,
                target100, ucl, lcl, balancingLoss, balancingRatio, colour, supResponseTime, mecResponseTime, qiResponseTime,
            }
        });

        return NextResponse.json({ data: newSheet, message: 'OBB sheet created successfully' }, { status: 201 });
    } catch (error) {
        console.error("[OBB_SHEET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}





export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const obbSheetId = searchParams.get("obbSheetId");
        if (!obbSheetId) {
            return new NextResponse("obbSheetId is required", { status: 400 });
          }
        const obbsheetDetails=await db.obbOperation.findMany({
            where:{
                obbSheetId:obbSheetId,
            },

            
        })
        return NextResponse.json({ data: obbsheetDetails, message: 'ObbOperation Data Fetched Successfuly' }, { status: 201 });
        
    } catch (error) {
        console.error("[OBB_OPERATION_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}


