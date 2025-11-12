import { db } from '@/lib/db';
import AnalyticsChart from './_components/analytics-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OperatorCumilative from './_components/cumilative-analytics';

const OperatorEfficiency60 = async () => {
    const obbSheets = await db.obbSheet.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true
        }
    });
    <AnalyticsChart
        obbSheets={obbSheets}
        title='Operator Efficiency Heatmap for 60min'
    />

    return (
        <div className=''>
          <AnalyticsChart
            obbSheets={obbSheets}
            title='Operator Efficiency Heatmap for 60min'
          />
        
        {/* <Tabs defaultValue="1" className="w-full">
        <div className='flex flex-col justify-center mt-4 items-center'>
          <TabsList>
            <TabsTrigger value="1">Live Efficiency</TabsTrigger>
            <TabsTrigger value="2">Cumilative Efficiency</TabsTrigger>
          </TabsList>
          <p className="mt-1 text-sm text-slate-500">
            (Please click the tabs to change the heatmaps)
          </p>
              </div>
          <TabsContent value="1">
          <AnalyticsChart
        obbSheets={obbSheets}
        title='Operator Efficiency Heatmap for 60min'
    />
          </TabsContent>
          <TabsContent value="2">
          <OperatorCumilative
              obbSheets={obbSheets}
              title="Production Efficiency - Hourly Heatmap"
            />
          </TabsContent>
         
        </Tabs> */}
        
      </div>
    )
}

export default OperatorEfficiency60