    import { PDFViewer } from "@react-pdf/renderer";
    import { TableCompo } from "./TableCompo";


    interface DayProductionReportFactoryWiseViewerProps {
    operationData: any;
    obbSheetData: any;
    selectedDate: string;
   lineEndData:number;
obbSmvInfo:{ name: string;
  totalSMV: number;}[]
    }

    const DayProductionReportFactoryWiseViewer = ({
    operationData,
    obbSheetData,
    selectedDate,
lineEndData,
obbSmvInfo

    }: DayProductionReportFactoryWiseViewerProps) => {
        console.log(operationData,
    obbSheetData,
    selectedDate,"aaaa")
    return (
    
        <div style={{ height: "100vh" }}>
        <PDFViewer width="100%" height="100%">
                                <TableCompo operationData={operationData} obbSmvInfo={obbSmvInfo} obbSheetData={obbSheetData} selectedDate={selectedDate}  lineEndData={lineEndData}/>
            
        </PDFViewer>
        </div>
    );
    };

    export default DayProductionReportFactoryWiseViewer;
