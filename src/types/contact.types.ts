export type InquiryType =
  | "CUSTOM_ENGAGEMENT_RING"
  | "PRIVATE_VAULT_VIEWING"
  | "INVESTMENT_GEMSTONE"
  | "CERTIFICATE_AUTHENTICATION"
  | "ORDER_CONCIERGE"
  | "GENERAL_INQUIRY";

export interface IContactInquiry {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  preferredCaratRange?: string;
  budgetRange?: string;
  message: string;
}

export interface IContactResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
  error?: string;
}
