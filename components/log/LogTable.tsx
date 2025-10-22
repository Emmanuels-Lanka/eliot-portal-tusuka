"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getData, getLogData } from './action';
import SelectObbSheetAndDate from '../dashboard/common/select-obbsheet-and-date';
import TableComponent from './TableComponent';

// Types
interface ObbSheet {
  id: string;
  name: string;
}

interface AnalyticsChartProps {
  obbSheets: ObbSheet[] | null;
}

export interface ProductionDataType {
  name: string;
  count: number;
  target: number;
  employeeId: string;
  machineId: string;
  eliotSerialNumber: string;
  code: string;
  operationname: string;
  totprod: number;
  LoginTimestamp: string;
  LogoutTimestamp: string;
}

type LogData = Awaited<ReturnType<typeof getLogData>>;

interface ProcessedOperation {
  obbOperation: any;
  operator: any;
  data: any[];
}

interface FormattedOperation extends ProcessedOperation {
  totalProduction: number;
}

interface FormattedData {
  eliotSerialNumber: string;
  employeeId: string;
  name: string;
  code: string;
  totprod: number;
  target: number;
  operationname: string;
  seqNo: number;
  machineId: string;
}

const LogTable: React.FC<AnalyticsChartProps> = ({ obbSheets }) => {
  const [date, setDate] = useState<string>("");
  const [obbSheetId, setObbSheetId] = useState<string>("");
  const [data, setData] = useState<FormattedData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized data processing functions
  const processData = useCallback((productionData: LogData): ProcessedOperation[] => {
    if (!productionData?.length) return [];

    const operationsMap = new Map<string, any[]>();
    
    productionData.forEach(data => {
      const operationId = data.obbOperation?.id;
      const operatorId = data.operator?.employeeId;
      
      if (!operationId || !operatorId) return;
      
      const key = `${operationId}_${operatorId}`;
      const existing = operationsMap.get(key) || [];
      existing.push(data);
      operationsMap.set(key, existing);
    });

    return Array.from(operationsMap.values())
      .map(group => ({
        obbOperation: group[0].obbOperation,
        operator: group[0].operator,
        data: group
      }))
      .sort((a, b) => (a.obbOperation?.seqNo || 0) - (b.obbOperation?.seqNo || 0));
  }, []);

  const calculateTotalProduction = useCallback((operations: ProcessedOperation[]): FormattedOperation[] => {
    return operations.map(op => {
      const sortedData = [...op.data].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      let totalProduction = 0;
      let lastValue = 0;

      sortedData.forEach(record => {
        const currentValue = record.totalPcs || 0;
        if (currentValue < lastValue) {
          // Counter reset (operator logout or shift change)
          totalProduction += lastValue;
        }
        lastValue = currentValue;
      });

      totalProduction += lastValue;

      return {
        ...op,
        totalProduction
      };
    });
  }, []);

  const formatData = useCallback((totals: FormattedOperation[]): FormattedData[] => {
    return totals.map(t => ({
      eliotSerialNumber: t.data[0]?.EliotDevice?.serialNumber || "",
      name: t.operator?.name || "",
      totprod: t.totalProduction,
      target: t.data[0]?.obbOperation?.target || 0,
      code: t.data[0]?.obbOperation?.operation?.code || "",
      seqNo: t.data[0]?.obbOperation?.seqNo || 0,
      operationname: t.obbOperation?.operation?.name || "",
      employeeId: t.operator?.employeeId || "",
      machineId: t.data[0]?.EliotDevice?.sewingMachines?.machineId || ""
    }));
  }, []);

  // Memoized date formatting
  const formatDate = useCallback((date: Date): string => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return `${nextDay.toISOString().split('T')[0]}%`;
  }, []);

  // Data fetching function
  const fetchData = useCallback(async (sheetId: string, dateStr: string) => {
    if (!sheetId || !dateStr) return;

    setIsLoading(true);
    setError(null);

    try {
      const [details, logData] = await Promise.all([
        getData(sheetId, dateStr),
        getLogData(sheetId, dateStr)
      ]);

      console.log("Log data:", logData);

      const operations = processData(logData);
      const totals = calculateTotalProduction(operations);
      const formatted = formatData(totals);

      console.log("Processed data:", { operations, totals, formatted });
      
      setData(formatted);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch production data");
    } finally {
      setIsLoading(false);
    }
  }, [processData, calculateTotalProduction, formatData]);

  // Handle form submission
  const handleFetchProductions = useCallback(async (formData: { obbSheetId: string; date: Date }) => {
    const formattedDate = formatDate(formData.date);
    
    setObbSheetId(formData.obbSheetId);
    setDate(formattedDate);
  }, [formatDate]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    if (obbSheetId && date) {
      console.log("Fetching data for:", { obbSheetId, date });
      fetchData(obbSheetId, date);
    }
  }, [obbSheetId, date, fetchData]);

  // Memoize card content to prevent unnecessary re-renders
  const cardContent = useMemo(() => (
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">
          {error}
        </div>
      ) : (
        <TableComponent data={data} />
      )}
    </CardContent>
  ), [data, isLoading, error]);

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Future content can go here */}
      </div>
      
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Production Log</CardTitle>
          <CardDescription>
            View production data by selecting an OBB sheet and date
          </CardDescription>
          
          <SelectObbSheetAndDate
            obbSheets={obbSheets}
            handleSubmit={handleFetchProductions}
          />
        </CardHeader>

        {cardContent}
      </Card>
    </div>
  );
};

export default LogTable;