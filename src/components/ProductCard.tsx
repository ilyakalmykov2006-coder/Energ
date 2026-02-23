import React from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/CompareContext";

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
}

const SERVER_URL = "http://192.168.0.196:5000";

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
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

  return (
    <div
      className="border rounded-lg p-4 bg-white shadow-sm relative cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {product.images.length > 0 ? (
        <div className="relative w-full h-48 overflow-hidden rounded">
          <img
            src={`${SERVER_URL}/uploads/${product.images[0].path}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.images.length > 1 && (
            <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
              +{product.images.length - 1}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
          Нет изображения
        </div>
      )}

      <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>

      {user?.role === "admin" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(product.id);
          }}
          className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
        >
          Удалить
        </button>
      )}

      <Button
        size="sm"
        variant={isInCompare ? "destructive" : "outline"}
        className="mt-3 w-full"
        onClick={handleCompareClick}
        disabled={loading}
      >
        {isInCompare ? "Убрать из сравнения" : "Сравнить"}
      </Button>
    </div>
  );
};

export default ProductCard;