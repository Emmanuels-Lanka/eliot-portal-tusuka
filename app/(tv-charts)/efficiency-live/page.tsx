export const dynamic = "force-dynamic";
import { db } from '@/lib/db';
import SelectObbSheet from '../line-dashboard/_components/select-obb-sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const Efficiency = async () => {
    const obbSheets = await db.obbSheet.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });

    console.log(obbSheets)
            
    return (
        <div className='mx-auto max-w-4xl'>
             {/* <Tabs defaultValue="1" className="w-full">
        <div className='flex flex-col justify-center mt-12 items-center'>
          <TabsList className='shadow-md px-4'>
            <TabsTrigger value="1">Live Efficiency</TabsTrigger>
            <TabsTrigger value="2">Cumilative Efficiency</TabsTrigger>
          </TabsList>
          <p className="mt-4 text-sm text-slate-500">
            (Please click the tabs to change the heatmaps)
          </p>
              </div>
          <TabsContent value="1"> */}
           
            <div className='mt-24'>
                <h1 className='text-center text-2xl font-medium text-sky-700 mb-6'>Select Obb Sheet for Live Efficiency</h1>
                <SelectObbSheet obbSheets={obbSheets} route="/efficiency-live" />
            </div>
          {/* </TabsContent>
          <TabsContent value="2">
          <div className='mt-24'>
                <h1 className='text-center text-2xl font-medium text-sky-700 mb-6'>Select Obb Sheet for Cumilative Efficiency</h1>
                <SelectObbSheet obbSheets={obbSheets} route="/cumilative-efficiency" />
            </div>
          </TabsContent>
         
        </Tabs> */}
        </div>
    )
}

export default Efficiency