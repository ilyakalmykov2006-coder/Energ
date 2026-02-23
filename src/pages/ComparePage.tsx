import React, { useState, useEffect } from "react";
import { useCompare } from "@/context/CompareContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SERVER_URL = "http://192.168.0.196:5000";

// Маппинг категорий
const categoriesMap: Record<number, string> = {
  3: "Счётчики",
  1: "Метео оборудование",
  2: "Энергетическое оборудование",
};

const ComparePage: React.FC = () => {
  const { compareProducts, removeFromCompare, clearCompareCategory } =
    useCompare();

  const navigate = useNavigate();

  // 👉 ОБЯЗАТЕЛЬНО объявляем categories ЗДЕСЬ
  const categories = Object.entries(compareProducts)
    .filter(([_, products]) => Array.isArray(products) && products.length > 0)
    .map(([categoryId, products]) => ({
      id: Number(categoryId),
      name: categoriesMap[Number(categoryId)] || "Без категории",
      count: products.length,
    }));

  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    if (categories.length === 0) {
      setActiveCategory(null);
      return;
    }

    if (!activeCategory || !categories.find(c => c.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);

  // Если нет товаров
  if (!activeCategory) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              В сравнении нет товаров
            </h1>
            <button
              onClick={() => navigate("/catalog")}
              className="px-6 py-3 bg-blue-600 text-white rounded"
            >
              Перейти в каталог
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const activeProducts = compareProducts[activeCategory] || [];

  const allSpecs = Array.from(
    new Set(
      activeProducts.flatMap(product =>
        product.specs?.map(spec => spec.name) || []
      )
    )
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Вкладки */}
          <div className="mb-8 flex gap-4 flex-wrap">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2 rounded border ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Заголовок */}
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {categories.find(c => c.id === activeCategory)?.name}
            </h2>

            <button
              onClick={() => clearCompareCategory(activeCategory)}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Очистить
            </button>
          </div>

          {/* Таблица */}
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="p-4 border">Характеристика</th>
                  {activeProducts.map(product => (
                    <th key={product.id} className="p-4 border">
                      {product.images?.length > 0 && (
                        <img
                          src={`${SERVER_URL}/uploads/${product.images[0].path}`}
                          alt={product.name}
                          className="h-24 mx-auto mb-2"
                        />
                      )}
                      <div className="font-semibold">{product.name}</div>
                      <button
                        onClick={() =>
                          removeFromCompare(product.id, activeCategory)
                        }
                        className="text-red-600 text-xs mt-2"
                      >
                        Удалить
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {allSpecs.map(specName => {
                  const values = activeProducts.map(product => {
                    const spec = product.specs?.find(
                      s => s.name === specName
                    );
                    return spec ? spec.value : "—";
                  });

                  const allEqual = values.every(v => v === values[0]);

                  return (
                    <tr key={specName}>
                      <td className="p-3 border font-medium">
                        {specName}
                      </td>
                      {values.map((value, i) => (
                        <td
                          key={i}
                          className={`p-3 border text-center ${
                            !allEqual ? "bg-yellow-100 font-semibold" : ""
                          }`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default ComparePage;