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

// const produtos = [
//   { id: 1, nome: "Parafuso M10", codigo: "PRF-001", quantidade: 450, minimo: 100, status: "ok" },
//   { id: 2, nome: "Porca M10", codigo: "PRC-001", quantidade: 380, minimo: 100, status: "ok" },
//   { id: 3, nome: "Arruela 10mm", codigo: "ARR-001", quantidade: 85, minimo: 100, status: "baixo" },
//   { id: 4, nome: "Parafuso M8", codigo: "PRF-002", quantidade: 520, minimo: 150, status: "ok" },
//   { id: 5, nome: "Porca M8", codigo: "PRC-002", quantidade: 25, minimo: 150, status: "critico" },
// ];

export default function Produtos() {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState([]);

  // 🔹 Chamada ao backend (porta 3001)
  // useEffect(() => {
  //   fetch("http://localhost:3001/produtos")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       //debugger
  //       console.log("✅ Produtos do backend:", data);
  //       setProdutos(data);
  //     })
  //     .catch((err) => console.error("Erro ao buscar produtos:", err));
  // }, []);

  const handleSearch  = () => {
      fetch("http://localhost:3001/produtos")
      .then((res) => res.json())
      .then((data) => {
        //debugger
        console.log("✅ Produtos do backend:", data);
        setProdutos(data);
      })
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-success">Em Estoque</Badge>;
      case "baixo":
        return <Badge className="bg-chart-4">Estoque Baixo</Badge>;
      case "critico":
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerenciamento de produtos do estoque</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                placeholder="Digite o nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" placeholder="Digite o código" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="fixacao">Fixação</SelectItem>
                  <SelectItem value="ferramentas">Ferramentas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ok">Em Estoque</SelectItem>
                  <SelectItem value="baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline">Limpar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead> */}
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Unidade de Medida</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  {/* <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.quantidade}</TableCell>
                  <TableCell>{produto.minimo}</TableCell>
                  <TableCell>{getStatusBadge(produto.status)}</TableCell> */}
                  {/* <TableCell>{p.id}</TableCell> */}
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>{p.descricao}</TableCell>
                  <TableCell>{p.preco_venda}</TableCell>
                  <TableCell>{p.unidade_medida}</TableCell>
                  <TableCell>{p.estoque}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
