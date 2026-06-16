"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type CartItem = {
  productId: string;
  name: string;
  brand: string;
  slug: string;
  image: string;
  quantity: number;
  price: number;
  salePrice?: number | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("anmol-cart");
    if (raw) setItems(JSON.parse(raw));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("anmol-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.salePrice ?? item.price) * item.quantity, 0);
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      addItem(item, quantity = 1) {
        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (existing) {
            return current.map((entry) =>
              entry.productId === item.productId ? { ...entry, quantity: entry.quantity + quantity } : entry
            );
          }
          toast.success("Added to cart");
          return [...current, { ...item, quantity }];
        });
      },
      updateQuantity(productId, quantity) {
        setItems((current) =>
          current
            .map((entry) => (entry.productId === productId ? { ...entry, quantity } : entry))
            .filter((entry) => entry.quantity > 0)
        );
      },
      removeItem(productId) {
        setItems((current) => current.filter((entry) => entry.productId !== productId));
      },
      clearCart() {
        setItems([]);
      }
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
