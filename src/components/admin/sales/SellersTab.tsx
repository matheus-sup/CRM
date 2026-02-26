"use client";

import { useState, useTransition } from "react";
import { Plus, Users, Edit2, Trash2, TrendingUp, ShoppingBag, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createSeller, updateSeller, deleteSeller, getSellersWithStats } from "@/lib/actions/seller";

interface SellerStats {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
    isActive: boolean;
    createdAt: Date;
    totalSales: number;
    salesCount: number;
    totalItems: number;
    pa: number;
    tkm: number;
}

interface SellersTabProps {
    initialSellers: SellerStats[];
}

export function SellersTab({ initialSellers }: SellersTabProps) {
    const [sellers, setSellers] = useState<SellerStats[]>(initialSellers);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSeller, setEditingSeller] = useState<SellerStats | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const handleOpenDialog = (seller?: SellerStats) => {
        if (seller) {
            setEditingSeller(seller);
            setFormData({
                name: seller.name,
                email: seller.email || "",
                phone: seller.phone || "",
                cpf: seller.cpf || "",
            });
        } else {
            setEditingSeller(null);
            setFormData({ name: "", email: "", phone: "", cpf: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast({
                title: "Erro",
                description: "O nome do vendedor é obrigatório.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                if (editingSeller) {
                    await updateSeller(editingSeller.id, formData);
                    toast({
                        title: "Sucesso",
                        description: "Vendedor atualizado com sucesso!",
                    });
                } else {
                    await createSeller(formData);
                    toast({
                        title: "Sucesso",
                        description: "Vendedor cadastrado com sucesso!",
                    });
                }

                // Refresh sellers list
                const updatedSellers = await getSellersWithStats();
                setSellers(updatedSellers);
                setIsDialogOpen(false);
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Erro ao salvar vendedor.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleDelete = async (seller: SellerStats) => {
        if (!confirm(`Tem certeza que deseja remover o vendedor ${seller.name}?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteSeller(seller.id);
                const updatedSellers = await getSellersWithStats();
                setSellers(updatedSellers);
                toast({
                    title: "Sucesso",
                    description: "Vendedor removido com sucesso!",
                });
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Erro ao remover vendedor.",
                    variant: "destructive",
                });
            }
        });
    };

    // Calculate totals
    const totals = sellers.reduce(
        (acc, seller) => ({
            totalSales: acc.totalSales + seller.totalSales,
            salesCount: acc.salesCount + seller.salesCount,
            totalItems: acc.totalItems + seller.totalItems,
        }),
        { totalSales: 0, salesCount: 0, totalItems: 0 }
    );

    const avgPA = sellers.length > 0
        ? sellers.reduce((acc, s) => acc + s.pa, 0) / sellers.length
        : 0;

    const avgTKM = sellers.length > 0
        ? sellers.reduce((acc, s) => acc + s.tkm, 0) / sellers.length
        : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totals.totalSales)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.salesCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">P.A. Médio</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgPA.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Peças por Atendimento</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TKM Médio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(avgTKM)}</div>
                        <p className="text-xs text-muted-foreground">Ticket Médio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Lista de Vendedores</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Vendedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSeller ? "Editar Vendedor" : "Novo Vendedor"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="name" className="text-xs">Nome *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Nome do vendedor"
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="cpf" className="text-xs">CPF</Label>
                                    <Input
                                        id="cpf"
                                        value={formData.cpf}
                                        onChange={(e) =>
                                            setFormData({ ...formData, cpf: e.target.value })
                                        }
                                        placeholder="000.000.000-00"
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="email" className="text-xs">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="email@exemplo.com"
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="phone" className="text-xs">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="(11) 99999-9999"
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={isPending}
                                    onClick={handleSubmit}
                                >
                                    {isPending ? "Salvando..." : "Salvar"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Sellers Table */}
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Vendedor</TableHead>
                            <TableHead className="text-center">Vendas</TableHead>
                            <TableHead className="text-center">P.A.</TableHead>
                            <TableHead className="text-right">TKM</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                    <p className="text-muted-foreground">
                                        Nenhum vendedor cadastrado ainda.
                                    </p>
                                    <Button
                                        variant="link"
                                        onClick={() => handleOpenDialog()}
                                        className="mt-2"
                                    >
                                        Cadastrar primeiro vendedor
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sellers.map((seller) => (
                                <TableRow key={seller.id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {seller.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{seller.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {seller.salesCount}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                            {seller.pa.toFixed(2)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-medium">
                                            {formatCurrency(seller.tkm)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-bold text-green-600">
                                            {formatCurrency(seller.totalSales)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(seller)}
                                            >
                                                <Edit2 className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(seller)}
                                            >
                                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
