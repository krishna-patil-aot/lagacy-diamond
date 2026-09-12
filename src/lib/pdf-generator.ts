import { renderToBuffer } from "@react-pdf/renderer";
import { IDiamond } from "@/types/diamond.types";
import { IOrder } from "@/types/order.types";
import { InvoicePdf } from "@/components/pdf/InvoicePdf";
import { LabCertificatePdf } from "@/components/pdf/LabCertificatePdf";
import { DiamondSpecPdf } from "@/components/pdf/DiamondSpecPdf";
import { IInvoicePdfProps, ILabCertificatePdfProps, IDiamondSpecPdfProps } from "@/types/pdf.types";

const COMPANY_INFO = {
  name: "Legacy Diamond Foundry",
  tagline: "Cultivated in Solar-Powered High-Tech Reactors • Zero Ecological Impact",
  address: "Vault 1, Diamond Financial District",
  cityStateZip: "San Francisco, CA 94104",
  supportEmail: "concierge@legacydiamond.luxury",
  websiteUrl: "https://legacydiamond.luxury",
};

/**
 * Server-side generation of Purchase Invoice PDF Buffer
 */
export async function generateInvoicePdfBuffer(order: IOrder): Promise<Buffer> {
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${order.id.slice(-5).toUpperCase()}`;
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

  const props: ILabCertificatePdfProps = {
    certificateNumber: diamond.certificateNumber,
    lab: diamond.lab,
    issueDate,
    diamond,
    gemologistName: "Dr. Alistair Sterling, FGA",
    gemologistTitle: "Chief Gemological Appraiser & Vault Master",
    vaultId: `VAULT-${diamond.sku}`,
    securityHash: Buffer.from(`${diamond.sku}-${diamond.certificateNumber}-${diamond.carat}`).toString("hex"),
    verificationUrl: `https://legacydiamond.luxury/verify/${diamond.certificateNumber}`,
  };

  const documentElement = LabCertificatePdf(props);
  const buffer = await renderToBuffer(documentElement);
  return buffer;
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
