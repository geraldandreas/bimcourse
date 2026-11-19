"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Course } from "@/data/courses";

interface CartContextType {
  cart: Course[];
  cartCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  checkoutCourse: Course | null;
  setCheckoutCourse: (course: Course | null) => void;
  openCheckout: (course?: Course) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "bimcourse_cart_items_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Course[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount (defaults to empty [])
  useEffect(() => {
    try {
      // Clear legacy storage key that had auto-seeded items
      try {
        localStorage.removeItem("bimcourse_cart_items");
      } catch {}

      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch {
      setCart([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch {}
    }
  }, [cart, isLoaded]);

  const addToCart = (course: Course) => {
    setCart((prev) => {
      // Avoid duplicate course
      if (prev.some((c) => c.id === course.id || c.slug === course.slug)) {
        return prev;
      }
      return [...prev, course];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (courseId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== courseId && c.slug !== courseId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const openCheckout = (course?: Course) => {
    if (course) {
      setCheckoutCourse(course);
    } else if (cart.length > 0) {
      setCheckoutCourse(cart[0]);
    }
    setIsCartOpen(false);
  };

  const totalAmount = cart.reduce((acc, c) => acc + (c.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        clearCart,
        checkoutCourse,
        setCheckoutCourse,
        openCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
