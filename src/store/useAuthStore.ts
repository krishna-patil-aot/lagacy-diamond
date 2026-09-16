import { create } from "zustand";
import { IAuthState, IUser } from "@/types/auth.types";
import { logoutAction, getSessionUserAction } from "@/actions/auth.action";
import { toast } from "sonner";

interface IAuthStore extends IAuthState {
  setUser: (user: IUser | null) => void;
  login: (user: IUser, token?: string) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<IAuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user: IUser | null) => {
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  },

  login: (user: IUser) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    toast.success(`Welcome, ${user.name}!`, {
      description: `Authenticated as ${user.role === "ADMIN" ? "Curator / Admin" : "Private Collector"}`,
    });
  },

  logout: async () => {
    try {
      await logoutAction();
    } catch {
      // Ignored if network failure during logout
    }

    // Clean up any remaining legacy localStorage items
    if (typeof window !== "undefined") {
      localStorage.removeItem("diamond_auth_token");
      localStorage.removeItem("diamond_auth_user");
    }

    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    toast.info("Signed out of Vault session");
  },

  initialize: async () => {
    try {
      const user = await getSessionUserAction();
      set({
        user,
        isAuthenticated: Boolean(user),
        isLoading: false,
      });
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
