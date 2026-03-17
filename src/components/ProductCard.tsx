import React from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/CompareContext";
import SpecList from "./SpecList";

export interface Spec {
  name: string;
  value: string;
}

export interface Image {
  id: number;
  path: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  specs: Spec[];
  images: Image[];
  category_id: number;
  category_name: string;
}

interface ProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
  // необязательно: если передать, клики по значениям характеристик вызовут этот callback (можно использовать для установки фильтра)
  onFilterClick?: (specName: string, value: string) => void;
}

const SERVER_URL = "http://192.168.0.196:5000";
const PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'%3E%3Crect fill='%23e5e7eb' width='320' height='240'/%3E%3Ctext x='50%25' y='50%25' fill='%238b8b8b' font-size='16' font-family='Arial' dominant-baseline='middle' text-anchor='middle'%3EНет изображения%3C/text%3E%3C/svg%3E";

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onFilterClick }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { compareProducts, addToCompare, removeFromCompare, loading } = useCompare();

  const categoryProducts = compareProducts[product.category_id] || [];
  const isInCompare = !loading && categoryProducts.some((p) => p.id === product.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert("Для сравнения нужно войти в аккаунт");

    if (isInCompare) removeFromCompare(product.id, product.category_id);
    else addToCompare(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(product.id);
  };

  const thumbUrl = product.images && product.images.length > 0
    ? `${SERVER_URL}/uploads/${product.images[0].path}`
    : PLACEHOLDER;

  return (
    <div
      className="border rounded-lg p-4 bg-white shadow-sm relative cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/product/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/product/${product.id}`);
      }}
    >
      <div className="relative w-full h-48 overflow-hidden rounded">
        <img
          src={thumbUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            if (t.src !== PLACEHOLDER) t.src = PLACEHOLDER;
          }}
        />
        {product.images && product.images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
            +{product.images.length - 1}
          </div>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold line-clamp-2">{product.name}</h3>

      {product.category_name && (
        <div className="text-xs text-muted-foreground mt-1">{product.category_name}</div>
      )}

      {/* Админское удаление */}
      {user?.role === "admin" && (
        <button
          onClick={handleDelete}
          aria-label="Удалить товар"
          className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
        >
          Удалить
        </button>
      )}

      {/* Краткие характеристики */}
      <div className="mt-3 text-sm text-muted-foreground">
        <SpecList
          specs={product.specs}
          previewGroups={3}
          onValueClick={(specName, value) => {
            // если в Card передан обработчик — вызываем его, иначе ничего
            if (onFilterClick) onFilterClick(specName, value);
          }}
        />
      </div>

      <div className="mt-3">
        <Button
          size="sm"
          variant={isInCompare ? "destructive" : "outline"}
          className="w-full"
          onClick={handleCompareClick}
          disabled={loading}
        >
          {isInCompare ? "Убрать из сравнения" : "Сравнить"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;