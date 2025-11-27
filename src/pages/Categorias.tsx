import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

interface Categoria {
  IdCategoria?: number;
  NomeCategoria: string;
  CdStatus: string; // 'ativo' | 'inativo'  ou "1"/"0"
}

export default function Categoria() {
  const [busca, setBusca] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const initialForm: Categoria = { NomeCategoria: "", CdStatus: "ativo"};
  const [form, setForm] = useState<Categoria>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // novo estado para filtro de status
  const [statusFiltro, setStatusFiltro] = useState<"todos" | "ativo" | "inativo">("todos");

  const fetchPerfis = () => {
    setLoading(true);

    const q = new URLSearchParams();
    if (busca && busca.trim() !== "") q.set("nome", busca.trim());
    if (statusFiltro && statusFiltro !== "todos") q.set("status", statusFiltro);

    const url = `http://localhost:3001/categoria${q.toString() ? "?" + q.toString() : ""}`;

    fetch(url, { method: "GET", credentials: 'include', })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCategorias(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar perfis:", err);
        toast.error("Erro ao buscar perfis. Veja console/network.");
      })
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Categoria & { IdCategoria?: number }) => { 
    setForm({ NomeCategoria: p.NomeCategoria, CdStatus: String(p.CdStatus)});
    setEditingId(p.IdCategoria ?? null);
    setShowForm(true);
  };

//   const handleDelete = (IdPerfil?: number) => {
//     if (!IdPerfil) return;
//     if (!confirm("Deseja realmente excluir este perfil?")) return;
//     fetch(`http://localhost:3001/perfis/${IdPerfil}`, { method: "DELETE" })
//       .then((res) => {
//         if (!res.ok) throw new Error("Erro ao excluir");
//         setPerfis((prev) => prev.filter((x) => x.IdPerfil !== IdPerfil));
//       })
//       .catch((err) => console.error(err));
//   };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.NomeCategoria.trim() ||!form.CdStatus.trim()) {
        toast.error("Preencha os campos da categoria.");
        return;
    }

    if (editingId) {
      fetch(`http://localhost:3001/categoria/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    .then(async (res) => {
      // Verifica se a resposta é bem-sucedida
      if (!res.ok) {
        // Tenta ler a resposta como texto para ver o erro
        const errorText = await res.text();
        throw new Error(errorText || `Erro ${res.status}`);
      }
      return res.json();
    })
    .then((updated: Categoria) => {
      setCategorias((prev) => prev.map((p) => (p.IdCategoria === editingId ? updated : p)));
      setShowForm(false);
      setEditingId(null);
      toast.success("Categoria atualizada com sucesso!");
    })
    .catch((err) => {
      console.error("Erro ao atualizar categoria:", err);
      toast.error(err.message || "Erro ao atualizar categoria");
    });
    } else {
        if (form.CdStatus.trim() === "0") {
            toast.error("Não pode cadastrar categoria inativa.");
            return;
        }

      fetch("http://localhost:3001/categoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(form),
      })
        .then((res) => res.json())
        .then((created: Categoria & { IdCategoria: number }) => {
          setCategorias((prev) => [created, ...prev]);
          setShowForm(false);
        })
        .catch((err) => console.error("Erro ao criar categoria:", err));
    }
  };

  // normaliza o CdStatus para 'ativo' | 'inativo' | undefined
  const normalizeStatus = (cd: any): "ativo" | "inativo" | undefined => {
    if (cd === 1 || cd === "1" || String(cd).toLowerCase() === "ativo") return "ativo";
    if (cd === 0 || cd === "0" || String(cd).toLowerCase() === "inativo") return "inativo";
    return undefined;
  };

  const getStatusBadge = (CdStatus: any) => {
    const s = normalizeStatus(CdStatus);
    if (s === "ativo") return <Badge variant="default">Ativo</Badge>;
    if (s === "inativo") return <Badge variant="destructive">Inativo</Badge>;
    return <Badge variant="secondary">-</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categoria</h1>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="busca">Nome da categoria</Label>
              <Input id="busca" placeholder="Pesquisar" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFiltro">Status</Label>
              <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as "todos" | "ativo" | "inativo")}>
                <SelectTrigger id="statusFiltro">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => fetchPerfis()}>
                <Search className="w-4 h-4 mr-2" /> Buscar
              </Button>
              <Button variant="outline" onClick={() => { setBusca(""); setStatusFiltro("todos"); setCategorias([]); }}>
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((p) => (
                <TableRow key={p.IdCategoria}>
                  <TableCell className="font-medium">{p.IdCategoria}</TableCell>
                  <TableCell>{p.NomeCategoria}</TableCell>
                  <TableCell>
                    {getStatusBadge(p.CdStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {/* <Button variant="ghost" size="icon" onClick={() => handleDelete(p.IdPerfil)}>
                        <Trash className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCategoria">Nome da Categoria</Label>
                    <Input id="nomeCategoria" value={form.NomeCategoria} onChange={(e) => setForm({ ...form, NomeCategoria: e.target.value })} placeholder="Ex: Usinagem" />
                  </div>

                    <div className="space-y-2">
                        <Label htmlFor="statusForm">Status</Label>
                        <Select
                            value={form.CdStatus.toString()}
                            onValueChange={(value: "1" | "0") => setForm({ ...form, CdStatus: value })}
                        >
                        <SelectTrigger id="statusForm">
                            {form.CdStatus === "1" ? "Ativo" : form.CdStatus === "0" ? "Inativo" : "Selecione o status"}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Ativo</SelectItem>
                            <SelectItem value="0">Inativo</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">{editingId ? "Salvar" : "Criar"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
