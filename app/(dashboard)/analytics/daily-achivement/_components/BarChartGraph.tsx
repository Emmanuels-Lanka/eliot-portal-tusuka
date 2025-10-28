"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const chartConfig = {
  target: {
    label: "Daily Target",
    color: "hsl(var(--chart-1))",
  },
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-2))",
  },
  count: {
    label: "Actual Production",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

type BarchartData = {
  operation: string;
  totalCount: number;
  target: number;
};

interface BarChartGraphProps {
  data: BarchartData[];
  date?: string;
  obbSheetId?: string;
}

const BarChartGraph = ({ data, date, obbSheetId }: BarChartGraphProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      // Transform the data for the chart
      const transformedData = data.map(item => ({
        name: item.operation,
        count: item.totalCount,
        target: item.target,
      }));
      setChartData(transformedData);
      
      // Set initial width based on number of items
      const itemCount = transformedData.length;
      if (itemCount > 10) {
        setChartWidth(Math.min(itemCount * 8, 300));
      }
    }
  }, [data]);

  // Calculate max value for Y-axis domain
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.count, d.target)),
    0
  );
  const yAxisMax = Math.ceil(maxValue * 1.2 / 1000) * 1000;

  const saveAsPDF = async () => {
    if (!chartRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        // scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add logo and title
      const baseUrl = window.location.origin;
      const logoUrl = `${baseUrl}/logo.png`;
      
      const logo = new Image();
      logo.src = logoUrl;
      
      logo.onload = () => {
        // Add logo
        pdf.addImage(logo, 'PNG', 20, 15, 30, 15);
        
        // Add title
        pdf.setTextColor(0, 113, 193);
        pdf.setFontSize(16);
        pdf.text('Production Dashboard - Target vs Actual', 55, 25);
        
        // Add date if available
        if (date) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Date: ${date}`, 55, 32);
        }
        
        // Add chart
        const imgWidth = pdfWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, Math.min(imgHeight, pdfHeight - 60));
        
        pdf.save(`production-chart-${date || 'report'}.pdf`);
        setIsExporting(false);
      };
      
      logo.onerror = () => {
        // If logo fails to load, continue without it
        pdf.setTextColor(0, 113, 193);
        pdf.setFontSize(16);
        pdf.text('Production Dashboard - Target vs Actual', 20, 25);
        
        const imgWidth = pdfWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, Math.min(imgHeight, pdfHeight - 50));
        
        pdf.save(`production-chart-${date || 'report'}.pdf`);
        setIsExporting(false);
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsExporting(false);
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="mt-12 w-full">
        <p className="text-center text-slate-500">No Data Available...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-4">
        <Loader2 className={cn("animate-spin w-7 h-7 hidden", isExporting && "flex")} />
      </div>

      <div className="w-full">
        <div 
          className="border rounded-lg overflow-x-auto bg-white shadow-sm"
          style={{ maxHeight: '600px' }}
        >
          <Card 
            className="border-0" 
            style={{ 
              minWidth: `${chartWidth}%`,
              width: `${chartWidth}%`
            }}
          >
            <CardHeader className="pb-4">
              {/* <CardTitle className="text-xl">Production Analysis</CardTitle> */}
            </CardHeader>
            <CardContent ref={chartRef}>
              <ChartContainer
                config={chartConfig}
                className="w-full"
                style={{ height: '500px' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 100,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      domain={[0, yAxisMax]}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar 
                      dataKey="target" 
                     fill="var(--color-actual)" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    >
                      <LabelList
                        dataKey="target"
                        position="top"
                        offset={8}
                        className="fill-foreground"
                        fontSize={10}
                      />
                    </Bar>
                    <Bar 
                      dataKey="count" 
                     fill="orange"   
                      
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    >
                      <LabelList
                        dataKey="count"
                        position="top"
                        offset={8}
                        className="fill-foreground"
                        fontSize={10}
                      />
                    </Bar>
                    <ChartLegend
                  verticalAlign="top"
                  content={<ChartLegendContent />}
                  className="mt-2 text-sm"
                />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Chart Width:</span>
            <Button
              onClick={() => setChartWidth(prev => Math.max(prev - 20, 100))}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0"
              disabled={chartWidth <= 100}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {chartWidth}%
            </span>
            <Button
              onClick={() => setChartWidth(prev => Math.min(prev + 20, 300))}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0"
              disabled={chartWidth >= 300}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={saveAsPDF}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download as PDF
              </>
            )}
          </Button>
        </div>

      </div>
    </>
  );
};

export default BarChartGraph;