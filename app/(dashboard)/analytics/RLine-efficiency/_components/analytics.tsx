"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ObbSheet } from "@prisma/client";
import { parseISO, getHours } from "date-fns";

import HeatmapChart from "@/components/dashboard/charts/heatmap-chart";

import { useToast } from "@/components/ui/use-toast";
import EffiencyHeatmap from "@/components/dashboard/charts/efficiency-heatmap";
import SelectObbSheetAndDate from "./unit-obb";
import BarChartGraphEfficiencyRate from "./barchart";
import BarChartGraphEfficiencyRatetst from "./tst";
import DailyRepCompo from "./tst";

interface AnalyticsChartProps {
  obbSheets:
    | {
        id: string;
        name: string;
      }[]
    | null;
  title?: string;
  units: any;
}

export type newOperationEfficiencyOutputTypes = {
  data: {
    operation: {
      name: string;
      count: number | 0;
      earnMinute: number | 0;
    }[];
  }[];
  categories: string[];
  machines?: string[];
  eliot?: string[];
};

const AnalyticsChart = ({ obbSheets, units }: AnalyticsChartProps) => {
  const { toast } = useToast();
  const [newDate, setNewDate] = useState<any>();
  const [obbSheetId, setObbSheetId] = useState<any>();

  const handleFetchProductions = async (data: {
    obbSheetId: string;
    date: { from: Date; to: Date };
  }) => {
    try {
      data.date.from.setDate(data.date.from.getDate() + 1);
      data.date.to.setDate(data.date.to.getDate() + 1);

      const formattedDateFrom = data.date.from.toISOString().split("T")[0];
      const formattedDateTo = data.date.to.toISOString().split("T")[0];

      const formattedDate = {
        from: formattedDateFrom,
        to: formattedDateTo,
      };
      const obb = data.obbSheetId;

      setNewDate(formattedDate);

      setObbSheetId(obb);

      console.log(data)
    } catch (error: any) {
      console.error("Error fetching production data:", error);
      toast({
        title: "Something went wrong! Try again",
        variant: "error",
        description: (
          <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
            <code className="text-slate-800">ERROR: {error.message}</code>
          </div>
        ),
      });
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
      <DailyRepCompo obbSheets={obbSheets}/>
      </div>
    </>
  );
};

export default AnalyticsChart;
