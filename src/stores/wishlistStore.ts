// src/stores/wishlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  product_id: string;
  product_name: string;
  price: number;
  description: string;
  image_url: string | null;
}

interface WishlistState {
  // 각 사용자별 위시리스트를 관리하는 객체
  wishlists: { [userId: string]: Product[] };
  addToWishlist: (userId: string, product: Product) => void;
  removeFromWishlist: (userId: string, productId: string) => void;
  toggleWishlist: (userId: string, product: Product) => void;
  clearWishlist: (userId: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlists: {},
      addToWishlist: (userId, product) => {
        set((state) => {
          const current = state.wishlists[userId] || [];
          return {
            wishlists: { ...state.wishlists, [userId]: [...current, product] },
          };
        });
      },
      removeFromWishlist: (userId, productId) => {
        set((state) => {
          const current = state.wishlists[userId] || [];
          return {
            wishlists: {
              ...state.wishlists,
              [userId]: current.filter((p) => p.product_id !== productId),
            },
          };
        });
      },
      toggleWishlist: (userId, product) => {
        const { wishlists, addToWishlist, removeFromWishlist } = get();
        const current = wishlists[userId] || [];
        const exists = current.some((p) => p.product_id === product.product_id);
        if (exists) {
          removeFromWishlist(userId, product.product_id);
        } else {
          addToWishlist(userId, product);
        }
      },
      clearWishlist: (userId) => {
        set((state) => {
          const newWishlists = { ...state.wishlists };
          delete newWishlists[userId];
          return { wishlists: newWishlists };
        });
      },
    }),
    { name: "wishlist-storage" }
  )
);
