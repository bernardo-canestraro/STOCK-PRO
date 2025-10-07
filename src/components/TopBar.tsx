import { Search, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Select defaultValue="pesquisar">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pesquisar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pesquisar">Pesquisar</SelectItem>
            <SelectItem value="produtos">Produtos</SelectItem>
            <SelectItem value="movimentacoes">Movimentações</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">Administrador</p>
          <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
        </div>
        <Avatar className="h-10 w-10 bg-muted">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
