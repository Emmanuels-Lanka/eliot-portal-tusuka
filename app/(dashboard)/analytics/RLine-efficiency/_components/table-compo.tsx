import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


type SessionTotals = {
  totalAvailableHours: number;
  totalProductionStandardHours: number;
  totalOffStandHours: number;
  totalOverallEfficiency: number;
  totalOnStandEfficiency: number;
  totalAvailableMins: number;
  totalEarnMins: number;
  totalOffStandMins: number;
};
// Updated interface to match summarizeEfficiencies output
export interface SummaryTableProps {
  tableProp: Array<{
    operator: string;
    operatorId: string;
    totalEarnMins: number;
    totalAvailableMins: number;
    efficiency: number;
    onStandEfficiency: number;
    operations: string;
    totalOffStandMins?: number; // Add this if not included in summary
  }>;
  date: { from: string; to: string };
  obbData: any[];
  footerData?:SessionTotals
}

export function TableDemo({ tableProp, date, obbData,footerData }: SummaryTableProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);

  // Convert minutes to hours for display
  const minutesToHours = (minutes: number): number => {
    return Number((minutes / 60).toFixed(2));
  };

  function calculateEfficiencyRatio(
    tableProp: SummaryTableProps['tableProp']
  ): string {
    const totalAvailableHours = tableProp.reduce((a, b) => a + minutesToHours(b.totalAvailableMins), 0);
    const totalStdHours = tableProp.reduce((a, b) => a + minutesToHours(b.totalEarnMins), 0);

    // Avoid division by zero
    if (totalAvailableHours === 0) return "0.0";

    return ((totalStdHours / totalAvailableHours) * 100).toFixed(2);
  }

  function calculateOnEfficiencyRatio(
    tableProp: SummaryTableProps['tableProp']
  ): string {
    const totalAvailableHours = tableProp.reduce((a, b) => a + minutesToHours(b.totalAvailableMins), 0);
    const totalStdHours = tableProp.reduce((a, b) => a + minutesToHours(b.totalEarnMins), 0);
    const offStand = tableProp.reduce((a, b) => a + minutesToHours(b.totalOffStandMins || 0), 0);

    const adjustedAvailable = totalAvailableHours - offStand;
    if (adjustedAvailable <= 0) return "0.0";

    const res = Math.max(0, Number(((totalStdHours / adjustedAvailable) * 100).toFixed(2)));
    return res.toString();
  }

  // Helper function to check if operator has multiple operations
  const hasMultipleOperations = (operations: string): boolean => {
    return operations.includes(',');
  };

  const handleDownloadPDF = () => {
    if (!obbData.length) return;

    const pdf = new jsPDF("l", "mm", "a4");

    const logoUrl = "/ha-meem.png";
    const logoWidth = 20;
    const logoHeight = (logoWidth * 120) / 120;

    pdf.addImage(
      logoUrl,
      "PNG",
      (pdf.internal.pageSize.getWidth() - logoWidth) / 2,
      10,
      logoWidth,
      logoHeight
    );
    pdf.setFontSize(12);
    pdf.text("~ Bangladesh ~", pdf.internal.pageSize.getWidth() / 2, 35, {
      align: "center",
    });
    pdf.text(
      "SUMMARY EFFICIENCY REPORT - LINE",
      pdf.internal.pageSize.getWidth() / 2,
      40,
      { align: "center" }
    );
    pdf.setLineWidth(0.5);
    pdf.line(15, 45, pdf.internal.pageSize.getWidth() - 15, 45);

    pdf.setFontSize(10);
    pdf.text(
      [
        `Factory: Apparel Gallery LTD`,
        `Unit: ${obbData[0].unit}`,
        `Line: ${obbData[0].line}`,
      ],
      15,
      30
    );

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const currentTime = `${formattedDate} - ${formattedTime}`;
    pdf.text(
      [`Document Date: ${date.from}`, `Printed Date: ${currentTime}`],
      pdf.internal.pageSize.getWidth() - 80,
      30
    );
    pdf.text(
      [`( * ) Indicates operator has multiple operations`],
      pdf.internal.pageSize.getWidth() - 80,
      40
    );

    // Sort by efficiency or operator ID based on current view
    const sortedForPDF = showLowPerformers 
      ? [...filteredTableProp].sort((a, b) => b.onStandEfficiency - a.onStandEfficiency)
      : [...filteredTableProp].sort((a, b) => a.operatorId.localeCompare(b.operatorId));

    // Modified table data for summary
    const tableData = sortedForPDF.map((row, index) => [
      index + 1, // Sequence number
      hasMultipleOperations(row.operations) ? `${row.operatorId} *` : row.operatorId,
      hasMultipleOperations(row.operations) ? `${row.operator} *` : row.operator,
      row.operations,
      minutesToHours(row.totalAvailableMins),
      minutesToHours(row.totalEarnMins),
      minutesToHours(row.totalOffStandMins || 0),
      row.efficiency,
      row.onStandEfficiency,
    ]);

    autoTable(pdf, {
      startY: 45,
      head: [
        [
          "S/N",
          "MO ID",
          "MO Name",
          "Operations",
          "Available Hours",
          "Production Standard Hours",
          "Off Stand Hours",
          "Overall Efficiency",
          "On Stand Efficiency",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: "#FFFFFF"
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: "#000000"
      },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
    });

    const finalY = (pdf as any).lastAutoTable.finalY || 45;

   autoTable(pdf, {
  startY: finalY + 5,
  headStyles: { fillColor: [128, 128, 128] },
  head: [
    [
      { content: "" },
      { content: "" },
      "Total Available Hours",
      "Total Production Standard Hours",
      "Total Off Stand Hours",
      "Overall Efficiency",
      "On Stand Efficiency",
    ],
  ],
  body: [
    [
      { content: "" },
      { content: "Total Line Efficiency" },
      footerData?.totalAvailableHours ?? "-",
      footerData?.totalProductionStandardHours ?? "-",
      footerData?.totalOffStandHours ?? "-",
      `${footerData?.totalOverallEfficiency ?? "-"}%`,
      `${footerData?.totalOnStandEfficiency ?? "-"}%`,
    ],
  ],
  theme: "grid",
  styles: { fontSize: 8, cellPadding: 2 },
  columnStyles: {
    2: { halign: "right" },
    3: { halign: "right" },
    4: { halign: "right" },
    5: { halign: "right" },
    6: { halign: "right" },
  },
});


    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.text("https://www.portal.eliot.global/", 15, pageHeight - 10);
    const eliotLogoUrl = "/eliot-logo.png";
    const eliotLogoWidth = 20;
    const eliotLogoHeight = (eliotLogoWidth * 200) / 200;

    pdf.addImage(
      eliotLogoUrl,
      "PNG",
      pdf.internal.pageSize.getWidth() - eliotLogoWidth - 15,
      pageHeight - eliotLogoHeight - 10,
      eliotLogoWidth,
      eliotLogoHeight
    );

    pdf.save(
      `Line_Individual_Efficiency_Summary_${obbData[0]?.line}_${date.from}.pdf`
    );
  };

  const [filterThreshold, setFilterThreshold] = useState<number>(50);
  const [showLowPerformers, setShowLowPerformers] = useState(false);

  // Sort logic: by MO ID initially, by efficiency when filtered
  const sortedTableProp = showLowPerformers 
    ? [...tableProp].filter((op) => op.onStandEfficiency < filterThreshold).sort((a, b) => b.onStandEfficiency - a.onStandEfficiency)
    : [...tableProp].sort((a, b) => a.operatorId.localeCompare(b.operatorId));

  const toggleLowPerformers = () => {
    setShowLowPerformers((prev) => !prev);
  };

  const filteredTableProp = sortedTableProp;

  return (
    <div>
      <div>
        <div className="flex gap-3 justify-between">
          <Button className="shadow-md" onClick={handleDownloadPDF}>
            Download as PDF
          </Button>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filterThreshold}
              onChange={(e) => setFilterThreshold(Number(e.target.value))}
              className="border h-10 border-gray-300 rounded-md px-3 py-1 text-sm shadow-sm w-20 text-center"
            />
            <Button
              className="shadow-md"
              variant={showLowPerformers ? "destructive" : "default"}
              onClick={toggleLowPerformers}
            >
              {showLowPerformers ? "Show All Operators" : "Show Low Performers"}
            </Button>
          </div>
        </div>
      </div>

      <div ref={reportRef} className="mt-5 mb-10">
        <div className="text-center">
          <img
            src="/ha-meem.png"
            alt="Ha-Meem Logo"
            className="mx-auto w-[120px] h-auto mt-[10px]"
          />
          <h5 className="mt-[10px]">~ Bangladesh ~</h5>
          <h1 className="text-center">SUMMARY EFFICIENCY REPORT - LINE</h1>
          <hr className="my-4" />
        </div>

        <div className="flex justify-around mt-5 text-sm mb-5">
          <div className="flex-1 mr-[10px] leading-[1.5]">
            <h5 className="m-0 font-semibold">
              Factory Name: Apparel Gallery LTD
            </h5>
            <h5 className="m-0 font-semibold">Unit: {obbData[0]?.unit}</h5>
          </div>
          <div className="flex-1 justify-around ml-[10px] leading-[1.5]">
            <h5 className="m-0 font-semibold">
              Date: {date.from}
            </h5>
            <h5 className="font-semibold">Line Name: {obbData[0]?.line}</h5>
          </div>
          <div>
            <div id="print-time-placeholder"></div>
          </div>
        </div>
        <div className="my-5">
          ( * ) indicates operator has multiple operations
        </div>
        <Table style={{ tableLayout: "fixed" }}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">S/N</TableHead>
              <TableHead className="text-center">MO ID</TableHead>
              <TableHead className="">MO Name</TableHead>
              <TableHead className="w-[200px]">Operations</TableHead>
              <TableHead className="text-center">Available Hours</TableHead>
              <TableHead className="text-center">
                Production Standard Hours
              </TableHead>
              <TableHead className="text-center">Off Stand Hours</TableHead>
              <TableHead className="text-center">Overall Efficiency</TableHead>
              <TableHead className="text-center">
                On Stand Efficiency
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTableProp.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell className="text-center px-2 py-2">
                  {index + 1}
                </TableCell>
                <TableCell className="text-center px-2 py-2">
                  {hasMultipleOperations(invoice.operations) ? `${invoice.operatorId} *` : invoice.operatorId}
                </TableCell>
                <TableCell className="font-medium px-2 py-2">
                  {hasMultipleOperations(invoice.operations) ? `${invoice.operator} *` : invoice.operator}
                </TableCell>
                <TableCell className="font-medium px-2 py-2">
                  {invoice.operations}
                </TableCell>
                <TableCell className="text-center font-medium px-2 py-2">
                  {minutesToHours(invoice.totalAvailableMins)}
                </TableCell>
                <TableCell className="text-center font-medium px-2 py-2">
                  {minutesToHours(invoice.totalEarnMins)}
                </TableCell>
                <TableCell className="text-center font-medium px-2 py-2">
                  {minutesToHours(invoice.totalOffStandMins || 0)}
                </TableCell>
                <TableCell className="text-center font-medium px-2 py-2">
                  {invoice.efficiency}%
                </TableCell>
                <TableCell className="text-center font-medium px-2 py-2">
                  {invoice.onStandEfficiency}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Table className="mt-12">
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}></TableCell>
              <TableCell className="text-right">
                Total Available Hours
              </TableCell>
              <TableCell className="text-center">
                Total Production Standard Hours
              </TableCell>
              <TableCell className="text-center">
                Total Off Stand Hours
              </TableCell>
              <TableCell className="text-center">
                Total Overall Efficiency
              </TableCell>
              <TableCell className="text-center">
                Total On Stand Efficiency
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}>Total Machine Operators Efficiency</TableCell>
              <TableCell className="text-right">
                {footerData?.totalAvailableHours}
              </TableCell>
              <TableCell className="text-center">
                {footerData?.totalProductionStandardHours}
              </TableCell>
              <TableCell className="text-center">
                {footerData?.totalOffStandHours}
              </TableCell>
              <TableCell className="text-center">
                {footerData?.totalOverallEfficiency}%
              </TableCell>
              <TableCell className="text-center">
                {footerData?.totalOnStandEfficiency}%
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <div className="flex justify-between items-center mt-12">
          <div>
            <p>
              <a
                href="https://www.portal.eliot.global/"
                className="text-blue-500 hover:underline"
              >
                https://www.portal.eliot.global/
              </a>
            </p>
          </div>
          <div className="footer-logo">
            <img
              src="/eliot-logo.png"
              alt="Company Footer Logo"
              className="w-[120px] h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}