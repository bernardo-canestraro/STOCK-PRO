import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth(); // << usa o AuthContext

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario || !senha) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      // 🔥 chama o login do AuthContext e recebe os dados do usuário
      const data = await login(usuario, senha);

      toast.success("Login realizado com sucesso!");

      // 🔎 identifica primeira rota permitida
      let firstRoute = "/dashboard"; // fallback

      if (Array.isArray(data.programs) && data.programs.length > 0) {
        firstRoute = "/" + data.programs[0].toLowerCase();
      }

      // 🚀 redireciona
      navigate(firstRoute);

    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-secondary" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"/>
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground tracking-wide">TECNOTOOLING</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gerenciamento de Estoque</p>
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

          <div className="flex items-center justify-center gap-3 pt-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-secondary" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tracking-wide">TECNOTOOLING</p>
              <p className="text-xs text-muted-foreground">Gerando Soluções</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-gradient-to-br from-primary to-secondary"></div>
    </div>
  );
}
