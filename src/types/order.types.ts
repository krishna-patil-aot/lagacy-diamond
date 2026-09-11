import { IDiamond } from "./diamond.types";

export type OrderStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

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

export interface IPaymentInfo {
  method: "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW";
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
}

export interface ICouponRule {
  code: string;
  discountPercentage: number;
  description: string;
}
