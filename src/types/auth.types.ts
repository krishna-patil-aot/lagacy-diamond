export type UserRole = "ADMIN" | "CUSTOMER";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider: "credentials" | "google";
  createdAt: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
