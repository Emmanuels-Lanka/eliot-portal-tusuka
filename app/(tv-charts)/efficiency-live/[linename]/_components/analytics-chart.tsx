"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ObbSheet, OperatorSession } from "@prisma/client";
import { parseISO, getHours } from 'date-fns';

import HeatmapChart from "@/components/dashboard/charts/heatmap-chart";
import SelectObbSheetAndDate from "@/components/dashboard/common/select-obbsheet-and-date";
import { useToast } from "@/components/ui/use-toast";
// import EffiencyHeatmap from "@/components/dashboard/charts/efficiency-heatmap";
import { getLinebyOS, getObbSheetID } from "@/components/tv-charts/achievement-rate-operation/actions";
import LogoImporter from "@/components/dashboard/common/eliot-logo";
import EffiencyHeatmap from "./effheat";
import { boolean, string } from "zod";
import Image from "next/image";
import { fetchDirectProductionData } from "@/actions/efficiency-direct-action";
// import EffiencyHeatmap from "./effheatmap";

type ProductionDataForChartTypes = {
  
  id: string;
  operatorRfid: string;
  eliotSerialNumber: string;
  obbOperationId: string;
  productionCount: number;
  totalPcs:number;
  efficiency :number;
  timestamp: string;
  createdAt: Date;
  operator: {
      name: string;
      employeeId: string;
      rfid: string;
      operatorSessions?:any[]
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
const AnalyticsChart = ({ linename }: { linename: string }) => {
    const { toast } = useToast();
    const router = useRouter();

    const [heatmapData, setHeatmapData] = useState<OperationEfficiencyOutputTypes>();
    const [obbSheet, setObbSheet] = useState<ObbSheet | null>(null);

    
    const [obbSheetId, setobbSheetId] = useState<string>("")
    const [lineName, setLineName] = useState<string>("")
    
  const [date, setDate] = useState<string>("");

  const fetchObbSheetId = async () => {
    try {
    //   const id = await getObbSheetID(linename);
      const line =await getLinebyOS(linename);
      if (line) {
        setobbSheetId(linename);
        setLineName(line);
        setDate(getFormattedDate());
      }
    } catch (error) {
      console.error("Error fetching OBB Sheet ID:", error);
      toast({
        title: "Error fetching OBB Sheet ID",
        variant: "destructive"
      });
    }
  };
    
  const getFormattedDate = () => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  };

  const upcase= (part:string) =>{
    return part.toUpperCase();
  }
  

  function shortenOperationName(operationName:string) {
    // Check if the input is a valid string
    if (typeof operationName !== 'string' || operationName.trim() === '') {
        return ''; // Return an empty string for invalid input
    }

    // Split the operation name into words
    const words = operationName.split(' ').filter(word => word); // Filter out any empty strings

    // If there are no words, return an empty string
    if (words.length === 0) {
        return '';
    }

    // Get the first two words
    const firstTwoWords = words.slice(0, 2).join(' ');

    // Get the rest of the words and convert them to short form
    const restShortForm = words.slice(2).map(word => word[0] + '.').join(' ');

    // Combine the first two words with the short form of the rest
    return restShortForm ? `${firstTwoWords} ${restShortForm}` : firstTwoWords;
}

const abbreviatePart = (part: string) => {
    switch (part.toLowerCase()) {
      case 'front':
        return 'F';
      case 'back':
        return 'B';
      case 'assembly':
        return 'A';
      case 'line-end':
        return 'E';
      default:
        return part.toUpperCase();
    }
  };

  // function shortenName(name :string) {
  //   let words = name.split(" ");
  //   if (words.length === 0) return "";
    
  //   let firstWord = words[0]; // First word remains the same
  //   let shortForm = words.slice(1).map(word => word[0]).join("."); // First letters of other words
    
  //   return shortForm ? `${firstWord}   ${shortForm}` : firstWord;
  // }
  
  function shortenName(name: string): string {
    const words = name.trim().split(/\s+/);
    return words.length <= 2 
        ? name.trim() 
        : `${words[0]} ${words[1]} ${words.slice(2).map(w => w[0]).join(".")}`;
}

    function processProductionData(productionData: ProductionDataForChartTypes[]): OperationEfficiencyOutputTypes {
      const hourGroups = ["8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM"];

        const getHourGroup = (timestamp: string): string => {
            const date = new Date(timestamp);
    const hour = date.getHours();
    const minutes = date.getMinutes();
    if (minutes >= 5) {
        return hourGroups[Math.max(0, Math.min(10, hour - 8))];
    } else {
        // If minutes are less than 5, group it to the previous hour group
        return hourGroups[Math.max(0, Math.min(10, hour - 9))];
    }
            // const hour = new Date(timestamp).getHours();
            // return hourGroups[Math.max(0, Math.min(11, hour - 7))];
        };

        const latestTimestamp = productionData.reduce((latest, current) => {
            return latest > current.timestamp ? latest : current.timestamp;
          }, "");
          const mostRecentHourGroup = getHourGroup(latestTimestamp);
        const operationsMap: { [key: string]: ProductionDataForChartTypes[] } = {};
        productionData.forEach(data => {
            if (!operationsMap[data.obbOperationId]) {
                operationsMap[data.obbOperationId] = [];
            }
            operationsMap[data.obbOperationId].push(data);
        });

        // Fixed sorting - only by sequence number
        const operations = Object.values(operationsMap).map(group => ({
            obbOperation: group[0].obbOperation,
            data: group,
            operator: group[0]
        })).sort((a, b) => {
            // Simply sort by sequence number only
            return a.obbOperation.seqNo - b.obbOperation.seqNo;
        });

        // const categories = operations.map(op => `${op.obbOperation.operation.name}-${op.obbOperation.seqNo}`);
        
        const categories = operations.map(op => ` ${shortenOperationName(op.obbOperation.operation.name)}-${shortenName(op.operator.operator.name)}-${op.obbOperation.smv}-${abbreviatePart(op.obbOperation.part)}-${op.obbOperation?.sewingMachine?.machineId || 'Unknown Machine ID'}-${op.obbOperation.seqNo}`);
        const machines = operations.map(op => ` ${op.obbOperation?.sewingMachine?.machineId || 'Unknown Machine ID'}`);
        const eliot = operations.map(op => ` ${op.data[0].eliotSerialNumber}`);

 const resultData = hourGroups
//  hourGroup !== mostRecentHourGroup  &&  removed from
 .filter(hourGroup => hourGroup !== "1:00 PM - 2:00 PM") // Exclude the most recent hour group
      .map(hourGroup => ({
            hourGroup,
            operation: operations.map(op => {
              
             
              // const loginTimestamp = op.operator.operator?.operatorSessions?.[0]?.LoginTimestamp;
              const currentTime = new Date(); // Get present time
        
              // Calculate time difference in minutes
              // let timeDiffMinutes = (currentTime.getTime() - loginTime.getTime()) / (1000 * 60);
        
              // If current time is past 2 PM, subtract 60 minutes
              // if (currentTime.getHours() >= 14) {
              //   timeDiffMinutes -= 60;
              // }
              


                // console.log(loginTimestamp)
                const filteredData = op.data.filter(data => getHourGroup(data.timestamp) === hourGroup);
                // const obbop = filteredData[0].obbOperationId
                // console.log(filteredData)
                if (filteredData.length === 0) return { name: op.obbOperation.operation.name, efficiency: null };
                
               
                const log = filteredData[0].operator.operatorSessions
                ?.filter((s) => s.obbOperationId === op.obbOperation.id)
                ?.sort((a, b) => new Date(b.LoginTimestamp).getTime() - new Date(a.LoginTimestamp).getTime())[0]
                ?.LoginTimestamp;
                // const loginTimestamp = filteredData[0]?.operator?.operatorSessions?.[0]?.LoginTimestamp;
                const loginTime = new Date(log); // Convert to Date object

                const  lastProduction = filteredData[0].totalPcs  ;
                const  lastProductionTime = filteredData[0].timestamp;
                const  firstProduction= filteredData[filteredData.length - 1].totalPcs  ;
                const productionCount = lastProduction - firstProduction;
                const earnMins = productionCount * op.obbOperation.smv;
                const liveEarnMins = lastProduction*op.obbOperation.smv

                const directEfficiency = filteredData[0].efficiency

                let efficiency: number | null = null;

                  // const firstTime = new Date(filteredData[0].timestamp);
                  const lastTime = new Date(lastProductionTime)
                  // const currentTime = new Date(); no need cuz of time zone issues  
                  let timeDiffMinutes = (lastTime.getTime() - loginTime.getTime()) / (1000 * 60);
                  
                  let is2Passed :boolean = false
                  let isLoggedBfr2 :boolean =false

                  if (
                      lastTime.getHours() > 14 || (lastTime.getHours() === 14 && lastTime.getMinutes() >= 5)
                    ) {
                      if (loginTime.getHours() < 14 || (loginTime.getHours() === 14 && loginTime.getMinutes() < 5)) {
                        timeDiffMinutes -= 60;
                        isLoggedBfr2 = true
                      }
                      is2Passed = true;
                    }
                    
                  // If current time is past 2 PM, subtract 60 minutes
              // if (currentTime.getHours() >= 14) {
              //   timeDiffMinutes -= 60;
              // }
              
                  // efficiency = timeDiffMinutes > 0 ? (liveEarnMins * 100) / timeDiffMinutes : 0;
              efficiency = timeDiffMinutes > 0 ? Math.min((liveEarnMins * 100) / timeDiffMinutes, 100) : 0;


                // const totalProduction = filteredData.reduce((sum, curr) => sum + curr.productionCount, 0);
                // const earnmins = op.obbOperation.smv * totalProduction
              // console.log("fd",filteredData)


                //  efficiency = filteredData.length > 0 ? (totalProduction === 0 ? 0 : ((earnmins * 100) / timeDiffMinutes)) : null;
                //  const efficiency = totalProduction
                const timeDiff = timeDiffMinutes
             
                
                
                return { name: `${op.obbOperation.seqNo}-${op.obbOperation.operation.name}`, efficiency: lastProduction !== null ? Math.round(directEfficiency +0.0001) : null 
                ,part: op.obbOperation.part,timeDiffMinutes:timeDiffMinutes,
                totalProduction:productionCount,firstProduction,lastProduction,
                smv:op.obbOperation.smv,opLogin:loginTime,is2Passed,lastProductionTime,operator:op.operator.operatorRfid,
                isLoggedBfr2};
            })
        }));
        console.log("first", resultData)
        return {
            data: resultData,
            categories,
            machines,
            eliot,


        };
    }

    const handleFetchProductions = async () => {
        if (!obbSheetId || !date) return;
        try {
            
            const y = new Date().getFullYear().toString()
            const m = (new Date().getMonth() + 1).toString().padStart(2, "0")
            //const d = new Date().getDate().toString().padStart(2, "0")
            const today = new Date();
            const yyyyMMdd = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
          
           const date =  yyyyMMdd.toString()
       
            // const response = await axios.get(`/api/efficiency-live?obbSheetId=${obbSheetId}&date=${date}`);
            // const response = await axios.get(`/api/efficiency-direct?obbSheetId=${obbSheetId}&date=${date}` ,{timeout: 30000}   );

            // // console.log("re",response.data.data)
            // const heatmapData = processProductionData(response.data.data);
            
            // setHeatmapData(heatmapData);
            // setObbSheet(response.data.obbSheet);

            const response : any = await fetchDirectProductionData(obbSheetId, date);
            const heatmapData = processProductionData(response.data);

            setHeatmapData(heatmapData);
            setObbSheet(response.obbSheet);

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

    
    useEffect(() => {
        fetchObbSheetId();
      }, [linename]);
    
      useEffect(() => {
        if (obbSheetId && date) {
          handleFetchProductions();
          const intervalId = setInterval(handleFetchProductions, 5 * 60 * 1000);
          return () => clearInterval(intervalId);
        }
      }, [obbSheetId, date,linename]);
    
      


    return (
      <>
        <div className="h-screen  w-screen flex flex-col ">
          {/* Header Section */}
            <div className="flex justify-center items-center gap-3 w-full py-4">
              
                <div>
                
                <Image
                                src="/eliot-logo.png"
                                alt='logo'
                                width={200}
                                height={200}
                                className='py-0'
                            />
                
                    </div>


              <h1 className="text-[#0071c1] text-3xl text-center">
                Dashboard - LIVE Efficiency TV Graph - {lineName}
              </h1>
            </div>

          {/* Heatmap Section */}
          <div className=" flex justify-center items-center">
            {heatmapData ? (
              <EffiencyHeatmap
                xAxisLabel="Operations"
                efficiencyLow={obbSheet?.efficiencyLevel1}
                efficiencyHigh={obbSheet?.efficiencyLevel3}
                heatmapData={heatmapData}
              />
            ) : (
              <span className="text-lg text-gray-500">
                No Layout for Line {lineName} - {date}
              </span>
            )}
          </div>
        </div>
      </>
    );
}

export default AnalyticsChart