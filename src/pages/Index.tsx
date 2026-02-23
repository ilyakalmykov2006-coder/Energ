import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import StatsSection from "@/components/StatsSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  // Локальный state для поиска, чтобы Header не падал
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main>
        <HeroSection />
        <CategoriesSection />
        <StatsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;