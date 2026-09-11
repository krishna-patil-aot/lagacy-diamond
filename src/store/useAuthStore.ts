import { create } from "zustand";
import { IAuthState, IUser } from "@/types/auth.types";
import { toast } from "sonner";

interface IAuthStore extends IAuthState {
  login: (user: IUser, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<IAuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: IUser, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("diamond_auth_token", token);
      localStorage.setItem("diamond_auth_user", JSON.stringify(user));
      document.cookie = `diamond_auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
    toast.success(`Welcome, ${user.name}!`, {
      description: `Authenticated as ${user.role === "ADMIN" ? "Curator / Admin" : "Private Collector"}`,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("diamond_auth_token");
      localStorage.removeItem("diamond_auth_user");
      document.cookie = "diamond_auth_token=; path=/; max-age=0; SameSite=Lax";
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    toast.info("Signed out of Vault session");
  },

  initialize: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    try {
      const token = localStorage.getItem("diamond_auth_token");
      const userJson = localStorage.getItem("diamond_auth_user");

      if (token && userJson) {
        const user = JSON.parse(userJson) as IUser;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
