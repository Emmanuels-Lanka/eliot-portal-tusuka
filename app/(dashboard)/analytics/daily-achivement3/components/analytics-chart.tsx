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
import { getData } from "../actions";
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

    const [heatmapData, setHeatmapData] = useState<OperationEfficiencyOutputTypes>();
    const [obbSheet, setObbSheet] = useState<ObbSheet | null>(null);
    const [prodData,setProdData] = useState<ProductionDataType []>([])
    
    const [userMessage,setUserMessage] = useState<string>("Please select a style and date ☝️")
    const [filterApplied,setFilterApplied] = useState<boolean>(false)

    const [obbSheetId,setObbSheetId] = useState<string>("")
    const [date,setDate] = useState<string>("")


  

    const handleFetchProductions = async (data: { obbSheetId: string; date: Date }) => {
        try {
            data.date.setDate(data.date.getDate() + 1);
            const formattedDate = data.date.toISOString().split('T')[0].toString() + "%";
            
            setObbSheetId(data.obbSheetId);
            setDate(formattedDate);
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