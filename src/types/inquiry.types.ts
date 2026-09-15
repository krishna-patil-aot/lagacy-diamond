export type InquiryType =
  | "CUSTOM_ENGAGEMENT_RING"
  | "PRIVATE_VAULT_VIEWING"
  | "INVESTMENT_GEMSTONE"
  | "CERTIFICATE_AUTHENTICATION"
  | "ORDER_CONCIERGE"
  | "GENERAL_INQUIRY";

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export type MessageSenderType = "CLIENT" | "ADMIN" | "SYSTEM";

export interface IInquiryMessage {
  id: string;
  sender: MessageSenderType;
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  readAt?: string;
}

export interface IInquiry {
  id: string;
  inquiryNumber: string;
  fullName: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  preferredCaratRange?: string;
  budgetRange?: string;
  message: string;
  messages?: IInquiryMessage[];
  status: InquiryStatus;
  adminNotes?: string;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  isClientRead?: boolean;
  unreadClientCount?: number;
  unreadAdminCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ICreateInquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  inquiryType: InquiryType;
  preferredCaratRange?: string;
  budgetRange?: string;
  message: string;
}

export interface ISendInquiryMessageInput {
  message: string;
  senderEmail?: string;
  senderName?: string;
  senderRole?: "CLIENT" | "ADMIN";
}

export interface ISendInquiryMessageResponse {
  success: boolean;
  data?: IInquiry;
  message?: string;
  error?: string;
}

export interface IGetInquiryDetailsResponse {
  success: boolean;
  data?: IInquiry;
  error?: string;
}

export interface IInquiryStats {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
}

export interface IAdminInquiriesResponse {
  success: boolean;
  data?: IInquiry[];
  stats?: IInquiryStats;
  error?: string;
}

export interface IUpdateInquiryStatusResponse {
  success: boolean;
  data?: IInquiry;
  error?: string;
}

export interface IClientNotificationsResponse {
  success: boolean;
  data?: IInquiry[];
  unreadCount: number;
  error?: string;
}

export interface ITrackInquiryResponse {
  success: boolean;
  data?: IInquiry;
  error?: string;
}

