"use client"
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SelectObbSheetAndDate from "./select-style-and-date";
import { EmployeeRecord, getNewData,  newData } from './actions';
import { getFormattedTime } from '@/lib/utils-time';
import { getObbData } from '../../line-efficiency/_components/actions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ProcessedData {
  total?: number;
  operator: string;
  data: {
    diff: number;
    eff: number;
    production_date: string;
    operatorRfid: string;
    daily_total: number;
    name: string;
    LoginDate: string;
    smv: number;
    LoginTimestamp: Date;
    LogoutTimestamp: Date;
    date: string;
  }[];
}

interface AnalyticsChartProps {
  obbSheets: {
    id: string;
    name: string;
  }[] | null;
  operators:EmployeeRecord[]
   

}

const ReportTable = ({ obbSheets, operators }: AnalyticsChartProps) => {
  const [date, setDate] = React.useState<string>("");
  const [startdate, setStartDate] = React.useState<string>("");
  const [enddate, setendDate] = React.useState<string>("");
  const [data, setData] = React.useState<any[]>([]);
  const [obb, setObb] = React.useState<any>();
  const [operatorID, setOperatorID] = React.useState<string>("");
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFetchProductions = async (data: { operatorId: string; date: Date; endDate: Date }) => {
    const start = getFormattedTime(data.date.toString());
    const end = getFormattedTime(data.endDate.toString());
    
    setStartDate(start);
    setendDate(end);
    let selectedDate = new Date();
    selectedDate.setDate(selectedDate.getDate());
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setDate(formattedDate)
    
    data.date.setDate(data.date.getDate() + 1);
    setOperatorID(data.operatorId);

    console.log(start,end,data.operatorId)

  };

  const processDatas = (data: newData[]) => {
    const effMap = data.map((d) => {
      const login = new Date(d.LoginTimestamp);
      const logout = new Date(d.LogoutTimestamp);
      const diff = Number(((logout.getTime() - login.getTime()) / 60000 - 60).toFixed(2));
      const earnMins = Number(Number((d.daily_production) * d.smv).toFixed(2));
      const eff = Number(((earnMins / diff) * 100).toFixed(2));
      const prod = Number(d.daily_production)

      return {
        ...d,
        diff,
        eff,
        earnMins,prod
      };
    });
    return effMap;
  };

  const getDetails = async () => {
    const data = await getNewData(startdate, enddate, operatorID);
    const pData = processDatas(data);
    setData(pData);
    const o = pData[0].obbSheetId;
    const obb = await getObbData(o);
    setObb(obb);
  };

  React.useEffect(() => {
    if (operatorID && startdate && enddate) {
      getDetails();
    }
  }, [operatorID, startdate, enddate]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !data.length) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      } as any);

      const imgWidth = 210 -20; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
      
      const fileName = `Operator_Monthly_Efficiency_Report_${data[0].name}_${startdate}_${enddate}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>

      
    <div>
      <SelectObbSheetAndDate operators={operators} handleSubmit={handleFetchProductions} />
      {data.length > 0 && (
        <Button className="mt-5 shadow-lg" onClick={handleDownloadPDF}>
          Download as PDF
        </Button>
      )}


      {  (operatorID && startdate && enddate) &&
        
        <div ref={reportRef} className="mt-5 mb-10 ">
        <div className="text-center">
          <img src="/ha-meem.png" alt="Ha-Meem Logo" className="mx-auto w-[120px] h-auto mt-[10px]" />
          <h5 className="mt-[10px]">~ Bangladesh ~</h5>
          <h1 className="text-center">Operator Monthly Efficiency Report</h1>
          <hr className="my-4" />
        </div>
        
        <div className="flex justify-around mt-5 text-sm">
          <div className="flex-1 mr-[10px] leading-[1.5]">
            <h5 className="m-0">Factory Name: Apparel Gallery LTD</h5>
            <h5 className="m-0">Operator: {data[0]?.name}</h5>
            <h5 className="m-0">Employee Id: {data[0]?.employeeId}</h5>
            <h5 className="m-0">Report Starting Date: {startdate}</h5>
            <h5 className="m-0">Report Ending Date: {enddate}</h5>
          </div>
          <div className="flex-1 justify-around ml-[10px] leading-[1.5]">
            <h5 className="m-0">Unit: {obb?.[0]?.unit}</h5>
            <h5 className="m-0">Buyer: {obb?.[0]?.buyer}</h5>
            <h5 className="m-0">Style Name: {obb?.[0]?.style}</h5>
            {/* <h5 className="m-0">Line Name: {obb?.[0]?.line}</h5> */}
            <h5 className="m-0">Generated Date: {date}</h5>
          </div>
        </div>

        <Table className="mt-5">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center bg-gray-100">Operation Performed</TableHead>
              <TableHead className="text-center w-[150px] bg-gray-100">Date</TableHead>
              <TableHead className="text-center w-[60px] bg-gray-100">Operation SMV</TableHead>
              <TableHead className="text-center w-[60px] bg-gray-100">Daily Production</TableHead>
              <TableHead className="text-center w-[60px] bg-gray-100">Earn Minutes</TableHead>
              <TableHead className="text-center w-[60px] bg-gray-100">Available Minutes</TableHead>
              
              <TableHead className="text-center w-[100px] bg-gray-100">Efficiency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d, index) => (
              <TableRow key={index}>
                <TableCell className="text-center border border-gray-100">{d.operation}</TableCell>
                <TableCell className="text-center border border-gray-100">{d.LoginDate}</TableCell>
                <TableCell className="text-center border border-gray-100">{d.smv}</TableCell>
                <TableCell className="text-center border border-gray-100">{d.daily_production}</TableCell>
                <TableCell className="text-center border border-gray-100">{d.earnMins}</TableCell>
                <TableCell className="text-center border border-gray-100">{d.diff}</TableCell>
                
                <TableCell className="text-center border border-gray-100">{d.eff}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} rowSpan={2}>Total Line Efficiency</TableCell>
              <TableCell className="text-center border border-gray-100">Total Working Days</TableCell>
              <TableCell className="text-center border border-gray-100">Total Daily Production</TableCell>
              <TableCell className="text-center border border-gray-100">Total Earn Minutes</TableCell>
              <TableCell className="text-center border border-gray-100">Total Available Mins</TableCell>
              <TableCell className="text-center border border-gray-100">Overall Efficiency</TableCell>
            </TableRow>
            <TableRow>
              {/* <TableCell  className="border border-gray-100">Total Line Efficiency</TableCell> */}
              <TableCell className="text-center border border-gray-100">
              {data.length}
              </TableCell>
              <TableCell className="text-center border border-gray-100">
              {data.reduce((a,b) => a + b.prod, 0)}
              </TableCell>
              <TableCell className="text-center border border-gray-100">
                {data.reduce((a,b) => a + b.earnMins, 0).toFixed(1)}
              </TableCell>
              <TableCell className="text-right border border-gray-100">
                {data.reduce((a,b) => a + b.diff, 0).toFixed(1)}
              </TableCell>
              <TableCell className="text-center border border-gray-100">
                {Number((((Number(data.reduce((a,b) => a + b.earnMins, 0).toFixed(1)))/(Number(data.reduce((a,b) => a + b.diff, 0).toFixed(1))))*100).toFixed(2))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <div className="flex justify-between items-center mt-[50px]">
          <div>
            <p><a href="https://www.portal.eliot.global/">https://www.portal.eliot.global/</a></p>
          </div>
          <div className="footer-logo">
            <img src="/eliot-logo.png" alt="Company Footer Logo" className="w-[100px] h-auto" />
          </div>
        </div>
      </div> }
      
    </div>
    </div>
  );
};


export default ReportTable