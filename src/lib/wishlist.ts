"use client";

import { useState, useEffect, useCallback } from "react";

export type WishlistItem = {
  slug: string;
  brand: string;
  model: string;
  year?: number | null;
  imageUrl?: string | null;
  priceKrw?: number | null;
};

const STORAGE_KEY = "racketlab_wishlist";

function getStoredItems(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredItems(items: WishlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(getStoredItems());
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setItems(getStoredItems());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const add = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) return prev;
      const next = [...prev, item];
      setStoredItems(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.slug !== slug);
      setStoredItems(next);
      return next;
    });
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === item.slug);
      const next = exists ? prev.filter((i) => i.slug !== item.slug) : [...prev, item];
      setStoredItems(next);
      return next;
    });
  }, []);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  return { items, add, remove, toggle, has };
}
