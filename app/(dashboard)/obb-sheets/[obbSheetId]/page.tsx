import { JwtPayload, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObbOperation, ObbSheet, Operation, SewingMachine, Staff } from "@prisma/client";

import AddObbOperationForm from "@/components/dashboard/forms/add-obb-operation-form";
import CreateObbSheetForm from "@/components/dashboard/forms/create-obb-sheet-form";
import { db } from "@/lib/db";
import ObbOperationsList from "./_components/obb-operations-list";
import GenerateObbReport from "./_components/generate-obb-report";

interface CategorizedStaff {
    [key: string]: Staff[];
}

const ObbSheetId = async ({ params }: { params: { obbSheetId: string } }) => {
    const cookieStore = cookies();
    const token = cookieStore.get('AUTH_TOKEN');

    const { value } = token as any;
    const secret = process.env.JWT_SECRET || "";
    
    const verifiedUser = verify(value, secret) as JwtPayload;
    // console.log("VERIFIED USER: ", verifiedUser);

    const units = await db.unit.findMany({
        select: {
            name: true,
            id: true,
        },
    });

    const staffs: Staff[] | null = await db.staff.findMany();

    const categorizedStaff: CategorizedStaff = staffs.reduce(
        (acc: CategorizedStaff, staff: Staff) => {
            const { designation } = staff;
            if (!acc[designation]) {
                acc[designation] = [];
            }
            acc[designation].push(staff);
            return acc;
        },
        {}
    );

    const sheets = await db.obbSheet.findUnique({
        where: {
            id: params.obbSheetId,
        },
    });

    const obbOperations = await db.obbSheet.findUnique({
        where: {
            id: params.obbSheetId,
        },
        select: {
            obbOperations: {
                include: {
                    operation: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    sewingMachine: {
                        select: {
                            id: true,
                            brandName: true,
                            machineType: true,
                            machineId: true,
                            activeObbOperationId: true,
                        },
                    },
                    supervisor: {
                        select: {
                            id: true,
                            name: true,
                            employeeId: true,
                        },
                    },
                },
                orderBy: {
                    seqNo: "asc",
                },
            },
            supervisorFront: true,
            supervisorBack: true,
            lineTarget: true,
        },
    });

    // const assignedMachinesToOperations = obbOperations?.obbOperations
    //   .filter(item => item.sewingMachine !== null)
    //   .filter(item => item.sewingMachine?.activeObbOperationId !== null)
    //   .map(item => item.sewingMachine?.id);

    // console.log("AAAA", assignedMachinesToOperations);

    const operations: Operation[] | null = await db.operation.findMany();

    let machines: SewingMachine[] | null = null;

    if (sheets?.productionLineId) {
        const machinesForLine = await db.productionLine.findUnique({
            where: {
                id: sheets?.productionLineId,
            },
            select: {
                machines: true,
            },
        });

        machines =
            machinesForLine?.machines.filter((machine) => machine.isAssigned) ?? [];
    }

    return (
        <section className="mt-16 mx-auto max-w-7xl space-y-12">
            {/* <AddObbOperationForm 
        operations={operations}
        machines={machines}
        // assignedMachinesToOperations={assignedMachinesToOperations}
        obbOperations={obbOperations?.obbOperations}
        obbSheetId={params.obbSheetId}
        supervisor1={obbOperations?.supervisorFront || null}
        supervisor2={obbOperations?.supervisorBack || null}
      /> */}
            <ObbOperationsList
                operations={operations}
                machines={machines}
                obbOperations={obbOperations?.obbOperations}
                obbSheetId={params.obbSheetId}
                obbSheetLineTarget={sheets?.lineTarget}
            />
            <div className="space-y-4">
                <div className="flex justify-between items-end gap-4">
                    <div>
                        <h2 className="text-slate-800 text-xl font-medium">
                            Update OBB Sheet
                        </h2>
                        <p className="text-slate-500 text-sm">
                            You can update the OBB sheet which you created!
                        </p>
                    </div>
                    <GenerateObbReport obbSheetId={params.obbSheetId} />
                </div>
                <CreateObbSheetForm
                    units={units}
                    mechanics={categorizedStaff?.["mechanics"]}
                    supervisor={categorizedStaff?.["supervisor"]}
                    qualityInspector={categorizedStaff?.["quality-inspector"]}
                    industrialEngineer={categorizedStaff?.["industrial-engineer"]}
                    accessoriesInputMan={categorizedStaff?.["accessories-input-man"]}
                    fabricInputMan={categorizedStaff?.["fabric-input-man"]}
                    lineChief={categorizedStaff?.["line-chief"]}
                    initialData={sheets}
                    obbSheetId={params.obbSheetId}
                    user={{
                        email: verifiedUser.email,
                        role: verifiedUser.role,
                    }}
                />
            </div>
        </section>
    );
};

export default ObbSheetId