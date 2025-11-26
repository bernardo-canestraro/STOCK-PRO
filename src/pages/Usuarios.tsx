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
import { Search, Plus, Edit, Trash, UserPlus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";


interface Usuario {
    IdUsuario?: number;
    NomeUsuario: string;
    Senha_hash: string;
    Perfil: string; // ex: administrador, operador
    IdPerfil: number;
    CdStatus: string; // ativo, inativo
}

export default function Usuarios() {
    const [busca, setBusca] = useState("");
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const [perfil, setPerfil] = useState("0");
    const [perfis, setPerfis] = useState([]);

    // Form state (usado para criar/editar)
    const initialForm: Usuario = {
        NomeUsuario: "",
        Senha_hash: "",
        Perfil: "",
        IdPerfil: 0,
        CdStatus: "",
    };
    const [form, setForm] = useState<Usuario>(initialForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    // novo estado para filtro de status
    const [statusFiltro, setStatusFiltro] = useState<"todos" | "ativo" | "inativo">("todos");

    const handleSearch = () => {
        const q = new URLSearchParams();
        if (busca && busca.trim() !== "") q.set("nome", busca.trim());
        if (statusFiltro && statusFiltro !== "todos") q.set("status", statusFiltro);
        if (perfil && perfil !== "0") q.set("idPerfil", perfil);

        const url = `http://localhost:3001/usuarios${q.toString() ? "?" + q.toString() : ""}`;
        
        setLoading(true);
        fetch(url, { method: "GET", credentials: 'include', })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                console.log("Usuários buscados:", data);
                setUsuarios(data);
            })
            .catch((err) => console.error("Erro ao buscar usuários:", err))
            .finally(() => setLoading(false));
    };

    const openCreateForm = () => {
        setForm(initialForm);
        setPerfil("0"); // garante o select no padrão ao abrir criação
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (u: Usuario & { IdUsuario?: number }) => {
        setForm({
            NomeUsuario: u.NomeUsuario ?? "",
            Senha_hash: u.Senha_hash ?? "",
            Perfil: (u.Perfil ?? String(u.IdPerfil ?? "")) as any,
            IdPerfil: u.IdPerfil ?? (typeof u.Perfil === "number" ? (u.Perfil as any) : 0),
            CdStatus: String(u.CdStatus ?? "1"),
        });
        setPerfil(String(u.IdPerfil ?? u.Perfil ?? "0"));
        setEditingId(u.IdUsuario ?? null);
        setShowForm(true);
    };

    // const handleDelete = (id?: number) => {
    //     if (!id) return;
    //     const confirm = window.confirm("Tem certeza que deseja excluir este usuário?");
    //     if (!confirm) return;

    //     fetch(`http://localhost:3001/usuarios/${id}`, { method: "DELETE" })
    //         .then((res) => {
    //             if (!res.ok) throw new Error("Erro ao excluir");
    //             // atualizar lista
    //             setUsuarios((prev) => prev.filter((u) => u.IdUsuario !== id));
    //         })
    //         .catch((err) => console.error(err));
    // };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        debugger

        // valida usando IdPerfil numérico
        if (!form.NomeUsuario.trim() || !form.Senha_hash.trim() || !(form.IdPerfil && Number(form.IdPerfil) > 0)) {
            toast.error("Preencha nome, senha e selecione um perfil válido.");
            return;
        }

        // prepara payload garantindo IdPerfil numérico
        const payload = { ...form, IdPerfil: Number(form.IdPerfil) };

        if (editingId) {
            // editar
            fetch(`http://localhost:3001/usuarios/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((updated: Usuario) => {
                    setUsuarios((prev) => prev.map((u) => (u.IdUsuario === editingId ? updated : u)));
                    setShowForm(false);
                    setEditingId(null);
                })
                .catch((err) => console.error("Erro ao atualizar usuário:", err));
        } else {
            if (payload.CdStatus && payload.CdStatus.toString().trim() === "0") {
                toast.error("Não pode cadastrar um usuário inativo.");
                return;
            }

            fetch("http://localhost:3001/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((created: Usuario & { id: number }) => {
                    setUsuarios((prev) => [created, ...prev]);
                    setShowForm(false);
                })
                .catch((err) => {
                    console.error("Erro ao criar usuário:", err);
                });
        }
    };

    // const filtered = usuarios.filter((u) => {
    //     if (!busca) return true;
    //     const q = busca.toLowerCase();
    //     return (
    //         u.nome.toLowerCase().includes(q) ||
    //         //u.email.toLowerCase().includes(q) ||
    //         u.senha.toLowerCase().includes(q)
    //     );
    // });

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

    useEffect(() => {
        fetch("http://localhost:3001/perfisDDL", { credentials: 'include', })
            .then(res => res.json())
            .then(data => {
                setPerfis(data);
            })
            .catch(err => console.error("Erro ao buscar perfis:", err));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-secondary hover:bg-secondary/90" onClick={openCreateForm}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Novo Usuário
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buscar Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                                id="nome"
                                placeholder="Digite nome"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="perfil">Perfil</Label>
                            <Select value={perfil} onValueChange={(value) => {
                                setPerfil(value);
                                setForm({ ...form, Perfil: value }); // Atualiza o perfil no formulário
                            }}>
                                <SelectTrigger id="perfil">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Opção padrão */}
                                    <SelectItem value="0">Todos</SelectItem>

                                    {/* Perfis vindos do backend */}
                                    {perfis.map((p) => (
                                        <SelectItem key={p.IdPerfil} value={String(p.IdPerfil)}>
                                            {p.NomePerfil}
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
                        <div />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button className="bg-primary hover:bg-primary/90" onClick={handleSearch}>
                            <Search className="w-4 h-4 mr-2" />
                            Buscar
                        </Button>
                        <Button variant="outline" onClick={() => { 
                            setBusca(""); 
                            setStatusFiltro("todos"); 
                            setPerfil("0");            // <-- reseta o select de Perfil para "Todos"
                            setForm(initialForm);      // <-- opcional: limpa o formulário
                            setUsuarios([]); 
                        }}>
                            Limpar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Senha</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((u) => (
                                <TableRow key={u.IdUsuario}>
                                    <TableCell className="font-medium">{u.IdUsuario}</TableCell>
                                    <TableCell>{u.NomeUsuario}</TableCell>
                                    <TableCell>{u.Senha_hash}</TableCell>
                                    <TableCell>{u.IdPerfil}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(u.CdStatus)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {/* <Button variant="ghost" size="icon" onClick={() => handleDelete(u.IdUsuario)}>
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

            {/* Formulário lateral / modal simples */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
                    <div className="relative w-full max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nomeForm">Nome</Label>
                                        <Input
                                            id="nomeForm"
                                            value={form.NomeUsuario}
                                            onChange={(e) => setForm({ ...form, NomeUsuario: e.target.value })}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="senhaForm">Senha</Label>
                                        <div className="relative">
                                            <Input
                                                id="senhaForm"
                                                type={showSenha ? "text" : "password"}
                                                value={form.Senha_hash}
                                                onChange={(e) => setForm({ ...form, Senha_hash: e.target.value })}
                                                placeholder="Senha"
                                                className="pr-10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowSenha(!showSenha)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            >
                                                {showSenha ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="perfil">Perfil</Label>
                                        <Select value={perfil} onValueChange={(value) => {
                                            setPerfil(value);
                                            // define tanto Perfil (string) quanto IdPerfil (number) no form
                                            setForm({ ...form, Perfil: value, IdPerfil: Number(value) });
                                        }}>
                                            <SelectTrigger id="perfil">
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Opção padrão */}
                                                <SelectItem value="0">Todos</SelectItem>

                                                {/* Perfis vindos do backend */}
                                                {perfis.map((p) => (
                                                    <SelectItem key={p.IdPerfil} value={String(p.IdPerfil)}>
                                                        {p.NomePerfil}
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
                                    {/* Botões */}
                                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                        <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="bg-primary hover:bg-primary/90">
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
