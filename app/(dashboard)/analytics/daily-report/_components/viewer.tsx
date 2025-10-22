    import { PDFViewer } from "@react-pdf/renderer";
    import { TableCompo } from "./TableCompo";


    interface DayProductionReportFactoryWiseViewerProps {
    operationData: any;
    obbSheetData: any;
    selectedDate: string;

    }

    const DayProductionReportFactoryWiseViewer = ({
    operationData,
    obbSheetData,
    selectedDate,

    }: DayProductionReportFactoryWiseViewerProps) => {
        console.log(operationData,
    obbSheetData,
    selectedDate,"aaaa")
    return (
    
        <div style={{ height: "100vh" }}>
        <PDFViewer width="100%" height="100%">
                                <TableCompo operationData={operationData} obbSheetData={obbSheetData} selectedDate={selectedDate}/>
            
        </PDFViewer>
        </div>
    );
    };

    export default DayProductionReportFactoryWiseViewer;
