import { renderToBuffer } from "@react-pdf/renderer";
import { IDiamond } from "@/types/diamond.types";
import { IOrder } from "@/types/order.types";
import { InvoicePdf } from "@/components/pdf/InvoicePdf";
import { LabCertificatePdf } from "@/components/pdf/LabCertificatePdf";
import { DiamondSpecPdf } from "@/components/pdf/DiamondSpecPdf";
import { IInvoicePdfProps, ILabCertificatePdfProps, IDiamondSpecPdfProps } from "@/types/pdf.types";
import { siteConfig } from "@/config/site.config";

const COMPANY_INFO = {
  name: siteConfig.contact.legalEntityName,
  tagline: `${siteConfig.brandTagline} • Zero Earth Displacement`,
  address: `${siteConfig.contact.addressLine1}, ${siteConfig.contact.addressLine2}`,
  cityStateZip: `${siteConfig.contact.city}, ${siteConfig.contact.state} ${siteConfig.contact.postalCode}, ${siteConfig.contact.country}`,
  supportEmail: siteConfig.contact.conciergeEmail,
  websiteUrl: siteConfig.appUrl,
};

/**
 * Server-side generation of Purchase Invoice PDF Buffer
 */
export async function generateInvoicePdfBuffer(order: IOrder): Promise<Buffer> {
  const invoiceIdPart = (order.orderNumber || order.id || "ORDER").slice(-5).toUpperCase();
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${invoiceIdPart}`;
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const props: IInvoicePdfProps = {
    order,
    invoiceNumber,
    issueDate,
    paymentStatus: "CONFIRMED_ESCROW",
    companyInfo: COMPANY_INFO,
  };

  const documentElement = InvoicePdf(props);
  const buffer = await renderToBuffer(documentElement);
  return buffer;
}

/**
 * Server-side generation of Official Lab Authorized Certificate PDF Buffer
 */
export async function generateLabCertificatePdfBuffer(diamond: IDiamond): Promise<Buffer> {
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certNumber = diamond.certificateNumber || "LD-CERT-GENUINE";
  const lab = diamond.lab || "GIA";
  const sku = diamond.sku || diamond._id || "GEN";

  const props: ILabCertificatePdfProps = {
    certificateNumber: certNumber,
    lab,
    issueDate,
    diamond,
    gemologistName: "Dr. Alistair Sterling, FGA",
    gemologistTitle: "Chief Gemological Appraiser & Vault Master",
    vaultId: `DARKGEM-${sku}`,
    securityHash: Buffer.from(`${sku}-${certNumber}-${diamond.carat || 1}`).toString("hex"),
    verificationUrl: `${siteConfig.appUrl}/verify/${certNumber}`,
  };

  const documentElement = LabCertificatePdf(props);
  const buffer = await renderToBuffer(documentElement);
  return buffer;
}

/**
 * Server-side batch generation of Invoice & Lab Certificate PDF Buffers for an Order
 */
export async function generateOrderDocuments(order: IOrder): Promise<{
  invoiceBuffer: Buffer;
  certificateBuffers: Array<{ filename: string; buffer: Buffer }>;
}> {
  const invoiceBuffer = await generateInvoicePdfBuffer(order);
  const items = Array.isArray(order.items) ? order.items : [];
  const certificateBuffers = await Promise.all(
    items.map(async (item) => ({
      filename: `Diamond_Lab_Certificate_${item.lab || "GIA"}_${item.certificateNumber || item.sku || "CERT"}.pdf`,
      buffer: await generateLabCertificatePdfBuffer(item),
    }))
  );

  return {
    invoiceBuffer,
    certificateBuffers,
  };
}

/**
 * Server-side generation of Diamond Technical Spec Dossier PDF Buffer
 */
export async function generateDiamondSpecPdfBuffer(diamond: IDiamond): Promise<Buffer> {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const props: IDiamondSpecPdfProps = {
    diamond,
    generatedDate,
    vaultReference: `DOSSIER-${diamond.sku}`,
  };

  const documentElement = DiamondSpecPdf(props);
  const buffer = await renderToBuffer(documentElement);
  return buffer;
}
