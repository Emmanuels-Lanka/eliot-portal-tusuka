export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import SelectObbSheet from "../line-dashboard/_components/select-obb-sheet";
// import SelectObbSheet from "../../line-dashboard/_components/select-obb-sheet";
const page = async () => {
    const obbSheets = await db.obbSheet.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });

    console.log(obbSheets)
            
    return (
        <div className='mx-auto max-w-4xl'>
          <div className='mt-24'>
                <h1 className='text-center text-2xl font-medium text-sky-700 mb-6'>Select Obb Sheet for Cumilative Efficiency</h1>
                <SelectObbSheet obbSheets={obbSheets} route="/ovef" />
            </div>
        </div>
    )
}

export default page