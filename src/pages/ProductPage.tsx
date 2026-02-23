import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
}

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

        if (data.images.length > 0) {
          setActiveImage(`${SERVER_URL}/uploads/${data.images[0].path}`);
        }
      } catch {
        setError("Ошибка соединения с сервером");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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

        <div className="grid md:grid-cols-2 gap-10 bg-white p-8 rounded-2xl shadow-lg">

          {/* ===== ГАЛЕРЕЯ ===== */}
          <div>
            {activeImage && (
              <img
                src={activeImage}
                onClick={() => setSelectedImage(activeImage)}
                className="w-full h-[400px] object-cover rounded-xl cursor-pointer transition hover:scale-105"
              />
            )}

            <div className="flex gap-3 mt-4 flex-wrap">
              {product.images.map((img) => {
                const url = `${SERVER_URL}/uploads/${img.path}`;
                return (
                  <img
                    key={img.id}
                    src={url}
                    onClick={() => setActiveImage(url)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border transition ${
                      activeImage === url
                        ? "border-blue-500 scale-105"
                        : "border-gray-200 hover:scale-105"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* ===== ИНФОРМАЦИЯ ===== */}
          <div>
            <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

            <div
              className="prose max-w-none mb-6 text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {product.specs.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Характеристики
                </h2>

                <div className="border rounded-lg overflow-hidden divide-y">
                  {product.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex justify-between px-4 py-3 bg-gray-50"
                    >
                      <span className="font-medium text-gray-600">{spec.name}</span>
                      <span className="text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* ===== FULLSCREEN MODAL ===== */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
        >
          <img
            src={selectedImage}
            className="max-h-[90%] max-w-[90%] rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProductPage;