import { create } from "zustand";
import { IDiamond } from "@/types/diamond.types";
import { toast } from "sonner";

interface ICartStore {
  cart: IDiamond[];
  wishlist: IDiamond[];
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (diamond: IDiamond) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (diamond: IDiamond) => void;
  isInWishlist: (id: string) => boolean;
  isInCart: (id: string) => boolean;
  clearCart: () => void;
}

export const useCartStore = create<ICartStore>((set, get) => ({
  cart: [],
  wishlist: [],
  isCheckoutOpen: false,

  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),

  addToCart: (diamond: IDiamond) => {
    set((state) => {
      if (state.cart.some((item) => item._id === diamond._id)) {
        toast.info("Already in your Private Vault reservation");
        return state;
      }
      toast.success("Reserved in Private Vault!", {
        description: `${diamond.name} (${diamond.carat} ct ${diamond.shape})`,
      });
      return { cart: [...state.cart, diamond] };
    });
  },

  removeFromCart: (id: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item._id !== id),
    }));
    toast.info("Removed from Private Vault reservation");
  },

  toggleWishlist: (diamond: IDiamond) => {
    set((state) => {
      const exists = state.wishlist.some((item) => item._id === diamond._id);
      if (exists) {
        toast.info("Removed from Private Collection");
        return {
          wishlist: state.wishlist.filter((item) => item._id !== diamond._id),
        };
      }
      toast.success("Saved to Private Collection!", {
        description: `${diamond.name} added to your wishlist.`,
      });
      return { wishlist: [...state.wishlist, diamond] };
    });
  },

  isInWishlist: (id: string) => {
    return get().wishlist.some((item) => item._id === id);
  },

  isInCart: (id: string) => {
    return get().cart.some((item) => item._id === id);
  },

  clearCart: () => set({ cart: [] }),
}));
