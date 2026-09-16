import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IDiamond } from "@/types/diamond.types";
import { toast } from "sonner";

export interface ICartItem extends IDiamond {
  cartQuantity: number;
}

interface ICartStore {
  cart: ICartItem[];
  wishlist: IDiamond[];
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (diamond: IDiamond, quantity?: number) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (diamond: IDiamond) => void;
  isInWishlist: (id: string) => boolean;
  isInCart: (id: string) => boolean;
  getCartItem: (id: string) => ICartItem | undefined;
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

      addToCart: (diamond: IDiamond, quantity = 1) => {
        const safeQuantity = Math.max(1, quantity);
        const maxStock = Math.max(1, diamond.stockQuantity);

        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item._id === diamond._id
          );

          if (existingIndex > -1) {
            const currentItem = state.cart[existingIndex];
            const newQty = Math.min(
              (currentItem.cartQuantity || 1) + safeQuantity,
              maxStock
            );

            const updatedCart = [...state.cart];
            updatedCart[existingIndex] = {
              ...currentItem,
              cartQuantity: newQty,
            };

            toast.success("Updated Cart Quantity", {
              description: `${diamond.name} quantity updated to ${newQty}.`,
            });
            return { cart: updatedCart };
          }

          const addQty = Math.min(safeQuantity, maxStock);
          toast.success("Added to Cart!", {
            description: `${diamond.name} (${addQty} ${addQty === 1 ? "specimen" : "specimens"})`,
          });
          return {
            cart: [
              ...state.cart,
              {
                ...diamond,
                cartQuantity: addQty,
              },
            ],
          };
        });
      },

      updateCartQuantity: (id: string, quantity: number) => {
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item._id !== id) return item;
            const maxStock = Math.max(1, item.stockQuantity);
            const validQty = Math.min(Math.max(1, quantity), maxStock);
            return { ...item, cartQuantity: validQty };
          }),
        }));
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

      getCartItem: (id: string) => {
        return get().cart.find((item) => item._id === id);
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

