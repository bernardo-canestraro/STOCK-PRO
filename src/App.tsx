import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Entrada from "./pages/Entrada";
import Saida from "./pages/Saida";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
import Usuarios from "./pages/Usuarios";
import Perfis from "./pages/Perfis";
import Categorias from "./pages/Categorias";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/produtos" element={<Layout><Produtos /></Layout>} />
          <Route path="/entrada" element={<Layout><Entrada /></Layout>} />
          <Route path="/saida" element={<Layout><Saida /></Layout>} />
          <Route path="/relatorios" element={<Layout><Relatorios /></Layout>} />
          <Route path="/categorias" element={<Layout><Categorias /></Layout>} />
          <Route path="/usuarios" element={<Layout><Usuarios /></Layout>} />
          <Route path="/perfis" element={<Layout><Perfis /></Layout>} />
          {/* <Route path="/configuracoes" element={<Layout><Dashboard /></Layout>} /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
