import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useCartStore = create<ICartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      isCheckoutOpen: false,

      openCheckout: () => set({ isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      addToCart: (diamond: IDiamond) => {
        set((state) => {
          if (state.cart.some((item) => item._id === diamond._id)) {
            toast.info("Item is already in your shopping cart");
            return state;
          }
          toast.success("Added to Cart!", {
            description: `${diamond.name} (${diamond.carat} ct ${diamond.shape})`,
          });
          return { cart: [...state.cart, diamond] };
        });
      },

      removeFromCart: (id: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== id),
        }));
        toast.info("Removed from Cart");
      },

      toggleWishlist: (diamond: IDiamond) => {
        set((state) => {
          const exists = state.wishlist.some(
            (item) => item._id === diamond._id,
          );
          if (exists) {
            toast.info("Removed from Wishlist");
            return {
              wishlist: state.wishlist.filter(
                (item) => item._id !== diamond._id,
              ),
            };
          }
          toast.success("Added to Wishlist!", {
            description: `${diamond.name} has been added to your wishlist.`,
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
    }),
    {
      name: "legacy_diamond_cart_wishlist_storage",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.cart) state.cart = [];
          if (!state.wishlist) state.wishlist = [];
        }
      },
    },
  ),
);
