// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type Resumo = {
  totalProdutos: number;
  estoqueNormal: number;
  estoqueBaixo: number;
  semEstoque: number;
  entradasMes: number;
  saidasMes: number;
  valorTotalEstoque: number;
  valorTotalSaidasMes: number;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [movementData, setMovementData] = useState<any[]>([]);
  const [valorData, setValorData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/dashboard", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setResumo(data.resumo);
        // estoque: [{name, value}, ...]
        const estoqueWithColors = (data.estoque || []).map((i: any, idx: number) => ({
          ...i,
          color: ["hsl(var(--chart-1))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"][idx] || "#8884d8",
        }));
        setStockData(estoqueWithColors);

        // movimentacoes: array com {mes, entrada, saida}
        // Se o backend retornou mes abreviado, ok. Caso retorne mesNum, formatamos.
        const mov = (data.movimentacoes || []).map((m: any) => ({
          mes: m.mes || `M${m.mesNum}`,
          entrada: Number(m.entrada) || 0,
          saida: Number(m.saida) || 0,
        }));
        setMovementData(mov);

        // valores (bar financeiro)
        const valores = [
          { nome: "Valor em Estoque", valor: Number(data.resumo?.valorTotalEstoque || 0) },
          { nome: "Saídas (Mês R$)", valor: Number(data.resumo?.valorTotalSaidasMes || 0) },
        ];
        setValorData(valores);
      })
      .catch((err) => {
        console.error("Erro ao carregar dashboard:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !resumo) return <p className="p-6">Carregando...</p>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do estoque</p>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entradas (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.entradasMes}</div>
            <p className="text-xs text-success">movimentações registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saídas (Mês)</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.saidasMes}</div>
            <p className="text-xs text-destructive">movimentações registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.estoqueBaixo}</div>
            <p className="text-xs text-muted-foreground">produtos com estoque baixo</p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pizza */}
        <Card>
          <CardHeader><CardTitle>Status do Estoque</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {stockData.map((i) => (
                <div key={i.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i.color }} />
                    <span className="text-sm">{i.name}</span>
                  </div>
                  <span className="text-sm font-medium">{i.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Movimentações Mensais*/}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entrada" fill="hsl(var(--chart-2))" />
                <Bar dataKey="saida" fill="hsl(var(--chart-5))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Valores Financeiros (Bar) */}
      <div className="mt-4">
        <Card>
          <CardHeader><CardTitle>Valores Financeiros</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="valor" fill="hsl(var(--chart-3))" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Valor total em estoque</div>
                <div className="text-lg font-bold">R$ {Number(resumo.valorTotalEstoque).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valor total saídas (mês)</div>
                <div className="text-lg font-bold">R$ {Number(resumo.valorTotalSaidasMes).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
