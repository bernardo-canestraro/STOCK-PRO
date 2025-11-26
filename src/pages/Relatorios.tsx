import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { CalendarIcon, Search, Download } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export default function Relatorios() {
  const [dataInicial, setDataInicial] = useState<Date>();
  const [dataFinal, setDataFinal] = useState<Date>();
  const [tipo, setTipo] = useState("todos");

  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMovimentacoes = () => {
    setLoading(true);

    // trecho dentro de fetchMovimentacoes()
    const q = new URLSearchParams();

    if (dataInicial)
      q.set("dataInicial", format(dataInicial, "yyyy-MM-dd"));

    if (dataFinal)
      q.set("dataFinal", format(dataFinal, "yyyy-MM-dd"));

    if (tipo !== "todos")
      q.set("tipo", tipo.toUpperCase());
    debugger

    const url = `http://localhost:3001/relatorios/movimentacoes${q.toString() ? "?" + q.toString() : ""}`;

    fetch(url, { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // garante sempre array
        if (!Array.isArray(data)) setMovimentacoes([data]);
        else setMovimentacoes(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar movimentações:", err);
      })
      .finally(() => setLoading(false));
  };

  function limpar() {
    setDataInicial(undefined);
    setDataFinal(undefined);
    setTipo("todos");
    setMovimentacoes([]);
  }

  // Exporta para Excel (.xlsx) — usa SheetJS + file-saver
  const exportToExcel = () => {
    if (!movimentacoes || movimentacoes.length === 0) {
      console.warn("Nada para exportar.");
      return;
    }

    // Mapear os campos que aparecerão no Excel (ajuste nomes se seu backend for diferente)
    const rows = movimentacoes.map((it: any) => ({
      Data: it.DtMovimento ? format(new Date(it.DtMovimento), "dd/MM/yyyy HH:mm") : "",
      Tipo: it.TipoMovimento ?? it.tipo ?? "",
      Produto: it.NomeProduto ?? it.produto ?? "",
      Quantidade: it.DiferencaQuantidade ?? it.quantidade ?? "",
      Responsavel: it.NomeUsuario ?? it.responsavel ?? "",
      NF: it.NF ?? "",
      Descricao: it.Descricao ?? it.descricao ?? "",
    }));

    // Cria worksheet e workbook
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimentacoes");

    // Converte para array buffer e dispara download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const filename = `relatorio_movimentacoes_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
  };

  // Fallback CSV (sem dependências). Bom ter como opção.
  const exportToCsv = () => {
    if (!movimentacoes || movimentacoes.length === 0) {
      console.warn("Nada para exportar.");
      return;
    }

    const header = ["Data", "Tipo", "Produto", "Quantidade", "Responsavel", "NF", "Descricao"];
    const lines = movimentacoes.map((it: any) => {
      const row = [
        it.DtMovimento ? format(new Date(it.DtMovimento), "dd/MM/yyyy HH:mm") : "",
        (it.TipoMovimento ?? it.tipo ?? "").toString(),
        (it.NomeProduto ?? it.produto ?? "").toString(),
        (it.DiferencaQuantidade ?? it.quantidade ?? "").toString(),
        (it.NomeUsuario ?? it.responsavel ?? "").toString(),
        (it.NF ?? "").toString(),
        (it.Descricao ?? it.descricao ?? "").toString(),
      ];
      // Escape ponto-e-vírgula (use ; como separador para compatibilidade BR)
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";");
    });

    const csvContent = [header.join(";"), ...lines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `relatorio_movimentacoes_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
      </div>

      {/* ------------ FILTROS ------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Consulta</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">

            {/* DATA INICIAL */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicial ? format(dataInicial, "PPP", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicial}
                    onSelect={setDataInicial}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* DATA FINAL */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFinal ? format(dataFinal, "PPP", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFinal}
                    onSelect={setDataFinal}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* TIPO */}
            <div className="space-y-2">
              <Label>Tipo de Movimento</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-2 mt-4">
            <Button onClick={fetchMovimentacoes} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>

            <Button variant="outline" onClick={limpar}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ------------ TABELA ------------ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações</CardTitle>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="ghost" size="sm" onClick={exportToExcel}>
              Exportar Excel
            </Button>

            <Button variant="ghost" size="sm" onClick={exportToCsv}>
              Exportar CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Diferença de Quantidade</TableHead>
                <TableHead>Preço Total Anterior</TableHead>
                <TableHead>Preço Total Novo</TableHead>
                <TableHead>Quantidade Anterior</TableHead>
                <TableHead>Quantidade Nova</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {movimentacoes.map((item: any, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(item.DtMovimento).toLocaleDateString('pt-BR')}
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        item.TipoMovimento === "ENTRADA"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {item.TipoMovimento}
                    </span>
                  </TableCell>

                  <TableCell>{item.NomeProduto}</TableCell>
                  <TableCell>{item.DiferencaQuantidade}</TableCell>
                  <TableCell>
                    {Number(item.PrecoTotalAnterior).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                  <TableCell>
                    {Number(item.PrecoTotalNovo).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                  <TableCell>{item.QuantidadeAnterior}</TableCell>
                  <TableCell>{item.QuantidadeNova}</TableCell>
                  <TableCell>{item.Responsavel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
