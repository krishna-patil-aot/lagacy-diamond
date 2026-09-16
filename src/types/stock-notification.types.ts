export interface IStockNotification {
  id: string;
  diamondId: string;
  diamondSku: string;
  diamondName: string;
  email: string;
  clientName: string;
  notified: boolean;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStockNotificationInput {
  diamondId: string;
  diamondSku: string;
  diamondName: string;
  email: string;
  clientName?: string;
}

export interface IStockNotificationResponse {
  success: boolean;
  message: string;
  data?: IStockNotification;
  error?: string;
}
