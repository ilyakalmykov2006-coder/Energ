import { useState, useEffect } from "react";
import { Product } from "@/types"; // общий тип продуктов

export const useCompare = () => {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем сравнение из localStorage при старте
  useEffect(() => {
    const stored = localStorage.getItem("compareProducts");
    if (stored) {
      try {
        const parsed: Product[] = JSON.parse(stored);
        setCompareProducts(parsed);
      } catch {
        setCompareProducts([]);
      }
    }
    setLoading(false);
  }, []);

  const addToCompare = (product: Product) => {
    setCompareProducts(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      const updated = [...prev, product];
      localStorage.setItem("compareProducts", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCompare = (productId: number) => {
    setCompareProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem("compareProducts", JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareProducts([]);
    localStorage.removeItem("compareProducts");
  };

  return {
    compareProducts,
    addToCompare,
    removeFromCompare,
    clearCompare,
    loading, // важно для корректной отрисовки кнопок
  };
};