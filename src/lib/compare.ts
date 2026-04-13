"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "racketlab_compare";
const MAX_COMPARE = 3;

export type CompareItem = {
  slug: string;
  brand: string;
  model: string;
};

function getStored(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(items: CompareItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("compare-updated"));
}

export function useCompare() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    setItems(getStored());
    function sync() { setItems(getStored()); }
    window.addEventListener("compare-updated", sync);
    window.addEventListener("storage", (e) => { if (e.key === STORAGE_KEY) sync(); });
    return () => {
      window.removeEventListener("compare-updated", sync);
    };
  }, []);

  const add = useCallback((item: CompareItem) => {
    const current = getStored();
    if (current.length >= MAX_COMPARE || current.some((i) => i.slug === item.slug)) return;
    const next = [...current, item];
    setStored(next);
    setItems(next);
  }, []);

  const remove = useCallback((slug: string) => {
    const next = getStored().filter((i) => i.slug !== slug);
    setStored(next);
    setItems(next);
  }, []);

  const toggle = useCallback((item: CompareItem) => {
    const current = getStored();
    const exists = current.some((i) => i.slug === item.slug);
    if (exists) {
      const next = current.filter((i) => i.slug !== item.slug);
      setStored(next);
      setItems(next);
    } else if (current.length < MAX_COMPARE) {
      const next = [...current, item];
      setStored(next);
      setItems(next);
    }
  }, []);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const clear = useCallback(() => {
    setStored([]);
    setItems([]);
  }, []);

  return { items, add, remove, toggle, has, clear, isFull: items.length >= MAX_COMPARE };
}
