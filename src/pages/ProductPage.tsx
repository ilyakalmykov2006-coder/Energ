// src/pages/ProductPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecList from "@/components/SpecList"; // убедитесь, что компонент есть
const SERVER_URL = "http://192.168.0.196:5000";

interface Spec {
  name: string;
  value: string;
}

interface Image {
  id: number;
  path: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  specs: Spec[];
  images: Image[];
  category_name?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' fill='%238b8b8b' font-size='20' font-family='Arial' dominant-baseline='middle' text-anchor='middle'%3EНет изображения%3C/text%3E%3C/svg%3E";

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [thumbsStart, setThumbsStart] = useState(0); // для прокрутки миниатюр

  useEffect(() => {
    if (!productId) {
      setError("Продукт не найден");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/product/${productId}`);
        if (!res.ok) {
          setError("Продукт не найден");
          return;
        }

        const data: Product = await res.json();
        setProduct(data);

        if (data.images && data.images.length > 0) {
          setActiveImage(`${SERVER_URL}/uploads/${data.images[0].path}`);
        } else {
          setActiveImage(PLACEHOLDER);
        }
      } catch (err) {
        console.error("FETCH PRODUCT ERROR:", err);
        setError("Ошибка соединения с сервером");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // навигация в полноэкранном модальном
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!product || !product.images) return;
      if (!selectedImage) return;
      const urls = product.images.map((img) => `${SERVER_URL}/uploads/${img.path}`);
      const idx = urls.indexOf(selectedImage);
      if (e.key === "Escape") setSelectedImage(null);
      if (e.key === "ArrowRight") {
        const next = idx === -1 ? 0 : (idx + 1) % urls.length;
        setSelectedImage(urls[next]);
      }
      if (e.key === "ArrowLeft") {
        const prev = idx === -1 ? urls.length - 1 : (idx - 1 + urls.length) % urls.length;
        setSelectedImage(urls[prev]);
      }
    },
    [product, selectedImage]
  );

  useEffect(() => {
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, handleKeyDown]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/catalog" className="text-blue-600 hover:underline">
          ← Назад к каталогу
        </Link>
      </div>
    );

  if (!product) return null;

  const imageUrls = (product.images || []).map((img) => `${SERVER_URL}/uploads/${img.path}`);
  const visibleThumbs = imageUrls.slice(thumbsStart, thumbsStart + 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <Link
          to="/catalog"
          className="text-sm text-gray-500 hover:underline mb-6 inline-block"
        >
          ← Назад к каталогу
        </Link>

        {/* Сетка: на md+ — 3 колонки (галерея 2 колонки + характеристики 1 колонка).
            Под первой строкой — описание на всю ширину. 
            На мобильных всё стекается: галерея -> описание -> характеристики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ====== Первая строка: Галерея (2 колонки) ====== */}
          <div className="md:col-span-2">
            <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-gray-100">
              <img
                src={activeImage ?? PLACEHOLDER}
                onClick={() => setSelectedImage(activeImage)}
                className="w-full h-full object-contain cursor-pointer bg-white"
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  if (t.src !== PLACEHOLDER) t.src = PLACEHOLDER;
                }}
              />

              {/* счетчик превью */}
              {product.images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                  {product.images.length} фото
                </div>
              )}
            </div>

            {/* превью миниатюр */}
            {product.images.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setThumbsStart((s) => Math.max(0, s - 1))}
                  disabled={thumbsStart === 0}
                  className={`p-1 rounded ${thumbsStart === 0 ? "opacity-40" : "hover:bg-gray-100"}`}
                  aria-label="prev thumbnails"
                >
                  ‹
                </button>

                <div className="flex gap-3 overflow-x-auto">
                  {visibleThumbs.map((url) => (
                    <button
                      key={url}
                      onClick={() => setActiveImage(url)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border transition transform ${
                        activeImage === url ? "border-blue-500 scale-105" : "border-gray-200 hover:scale-105"
                      }`}
                      aria-pressed={activeImage === url}
                    >
                      <img
                        src={url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          if (t.src !== PLACEHOLDER) t.src = PLACEHOLDER;
                        }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setThumbsStart((s) =>
                      Math.min(Math.max(0, imageUrls.length - 6), s + 1)
                    )
                  }
                  disabled={thumbsStart >= Math.max(0, imageUrls.length - 6)}
                  className={`p-1 rounded ${thumbsStart >= Math.max(0, imageUrls.length - 6) ? "opacity-40" : "hover:bg-gray-100"}`}
                  aria-label="next thumbnails"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* ====== Первой строкой справа: Характеристики (sticky на desktop) ====== */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-28">
              {product.specs && product.specs.length > 0 ? (
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
                  <SpecList specs={product.specs} previewGroups={0} />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Характеристики отсутствуют</div>
              )}
            </div>
          </aside>

          {/* ====== Вторая строка: Описание на всю ширину ====== */}
          <section className="md:col-span-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category_name && (
                <div className="text-sm text-muted-foreground mb-3">{product.category_name}</div>
              )}

              <div
                className="prose max-w-none mb-4 text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* ===== FULLSCREEN MODAL ===== */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
          aria-modal="true"
          role="dialog"
        >
          <img
            src={selectedImage}
            className="max-h-[90%] max-w-[90%] rounded-xl"
            alt="full"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              if (t.src !== PLACEHOLDER) t.src = PLACEHOLDER;
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductPage;