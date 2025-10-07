import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usuario && senha) {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } else {
      toast.error("Por favor, preencha todos os campos");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Package className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Valmet</h1>
              <p className="text-sm text-muted-foreground">Sistema de Estoque</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>

            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
              ENTRAR
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 pt-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Valmet</p>
              <p className="text-xs text-muted-foreground">FORWARD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-gradient-to-br from-primary to-secondary"></div>
    </div>
  );
}
