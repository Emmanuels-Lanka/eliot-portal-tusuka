import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { obbSheetId: string } }
) {
    try {
        const existingSheetById = await db.obbSheet.findUnique({
            where: {
                id: params.obbSheetId
            }
        });

        if (!existingSheetById) {
            return new NextResponse("OBB sheet does not exist!", { status: 409 })
        }

        // Fetch the obb operations for this sheet
        const obbOperations = await db.obbOperation.findMany({
            where: {
                obbSheetId: params.obbSheetId
            }
        });

        // Change the activeObbOperation on each assigned machine
        for (const operation of obbOperations) {
            if (operation.sewingMachineId) {
                await db.sewingMachine.update({
                    where: {
                        id: operation.sewingMachineId
                    },
                    data: {
                        activeObbOperationId: null,
                    }
                });
            }
        }

        // Delete the OBB sheet
        await db.obbSheet.delete({
            where: {
                id: params.obbSheetId
            }
        });

        return new NextResponse("OBB sheet removed successfully", { status: 201 })
    } catch (error) {
        console.error("[OBB_SHEET_DELETE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { obbSheetId: string } }
) {
    try {
        const { 
            version, unitId, productionLineId, indEngineer, supervisor1, supervisor2, supervisor3, supervisor4, mechanic, qualityIns, accInputMan, fabInputMan, lineChief,
            buyer, style, item, operators, helpers, startingDate, endingDate, workingHours, factoryStartTime, factoryStopTime, bundleTime, personalAllowance,
            efficiencyLevel1, efficiencyLevel2, efficiencyLevel3, itemReference, totalMP, totalSMV, availableMinPerHour, obbOperationsNo, bottleNeckTarget, target100, 
            ucl, lcl, balancingLoss, balancingRatio, colour, supResponseTime, mecResponseTime, qiResponseTime,intervalStartTime,intervalStopTime,lineTarget
        } = await req.json();

        const existingSheetById = await db.obbSheet.findUnique({
            where: {
                id: params.obbSheetId
            }
        });

        if (!existingSheetById) {
            return new NextResponse("The OBB sheet does not exist", { status: 409 })
        };

        // Fetch the line name
        const line = await db.productionLine.findUnique({
            where: {
                id: productionLineId
            }
        });

        const name = `${line?.name}-${style}-v${version}`

        const updatedSheet = await db.obbSheet.update({
            where: {
                id: params.obbSheetId
            },
            data: {
                name, unitId, productionLineId, 
                indEngineerId: indEngineer, 
                supervisorFrontId: supervisor1, 
                supervisorBackId: supervisor2,
                supervisorAssemblyId: supervisor3,
                supervisorLineEndId: supervisor4, 
                mechanicId: mechanic, 
                qualityInsId: qualityIns, 
                accInputManId: accInputMan, 
                fabInputManId: fabInputMan, 
                lineTarget,
                lineChiefId: lineChief,intervalStartTime,intervalStopTime,
                buyer, style, item, operators, helpers, startingDate, endingDate, factoryStartTime, factoryStopTime, workingHours: parseFloat(workingHours), bundleTime, personalAllowance,
                efficiencyLevel1, efficiencyLevel2, efficiencyLevel3, itemReference, totalMP, totalSMV: parseFloat(totalSMV), availableMinPerHour, obbOperationsNo, bottleNeckTarget,
                target100, ucl, lcl, balancingLoss, balancingRatio, colour, supResponseTime, mecResponseTime, qiResponseTime,
            }
        });

        return NextResponse.json({ data: updatedSheet, message: 'OBB sheet updated successfully' }, { status: 201 });
    } catch (error) {
        console.error("[OBB_SHEET_UPDATE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}