import { 
  Home, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileText,
  Users,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { useAuth } from "./AuthContext";

// ✨ MENUS
const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, program: "dashboard" },
  { title: "Produtos", url: "/produtos", icon: Package, program: "produtos" },
  { title: "Entrada", url: "/entrada", icon: ArrowDownCircle, program: "entrada" },
  { title: "Saída", url: "/saida", icon: ArrowUpCircle, program: "saida" },
  { title: "Relatórios", url: "/relatorios", icon: FileText, program: "relatorios" },
  { title: "Categorias", url: "/categorias", icon: Package, program: "categorias" },
  { title: "Usuários", url: "/usuarios", icon: Users, program: "usuarios" },
  { title: "Perfis", url: "/perfis", icon: Users, program: "perfis" },
  { title: "Programa x Perfil", url: "/programaxperfil", icon: Users, program: "programaxperfil" },
];

export function AppSidebar() {
  const { hasProgram, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
  logout();                // limpa seu contexto
  sessionStorage.clear();  // limpa sessionStorage
  navigate("/", { replace: true }); // sua tela de login é "/"
}

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path 
                d="M12 2L2 7L12 12L22 7L12 2Z" 
                fill="currentColor" 
                className="text-sidebar-primary-foreground" 
                opacity="0.8"
              />
              <path 
                d="M2 17L12 22L22 17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-sidebar-primary-foreground"
              />
              <path 
                d="M2 12L12 17L22 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-sidebar-primary-foreground"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-wide">
              TECNOTOOLING
            </h1>
            <p className="text-xs text-sidebar-foreground/70">
              Gerenciamento de Estoque
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between h-full">

        {/* -------------------- MENU -------------------- */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => hasProgram(item.program))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* -------------------- BOTÃO DE SAIR -------------------- */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 text-red-500 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}
