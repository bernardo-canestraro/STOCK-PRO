import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";

import ProtectedRoute from "@/components/ProtectedRoute";

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
import ProgramaXPerfil from "./pages/ProgramaXperfil";

import { AuthProvider } from "./components/AuthContext";
import Forbidden from "./pages/Forbidden";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            {/* LOGIN */}
            <Route path="/" element={<Login />} />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute program="Dashboard">
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />

            {/* PRODUTOS */}
            <Route
              path="/produtos"
              element={
                <ProtectedRoute program="Produto">
                  <Layout><Produtos /></Layout>
                </ProtectedRoute>
              }
            />

            {/* ENTRADA */}
            <Route
              path="/entrada"
              element={
                <ProtectedRoute program="Entrada">
                  <Layout><Entrada /></Layout>
                </ProtectedRoute>
              }
            />

            {/* SAIDA */}
            <Route
              path="/saida"
              element={
                <ProtectedRoute program="Saida">
                  <Layout><Saida /></Layout>
                </ProtectedRoute>
              }
            />

            {/* RELATÓRIOS */}
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute program="Relatorio">
                  <Layout><Relatorios /></Layout>
                </ProtectedRoute>
              }
            />

            {/* CATEGORIAS */}
            <Route
              path="/categorias"
              element={
                <ProtectedRoute program="Categoria">
                  <Layout><Categorias /></Layout>
                </ProtectedRoute>
              }
            />

            {/* USUÁRIOS */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute program="Usuario">
                  <Layout><Usuarios /></Layout>
                </ProtectedRoute>
              }
            />

            {/* PERFIS */}
            <Route
              path="/perfis"
              element={
                <ProtectedRoute program="Perfil">
                  <Layout><Perfis /></Layout>
                </ProtectedRoute>
              }
            />

            {/* PROGRAMA X PERFIL */}
            <Route
              path="/programaxperfil"
              element={
                <ProtectedRoute program="ProgramaXPerfil">
                  <Layout><ProgramaXPerfil /></Layout>
                </ProtectedRoute>
              }
            />

            {/* 403 - ACESSO NEGADO */}
            <Route path="/403" element={<Forbidden />} />

            {/* 404 - NÃO ENCONTRADO */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
