import React from "react";
import { Document, Page, Text, View, StyleSheet, DocumentProps } from "@react-pdf/renderer";
import { IInvoicePdfProps } from "@/types/pdf.types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#1c1917",
    padding: 36,
    fontFamily: "Helvetica",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1.5pt solid #1c1917",
    paddingBottom: 16,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    letterSpacing: 2,
    color: "#855d14",
    textTransform: "uppercase",
  },
  brandTagline: {
    fontSize: 8,
    color: "#78716c",
    marginTop: 3,
    letterSpacing: 1,
  },
  companyMeta: {
    fontSize: 7.5,
    color: "#57534e",
    marginTop: 4,
    lineHeight: 1.3,
  },
  invoiceMetaRight: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  invoiceNum: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#855d14",
    marginTop: 3,
  },
  metaText: {
    fontSize: 8,
    color: "#57534e",
    marginTop: 2,
  },
  // Address section
  addressSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#faf9f6",
    padding: 12,
    borderRadius: 4,
    border: "0.5pt solid #e7e5e4",
  },
  addressCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#855d14",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },
  addressText: {
    fontSize: 8,
    color: "#44403c",
    lineHeight: 1.4,
    marginTop: 2,
  },
  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#1c1917",
    padding: 7,
    borderRadius: 2,
  },
  thCol1: { width: "40%" },
  thCol2: { width: "20%", textAlign: "center" },
  thCol3: { width: "20%", textAlign: "center" },
  thCol4: { width: "20%", textAlign: "right" },
  thText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderBottom: "0.5pt solid #e7e5e4",
    alignItems: "center",
  },
  tdTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },
  tdSubtitle: {
    fontSize: 7,
    color: "#78716c",
    marginTop: 2,
  },
  tdTextCenter: {
    fontSize: 8,
    color: "#44403c",
    textAlign: "center",
  },
  tdTextRight: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    textAlign: "right",
  },
  // Summary
  summaryWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentNotice: {
    width: "55%",
    backgroundColor: "#f5f5f4",
    padding: 10,
    borderRadius: 4,
    borderLeft: "2pt solid #855d14",
  },
  paymentNoticeTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    textTransform: "uppercase",
  },
  paymentNoticeText: {
    fontSize: 7.5,
    color: "#57534e",
    marginTop: 3,
    lineHeight: 1.4,
  },
  totalsBox: {
    width: "40%",
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 8,
    color: "#57534e",
  },
  totalVal: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },
  grandTotalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTop: "1pt solid #1c1917",
    borderBottom: "1pt solid #1c1917",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    textTransform: "uppercase",
  },
  grandTotalVal: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: "#855d14",
  },
  // Footer
  footer: {
    borderTop: "0.5pt solid #d6d3d1",
    paddingTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLegal: {
    fontSize: 6.5,
    color: "#a8a29e",
    maxWidth: "80%",
    lineHeight: 1.3,
  },
  footerStatus: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#15803d",
    textTransform: "uppercase",
  },
});

export function InvoicePdf({
  order,
  invoiceNumber,
  issueDate,
  paymentStatus,
  companyInfo,
}: IInvoicePdfProps): React.ReactElement<DocumentProps> {
  return (
    <Document title={`Invoice ${invoiceNumber} - ${companyInfo.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>{companyInfo.name}</Text>
            <Text style={styles.brandTagline}>{companyInfo.tagline}</Text>
            <Text style={styles.companyMeta}>{companyInfo.address}</Text>
            <Text style={styles.companyMeta}>{companyInfo.cityStateZip}</Text>
            <Text style={styles.companyMeta}>Support: {companyInfo.supportEmail}</Text>
          </View>

          <View style={styles.invoiceMetaRight}>
            <Text style={styles.invoiceTitle}>Official Invoice</Text>
            <Text style={styles.invoiceNum}>INV #: {invoiceNumber}</Text>
            <Text style={styles.metaText}>Date: {issueDate}</Text>
            <Text style={styles.metaText}>Order ID: #{order.orderNumber || (order.id ? order.id.slice(-8).toUpperCase() : "ORDER")}</Text>
            <Text style={styles.metaText}>Status: {paymentStatus}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressCol}>
            <Text style={styles.sectionTitle}>Billed & Shipped To</Text>
            <Text style={styles.clientName}>{order.shippingAddress?.fullName || "Valued Client"}</Text>
            <Text style={styles.addressText}>{order.shippingAddress?.street || ""}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress?.city || ""}, {order.shippingAddress?.state || ""}{" "}
              {order.shippingAddress?.postalCode || ""}
            </Text>
            <Text style={styles.addressText}>{order.shippingAddress?.country || ""}</Text>
            <Text style={styles.addressText}>Email: {order.shippingAddress?.email || ""}</Text>
          </View>

          <View style={styles.addressCol}>
            <Text style={styles.sectionTitle}>Armored Transit Courier</Text>
            <Text style={styles.addressText}>Carrier: Armored High-Value Escrow Courier</Text>
            <Text style={styles.addressText}>Origin: {companyInfo.name} Primary Vault</Text>
            <Text style={styles.addressText}>Biometric Signature Required: Yes</Text>
            <Text style={styles.addressText}>
              Payment Channel: {order.paymentInfo?.method ? order.paymentInfo.method.replace("_", " ") : "SECURE PAYMENT"}
            </Text>
          </View>
        </View>

        {/* Itemized Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.thCol1}>
              <Text style={styles.thText}>Gemstone Item Description</Text>
            </View>
            <View style={styles.thCol2}>
              <Text style={styles.thText}>4Cs Grade</Text>
            </View>
            <View style={styles.thCol3}>
              <Text style={styles.thText}>Lab Cert #</Text>
            </View>
            <View style={styles.thCol4}>
              <Text style={styles.thText}>Total Amount</Text>
            </View>
          </View>

          {(order.items || []).map((item, index) => {
            const priceDisplay = (
              typeof item.finalPrice === "number"
                ? item.finalPrice
                : typeof item.price === "number"
                ? item.price
                : 0
            ).toLocaleString();

            return (
              <View key={item._id || index} style={styles.tableRow}>
                <View style={styles.thCol1}>
                  <Text style={styles.tdTitle}>{item.name || "Certified Diamond"}</Text>
                  <Text style={styles.tdSubtitle}>
                    SKU: {item.sku || "DIA"} • {item.shape || "Round"} Shape
                  </Text>
                </View>
                <View style={styles.thCol2}>
                  <Text style={styles.tdTextCenter}>
                    {item.carat || 1}ct • {item.color || "F"} • {item.clarity || "VS1"}
                  </Text>
                  <Text style={styles.tdSubtitle}>{item.cut || "Ideal"} Cut</Text>
                </View>
                <View style={styles.thCol3}>
                  <Text style={styles.tdTextCenter}>{item.lab || "GIA"}</Text>
                  <Text style={styles.tdSubtitle}>#{item.certificateNumber || "GENUINE"}</Text>
                </View>
                <View style={styles.thCol4}>
                  <Text style={styles.tdTextRight}>${priceDisplay}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Totals & Payment Info */}
        <View style={styles.summaryWrapper}>
          <View style={styles.paymentNotice}>
            <Text style={styles.paymentNoticeTitle}>Vault Security & Compliance</Text>
            <Text style={styles.paymentNoticeText}>
              All diamonds listed herein are laboratory grown with 100% renewable solar reactor energy and certified conflict-free under the Kimberly Process. Your accompanying Lab Authorized Certificate has been dispatched simultaneously.
            </Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>${(order.subtotal || 0).toLocaleString()}</Text>
            </View>
            {(order.couponDiscount || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VIP Coupon Discount</Text>
                <Text style={styles.totalVal}>-${(order.couponDiscount || 0).toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Armored Vault Transit</Text>
              <Text style={styles.totalVal}>$0.00 (Complimentary)</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Paid</Text>
              <Text style={styles.grandTotalVal}>${(order.totalAmount || 0).toLocaleString()} USD</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLegal}>
            Thank you for acquiring your masterwork gemstone from {companyInfo.name}. For questions regarding transit escrow or certificates, contact {companyInfo.supportEmail}.
          </Text>
          <Text style={styles.footerStatus}>✓ ESCROW SETTLED</Text>
        </View>
      </Page>
    </Document>
  );
};
