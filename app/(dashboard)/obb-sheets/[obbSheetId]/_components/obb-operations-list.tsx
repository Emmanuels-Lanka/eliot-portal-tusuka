import { Operation, SewingMachine, Staff } from "@prisma/client";

import { DataTable } from "@/app/(dashboard)/obb-sheets/[obbSheetId]/_components/data-table";
import ObbOperationsForm from "./obb-operations-form";

interface ObbOperationsListProps {
    operations: Operation[] | null;
    machines: SewingMachine[] | null;
    obbOperations: ObbOperationData[] | undefined;
    obbSheetId: string;
    obbSheetLineTarget?: number | null;
}

const ObbOperationsList = ({
    operations,
    machines,
    obbOperations,
    obbSheetId,
    obbSheetLineTarget
}: ObbOperationsListProps) => {
    return (
        <div className="mx-auto max-w-7xl border px-6 pt-4 pb-6 rounded-lg bg-slate-100">
            <div className="font-medium flex items-center justify-between">
                <h2 className="text-slate-800 text-lg font-medium">OBB Operations ({obbOperations ? obbOperations?.length : '0'})</h2>
                <ObbOperationsForm 
                    obbSheetId={obbSheetId}
                    operations={operations}
                    machines={machines}
                    obbSheetLineTarget={obbSheetLineTarget || null}
                />
            </div>

            <div className="space-y-2">
                {obbOperations && obbOperations?.length > 0 ?
                    <DataTable
                        data={obbOperations}
                        obbSheetId={obbSheetId}
                        operations={operations}
                        machines={machines}
                    />
                    : (
                        <p className="text-sm mt-2 text-slate-500 italic">
                            No operations available
                        </p>
                    )}
            </div>
        </div>
    )
}

export default ObbOperationsList