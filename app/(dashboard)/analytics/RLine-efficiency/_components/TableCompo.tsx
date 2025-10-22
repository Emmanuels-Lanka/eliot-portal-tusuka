import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 15,
    fontSize: 8,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerInfo: {
    fontSize: 9,
    color: '#666666',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#dddddd',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#dddddd',
    backgroundColor: '#f5f5f5',
  },
  tableCol: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#dddddd',
  },
  tableCellHeader: {
    margin: 4,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  tableCell: {
    margin: 4,
    fontSize: 7,
    color: '#333333',
    textAlign: 'center',
  },
  operationRow: {
    backgroundColor: '#ffffff',
  },
  grandTotalRow: {
    backgroundColor: '#e8f5e8',
    borderTopWidth: 3,
    borderTopColor: '#4caf50',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    fontSize: 7,
    color: '#666666',
  },
  footerText: {
    marginBottom: 3,
  }
});

interface OperationDetail {
  type: "operation";
  operator: string;
  operatorId: string;
  operation: string;
  smv: number;
  earnMins: number;
  availableMins: number;
  totalPcs: number;
  machine?: string;
  lunchBreakTime: number;
  availableMinswithLunch: number;
  sessionLogin: string;
  sessionDuration: number;
  recordsInSession: number;
  sessionStartTotal: number;
  currentSessionEndTotal: number;
  prevSessionTotal: number;
  offStandTime: number;
  code: string;
  desi: string;
  mechDown: number;
  prodDown: number;
}

interface OperatorSummary {
  type: "summary";
  operator: string;
  operatorId: string;
  totalEarnMins: number;
  totalAvailableMins: number;
  efficiency: number;
  operationCount: number;
  totalPcs: number;
  totalOnStandEfficiency: number;
  totalOffStandMins: number;
  code: string;
  desi: string;
  totalmechDown: number;
  totalprodDown: number;
}

type TableRow = OperationDetail | OperatorSummary;

interface PDFReportProps {
  operationData: TableRow[];
  obbSheetData: any;
  selectedDate: string;
  lineEndData: number;
  obbSmvInfo:{ name: string;
  totalSMV: number;}[]
}

export const TableCompo: React.FC<PDFReportProps> = ({
  operationData,
  obbSheetData,
  selectedDate,
  lineEndData,
  obbSmvInfo
}) => {
  // Group operations by operator and calculate totals
  const operatorTotals = new Map<string, OperatorSummary>();
  
  operationData.forEach(row => {
    if (row.type === "summary") {
      operatorTotals.set(row.operatorId, row);
    }
  });

  // Compute overall totals
  const grandTotalEarnMins = Array.from(operatorTotals.values())
    .reduce((sum, row) => sum + row.totalEarnMins, 0);

  const grandTotalAvailableMins = Array.from(operatorTotals.values())
    .reduce((sum, row) => sum + row.totalAvailableMins, 0);

  const grandTotalOffstandMins = Array.from(operatorTotals.values())
    .reduce((sum, row) => sum + row.totalOffStandMins, 0);

  const grandOnStandEfficiency = grandTotalAvailableMins > 0
    ? ((grandTotalEarnMins / (grandTotalAvailableMins - grandTotalOffstandMins)) * 100).toFixed(1)
    : "0";
  
  const grandEfficiency = grandTotalAvailableMins > 0
    ? ((grandTotalEarnMins / grandTotalAvailableMins) * 100).toFixed(1)
    : "0";

  const summaryRows = Array.from(operatorTotals.values());
  
  let sequenceNumber = 0;
  let currentOperatorId = '';
  let isFirstOperationForOperator = false;

  // Filter out summary rows for rendering
  const operationsOnly = operationData.filter(row => row.type === "operation") as OperationDetail[];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Daily line individual Efficiency Report
          </Text>
          <Text style={styles.headerInfo}>
            Report Date: {selectedDate} | Line: {obbSheetData || "Unknown"} |
            Generated: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header Row 1 - Main Headers */}
         {/* Table Header Row 1 - Main Headers */}
          <View style={styles.tableRow} fixed>
            <View style={[styles.tableColHeader, { width: "3%" }]}>
              <Text style={styles.tableCellHeader}>SI No</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>MO ID</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "10%" }]}>
              <Text style={styles.tableCellHeader}>MO Name</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "2%" }]}>
              <Text style={styles.tableCellHeader}>Des</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "6%" }]}>
              <Text style={styles.tableCellHeader}>OP Code</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "10%" }]}>
              <Text style={styles.tableCellHeader}>Operation</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "6%" }]}>
              <Text style={styles.tableCellHeader}>Machine</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "3%" }]}>
              <Text style={styles.tableCellHeader}>SMV</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>Prod Pcs</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "5%" }]}>
              <Text style={styles.tableCellHeader}>Prod.Std Hrs</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "5%" }]}>
              <Text style={styles.tableCellHeader}>Working Hrs</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "8%" }]}>
              <Text style={styles.tableCellHeader}>Waiting/Call</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "24%" }]}>
              <Text style={styles.tableCellHeader}>Lost Hours</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "5%" }]}>
              <Text style={styles.tableCellHeader}>Efficiency %</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "5%" }]}>
              <Text style={styles.tableCellHeader}>OnStand Eff %</Text>
            </View>
          </View>

          {/* Table Header Row 2 - Sub Headers */}
          <View style={styles.tableRow} fixed>
            <View style={[styles.tableColHeader, { width: "3%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "4%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "10%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "2%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "6%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "10%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "6%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "3%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "4%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "5%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "5%" }]}><Text style={styles.tableCellHeader}></Text></View>
            
            {/* Breakdowns sub-columns */}
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>Machine</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>Supervisor</Text>
            </View>
            
            {/* Lost Hours sub-columns (5 columns + Total) */}
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>A</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>B</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>C</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>D</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>E</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "4%" }]}>
              <Text style={styles.tableCellHeader}>Ttl</Text>
            </View>
            
            <View style={[styles.tableColHeader, { width: "5%" }]}><Text style={styles.tableCellHeader}></Text></View>
            <View style={[styles.tableColHeader, { width: "5%" }]}><Text style={styles.tableCellHeader}></Text></View>
          </View>

          {/* Table Body */}
          {operationsOnly.map((row, index) => {
            // Check if this is the first operation for a new operator
            if (row.operatorId !== currentOperatorId) {
              currentOperatorId = row.operatorId;
              isFirstOperationForOperator = true;
              sequenceNumber++;
            } else {
              isFirstOperationForOperator = false;
            }

            // Remove the asterisk from operator name for display
            const cleanOperatorName = row.operator.replace(/^\*/, '');
            
            // Get operator totals for this operator
            const operatorTotal = operatorTotals.get(row.operatorId);

            return (
              <View
                key={`op-${index}`}
                style={[styles.tableRow, styles.operationRow]}
              >
                <View style={[styles.tableCol, { width: "3%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator ? sequenceNumber : ""}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator ? row.operatorId : ""}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator ? cleanOperatorName : ""}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "2%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator
                      ? row.desi
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  : ''}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "6%" }]}>
                  <Text style={styles.tableCell}>{row.code}</Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={styles.tableCell}>
                    {row.operation?.slice(0, 15) +
                      (row.operation?.length > 15 ? "." : "")}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "6%" }]}>
                  <Text style={styles.tableCell}>{row.machine || "-"}</Text>
                </View>
                <View style={[styles.tableCol, { width: "3%" }]}>
                  <Text style={styles.tableCell}>{row.smv}</Text>
                </View>
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>{row.totalPcs}</Text>
                </View>
                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator && operatorTotal
                      ? `${operatorTotal.totalEarnMins.toFixed(2)}`
                      : "-"}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator && operatorTotal
                      ? `${operatorTotal.totalAvailableMins.toFixed(2)}`
                      : "-"}
                  </Text>
                </View>

                {/* Breakdowns - Machine */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>{isFirstOperationForOperator && operatorTotal
                      ? `${operatorTotal.totalmechDown.toFixed(2)}`
                      : "-"}</Text>
                </View>
                {/* Breakdowns - Supervisor */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>{isFirstOperationForOperator && operatorTotal
                      ? `${operatorTotal.totalprodDown.toFixed(2)}`
                      : "-"}</Text>
                </View>

                {/* Lost Hours A */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                  {isFirstOperationForOperator && operatorTotal
                      ? `${(row.offStandTime / 60).toFixed(2)}`
                      : "-"}
                  </Text>
                </View>
                {/* Lost Hours B */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator && operatorTotal
                      ? `0.00`
                      : "-"}
                  </Text>
                </View>
                {/* Lost Hours C */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                     {isFirstOperationForOperator && operatorTotal
                      ? `0.00`
                      : "-"}
                  </Text>
                </View>
                {/* Lost Hours D */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                      {isFirstOperationForOperator && operatorTotal
                      ? `0.00`
                      : "-"}
                  </Text>
                </View>
                {/* Lost Hours E */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                      {isFirstOperationForOperator && operatorTotal
                      ? `0.00`
                      : "-"}
                  </Text>
                </View>
                {/* Lost Hours Total */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={styles.tableCell}>
                   {isFirstOperationForOperator && operatorTotal
                      ? `${(row.offStandTime / 60).toFixed(2)}`
                      : "-"}
                  </Text>
                </View>

                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator && operatorTotal
                      ? `${operatorTotal.efficiency}%`
                      : "-"}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={styles.tableCell}>
                    {isFirstOperationForOperator && operatorTotal
                      ? `${operatorTotal.totalOnStandEfficiency}%`
                      : "-"}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Grand Total Row */}
          <View style={[styles.tableRow, styles.grandTotalRow]}>
            <View style={[styles.tableCol, { width: "3%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Line efficiency
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "6%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "3%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
            </View>
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
         
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {grandTotalEarnMins.toFixed(2)}Hrs
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {grandTotalAvailableMins.toFixed(2)}Hrs
              </Text>
            </View>
            
            {/* Grand Total Breakdowns - Machine */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
            </View>
            {/* Grand Total Breakdowns - Supervisor */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
            </View>
            
            {/* Grand Total Lost Hours A */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {grandTotalOffstandMins.toFixed(2)}Hrs
              </Text>
            </View>
            {/* Grand Total Lost Hours B */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
            </View>
            {/* Grand Total Lost Hours C */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
            </View>
            {/* Grand Total Lost Hours D */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
            </View>
            {/* Grand Total Lost Hours E */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
            </View>
            {/* Grand Total Lost Hours Total */}
            <View style={[styles.tableCol, { width: "4%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {(grandTotalOffstandMins).toFixed(2)}Hrs
              </Text>
            </View>

            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {grandEfficiency}%
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {grandOnStandEfficiency}%
              </Text>
            </View>
          </View>

          {/* OBB SMV Info Rows */}
          {obbSmvInfo && obbSmvInfo.map((smvData, index) => {
            const prodStdHours = (smvData.totalSMV * lineEndData) / 60;
            const efficiency = grandTotalAvailableMins > 0
              ? ((prodStdHours / grandTotalAvailableMins) * 100).toFixed(1)
              : "0.0";
            const onStandEfficiency = (grandTotalAvailableMins - grandTotalOffstandMins) > 0
              ? ((prodStdHours / (grandTotalAvailableMins - grandTotalOffstandMins)) * 100).toFixed(1)
              : "0.0";

            return (
              <View key={`smv-${index}`} style={[styles.tableRow, { backgroundColor: '#f0f8ff' }]}>
                <View style={[styles.tableCol, { width: "3%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
                </View>
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                   Line Day Performence of: {smvData.name}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
                </View>
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
                </View>
                <View style={[styles.tableCol, { width: "6%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}></Text>
                </View>
                <View style={[styles.tableCol, { width: "3%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {smvData.totalSMV.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {lineEndData}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {prodStdHours.toFixed(2)}Hrs
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {grandTotalAvailableMins.toFixed(2)}Hrs
                  </Text>
                </View>
                
                {/* Breakdowns - Machine */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
                </View>
                {/* Breakdowns - Supervisor */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
                </View>
                
                {/* Lost Hours A */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {grandTotalOffstandMins.toFixed(2)}Hrs
                  </Text>
                </View>
                {/* Lost Hours B */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
                </View>
                {/* Lost Hours C */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
                </View>
                {/* Lost Hours D */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
                </View>
                {/* Lost Hours E */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>0.00Hrs</Text>
                </View>
                {/* Lost Hours Total */}
                <View style={[styles.tableCol, { width: "4%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {grandTotalOffstandMins.toFixed(2)}Hrs
                  </Text>
                </View>

                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {efficiency}%
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "5%" }]}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {onStandEfficiency}%
                  </Text>
                </View>
              </View>
            );
          })}

          
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Summary:</Text>
          <Text style={styles.footerText}>
            • Total Operators: {summaryRows.length}
          </Text>
          <Text style={styles.footerText}>
            •  Efficiency: {grandEfficiency}%
          </Text>
          <Text style={styles.footerText}>
            •  Onstand Efficiency: {grandOnStandEfficiency}%
          </Text>
          <Text style={styles.footerText}>
            • Lost Hours Break Down : A - Offstand time recorded in the Database
          </Text>
          <Text style={styles.footerText}>
            • Total Line Day Performance: {lineEndData ?? "0"}
          </Text>
          <Text style={styles.footerText}>
            • Report generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};