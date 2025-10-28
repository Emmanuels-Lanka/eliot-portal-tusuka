"use client"

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrafficLightSystem } from "@prisma/client";

import HeatmapChart from "@/components/dashboard/charts/heatmap-chart";
import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";
import { useToast } from "@/components/ui/use-toast";
import ChartContainerCompo from "../../daily-achivement3/components/chart-container";

interface AnalyticsChartProps {
    obbSheets: {
        id: string;
        name: string;
    }[] | null;
    title: string;
}

interface ProductionItem {
    roundNo: number;
    obbOperationId: string;
    colour: string;
    obbOperation: {
        operation: {
            name: string;
        };
    };
}

// Color mapping
const colorValues: { [key: string]: number } = {
    red: 25,
    orange: 50,
    green: 80
};

const AnalyticsChart = ({
    obbSheets,
    title
}: AnalyticsChartProps) => {
    const { toast } = useToast();
    const router = useRouter();

    const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
    const [heatmapCategories, setHeatmapCategories] = useState<string[] | null>(null);

    function processForHeatmap(productionData: ProductionItem[]) {
        const heatmapData: number[][] = Array.from({ length: 12 }, () => []);
        const xAxisCategories = new Set<string>();
        const operationMappings: { [key: string]: number } = {};

        productionData.forEach(item => {
            // Ensure roundNo is within the expected range
            if (item.roundNo >= 1 && item.roundNo <= 12) {
                const roundIndex = item.roundNo - 1;
                const value = colorValues[item.colour]; // Default to 0 if color not defined

                // Map operations to consistent indexes in the xAxisCategories and heatmapData
                if (!(item.obbOperationId in operationMappings)) {
                    operationMappings[item.obbOperationId] = Object.keys(operationMappings).length;
                    xAxisCategories.add(item.obbOperation.operation.name);
                }

                const operationIndex = operationMappings[item.obbOperationId];

                // Add the value to the correct position
                heatmapData[roundIndex][operationIndex] = value;
            }
        });

        // Ensure each round contains entries for all operations, even if they are zero
        heatmapData.forEach((round, index) => {
            for (let i = 0; i < Object.keys(operationMappings).length; i++) {
                if (round[i] === undefined) {
                    heatmapData[index][i];
                }
            }
        });

        return {
            heatmapData,
            xAxisCategories: Array.from(xAxisCategories)
        };
    }

    const handleFetchProductions = async (data: { obbSheetId: string; date: Date }) => {
        try {
            data.date.setDate(data.date.getDate() + 1);
            const formattedDate = data.date.toISOString().split('T')[0];
            const response = await axios.get(`/api/tls/fetch-tls-by-obb?obbSheetId=${data.obbSheetId}&date=${formattedDate}`);

            const { heatmapData, xAxisCategories } = processForHeatmap(response.data.data);
            setHeatmapData(heatmapData);
            setHeatmapCategories(xAxisCategories);

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
        <div className="mx-auto max-w-7xl">
            <SelectObbSheetAndDate
                obbSheets={obbSheets}
                handleSubmit={handleFetchProductions}
                
            />
            
            {heatmapData !== null && heatmapCategories !== null ?
                <div className="mt-12">
                    <h2 className="text-lg mb-2 font-medium text-slate-700">{title}</h2>
                    <HeatmapChart
                        xAxisLabel='Operations for TLS'
                        height={720}
                        type="tls"
                        heatmapData={heatmapData}
                        heatmapCategories={heatmapCategories}
                    />
                </div>
                :
                <div className="mt-12 w-full">
                    <p className="text-center text-slate-500">Please select the OBB sheet and date ☝️</p>
                 
                </div>
            }
        </div>
    )
}

export default AnalyticsChart