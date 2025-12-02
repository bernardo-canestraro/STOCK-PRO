import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function ProgramaXperfil() {
    const [perfis, setPerfis] = useState<any[]>([]);
    const [programas, setProgramas] = useState<any[]>([]);
    const [selectedPerfil, setSelectedPerfil] = useState<number | null>(null);
    const [vinculos, setVinculos] = useState<number[]>([]);

    useEffect(() => {
        // BUSCA PERFIS DO BACKEND
        fetch("http://localhost:3001/perfisPXP", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                debugger
                setPerfis(data);
            })
            .catch(() => console.error("Erro ao buscar perfis"));
        
        // BUSCA PROGRAMAS DO BACKEND
        fetch("http://localhost:3001/programasPXP", { credentials: "include" })
            .then(res => res.json())
            .then(setProgramas)
            .catch(() => console.error("Erro ao buscar programas"));
    }, []);

    const loadVinculos = (idPerfil: number) => {
        setSelectedPerfil(idPerfil);

        fetch(`http://localhost:3001/programas-perfilPXP/${idPerfil}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setVinculos(data || []))
            .catch(() => console.error("Erro ao buscar vínculos"));
    };

    const togglePrograma = (idPrograma: number) => {
        if (vinculos.includes(idPrograma)) {
            setVinculos(vinculos.filter(id => id !== idPrograma));
        } else {
            setVinculos([...vinculos, idPrograma]);
        }
    };

    const salvar = () => {
        if (!selectedPerfil) {
            toast.error("Selecione um perfil!");
            return;
        }

        fetch("http://localhost:3001/programas-perfilPXP", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                IdPerfil: selectedPerfil,
                Programas: vinculos
            })
        })
            .then(res => res.json())
            .then(() => toast.success("Vínculos salvos com sucesso!"))
            .catch(() => toast.error("Erro ao salvar vínculos"));
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Programa x Perfil</CardTitle>
                </CardHeader>

                <CardContent className="flex gap-6">
                    {/* LISTA DE PERFIS */}
                    <div className="w-1/4 border-r pr-4">
                        <h3 className="font-semibold mb-2">Perfis</h3>

                        {perfis.map((perfil) => (
                            <div
                                key={perfil.IdPerfil}
                                className={`p-2 cursor-pointer rounded 
                                    ${selectedPerfil === perfil.IdPerfil ? "bg-blue-200" : "hover:bg-gray-100"}`}
                                onClick={() => loadVinculos(perfil.IdPerfil)}
                            >
                                {perfil.NomePerfil}
                            </div>
                        ))}
                    </div>

                    {/* LISTA DE PROGRAMAS */}
                    <div className="flex-1">
                        <h3 className="font-semibold mb-4">Programas Permitidos</h3>

                        {selectedPerfil === null ? (
                            <p className="text-gray-500">Selecione um perfil.</p>
                        ) : (
                            programas.map((programa) => (
                                <div key={programa.IdPrograma} className="flex items-center gap-3 mb-2">
                                    <Checkbox
                                        checked={vinculos.includes(programa.IdPrograma)}
                                        onCheckedChange={() => togglePrograma(programa.IdPrograma)}
                                    />
                                    <span>{programa.NomePrograma}</span>
                                </div>
                            ))
                        )}

                        <Button className="mt-4" onClick={salvar}>
                            Salvar Acessos
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
