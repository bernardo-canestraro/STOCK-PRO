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

export default function Entrada() {
  const [dataEntrada, setDataEntrada] = useState<Date>(new Date());

  const [produtos, setProdutos] = useState<any[]>([]);
  const [tiposEntrada, setTiposEntrada] = useState<any[]>([]);

  const [idProduto, setIdProduto] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [idTipoEntrada, setIdTipoEntrada] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // ============================
  // CARREGAR PRODUTOS & TIPO ENTRADA
  // ============================
  useEffect(() => {
    fetch("http://localhost:3001/produtosDDL", { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setProdutos(data));

    fetch("http://localhost:3001/tipoEntradaDDL", { credentials: 'include' })
      .then((res) => res.json())
      .then((data) =>{
         setTiposEntrada(data)
      });
  }, []);

  // ============================
  // AO MUDAR PRODUTO, PEGAR VALOR UNITÁRIO
  // ============================
  const handleProdutoChange = (value: string) => {
    setIdProduto(value);

    const produtoSelecionado = produtos.find((p) => p.IdProduto === parseInt(value));

    if (produtoSelecionado) {
      setValorUnitario(produtoSelecionado.Preco.toString());
    }
  };

  // ============================
  // SALVAR ENTRADA
  // ============================
  const handleSave = async () => {
    if (!idProduto || !quantidade || !idTipoEntrada) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const body = {
      IdProduto: idProduto,
      Quantidade: quantidade,
      ValorUnitario: valorUnitario,
      DataEntrada: dataEntrada,
      NotaFiscal: notaFiscal,
      Observacoes: observacoes,
      IdTipoEntrada: idTipoEntrada,
    };

    try {
      const response = await fetch("http://localhost:3001/entrada", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Entrada registrada com sucesso!");
        limparCampos();
      } else {
        toast.error("Erro ao registrar entrada.");
      }
    } catch (error) {
      toast.error("Falha ao conectar com o servidor.");
    }
  };

  const limparCampos = () => {
    setIdProduto("");
    setValorUnitario("");
    setQuantidade("");
    setNotaFiscal("");
    setObservacoes("");
    setIdTipoEntrada("");
    setDataEntrada(new Date());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Entrada de Mercadorias</h1>
        <p className="text-muted-foreground">Registrar entrada de produtos no estoque</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Entrada</CardTitle>
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

            {/* TIPO DE ENTRADA */}
            <div className="space-y-2">
              <Label htmlFor="tipoEntrada">Tipo de Entrada</Label>
              <Select onValueChange={setIdTipoEntrada} value={idTipoEntrada}>
                <SelectTrigger id="tipoEntrada">
                  <SelectValue placeholder="Selecione o tipo de entrada" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEntrada.map((t) => (
                    <SelectItem key={t.IdTipoEntrada} value={t.IdTipoEntrada.toString()}>
                      {t.NomeTipoEntrada}
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
              <Input
                id="valor"
                type="number"
                value={valorUnitario}
                disabled
              />
            </div>

            {/* DATA DA ENTRADA (VEM PREENCIDA, MAS EDITÁVEL) */}
            <div className="space-y-2">
              <Label>Data da Entrada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataEntrada && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {format(dataEntrada, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={dataEntrada}
                    onSelect={(d) => d && setDataEntrada(d)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* NOTA FISCAL */}
            <div className="space-y-2">
              <Label htmlFor="nf">Nota Fiscal</Label>
              <Input
                id="nf"
                placeholder="Número da NF"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
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
              Salvar Entrada
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
