"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ObbSheet } from "@prisma/client";
import { parseISO, getHours } from 'date-fns';

import HeatmapChart from "@/components/dashboard/charts/heatmap-chart";
import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";
import { useToast } from "@/components/ui/use-toast";
import EffiencyHeatmap from "@/components/dashboard/charts/efficiency-heatmap";
import { getData } from "./actions";
import BarChartGraph from "./BarChartGraph";


interface AnalyticsChartProps {
    obbSheets: {
        id: string;
        name: string;
    }[] | null;
    title: string;
}

export type ProductionDataType = {
    name: string;
    count: number;
    target: number;
    machine?:string;
}



const AnalyticsChart = ({
    obbSheets,
    title
}: AnalyticsChartProps) => {
    const { toast } = useToast();
    const router = useRouter();


    const [userMessage,setUserMessage] = useState<string>("Please select a style and date ☝️")
    const [filterApplied,setFilterApplied] = useState<boolean>(false)

    const [obbSheetId,setObbSheetId] = useState<string>("")
    const [date,setDate] = useState<string>("")
    const [finalData,setFinalData] = useState<{ operation: string; totalCount: number; target: number; }[]>([])
    

  

    const handleFetchProductions = async (data: { obbSheetId: string; date: Date }) => {
        try {
            data.date.setDate(data.date.getDate() + 1);
            const formattedDate = data.date.toISOString().split('T')[0].toString() + "%";
            
            setObbSheetId(data.obbSheetId);
            setDate(formattedDate);
            const dataa = await getData(data.obbSheetId,formattedDate)
            const processedData =  processData(dataa)
            setFinalData(processedData)
            setFilterApplied(true);
    
            // Directly refresh the router after updating the state.
            router.refresh();
        } catch (error: any) {
            console.error("Error fetching production data:", error);
            toast({
                title: "Something went wrong! Try again",
                variant: "error",
                description: (
                    <div className='mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md'>
                        <code className="text-slate-800">
                            ERROR: {error.message}
                        </code>
                    </div>
                ),
            });
        }
    };
const processData = (data: Awaited<ReturnType<typeof getData>>) => {
  // Step 1: Group by operation name
  const grouped: Record<string, typeof data> = {};

  for (const item of data) {
    const opName = item.obbOperation.operation.name;
    const oprName = item.operator.id
    const key = `${opName}_${oprName}`
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
console.log(grouped,"")
  // Step 2: Calculate totalPcs per operation (handle reset cases)
  const results = Object.entries(grouped).map(([operation, records]) => {
    // Sort by timestamp to ensure order
    const sorted = [...records].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(sorted)


    
      let totalProduction = 0;
      let lastValue = 0;

      sorted.forEach(record => {
        const currentValue = record.totalPcs || 0;
        if (currentValue < lastValue) {
          // Counter reset (operator logout or shift change)
          totalProduction += lastValue;
        }
        lastValue = currentValue;
      });

      totalProduction += lastValue;

      


    // Step 3: Return summarized info
    const target = records[0].obbOperation.target ?? 0;
    const seqNo = records[0].obbOperation.seqNo
    return {
      operation:records[0].obbOperation.operation.name+"-"+seqNo,
      totalCount: totalProduction,
      target:target*10,
      seqNo
    };
  });
   results.sort((a, b) => (a.seqNo ?? 0) - (b.seqNo ?? 0));

  console.log(results, "results");
  return results;
};




    useEffect(()=> {

        if(filterApplied)
        {
            setUserMessage("No Data Available...")
            
        }
    },[filterApplied])
    
    return (
        <>
            <div className="mx-auto max-w-7xl">
                <SelectObbSheetAndDate 
                    obbSheets={obbSheets}
                    handleSubmit={handleFetchProductions}
                />
            </div>
            <div className="mx-auto max-w-[1680px]">
                { obbSheetId.length > 0 ?
                    <div className="">
                        {/* <LineChartGraph 
                            data={production}
                        />  */}
                        <BarChartGraph
                            obbSheetId={obbSheetId}
                            date={date}
                            data = {finalData}
                                                      
                        />
                    </div>
                    :
                    <div className="mt-12 w-full">
                        <p className="text-center text-slate-500">{userMessage}</p>
                    </div>
                }
            </div>
        </>
    )
}

export default AnalyticsChart