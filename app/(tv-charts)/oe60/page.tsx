export const dynamic = "force-dynamic";
import { db } from '@/lib/db';
import SelectObbSheet from '../line-dashboard/_components/select-obb-sheet';

const OperatorEfficiency60 = async () => {
    const obbSheets = await db.obbSheet.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className='mx-auto max-w-4xl'>
            <div className='mt-24'>
                <h1 className='text-center text-2xl font-medium text-sky-700 mb-6'>Select Obb Sheet for this Line</h1>
                <SelectObbSheet obbSheets={obbSheets} route="/oe60" />
            </div>
        </div>
    )
}

export default OperatorEfficiency60