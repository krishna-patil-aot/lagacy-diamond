import { IDiamond } from "./diamond.types";

export type OrderStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type IOrderItem = IDiamond;

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW";

export interface IPaymentInfo {
  method: PaymentMethod;
  couponCode?: string;
  couponDiscountPercentage: number;
}

export interface IOrderTrackingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  vaultOrigin?: string;
  transitType?: "ARMORED_GROUND" | "ARMORED_AIR_ESCORT";
  biometricSignatureRequired?: boolean;
}

export interface IOrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface IOrder {
  id: string;
  orderNumber?: string;
  userId?: string;
  items: IDiamond[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  subtotal: number;
  couponDiscount: number;
  totalAmount: number;
  status: OrderStatus;
  trackingInfo?: IOrderTrackingInfo;
  timeline?: IOrderTimelineEvent[];
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  createdByAdmin?: boolean;
  adminNotes?: string;
}

export interface ICouponRule {
  code: string;
  discountPercentage: number;
  description: string;
}

export interface ISendOrderDocumentsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

