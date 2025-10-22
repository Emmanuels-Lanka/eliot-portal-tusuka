"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Operationprops = {
  operationData: {
    operator: string;
    operatorId: string;
    operation: string;
    smv: number;
    earnMins: number;
    availableMins: number;
    efficiency: number;
    totalPcs: number;
    machine: string;
    loginDate:string;
    logoutDate:string;
  }[];
  obbSheetData: any;

  data:any
    startdate:string;
  enddate:string;
};

const TableCompo = ({
  operationData,
  obbSheetData,
  startdate,
  enddate,
  data
}: Operationprops) => {
  const reportRef = useRef<HTMLDivElement>(null);

  

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const input = reportRef.current;

    // Capture the whole component as canvas with reasonable scale for quality
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    } as any);

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(
      `Operator_Efficiency_Report_${startdate.replace(/ /g, "_")}.pdf`
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4 print-button">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download size={16} />
          Export as PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-white p-6 rounded-lg">
        {/* <div className="text-center mb-6">
          <img 
            src="/ha-meem.png" 
            alt="Ha-Meem Logo" 
            className="mx-auto w-[100px] h-auto mb-2 print:w-[90px]"
          />
          <h5 className="text-gray-600 mb-1">~ Bangladesh ~</h5>
          <h1 className="text-xl font-bold text-gray-800">
            Operator Daily Efficiency Report
          </h1>
          <hr className="my-3 border-t border-gray-300" />
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-6 text-sm">
          <div className="mb-4 md:mb-0">
            <p className="m-0 font-medium">Factory Name: Apparel Gallery LTD</p>
            <p className="m-0 font-medium">Unit: {obbSheetData.unit.name}</p>
            <p className="m-0 font-medium">Line Name: {obbSheetData.productionLine.name}</p>
          </div>
          <div>
            <p className="m-0 font-medium">Buyer: {obbSheetData.buyer}</p>
            <p className="m-0 font-medium">Style Name: {obbSheetData.style}</p>
            <p className="m-0 font-medium">Date: {currentDate}</p>
            <p className="m-0 font-medium">Printed on: {new Date().toLocaleString()}</p>
            
          </div>
        </div> */}

<div className="mb-3">
  {/* Top row with logo, title, and dates */}
  <div className="flex items-center justify-between mb-1.5">
   
    <h1 className="text-[15px] font-bold text-center mx-2">
      AVG. EFFICIENCY REPORT - INDIVIDUAL OPERATOR
    </h1>
    <div className="text-[11px] text-right min-w-[120px]">
      <div className="text-gray-600">Date: {startdate}-{enddate}</div>
      <div className="text-gray-600">Printed: {new Date().toLocaleTimeString()}</div>
    </div>
  </div>

  {/* Factory info in single compact line */}
  <div className="flex flex-wrap justify-center items-center gap-x-2 text-[11px] font-medium mb-1 px-2">
    
   
    <div className="flex items-center">
      <span className="text-gray-600">Operator:</span>
      <span className="ml-1">{operationData[0].operator}</span>
    </div>
    <div className="w-px h-3 bg-gray-300 mx-1"></div>
    <div className="flex items-center">
      <span className="text-gray-600">Operator ID:</span>
      <span className="ml-1">{operationData[0].operatorId}</span>
    </div>
    
  </div>

  {/* Footer note */}
  <div className="text-[10px] text-center text-gray-500 italic mt-1">
    (*) Indicates operator worked in multiple operations
    
  </div>

  {/* Thin divider line */}
  <div className="border-t border-gray-200 mt-1.5"></div>
</div>

        <Table className="border border-gray-300">
  <TableHeader className="bg-gray-100">
    <TableRow>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold">MC ID</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold">Login Time</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold">Logout Time</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold">Operation Name</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold">SMV</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold text-center">Production</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold text-center">Earn Minutes</TableHead>
      <TableHead className="px-2 py-1 border-r border-gray-300 font-semibold text-center">Available Mins</TableHead>
      <TableHead className="px-2 py-1 font-semibold text-center">Efficiency(%)</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {operationData.map((d, rid) => (
      <TableRow key={rid}>
        <TableCell className="px-2 py-1 border-r border-gray-300">{d.machine}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300">{d.loginDate}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300">{d.logoutDate}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300">{d.operation}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300">{d.smv}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300 text-center">{d.totalPcs}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300 text-center">{d.earnMins}</TableCell>
        <TableCell className="px-2 py-1 border-r border-gray-300 text-center">{d.availableMins.toFixed(2)}</TableCell>
        <TableCell className={`px-2 py-1 text-center font-medium ${
          d.efficiency > 100 ? 'text-green-600' : 
          d.efficiency > 80 ? 'text-blue-600' : 
          d.efficiency > 60 ? 'text-orange-600' : 'text-red-600'
        }`}>
          {d.efficiency.toFixed(2)}%
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter className="bg-gray-50">
    <TableRow>
      <TableCell colSpan={5} className="px-2 py-1 border-r border-gray-300 font-semibold text-right">
        Totals:
      </TableCell>
      <TableCell className="px-2 py-1 border-r border-gray-300 font-semibold text-center">
        {operationData.reduce((sum, item) => sum + (item.totalPcs || 0), 0)}
      </TableCell>
      <TableCell className="px-2 py-1 border-r border-gray-300 font-semibold text-center">
        {data.totalEarnMins}
      </TableCell>
      <TableCell className="px-2 py-1 border-r border-gray-300 font-semibold text-center">
        {data.totalAvailableMins}
      </TableCell>
      <TableCell className="px-2 py-1 font-semibold text-center">
        {data.totalEfficiency}%
      </TableCell>
    </TableRow>
  </TableFooter>
</Table>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-4 border-t border-gray-300">
          <div className="mb-4 md:mb-0">
            <p className="text-xs text-gray-600">
              <a
                href="https://www.portal.eliot.global/"
                className="hover:underline print:text-black"
              >
                https://www.portal.eliot.global/
              </a>
            </p>
          </div>

          <div>
            <img
              src="/eliot-logo.png"
              alt="Eliot Logo"
              className="w-[100px] h-auto print:w-[90px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCompo;
