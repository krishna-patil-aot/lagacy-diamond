import React from "react";
import { Document, Page, Text, View, StyleSheet, DocumentProps } from "@react-pdf/renderer";
import { ILabCertificatePdfProps } from "@/types/pdf.types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fffdf9",
    color: "#1c1917",
    padding: 30,
    fontFamily: "Helvetica",
  },
  outerBorder: {
    border: "3pt solid #b48c36",
    padding: 3,
    height: "100%",
  },
  innerBorder: {
    border: "1pt solid #785a1a",
    padding: 22,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  crestSection: {
    alignItems: "center",
    marginBottom: 10,
    borderBottom: "1pt solid #dcd3c2",
    paddingBottom: 10,
  },
  labName: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    letterSpacing: 4,
    color: "#855d14",
    textTransform: "uppercase",
  },
  certTitle: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    letterSpacing: 2,
    color: "#1c1917",
    marginTop: 4,
    textTransform: "uppercase",
  },
  certSubtitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#78716c",
    marginTop: 3,
    textTransform: "uppercase",
  },
  metaBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f7f3eb",
    padding: 8,
    borderRadius: 2,
    border: "0.5pt solid #e5dccb",
    marginBottom: 14,
  },
  metaItem: {
    fontSize: 8,
    color: "#44403c",
  },
  metaBold: {
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },
  // 4Cs Grid
  sectionHeading: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    letterSpacing: 2,
    color: "#855d14",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  fourCsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  fourCCard: {
    flex: 1,
    border: "1pt solid #b48c36",
    backgroundColor: "#ffffff",
    padding: 8,
    alignItems: "center",
    borderRadius: 2,
  },
  fourCLabel: {
    fontSize: 7,
    color: "#78716c",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  fourCValue: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    color: "#855d14",
  },
  fourCSub: {
    fontSize: 6,
    color: "#a8a29e",
    marginTop: 2,
  },
  // Analysis Columns
  columnsWrapper: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  columnLeft: {
    flex: 1.1,
  },
  columnRight: {
    flex: 0.9,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3.5,
    borderBottom: "0.5pt solid #ebe5d8",
  },
  tableLabel: {
    fontSize: 7.5,
    color: "#57534e",
  },
  tableValue: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },
  // Security & Signatures
  securityBlock: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#faf7f0",
    border: "0.5pt solid #e5dccb",
    padding: 10,
    marginTop: 6,
    borderRadius: 2,
  },
  sealBox: {
    alignItems: "center",
    border: "1.5pt dashed #b48c36",
    padding: 6,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
  },
  sealText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: "#855d14",
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  signatureBox: {
    width: 140,
    alignItems: "center",
  },
  sigLine: {
    fontFamily: "Times-Italic",
    fontSize: 12,
    color: "#1c1917",
    marginBottom: 3,
  },
  sigUnderline: {
    width: "100%",
    borderBottom: "0.8pt solid #1c1917",
    marginBottom: 3,
  },
  sigName: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    textTransform: "uppercase",
  },
  sigTitle: {
    fontSize: 6,
    color: "#78716c",
  },
  qrInfo: {
    width: 140,
  },
  qrTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#855d14",
    textTransform: "uppercase",
  },
  qrDesc: {
    fontSize: 6,
    color: "#78716c",
    marginTop: 2,
    lineHeight: 1.3,
  },
  hashText: {
    fontSize: 5.5,
    color: "#a8a29e",
    marginTop: 3,
    fontFamily: "Courier",
  },
  // Footer
  certFooter: {
    borderTop: "0.5pt solid #dcd3c2",
    paddingTop: 8,
    marginTop: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLegal: {
    fontSize: 6,
    color: "#a8a29e",
    maxWidth: "80%",
    lineHeight: 1.3,
  },
  footerCode: {
    fontSize: 6,
    fontFamily: "Courier",
    color: "#78716c",
  },
});

export function LabCertificatePdf({
  certificateNumber,
  lab,
  issueDate,
  diamond,
  gemologistName,
  gemologistTitle,
  vaultId,
  securityHash,
  verificationUrl,
}: ILabCertificatePdfProps): React.ReactElement<DocumentProps> {
  return (
    <Document title={`Lab Certificate of Authenticity - ${diamond.sku}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Laboratory Crest & Title */}
            <View style={styles.crestSection}>
              <Text style={styles.labName}>
                {lab} Accredited Gemological Laboratory
              </Text>
              <Text style={styles.certTitle}>Certificate of Authenticity</Text>
              <Text style={styles.certSubtitle}>
                Official Gemological Grading Dossier • Foundry Cultivated Gemstone
              </Text>
            </View>

            {/* Verification Metadata Bar */}
            <View style={styles.metaBar}>
              <Text style={styles.metaItem}>
                Report Number: <Text style={styles.metaBold}>{certificateNumber}</Text>
              </Text>
              <Text style={styles.metaItem}>
                Issue Date: <Text style={styles.metaBold}>{issueDate}</Text>
              </Text>
              <Text style={styles.metaItem}>
                Vault Registry: <Text style={styles.metaBold}>{vaultId}</Text>
              </Text>
              <Text style={styles.metaItem}>
                Status: <Text style={styles.metaBold}>SEALED & AUTHENTICATED</Text>
              </Text>
            </View>

            {/* 4Cs Master Cards */}
            <View>
              <Text style={styles.sectionHeading}>The 4Cs Master Grading</Text>
              <View style={styles.fourCsContainer}>
                <View style={styles.fourCCard}>
                  <Text style={styles.fourCLabel}>Carat Weight</Text>
                  <Text style={styles.fourCValue}>{diamond.carat.toFixed(2)} ct</Text>
                  <Text style={styles.fourCSub}>Exact Precision</Text>
                </View>
                <View style={styles.fourCCard}>
                  <Text style={styles.fourCLabel}>Color Grade</Text>
                  <Text style={styles.fourCValue}>{diamond.color}</Text>
                  <Text style={styles.fourCSub}>Colorless</Text>
                </View>
                <View style={styles.fourCCard}>
                  <Text style={styles.fourCLabel}>Clarity Grade</Text>
                  <Text style={styles.fourCValue}>{diamond.clarity}</Text>
                  <Text style={styles.fourCSub}>Eye-Clean</Text>
                </View>
                <View style={styles.fourCCard}>
                  <Text style={styles.fourCLabel}>Cut Grade</Text>
                  <Text style={styles.fourCValue}>{diamond.cut}</Text>
                  <Text style={styles.fourCSub}>Maximum Brilliance</Text>
                </View>
              </View>
            </View>

            {/* Detailed Proportions & Technical Diagnostics */}
            <View style={styles.columnsWrapper}>
              {/* Left Column: Physical Metrics */}
              <View style={styles.columnLeft}>
                <Text style={styles.sectionHeading}>Physical Proportions</Text>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Shape & Cutting Profile</Text>
                  <Text style={styles.tableValue}>{diamond.shape} Brilliant Cut</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Measurements</Text>
                  <Text style={styles.tableValue}>
                    {diamond.dimensions.length.toFixed(2)} × {diamond.dimensions.width.toFixed(2)} ×{" "}
                    {diamond.dimensions.depth.toFixed(2)} mm
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Table Percentage</Text>
                  <Text style={styles.tableValue}>{diamond.tablePercentage}%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Total Depth Percentage</Text>
                  <Text style={styles.tableValue}>{diamond.depthPercentage}%</Text>
                </View>
              </View>

              {/* Right Column: Finish & Optical Quality */}
              <View style={styles.columnRight}>
                <Text style={styles.sectionHeading}>Optical Finish & Grading</Text>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Polish</Text>
                  <Text style={styles.tableValue}>{diamond.polish}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Symmetry</Text>
                  <Text style={styles.tableValue}>{diamond.symmetry}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Fluorescence</Text>
                  <Text style={styles.tableValue}>{diamond.fluorescence}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Growth Process</Text>
                  <Text style={styles.tableValue}>CVD / HPHT Eco-Foundry</Text>
                </View>
              </View>
            </View>

            {/* Security, Embossed Seal & Gemologist Authorization */}
            <View style={styles.securityBlock}>
              {/* Embossed Seal Stamp */}
              <View style={styles.sealBox}>
                <Text style={styles.sealText}>OFFICIAL</Text>
                <Text style={styles.sealText}>VAULT SEAL</Text>
                <Text style={styles.sealText}>★ GENUINE ★</Text>
              </View>

              {/* Security & Verification Details */}
              <View style={styles.qrInfo}>
                <Text style={styles.qrTitle}>Cryptographic Vault Pass</Text>
                <Text style={styles.qrDesc}>
                  Scan or verify online at: {verificationUrl}
                </Text>
                <Text style={styles.hashText}>Hash: {securityHash.slice(0, 24)}...</Text>
              </View>

              {/* Authorized Gemologist Signature */}
              <View style={styles.signatureBox}>
                <Text style={styles.sigLine}>{gemologistName}</Text>
                <View style={styles.sigUnderline} />
                <Text style={styles.sigName}>{gemologistName}</Text>
                <Text style={styles.sigTitle}>{gemologistTitle}</Text>
              </View>
            </View>

            {/* Legal Disclaimer */}
            <View style={styles.certFooter}>
              <Text style={styles.footerLegal}>
                This document constitutes an official gemological grading report under ISO standard laboratory testing. The gemstone described has been examined by senior gemologists utilizing optical spectroscopy and micro-laser inspection. Guaranteed conflict-free.
              </Text>
              <Text style={styles.footerCode}>SEC-ID: {diamond.sku}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
