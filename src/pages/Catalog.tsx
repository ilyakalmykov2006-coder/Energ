import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useUser } from "@/context/UserContext";
import { Suspense, lazy } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = lazy(() => import("react-quill"));

const SERVER_URL = "http://192.168.0.196:5000";

interface Spec {
  name: string;
  value: string;
}

interface NewProduct {
  name: string;
  description: string;
  category_id: number | "";
  specs: Spec[];
  images: File[];
}

const Catalog = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    category_id: "",
    specs: [],
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsRes = await fetch(`${SERVER_URL}/categories`);
        const cats = await catsRes.json();
        setCategories(cats);

        const prodRes = await fetch(`${SERVER_URL}/products`);
        const prods = await prodRes.json();
        setProducts(prods);
      } catch (err) {
        console.error("FETCH DATA ERROR:", err);
      }
    };
    fetchData();
  }, []);

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory) result = result.filter((p) => p.category_id === activeCategory.id);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
  (p) =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    (p.specs || []).some((s: any) =>
      s.value.toLowerCase().includes(q)
    )
);
    }
    return result;
  }, [activeCategory, searchQuery, products]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewProduct({ ...newProduct, images: Array.from(e.target.files) });
    }
  };

  // --- Dynamic Specs ---
  const addSpec = () => {
    setNewProduct({
      ...newProduct,
      specs: [...newProduct.specs, { name: "", value: "" }],
    });
  };

  const updateSpec = (index: number, field: "name" | "value", value: string) => {
    const updated = [...newProduct.specs];
    updated[index][field] = value;
    setNewProduct({ ...newProduct, specs: updated });
  };

  const removeSpec = (index: number) => {
    const updated = newProduct.specs.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, specs: updated });
  };

  const handleSubmitNewProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Нет токена авторизации");

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description); // HTML string
      formData.append("category_id", String(newProduct.category_id));
      formData.append("specs", JSON.stringify(newProduct.specs));
      newProduct.images.forEach((file) => formData.append("images", file));

      const res = await fetch(`${SERVER_URL}/admin/product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Ошибка сервера");
        return;
      }

      alert("Товар добавлен!");
      setShowModal(false);
      setNewProduct({ name: "", description: "", category_id: "", specs: [], images: [] });

      const prodRes = await fetch(`${SERVER_URL}/products`);
      const prods = await prodRes.json();
      setProducts(prods);
    } catch (err) {
      console.error("SUBMIT PRODUCT ERROR:", err);
      alert("Ошибка соединения с сервером");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (user?.role !== "admin") return;
    if (!confirm("Вы действительно хотите удалить этот товар?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER_URL}/admin/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка удаления");
      setProducts(products.filter((p) => p.id !== id));
      alert("Товар удален");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Не удалось удалить товар");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams(location.search);
    if (value) params.set("search", value);
    else params.delete("search");
    navigate({ pathname: "/catalog", search: params.toString() });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <span>/</span>
          <Link
            to="/catalog"
            className={`hover:text-primary transition-colors ${!activeCategory ? "text-foreground font-medium" : ""}`}
          >
            Каталог
          </Link>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-foreground font-medium">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-28">
              <h3 className="font-semibold mb-3">Категории</h3>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/catalog"
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${!activeCategory ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                >
                  Все товары
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog/${cat.slug}`}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${activeCategory?.id === cat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">{activeCategory ? activeCategory.name : "Все товары"}</h1>
              <span className="text-sm text-muted-foreground">Найдено: {filtered.length}</span>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowModal(true)}
                  className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Добавить товар
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск по названию, описанию или характеристикам..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-input bg-card py-3 pl-11 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Products */}
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={() => handleDeleteProduct(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal добавления */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Добавить товар</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmitNewProduct} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Description (Rich Text) */}
             <Suspense fallback={<div>Загрузка редактора...</div>}>
  <ReactQuill
    theme="snow"
    value={newProduct.description}
    onChange={(value) => setNewProduct({ ...newProduct, description: value })}
    className="bg-white"
  />
</Suspense>


              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">Категория</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category_id: Number(e.target.value), specs: [] })
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Specs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Характеристики</label>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    + Добавить
                  </button>
                </div>

                {newProduct.specs.map((spec, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Название характеристики"
                      value={spec.name}
                      onChange={(e) => updateSpec(index, "name", e.target.value)}
                      className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Значение"
                      value={spec.value}
                      onChange={(e) => updateSpec(index, "value", e.target.value)}
                      className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

             {/* Images */}
<div>
  <label className="block text-sm font-medium mb-1">
    Картинки (можно несколько)
  </label>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageChange}
    className="w-full"
  />

  <div className="flex gap-2 flex-wrap mt-3">
    {newProduct.images.map((img, idx) => (
      <img
        key={idx}
        src={URL.createObjectURL(img)}
        alt="preview"
        className="w-20 h-20 object-cover rounded border"
      />
    ))}
  </div>
</div>

              {/* Buttons */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-100">Отмена</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Catalog;
