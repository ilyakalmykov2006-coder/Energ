import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import WhereBuy from "./pages/WhereBuy";
import ProductPage from "./pages/ProductPage";
import ComparePage from "@/pages/ComparePage";
import { UserProvider } from "@/context/UserContext";
import { CompareProvider } from "@/context/CompareContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider> {/* <-- оборачиваем всё в UserProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <CompareProvider>
          <Routes>
  <Route path="/" element={<Index />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/catalog" element={<Catalog />} />
  <Route path="/catalog/:categorySlug" element={<Catalog />} />
  <Route path="/product/:productId" element={<ProductPage />} /> {/* <-- нужный */}
  <Route path="/about" element={<About />} />
  <Route path="/contacts" element={<Contacts />} />
  <Route path="/compare" element={<ComparePage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/where-buy" element={<WhereBuy />} />
  <Route path="*" element={<NotFound />} />
</Routes>
</CompareProvider>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
