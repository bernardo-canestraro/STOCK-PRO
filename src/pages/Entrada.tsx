import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Plus } from "lucide-react";
import { useState } from "react";
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
  const [data, setData] = useState<Date>();

  const handleSave = () => {
    toast.success("Entrada registrada com sucesso!");
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
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Select>
                <SelectTrigger id="produto">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prf001">Parafuso M10 (PRF-001)</SelectItem>
                  <SelectItem value="prc001">Porca M10 (PRC-001)</SelectItem>
                  <SelectItem value="arr001">Arruela 10mm (ARR-001)</SelectItem>
                  <SelectItem value="prf002">Parafuso M8 (PRF-002)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Select>
                <SelectTrigger id="fornecedor">
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f1">Fornecedor A</SelectItem>
                  <SelectItem value="f2">Fornecedor B</SelectItem>
                  <SelectItem value="f3">Fornecedor C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                placeholder="0"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Unitário</Label>
              <Input
                id="valor"
                type="number"
                placeholder="0,00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Entrada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nf">Nota Fiscal</Label>
              <Input
                id="nf"
                placeholder="Número da NF"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Digite observações adicionais"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} className="bg-secondary hover:bg-secondary/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar Entrada
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
