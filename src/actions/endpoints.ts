export const ENDPOINTS = {
  DIAMONDS: {
    BASE: "/api/diamonds",
    BY_ID: (id: string) => `/api/diamonds/${id}`,
  },
  ORDERS: {
    BASE: "/api/orders",
    ADMIN: "/api/admin/orders",
    BY_ID: (id: string) => `/api/orders/${id}`,
  },
  INQUIRIES: {
    BASE: "/api/inquiries",
    ADMIN: "/api/admin/inquiries",
    BY_ID: (id: string) => `/api/inquiries/${id}`,
  },
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
  },
} as const;
