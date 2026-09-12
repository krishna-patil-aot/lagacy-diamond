import { IDiamond, CertificationLab } from "./diamond.types";
import { IOrder } from "./order.types";

export interface IDiamondSpecPdfProps {
  diamond: IDiamond;
  generatedDate: string;
  vaultReference: string;
}

export interface ILabCertificatePdfProps {
  certificateNumber: string;
  lab: CertificationLab;
  issueDate: string;
  diamond: IDiamond;
  gemologistName: string;
  gemologistTitle: string;
  vaultId: string;
  securityHash: string;
  verificationUrl: string;
}

export interface IInvoicePdfProps {
  order: IOrder;
  invoiceNumber: string;
  issueDate: string;
  paymentStatus: "CONFIRMED_ESCROW" | "PAID_IN_FULL" | "PENDING_SETTLEMENT";
  companyInfo: {
    name: string;
    tagline: string;
    address: string;
    cityStateZip: string;
    supportEmail: string;
    websiteUrl: string;
  };
}

export interface IEmailDispatchPayload {
  to: string;
  clientName: string;
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
  invoicePdfBuffer: Buffer;
  certificatePdfBuffers: Array<{
    filename: string;
    buffer: Buffer;
  }>;
}

export interface IEmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
