import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { obbOperationId: string } }
) {
    try {
        const existingOperation = await db.obbOperation.findUnique({
            where: {
                id: params.obbOperationId
            },
            include: {
                sewingMachine: true
            }
        });

        if (!existingOperation) {
            return new NextResponse("OBB operation does not exist!", { status: 409 })
        }

                const activeOperation = existingOperation.sewingMachine?.activeObbOperationId

        if (existingOperation.sewingMachine) {      // 1: A machine assigned to this Obb operation
            if (existingOperation.sewingMachine?.activeObbOperationId !== null) {       // 3: The machine is in active with a obb operation
                if (existingOperation.sewingMachine?.activeObbOperationId !== params.obbOperationId) {      // 5: The machine is active with different obb operation
                     if (existingOperation.sewingMachine?.activeObbOperationId !== "combined") {

                         const activeObb = await db.obbOperation.findUnique({
                           where: {
                             id: activeOperation as string,
                           },
                           select: {
                             obbSheet: {
                               select: {
                                 name: true,
                               },
                             },
                           },
                         });
                        return new NextResponse(`Machine already in active in ${activeObb?.obbSheet.name}, Cannot activate the same machine for this operation!`, { status: 409 })
                    }
                }
            } else {        // 4: The machine is not in active with any obb operations
                // Put the activeObbOperationId is "combined", if the operation is combined
                // Put the activeObbOperationId is operationId, if the operation is not combined
                await db.sewingMachine.update({
                    where: {
                        id: existingOperation.sewingMachine.id
                    },
                    data: {
                        activeObbOperationId: existingOperation.isCombined ? "combined" : params.obbOperationId
                    }
                });
            }
        }

        // Activate the ObbOperation
        await db.obbOperation.update({
            where: {
                id: params.obbOperationId
            },
            data: { isActive: true }
        });

        return new NextResponse("Activated the OBB Operation successfully", { status: 200 });
    } catch (error) {
        console.error("[OBB_OPERATION_STATUS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}