"use client";

import { create } from "zustand";
import type { Cart } from "@/types/api";

interface CartState {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
}));
