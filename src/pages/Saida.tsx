import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Saida() {
  const [dataSaida, setDataSaida] = useState<Date>(new Date());
  const [produtos, setProdutos] = useState<any[]>([]);
  const [tiposSaida, setTiposSaida] = useState<any[]>([]);

  const [idProduto, setIdProduto] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [idTipoSaida, setIdTipoSaida] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [documento, setDocumento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/produtosDDL", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch(() => toast.error("Erro ao carregar produtos."));

    fetch("http://localhost:3001/tipoSaidaDDL", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setTiposSaida(data))
      .catch(() => toast.error("Erro ao carregar tipos de saída."));
  }, []);

  const handleProdutoChange = (value: string) => {
    setIdProduto(value);

    const produtoSelecionado = produtos.find((p) => p.IdProduto === parseInt(value));

    if (produtoSelecionado) {
      setValorUnitario(produtoSelecionado.Preco.toString());
    } else {
      setValorUnitario("");
    }
  };

  const limparCampos = () => {
    setIdProduto("");
    setValorUnitario("");
    setQuantidade("");
    setDocumento("");
    setObservacoes("");
    setIdTipoSaida("");
    setDataSaida(new Date());
  };

  const handleSave = async () => {
    if (!idProduto || !quantidade || !idTipoSaida) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const body = {
      IdProduto: idProduto,
      Quantidade: quantidade,
      ValorUnitario: valorUnitario,
      DataSaida: dataSaida,
      Documento: documento,
      Observacoes: observacoes,
      IdTipoSaida: idTipoSaida,
    };

    try {
      const response = await fetch("http://localhost:3001/saida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const text = await response.text();
      // backend retorna json ou texto em erro; tentamos parsear
      let json;
      try { json = JSON.parse(text); } catch { json = null; }

      if (response.ok) {
        toast.success("Saída registrada com sucesso!");
        limparCampos();
      } else {
        const msg = json?.error || text || "Erro ao registrar saída.";
        toast.error(msg);
      }
    } catch (error) {
      toast.error("Falha ao conectar com o servidor.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saída de Mercadorias</h1>
        <p className="text-muted-foreground">Registrar saída de produtos do estoque</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Saída</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* PRODUTO */}
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Select onValueChange={handleProdutoChange} value={idProduto}>
                <SelectTrigger id="produto">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.IdProduto} value={p.IdProduto.toString()}>
                      {p.NomeProduto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TIPO DE SAÍDA */}
            <div className="space-y-2">
              <Label htmlFor="tipoSaida">Tipo de Saída</Label>
              <Select onValueChange={setIdTipoSaida} value={idTipoSaida}>
                <SelectTrigger id="tipoSaida">
                  <SelectValue placeholder="Selecione o tipo de saída" />
                </SelectTrigger>
                <SelectContent>
                  {tiposSaida.map((t) => (
                    <SelectItem key={t.IdTipoSaida} value={t.IdTipoSaida.toString()}>
                      {t.NomeTipoSaida}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* QUANTIDADE */}
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                placeholder="0"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            {/* VALOR UNITÁRIO (BLOQUEADO) */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Unitário</Label>
              <Input id="valor" type="number" value={valorUnitario} disabled />
            </div>

            {/* DATA DA SAÍDA */}
            <div className="space-y-2">
              <Label>Data da Saída</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataSaida && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dataSaida, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={dataSaida}
                    onSelect={(d) => d && setDataSaida(d)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* DOCUMENTO / NF */}
            <div className="space-y-2">
              <Label htmlFor="documento">Documento / NF</Label>
              <Input
                id="documento"
                placeholder="Número do documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
              />
            </div>

            {/* OBSERVAÇÕES */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Digite observações adicionais"
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} className="bg-secondary hover:bg-secondary/90">
              <Save className="w-4 h-4 mr-2" />
              Registrar Saída
            </Button>
            <Button variant="outline" onClick={limparCampos}>
              <Plus className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
