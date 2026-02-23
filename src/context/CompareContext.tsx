import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/types";

interface CompareContextType {
  compareProducts: Record<number, Product[]>; // категория -> массив товаров
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number, categoryId: number) => void;
  clearCompareCategory: (categoryId: number) => void;
  clearCompareAll: () => void;
  loading: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(
  undefined
);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareProducts, setCompareProducts] = useState<Record<number, Product[]>>({});
  const [loading, setLoading] = useState(true);

  // Загружаем из localStorage при старте
  useEffect(() => {
    const stored = localStorage.getItem("compareProductsByCategory");
    if (stored) {
      try {
        setCompareProducts(JSON.parse(stored));
      } catch {
        setCompareProducts({});
      }
    }
    setLoading(false);
  }, []);

  // Сохраняем в localStorage
  const save = (data: Record<number, Product[]>) => {
    localStorage.setItem("compareProductsByCategory", JSON.stringify(data));
  };

  // Добавление товара в сравнение по категории
  const addToCompare = (product: Product) => {
    const categoryId = product.category_id;

    setCompareProducts((prev) => {
      const categoryProducts = prev[categoryId] || [];

      if (categoryProducts.some((p) => p.id === product.id)) {
        return prev; // уже в сравнении
      }

      const updated = {
        ...prev,
        [categoryId]: [...categoryProducts, product],
      };

      save(updated);
      return updated;
    });
  };

  // Удаление товара из конкретной категории
  const removeFromCompare = (productId: number, categoryId: number) => {
    setCompareProducts((prev) => {
      const updatedCategory = (prev[categoryId] || []).filter(
        (p) => p.id !== productId
      );

      const updated = {
        ...prev,
        [categoryId]: updatedCategory,
      };

      save(updated);
      return updated;
    });
  };

  // Очистка всей категории
  const clearCompareCategory = (categoryId: number) => {
    setCompareProducts((prev) => {
      const updated = {
        ...prev,
        [categoryId]: [],
      };
      save(updated);
      return updated;
    });
  };

  // Полная очистка всех категорий
  const clearCompareAll = () => {
    setCompareProducts({});
    localStorage.removeItem("compareProductsByCategory");
  };

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompareCategory,
        clearCompareAll,
        loading,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

// Хук для использования контекста
export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
};