import React from "react";
import { Document, Page, Text, View, StyleSheet, DocumentProps } from "@react-pdf/renderer";
import { IDiamondSpecPdfProps } from "@/types/pdf.types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0d0c0a",
    color: "#f3f0ea",
    padding: 36,
    fontFamily: "Helvetica",
  },
  borderWrapper: {
    border: "1.5pt solid #c59b27",
    padding: 24,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    borderBottom: "1pt solid #2d2616",
    paddingBottom: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    letterSpacing: 2,
    color: "#e8c567",
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#9e9684",
    marginTop: 4,
    textTransform: "uppercase",
  },
  docMeta: {
    textAlign: "right",
  },
  docBadge: {
    fontSize: 8,
    color: "#e8c567",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  docDate: {
    fontSize: 8,
    color: "#888",
    marginTop: 3,
  },
  diamondHero: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#161410",
    padding: 16,
    borderRadius: 4,
    border: "0.5pt solid #3d331d",
  },
  diamondName: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  diamondSku: {
    fontSize: 9,
    color: "#c59b27",
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#e8c567",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    borderBottom: "0.5pt solid #2d2616",
    paddingBottom: 4,
  },
  grid4C: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  card4C: {
    flex: 1,
    backgroundColor: "#161410",
    border: "0.5pt solid #3d331d",
    padding: 10,
    borderRadius: 4,
    textAlign: "center",
  },
  label4C: {
    fontSize: 7,
    color: "#9e9684",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  value4C: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#e8c567",
  },
  specsTable: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
  },
  specRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "0.5pt solid #1f1b13",
  },
  specLabel: {
    fontSize: 8,
    color: "#a09886",
  },
  specValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  pricingBox: {
    backgroundColor: "#161410",
    padding: 12,
    borderRadius: 4,
    border: "0.5pt solid #c59b27",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 9,
    color: "#c59b27",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    color: "#ffffff",
  },
  footer: {
    borderTop: "0.5pt solid #2d2616",
    paddingTop: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#726b5d",
    letterSpacing: 0.5,
  },
  vaultStamp: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#c59b27",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export function DiamondSpecPdf({
  diamond,
  generatedDate,
  vaultReference,
}: IDiamondSpecPdfProps): React.ReactElement<DocumentProps> {
  return (
    <Document title={`${diamond.name} - Technical Specification Dossier`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.borderWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brandTitle}>Diamond Foundry</Text>
              <Text style={styles.brandSubtitle}>High Gemological Archives & Vault Dossier</Text>
            </View>
            <View style={styles.docMeta}>
              <Text style={styles.docBadge}>Official Spec Sheet</Text>
              <Text style={styles.docDate}>Date: {generatedDate}</Text>
              <Text style={styles.docDate}>Ref: {vaultReference}</Text>
            </View>
          </View>

          {/* Diamond Hero */}
          <View style={styles.diamondHero}>
            <Text style={styles.diamondName}>{diamond.name}</Text>
            <Text style={styles.diamondSku}>
              SKU: {diamond.sku} • {diamond.lab} CERT #{diamond.certificateNumber}
            </Text>
          </View>

          {/* 4Cs Master Grid */}
          <View>
            <Text style={styles.sectionTitle}>The 4Cs Grading Analysis</Text>
            <View style={styles.grid4C}>
              <View style={styles.card4C}>
                <Text style={styles.label4C}>Carat Weight</Text>
                <Text style={styles.value4C}>{diamond.carat} ct</Text>
              </View>
              <View style={styles.card4C}>
                <Text style={styles.label4C}>Cut Grade</Text>
                <Text style={styles.value4C}>{diamond.cut}</Text>
              </View>
              <View style={styles.card4C}>
                <Text style={styles.label4C}>Color Grade</Text>
                <Text style={styles.value4C}>{diamond.color}</Text>
              </View>
              <View style={styles.card4C}>
                <Text style={styles.label4C}>Clarity Grade</Text>
                <Text style={styles.value4C}>{diamond.clarity}</Text>
              </View>
            </View>
          </View>

          {/* Detailed Proportions & Finish */}
          <View>
            <Text style={styles.sectionTitle}>Proportions, Finish & Facet Metrics</Text>
            <View style={styles.specsTable}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Shape & Cutting Style</Text>
                <Text style={styles.specValue}>{diamond.shape} Brilliant</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Measurements (L × W × D)</Text>
                <Text style={styles.specValue}>
                  {diamond.dimensions.length.toFixed(2)} × {diamond.dimensions.width.toFixed(2)} ×{" "}
                  {diamond.dimensions.depth.toFixed(2)} mm
                </Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Table Percentage</Text>
                <Text style={styles.specValue}>{diamond.tablePercentage}%</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Total Depth Percentage</Text>
                <Text style={styles.specValue}>{diamond.depthPercentage}%</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Polish Grade</Text>
                <Text style={styles.specValue}>{diamond.polish}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Symmetry Grade</Text>
                <Text style={styles.specValue}>{diamond.symmetry}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Fluorescence</Text>
                <Text style={styles.specValue}>{diamond.fluorescence}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Laboratory Accreditation</Text>
                <Text style={styles.specValue}>{diamond.lab} Institute</Text>
              </View>
            </View>
          </View>

          {/* Pricing & Guarantee */}
          <View style={styles.pricingBox}>
            <View>
              <Text style={styles.priceLabel}>Foundry Acquisition Valuation</Text>
              <Text style={styles.footerText}>Direct from laboratory foundry • Kimberly Process compliant</Text>
            </View>
            <Text style={styles.priceValue}>${diamond.finalPrice.toLocaleString()}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Verified by Diamond Luxury Foundry Gemological Division. All rights reserved.
            </Text>
            <Text style={styles.vaultStamp}>Certified Genuine • Vault Sealed</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
