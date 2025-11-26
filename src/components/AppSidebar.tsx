import { 
  Home, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileText,
  Users,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Entrada", url: "/entrada", icon: ArrowDownCircle },
  { title: "Saída", url: "/saida", icon: ArrowUpCircle },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Categorias", url: "/categorias", icon: Package },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Perfis", url: "/perfis", icon: Users },
  // { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-sidebar-primary-foreground" opacity="0.8"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sidebar-primary-foreground"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sidebar-primary-foreground"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-wide">TECNOTOOLING</h1>
            <p className="text-xs text-sidebar-foreground/70">Gerenciamento de Estoque</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
    </Sidebar>
  );
}
