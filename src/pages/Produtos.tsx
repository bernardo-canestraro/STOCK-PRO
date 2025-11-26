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
import { Textarea } from "@/components/ui/textarea";

interface Produto {
  IdProduto?: number;
  NomeProduto: string;
  Descrecao?: string;
  CodProduto?: string;
  Preco?: number | string;
  UniMedida?: string;
  EstMinimo?: number | string;
  IdCategoriaFK?: number | string;
  NomeCategoria?: string;
  CdStatus?: "ativo" | "inativo" | string;
}

interface CategoriaDDL {
  id: number;
  nome: string;
  IdCategoria: number;
  NomeCategoria: string;
}

export default function Produtos() {
  const [busca, setBusca] = useState("");
  const [codigoBusca, setCodigoBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("0");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  // form
  const initialForm: Produto = {
    NomeProduto: "",
    Descrecao: "",
    CodProduto: "",
    Preco: "",
    UniMedida: "",
    EstMinimo: "",
    IdCategoriaFK: "0",
    CdStatus: "ativo",
  };
  const [form, setForm] = useState<Produto>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaDDL[]>([]);

  // buscar categorias
  useEffect(() => {
    fetch("http://localhost:3001/categoriasDDL", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data || []);
      })
      .catch((err) => console.error("Erro ao buscar categorias:", err));
  }, []);

  // busca produtos
  const handleSearch = () => {
    const q = new URLSearchParams();
    if (busca && busca.trim() !== "") q.set("nome", busca.trim());
    if (codigoBusca && codigoBusca.trim() !== "") q.set("codigo", codigoBusca.trim());
    if (categoriaFiltro && categoriaFiltro.trim() !== "0") q.set("categoriaId", categoriaFiltro.trim());
    if (statusFiltro && statusFiltro !== "todos") q.set("status", statusFiltro);

    const url = `http://localhost:3001/produto${q.toString() ? "?" + q.toString() : ""}`;

    setLoading(true);
    fetch(url, { method: "GET", credentials: 'include', })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProdutos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos:", err);
        toast.error("Erro ao buscar produtos");
      })
      .finally(() => setLoading(false));
  };

  const openCreateForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Produto) => {
    setForm({
      NomeProduto: p.NomeProduto ?? "",
      Descrecao: p.Descrecao ?? "",
      CodProduto: p.CodProduto ?? "",
      Preco: p.Preco ?? "",
      UniMedida: p.UniMedida ?? "",
      EstMinimo: p.EstMinimo ?? "",
      IdCategoriaFK: p.IdCategoriaFK ? String(p.IdCategoriaFK) : "0",
      CdStatus: p.CdStatus ?? "ativo",
    });
    setEditingId(p.IdProduto ?? null);
    setShowForm(true);
  };

  // const handleDelete = (id?: number) => {
  //   if (!id) return;
  //   const confirm = window.confirm("Tem certeza que deseja excluir este produto?");
  //   if (!confirm) return;

  //   fetch(`http://localhost:3001/produtos/${id}`, { method: "DELETE" })
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Erro ao excluir");
  //       setProdutos((prev) => prev.filter((p) => p.IdProduto !== id));
  //       toast.success("Produto excluído");
  //     })
  //     .catch((err) => {
  //       console.error("Erro ao excluir produto:", err);
  //       toast.error("Erro ao excluir produto");
  //     });
  // };

  // enviar formulário
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!form.NomeProduto || String(form.NomeProduto).trim() === "") {
      toast.error("Preencha o nome do produto.");
      return;
    } else if (!form.Preco || String(form.Preco).trim() === "") {
      toast.error("Preencha o preço do produto.");
      return;
    } else if (!form.UniMedida || String(form.UniMedida).trim() === "") {
      toast.error("Preencha a unidade de medida do produto.");
      return;
    } else if (form.EstMinimo === undefined || form.EstMinimo === null || String(form.EstMinimo).trim() === "") {
      toast.error("Preencha o estoque mínimo do produto.");
      return;
    } else if (form.CodProduto === undefined || form.CodProduto === null || String(form.CodProduto).trim() === "") {
      toast.error("Preencha o código do produto.");
      return;
    }  else if (form.IdCategoriaFK === undefined || form.IdCategoriaFK === null || String(form.IdCategoriaFK).trim() === "") {
      toast.error("Preencha a categoria do produto.");
      return;
    } 

    const precoNum = Number(String(form.Preco ?? "").replace(",", "."));
    if (isNaN(precoNum) || precoNum < 0) {
      toast.error("Preço inválido.");
      return;
    }

    const payload: any = {
      NomeProduto: String(form.NomeProduto).trim(),
      Descrecao: form.Descrecao ?? "",
      CodProduto: form.CodProduto ?? "",
      Preco: precoNum,
      UniMedida: form.UniMedida ?? "",
      EstMinimo: Number(form.EstMinimo ?? 0),
      IdCategoriaFK: form.IdCategoriaFK ? Number(form.IdCategoriaFK) : null,
      CdStatus: form.CdStatus ?? "ativo",
    };

    if (editingId) {
      fetch(`http://localhost:3001/produto/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((updated: Produto) => {
          setProdutos((prev) => prev.map((p) => (p.IdProduto === editingId ? updated : p)));
          setShowForm(false);
          setEditingId(null);
          toast.success("Produto atualizado");
        })
        .catch(() => toast.error("Erro ao atualizar produto"));
    } else {
      if (form.CdStatus.trim() === "0") {
            toast.error("Não pode cadastrar um produto inativo.");
            return;
        }

      fetch(`http://localhost:3001/produto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((created: Produto) => {
          setProdutos((prev) => [created, ...prev]);
          setShowForm(false);
          toast.success("Produto criado");
        })
        .catch(() => toast.error("Erro ao criar produto"));
    }
  };

  const handleClear = () => {
    setBusca("");
    setCodigoBusca("");
    setCategoriaFiltro("0");
    setStatusFiltro("todos");
    setProdutos([]);
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
      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Cadastro de produtos</p>
        </div>

        <Button className="bg-secondary" onClick={openCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={codigoBusca} onChange={(e) => setCodigoBusca(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.IdCategoria} value={String(c.IdCategoria)}>
                      {c.NomeCategoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} disabled={loading} className="bg-primary">
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>

            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Est Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {produtos.map((p) => (
                <TableRow key={p.IdProduto}>
                  <TableCell>{p.IdProduto}</TableCell>
                  <TableCell>{p.NomeProduto}</TableCell>
                  <TableCell>{p.CodProduto}</TableCell>
                  <TableCell>{p.Descrecao}</TableCell>
                  <TableCell>{p.Preco}</TableCell>
                  <TableCell>{p.UniMedida}</TableCell>
                  <TableCell>{p.IdCategoriaFK}</TableCell>
                  <TableCell>{p.EstMinimo}</TableCell>
                  <TableCell>
                    {getStatusBadge(p.CdStatus)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {/* <Button variant="ghost" size="icon" onClick={() => handleDelete(p.IdProduto)}>
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

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />

          <div className="relative w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Editar Produto" : "Novo Produto"}</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={form.NomeProduto}
                      onChange={(e) => setForm({ ...form, NomeProduto: e.target.value })}
                      placeholder="Nome do produto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input
                      value={form.CodProduto}
                      onChange={(e) => setForm({ ...form, CodProduto: e.target.value })}
                      placeholder="Código interno"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço</Label>
                    <Input
                      value={String(form.Preco ?? "")}
                      onChange={(e) => setForm({ ...form, Preco: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input
                      value={form.UniMedida}
                      onChange={(e) => setForm({ ...form, UniMedida: e.target.value })}
                      placeholder="Ex: un, kg, cx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input
                      value={String(form.EstMinimo ?? "")}
                      onChange={(e) => setForm({ ...form, EstMinimo: e.target.value })}
                      placeholder="Quantidade mínima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={String(form.IdCategoriaFK ?? "0")}
                      onValueChange={(v) => setForm({ ...form, IdCategoriaFK: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sem categoria</SelectItem>
                        {categorias.map((c) => (
                          <SelectItem key={c.IdCategoria} value={String(c.IdCategoria)}>
                            {c.NomeCategoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                  <div className="space-y-2 md:col-span-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={form.Descrecao}
                      onChange={(e) => setForm({ ...form, Descrecao: e.target.value })}
                      placeholder="Descrição detalhada do produto"
                      rows={4}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 mt-3">
                    <Button variant="outline" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary">
                      {editingId ? "Salvar" : "Criar"}
                    </Button>
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
