import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useParams, useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useUser } from "@/context/UserContext";
import "react-quill/dist/quill.snow.css";

const ReactQuill = React.lazy(() => import("react-quill"));

const SERVER_URL = "http://192.168.0.196:5000";

interface SubEntry {
  label: string;
  value: string;
}

interface Spec {
  name: string;
  // старый стиль value (если нет entries)
  value?: string;
  // новый — список подпунктов
  entries?: SubEntry[];
}

interface NewProduct {
  name: string;
  description: string;
  category_id: number | "";
  specs: Spec[];
  images: File[];
}

const Catalog: React.FC = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

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

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodRes] = await Promise.all([
          fetch(`${SERVER_URL}/categories`),
          fetch(`${SERVER_URL}/products`),
        ]);

        const cats = await catsRes.json();
        const prods = await prodRes.json();

        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods) ? prods : []);
      } catch (err) {
        console.error("FETCH DATA ERROR:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  // availableSpecs — остаётся как раньше, потому что сервер отдаёт развернутые значения.
  const availableSpecs = useMemo(() => {
    const map: Record<string, Map<string, number>> = {};

    products.forEach((p) => {
      if (activeCategory && p.category_id !== activeCategory.id) return;

      const specs = Array.isArray(p.specs) ? p.specs : [];
      specs.forEach((s: any) => {
        if (!s?.name) return;
        const name = String(s.name);
        const value = s?.value == null ? "" : String(s.value);

        if (!map[name]) map[name] = new Map();
        const prev = map[name].get(value) || 0;
        map[name].set(value, prev + 1);
      });
    });

    const result: Record<string, { value: string; count: number }[]> = {};
    Object.keys(map).forEach((k) => {
      const arr = Array.from(map[k].entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
      result[k] = arr;
    });

    return result;
  }, [products, activeCategory]);

  const toggleFilter = (specName: string, value: string) => {
    setActiveFilters((prev) => {
      const cur = prev[specName] || [];
      if (cur.includes(value)) {
        const updated = cur.filter((v) => v !== value);
        if (updated.length === 0) {
          const copy = { ...prev };
          delete copy[specName];
          return copy;
        }
        return { ...prev, [specName]: updated };
      } else {
        return { ...prev, [specName]: [...cur, value] };
      }
    });
  };

  const clearFilters = () => setActiveFilters({});

  const filtered = useMemo(() => {
    let result = products;

    if (activeCategory) {
      result = result.filter((p) => p.category_id === activeCategory.id);
    }

    if ((debouncedSearch || "").trim()) {
      const q = debouncedSearch.toLowerCase();

      result = result.filter((p) => {
        const name = (p?.name || "").toString().toLowerCase();
        const description = (p?.description || "").toString().toLowerCase();
        const specs = Array.isArray(p?.specs) ? p.specs : [];

        const inSpecs = specs.some((s: any) =>
          (s?.value || "").toString().toLowerCase().includes(q)
        );

        return name.includes(q) || description.includes(q) || inSpecs;
      });
    }

    Object.entries(activeFilters).forEach(([specName, values]) => {
      if (!values || values.length === 0) return;
      result = result.filter((p) => {
        const specs = Array.isArray(p?.specs) ? p.specs : [];
        return specs.some((s: any) => s?.name === specName && values.includes(String(s?.value)));
      });
    });

    return result;
  }, [products, activeCategory, debouncedSearch, activeFilters]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewProduct((prev) => ({ ...prev, images: files }));
  };

  // --- Specs (новая логика: поддерживаем подпункты) ---
  const addSpec = () => {
    setNewProduct((prev) => ({ ...prev, specs: [...prev.specs, { name: "", value: "" }] }));
  };

  const updateSpec = (index: number, field: "name" | "value", value: string) => {
    setNewProduct((prev) => {
      const updated = [...prev.specs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specs: updated };
    });
  };

  const removeSpec = (index: number) => {
    setNewProduct((prev) => ({ ...prev, specs: prev.specs.filter((_, i) => i !== index) }));
  };

  const addSubEntry = (specIndex: number) => {
    setNewProduct((prev) => {
      const updated = [...prev.specs];
      const spec = { ...(updated[specIndex] || { name: "", value: "" }) };
      spec.entries = Array.isArray(spec.entries) ? [...spec.entries, { label: "", value: "" }] : [{ label: "", value: "" }];
      // remove top-level value if entries are used
      delete spec.value;
      updated[specIndex] = spec;
      return { ...prev, specs: updated };
    });
  };

  const updateSubEntry = (specIndex: number, subIndex: number, field: "label" | "value", value: string) => {
    setNewProduct((prev) => {
      const updated = [...prev.specs];
      const spec = { ...(updated[specIndex] || { name: "", value: "" }) };
      spec.entries = spec.entries ? [...spec.entries] : [];
      const sub = { ...(spec.entries[subIndex] || { label: "", value: "" }), [field]: value };
      spec.entries[subIndex] = sub;
      // if changed entries, ensure top-level value is removed
      delete spec.value;
      updated[specIndex] = spec;
      return { ...prev, specs: updated };
    });
  };

  const removeSubEntry = (specIndex: number, subIndex: number) => {
    setNewProduct((prev) => {
      const updated = [...prev.specs];
      const spec = { ...(updated[specIndex] || { name: "", value: "" }) };
      spec.entries = spec.entries ? spec.entries.filter((_, i) => i !== subIndex) : [];
      // if no entries left, leave spec.value as "" to allow old-style input
      if (spec.entries.length === 0 && spec.value === undefined) spec.value = "";
      updated[specIndex] = spec;
      return { ...prev, specs: updated };
    });
  };

  // Подготовка specs для отправки:
  //  - если у spec есть entries -> для каждой entry создаём объект { name: spec.name (+ ' — ' + label), value: entry.value }
  //  - иначе -> { name: spec.name, value: spec.value }
  const buildSpecsForSend = (specs: Spec[]) => {
    const out: { name: string; value: string }[] = [];
    for (const s of specs) {
      const baseName = s.name?.trim() ?? "";
      if (Array.isArray(s.entries) && s.entries.length > 0) {
        for (const e of s.entries) {
          const label = e.label?.trim();
          const value = e.value ?? "";
          const name = label ? `${baseName} — ${label}` : baseName;
          out.push({ name, value });
        }
      } else {
        // старый стиль
        out.push({ name: baseName, value: s.value ?? "" });
      }
    }
    return out;
  };

  const handleSubmitNewProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Нет токена авторизации");

      if (!newProduct.name || !newProduct.description || !newProduct.category_id) {
        return alert("Заполните обязательные поля");
      }

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("category_id", String(newProduct.category_id));

      // трансформируем specs в плоский массив {name, value}
      const plainSpecs = buildSpecsForSend(newProduct.specs || []);
      formData.append("specs", JSON.stringify(plainSpecs));

      newProduct.images.forEach((file) => formData.append("images", file));

      const res = await fetch(`${SERVER_URL}/admin/product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Ошибка сервера при добавлении товара");
        return;
      }

      const prodRes = await fetch(`${SERVER_URL}/products`);
      const prods = await prodRes.json();
      setProducts(Array.isArray(prods) ? prods : []);

      setNewProduct({ name: "", description: "", category_id: "", specs: [], images: [] });
      setShowModal(false);
      alert("Товар добавлен!");
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Ошибка удаления");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Товар удален");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Не удалось удалить товар: " + (err instanceof Error ? err.message : ""));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams(location.search);
    if (value) params.set("search", value);
    else params.delete("search");
    navigate({ pathname: `/catalog${activeCategory ? `/${activeCategory.slug}` : ""}`, search: params.toString() });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    navigate({ pathname: `/catalog${activeCategory ? `/${activeCategory.slug}` : ""}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-8">
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

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Фильтры</h4>
                  <button onClick={clearFilters} className="text-sm text-muted-foreground hover:underline">Сброс</button>
                </div>

                {Object.keys(availableSpecs).length === 0 ? (
                  <div className="text-sm text-muted-foreground">Нет доступных фильтров</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(availableSpecs).map(([specName, values]) => (
                      <div key={specName} className="bg-card rounded p-3 border">
                        <div className="text-sm font-medium mb-2">{specName}</div>
                        <div className="flex flex-col gap-2 max-h-48 overflow-auto pr-2">
                          {values.map(({ value, count }) => (
                            <label key={value} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={activeFilters[specName]?.includes(value) || false}
                                onChange={() => toggleFilter(specName, value)}
                              />
                              <span className="truncate">{value}</span>
                              <span className="ml-auto text-muted-foreground text-xs">({count})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">{activeCategory ? activeCategory.name : "Все товары"}</h1>
              <span className="text-sm text-muted-foreground">Найдено товаров: {filtered.length}</span>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowModal(true)}
                  className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Добавить товар
                </button>
              )}
            </div>

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
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

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
                <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска или фильтры</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Add Product */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Добавить товар</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmitNewProduct} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <Suspense fallback={<div>Загрузка редактора...</div>}>
                <ReactQuill
                  theme="snow"
                  value={newProduct.description}
                  onChange={(value: string) => setNewProduct((prev) => ({ ...prev, description: value }))}
                  className="bg-white"
                />
              </Suspense>

              <div>
                <label className="block text-sm font-medium mb-1">Категория</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category_id: Number(e.target.value), specs: [] }))}
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

                <div className="text-xs text-muted-foreground">
                  Подсказка: можно добавить подпункты для характеристики (например: <em>переменного оперативного тока</em>) и указать в значении несколько вариантов через <code>;</code> (например <code>100; 220</code>).
                </div>

                {newProduct.specs.map((spec, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex gap-3 items-center mb-2">
                      <input
                        type="text"
                        placeholder="Название характеристики"
                        value={spec.name}
                        onChange={(e) => updateSpec(index, "name", e.target.value)}
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

                    {/* Если нет подпунктов — показываем старое поле value */}
                    {!Array.isArray(spec.entries) && (
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Значение (или несколько через ; )"
                          value={spec.value ?? ""}
                          onChange={(e) => updateSpec(index, "value", e.target.value)}
                          className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => addSubEntry(index)}
                          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                        >
                          + подпункт
                        </button>
                      </div>
                    )}

                    {/* Если есть подпункты — показываем их */}
                    {Array.isArray(spec.entries) && (
                      <div className="space-y-2 mt-2">
                        {spec.entries.map((sub, sIdx) => (
                          <div key={sIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Метка подпункта (например: переменного оперативного тока)"
                              value={sub.label}
                              onChange={(e) => updateSubEntry(index, sIdx, "label", e.target.value)}
                              className="flex-[0.5] rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Значение (можно: 100; 220)"
                              value={sub.value}
                              onChange={(e) => updateSubEntry(index, sIdx, "value", e.target.value)}
                              className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeSubEntry(index, sIdx)}
                              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <div>
                          <button
                            type="button"
                            onClick={() => setNewProduct(prev => {
                              const updated = [...prev.specs];
                              const spec = { ...(updated[index] || { name: "", entries: [] }) };
                              spec.entries = spec.entries ? [...spec.entries, { label: "", value: "" }] : [{ label: "", value: "" }];
                              updated[index] = spec;
                              return { ...prev, specs: updated };
                            })}
                            className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                          >
                            + добавить подпункт
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Картинки (можно несколько)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full" />
                <div className="flex gap-2 flex-wrap mt-3">
                  {newProduct.images.map((img, idx) => (
                    <img key={idx} src={URL.createObjectURL(img)} alt="preview" className="w-20 h-20 object-cover rounded border" />
                  ))}
                </div>
              </div>

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