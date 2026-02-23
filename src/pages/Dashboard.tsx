import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  // Локальный state для поиска, чтобы Header не падал
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null; // пока идет редирект, не рендерим

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 card-shadow">
          <h1 className="text-2xl font-bold mb-6">Личный кабинет</h1>

          <div className="space-y-4 text-foreground">
            <p>
              <span className="font-medium">Имя:</span> {user.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Роль:</span> {user.role}
            </p>
          </div>

          <div className="mt-8">
            <Button onClick={handleLogout} className="w-full" size="lg">
              Выйти
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;