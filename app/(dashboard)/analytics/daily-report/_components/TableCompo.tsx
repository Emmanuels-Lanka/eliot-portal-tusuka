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
  },
  tableCell: {
    margin: 4,
    fontSize: 7,
    color: '#333333',
  },
  operationRow: {
    backgroundColor: '#ffffff',
  },
  summaryRow: {
    backgroundColor: '#e3f2fd',
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
}

type TableRow = OperationDetail | OperatorSummary;

interface PDFReportProps {
  operationData: TableRow[];
  obbSheetData: any;
  selectedDate: string;
}

export const TableCompo: React.FC<PDFReportProps> = ({
  operationData,
  obbSheetData,
  selectedDate
}) => {
  // Compute overall totals
  const grandTotalEarnMins = operationData
    .filter((row): row is OperatorSummary => row.type === "summary")
    .reduce((sum, row) => sum + row.totalEarnMins, 0);

  const grandTotalAvailableMins = operationData
    .filter((row): row is OperatorSummary => row.type === "summary")
    .reduce((sum, row) => sum + row.totalAvailableMins, 0);

  const grandTotalPcs = operationData
    .filter((row): row is OperatorSummary => row.type === "summary")
    .reduce((sum, row) => sum + row.totalPcs, 0);

  const grandEfficiency =
    grandTotalAvailableMins > 0
      ? ((grandTotalEarnMins / grandTotalAvailableMins) * 100).toFixed(1)
      : "0";

  const summaryRows = operationData.filter((row): row is OperatorSummary => row.type === "summary");
  
  let sequenceNumber = 0;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Overall Efficiency Report - Detailed</Text>
          <Text style={styles.headerInfo}>
            Report Date: {selectedDate} | Line: {obbSheetData || "Unknown"} | Generated: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '5%' }]}>
              <Text style={styles.tableCellHeader}>S/N</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '8%' }]}>
              <Text style={styles.tableCellHeader}>Op-ID</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '9%' }]}>
              <Text style={styles.tableCellHeader}>Machine</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.tableCellHeader}>Operator</Text>
            </View>
            
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Operation</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '7%' }]}>
              <Text style={styles.tableCellHeader}>SMV</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '8%' }]}>
              <Text style={styles.tableCellHeader}>Total Pcs</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>Earn Mins</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>Available Mins</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '8%' }]}>
              <Text style={styles.tableCellHeader}>Efficiency %</Text>
            </View>
            
          </View>

          {/* Table Body */}
          {operationData.map((row, index) => {
            if (row.type === "operation") {
              return (
                <View key={`op-${index}`} style={[styles.tableRow, styles.operationRow]}>
                  <View style={[styles.tableCol, { width: '5%' }]}>
                    <Text style={styles.tableCell}></Text>
                  </View>
                  <View style={[styles.tableCol, { width: '8%' }]}>
                    <Text style={styles.tableCell}>{row.operatorId}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '9%' }]}>
                    <Text style={styles.tableCell}>{row.machine || "-"}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text style={styles.tableCell}>{row.operator}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={styles.tableCell}>{row.operation}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '7%' }]}>
                    <Text style={styles.tableCell}>{row.smv}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '8%' }]}>
                    <Text style={styles.tableCell}>{row.totalPcs}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={styles.tableCell}>{row.earnMins}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={styles.tableCell}>{row.availableMins.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '8%' }]}>
                    <Text style={styles.tableCell}>-</Text>
                  </View>
                  
                </View>
              );
            } else {
              sequenceNumber++;
              return (
                <View key={`summary-${index}`} style={[styles.tableRow, styles.summaryRow]}>
                  <View style={[styles.tableCol, { width: '5%' }]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{sequenceNumber}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '8%' }]}>
                    <Text style={styles.tableCell}>{row.operatorId}</Text>
                  </View>
                   <View style={[styles.tableCol, { width: '9%' }]}>
                    <Text style={styles.tableCell}>-</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.operator} (Total)</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={styles.tableCell}>{row.operationCount} operation{row.operationCount > 1 ? "s" : ""}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '7%' }]}>
                    <Text style={styles.tableCell}>-</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '8%' }]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.totalPcs}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.totalEarnMins.toFixed(2)} Hrs</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.totalAvailableMins.toFixed(2)} Hrs</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '8%' }]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.efficiency}%</Text>
                  </View>
                 
                </View>
              );
            }
          })}

          {/* Grand Total Row */}
          <View style={[styles.tableRow, styles.grandTotalRow]}>
            <View style={[styles.tableCol, { width: '45%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>OVERALL EFFICIENCY</Text>
            </View>
            <View style={[styles.tableCol, { width: '8%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{grandTotalPcs}</Text>
            </View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{grandTotalEarnMins.toFixed(2)} Hrs</Text>
            </View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{grandTotalAvailableMins.toFixed(2)} Hrs</Text>
            </View>
            <View style={[styles.tableCol, { width: '8%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{grandEfficiency}%</Text>
            </View>
            <View style={[styles.tableCol, { width: '9%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Summary:</Text>
          <Text style={styles.footerText}>• Total Operators: {summaryRows.length}</Text>
          {/* <Text style={styles.footerText}>• Total Operations: {operationData.filter(row => row.type === "operation").length}</Text> */}
          <Text style={styles.footerText}>• Overall Efficiency: {grandEfficiency}%</Text>
          <Text style={styles.footerText}>• Report generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};