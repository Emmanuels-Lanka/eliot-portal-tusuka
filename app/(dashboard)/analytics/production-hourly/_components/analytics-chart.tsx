"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ObbSheet } from "@prisma/client";
import { parseISO, getHours } from 'date-fns';

import HeatmapChart from "@/components/dashboard/charts/heatmap-chart";
import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";
import { useToast } from "@/components/ui/use-toast";
import EffiencyHeatmap from "./heatmap";
import { fetchDirectProductionData } from "@/actions/efficiency-direct-action";
// import EffiencyHeatmap from "@/components/dashboard/charts/efficiency-heatmap";


type ProductionDataForChartTypes = {
    id: string;
    operatorRfid: string;
    eliotSerialNumber: string;
    obbOperationId: string;
    productionCount: number;
    totalPcs:number;
    timestamp: string;
    createdAt: Date;
    operator: {
        name: string;
        employeeId: string;
        rfid: string;
    };
   
    obbOperation: {
        id: string;
        seqNo: number;
        target: number;
        smv: number;
        part:string;
        operation: {
            name: string;
        };
        sewingMachine: {
            
                machineId:string
            
        }
        
    };
    data: {

    }
   
};

interface AnalyticsChartProps {
    obbSheets: {
        id: string;
        name: string;
    }[] | null;
    title: string;
}

type EfficiencyResult = {
    data: {
        hourGroup: string,
        operation: {
            name: string,
            efficiency: number | null
        }[];
    }[];
    categories: string[];
};

const AnalyticsChart = ({
    obbSheets,
    title
}: AnalyticsChartProps) => {
    const { toast } = useToast();
    const router = useRouter();

    const [heatmapData, setHeatmapData] = useState<OperationEfficiencyOutputTypes>();
    const [obbSheet, setObbSheet] = useState<ObbSheet | null>(null);
    const [isNew,setIsNew] = useState<boolean>(true)

    function processProductionData(
    productionData: ProductionDataForChartTypes[], 
    state: boolean
    ): OperationEfficiencyOutputTypes {
    const hourGroups = [
        "7:00 AM - 8:00 AM", "8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", 
        "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM"
    ];

    const getHourGroup = (timestamp: string): string => {
        const date = new Date(timestamp);
        const hour = date.getHours();
        const minutes = date.getMinutes();
        if (minutes >= 5) {
            return hourGroups[Math.max(0, Math.min(12, hour - 7))];
        } else {
            return hourGroups[Math.max(0, Math.min(12, hour - 8))];
        }
    };

    const operationsMap: { [key: string]: ProductionDataForChartTypes[] } = {};
    productionData.forEach(data => {
        if (!operationsMap[data.obbOperationId]) {
            operationsMap[data.obbOperationId] = [];
        }
        operationsMap[data.obbOperationId].push(data);
    });

    const operations = Object.values(operationsMap).map(group => ({
        obbOperation: group[0].obbOperation,
        data: group
    })).sort((a, b) => a.obbOperation.seqNo - b.obbOperation.seqNo);

    const categories = operations.map(op => 
        `${op.obbOperation.operation.name} - (${op.obbOperation?.sewingMachine?.machineId || 'Unknown'}) - ${op.obbOperation.seqNo}`
    );
    const machines = operations.map(op => op.obbOperation?.sewingMachine?.machineId || 'Unknown');
    const eliot = operations.map(op => op.data[0]?.eliotSerialNumber || 'Unknown');

    const resultData = hourGroups.map(hourGroup => ({
        hourGroup,
        operation: operations.map(op => {
            const filteredData = op.data.filter(data => getHourGroup(data.timestamp) === hourGroup);

            let prod: number;

            if (!state) {
                // Mode A: Direct production count
                prod = filteredData.reduce((sum, curr) => sum + curr.productionCount, 0);
            } else {
                // Mode B: Cumulative difference with reset detection
                if (filteredData.length === 0) {
                    return { 
                        name: `${op.obbOperation.seqNo}-${op.obbOperation.operation.name}`, 
                        efficiency: null 
                    };
                }

                // Sort by timestamp ascending
                const sortedData = [...filteredData].sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );

                const currentHourIndex = hourGroups.indexOf(hourGroup);
                
                // Find previous hour's LAST totalPcs value
                let previousHourLastValue: number = 0;
                
                if (currentHourIndex > 0) {
                    for (let i = currentHourIndex - 1; i >= 0; i--) {
                        const previousHourGroup = hourGroups[i];
                        const prevHourData = op.data.filter(
                            (data) => getHourGroup(data.timestamp) === previousHourGroup
                        );

                        if (prevHourData.length > 0) {
                            // Get LAST record from previous hour
                            const sortedPrevData = [...prevHourData].sort((a, b) => 
                                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                            );
                            previousHourLastValue = sortedPrevData[sortedPrevData.length - 1].totalPcs;
                            break;
                        }
                    }
                }

                // **CRITICAL FIX: Process all records and detect resets**
                let totalProduction = 0;
                let lastValue = previousHourLastValue;

                for (let i = 0; i < sortedData.length; i++) {
                    const currentRecord = sortedData[i];
                    const currentTotal = currentRecord.totalPcs;

                    // **Reset Detection: If current < last, device was reset**
                    if (currentTotal < lastValue) {
                        // This is a reset!
                        // 1. Add production BEFORE reset (if this isn't the first record)
                        // 2. Start counting from the reset value
                        
                        console.log(`🔴 Reset detected at ${currentRecord.timestamp}`);
                        console.log(`   Previous value: ${lastValue}, Reset to: ${currentTotal}`);
                        
                        // The current value is production after reset
                        // No need to calculate difference, just add current value
                        totalProduction += currentTotal;
                        
                    } else {
                        // Normal increment
                        const increment = currentTotal - lastValue;
                        totalProduction += increment;
                    }

                    // Update last value for next iteration
                    lastValue = currentTotal;
                }

                prod = totalProduction;
            }

            const totalProduction = prod;
            
            return { 
                name: `${op.obbOperation.seqNo}-${op.obbOperation.operation.name}`, 
                efficiency: totalProduction >= 0 ? parseFloat(totalProduction.toFixed(1)) : 0
            };
        })
    }));

    return {
        data: resultData,
        categories,
        machines,
        eliot
    };
}
    useEffect(()=>{
        console.log(isNew)
    },[isNew])

    const handleFetchProductions = async (data: { obbSheetId: string; date: Date }) => {
        try {
            data.date.setDate(data.date.getDate() + 1);
            const formattedDate = data.date.toISOString().split('T')[0];
            // let response 
            // let state = true
           
            // response = await axios.get(`/api/efficiency-direct?obbSheetId=${data.obbSheetId}&date=${formattedDate}`);
            // if(response.data.data.length === 0){
            //     state = false
            //    response = await axios.get(`/api/efficiency/production?obbSheetId=${data.obbSheetId}&date=${formattedDate}`);
            // }
            
            // const heatmapData = processProductionData(response.data.data,state);
            
            // setHeatmapData(heatmapData);
            // setObbSheet(response.data.obbSheet);

            let response :any
                        let state = true
                       
                        // response = await axios.get(`/api/efficiency-direct?obbSheetId=${data.obbSheetId}&date=${formattedDate}`);
                         response  = await fetchDirectProductionData(data.obbSheetId, formattedDate);
            
                        if(response.data.length === 0){
                            state = false
                           response = await axios.get(`/api/efficiency/production?obbSheetId=${data.obbSheetId}&date=${formattedDate}`);
                        }
            
                        const heatmapData = processProductionData(response.data,state);
                        
                        setHeatmapData(heatmapData);
                        setObbSheet(response.data.obbSheet);

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
    }

    return (
        <>
            <div className="mx-auto max-w-7xl">
                <SelectObbSheetAndDate
                    obbSheets={obbSheets}
                    handleSubmit={handleFetchProductions}
                />
            </div>
            <div className="mx-auto max-w-[1680px]">
                {heatmapData ?
                    <div className="mt-12">
                        {/* <h2 className="text-lg mb-2 font-medium text-slate-700">{title}</h2> */}
                        <EffiencyHeatmap
                            xAxisLabel='Operations'
                            height={700}
                            efficiencyLow={obbSheet?.efficiencyLevel1}
                            efficiencyHigh={obbSheet?.efficiencyLevel3}
                            heatmapData={heatmapData}
                        />
                    </div>
                    :
                    <div className="mt-12 w-full">
                        <p className="text-center text-slate-500">Please select the OBB sheet and date ☝️</p>
                    </div>
                }
            </div>
        </>
    )
}

export default AnalyticsChart