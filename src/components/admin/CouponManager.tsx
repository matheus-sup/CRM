"use strict";
"use client";

import { useState, useEffect } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, Tag, Pencil, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { createCoupon, deleteCoupon, toggleCoupon, updateCoupon } from "@/lib/actions/coupon";
import {
    createItemDiscount,
    deleteItemDiscount,
    toggleItemDiscount,
    updateItemDiscount,
    getProductsForDiscount
} from "@/lib/actions/item-discount";
import { useRouter } from "next/navigation";

interface Coupon {
    id: string;
    code: string;
    type: string;
    value: number;
    minOrderValue: number | null;
    active: boolean;
    usageCount: number;
    maxUsage: number | null;
    endDate: Date | null;
}

interface ItemDiscount {
    id: string;
    productId: string;
    discountPercent: number;
    promoStock: number;
    soldCount: number;
    active: boolean;
    endDate: Date | null;
    product: {
        id: string;
        name: string;
        price: number;
        images: { url: string }[];
    };
}

interface ProductOption {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: { url: string }[];
}

function formatDate(date: Date | string | null): string {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
}

function formatDateForInput(date: Date | string | null): string {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
}

function isExpired(date: Date | string | null): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
}

export function CouponManager({
    initialCoupons,
    initialItemDiscounts = []
}: {
    initialCoupons: any[];
    initialItemDiscounts?: any[];
}) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isItemDiscountOpen, setIsItemDiscountOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Coupon Form State
    const [code, setCode] = useState("");
    const [type, setType] = useState("PERCENTAGE");
    const [value, setValue] = useState("");
    const [minOrder, setMinOrder] = useState("");
    const [maxUsage, setMaxUsage] = useState("");
    const [couponEndDate, setCouponEndDate] = useState("");

    // Item Discount Form State
    const [selectedProductId, setSelectedProductId] = useState("");
    const [discountPercent, setDiscountPercent] = useState("");
    const [promoStock, setPromoStock] = useState("");
    const [itemEndDate, setItemEndDate] = useState("");

    // Edit Expiry Dialog State
    const [editExpiryOpen, setEditExpiryOpen] = useState(false);
    const [editExpiryType, setEditExpiryType] = useState<"coupon" | "item">("coupon");
    const [editExpiryId, setEditExpiryId] = useState("");
    const [editExpiryDate, setEditExpiryDate] = useState("");
    const [editExpiryName, setEditExpiryName] = useState("");

    // Load products when item discount modal opens
    useEffect(() => {
        if (isItemDiscountOpen && products.length === 0) {
            loadProducts();
        }
    }, [isItemDiscountOpen]);

    const loadProducts = async () => {
        setLoadingProducts(true);
        const res = await getProductsForDiscount();
        if (res.success && res.products) {
            setProducts(res.products as ProductOption[]);
        }
        setLoadingProducts(false);
    };

    const handleCreate = async () => {
        if (!code || !value) {
            toast.error("Preencha código e valor.");
            return;
        }

        setIsLoading(true);
        const res = await createCoupon({
            code,
            type,
            value: Number(value),
            minOrderValue: minOrder ? Number(minOrder) : undefined,
            maxUsage: maxUsage ? Number(maxUsage) : undefined,
            endDate: couponEndDate ? new Date(couponEndDate + "T23:59:59") : undefined
        });

        setIsLoading(false);

        if (res.success) {
            toast.success("Cupom criado com sucesso!");
            setIsCreateOpen(false);
            resetForm();
            router.refresh();
        } else {
            toast.error(res.error || "Erro ao criar.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        const res = await deleteCoupon(id);
        if (res.success) {
            toast.success("Cupom excluído.");
            router.refresh();
        } else {
            toast.error("Erro ao excluir.");
        }
    };

    const handleToggle = async (id: string, current: boolean) => {
        const res = await toggleCoupon(id, !current);
        if (res.success) {
            toast.success(`Cupom ${!current ? 'ativado' : 'desativado'}.`);
            router.refresh();
        } else {
            toast.error("Erro ao atualizar.");
        }
    };

    const resetForm = () => {
        setCode("");
        setValue("");
        setMinOrder("");
        setMaxUsage("");
        setType("PERCENTAGE");
        setCouponEndDate("");
    }

    const resetItemDiscountForm = () => {
        setSelectedProductId("");
        setDiscountPercent("");
        setPromoStock("");
        setItemEndDate("");
    }

    const handleCreateItemDiscount = async () => {
        if (!selectedProductId || !discountPercent || !promoStock) {
            toast.error("Preencha todos os campos.");
            return;
        }

        setIsLoading(true);
        const res = await createItemDiscount({
            productId: selectedProductId,
            discountPercent: Number(discountPercent),
            promoStock: Number(promoStock),
            endDate: itemEndDate ? new Date(itemEndDate + "T23:59:59") : undefined
        });

        setIsLoading(false);

        if (res.success) {
            toast.success("Desconto por item criado com sucesso!");
            setIsItemDiscountOpen(false);
            resetItemDiscountForm();
            router.refresh();
        } else {
            toast.error(res.error || "Erro ao criar.");
        }
    };

    const handleDeleteItemDiscount = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        const res = await deleteItemDiscount(id);
        if (res.success) {
            toast.success("Desconto excluído.");
            router.refresh();
        } else {
            toast.error("Erro ao excluir.");
        }
    };

    const handleToggleItemDiscount = async (id: string, current: boolean) => {
        const res = await toggleItemDiscount(id, !current);
        if (res.success) {
            toast.success(`Desconto ${!current ? 'ativado' : 'desativado'}.`);
            router.refresh();
        } else {
            toast.error("Erro ao atualizar.");
        }
    };

    const openEditExpiry = (type: "coupon" | "item", id: string, name: string, currentDate: Date | string | null) => {
        setEditExpiryType(type);
        setEditExpiryId(id);
        setEditExpiryName(name);
        setEditExpiryDate(formatDateForInput(currentDate));
        setEditExpiryOpen(true);
    };

    const handleSaveExpiry = async () => {
        setIsLoading(true);
        const newDate = editExpiryDate ? new Date(editExpiryDate + "T23:59:59") : null;

        let res;
        if (editExpiryType === "coupon") {
            res = await updateCoupon(editExpiryId, { endDate: newDate });
        } else {
            res = await updateItemDiscount(editExpiryId, { endDate: newDate });
        }

        setIsLoading(false);

        if (res.success) {
            toast.success("Validade atualizada!");
            setEditExpiryOpen(false);
            router.refresh();
        } else {
            toast.error("Erro ao atualizar validade.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-3 items-center">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Cupom
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Cupom</DialogTitle>
                            <DialogDescription>
                                Configure as regras do cupom de desconto.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Código</Label>
                                    <Input
                                        placeholder="EX: NATA10"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                                            <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Valor {type === 'PERCENTAGE' ? '(%)' : '(R$)'}</Label>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pedido Mínimo (R$)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={minOrder}
                                        onChange={e => setMinOrder(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Limite de Uso</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ilimitado"
                                        value={maxUsage}
                                        onChange={e => setMaxUsage(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Validade</Label>
                                <Input
                                    type="date"
                                    value={couponEndDate}
                                    onChange={e => setCouponEndDate(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">Deixe vazio para sem validade.</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate} disabled={isLoading}>
                                {isLoading ? "Criando..." : "Criar Cupom"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isItemDiscountOpen} onOpenChange={setIsItemDiscountOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Tag className="mr-2 h-4 w-4" />
                            Desconto por Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Desconto por Item</DialogTitle>
                            <DialogDescription>
                                Configure um desconto específico para um produto.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Selecionar Produto</Label>
                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingProducts ? "Carregando..." : "Selecione um produto"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Desconto (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 20"
                                    value={discountPercent}
                                    onChange={e => setDiscountPercent(e.target.value)}
                                    min="1"
                                    max="100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Quantidade na Promoção</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 50"
                                    value={promoStock}
                                    onChange={e => setPromoStock(e.target.value)}
                                    min="1"
                                />
                                <p className="text-xs text-slate-500">
                                    Quantidade de unidades disponíveis com desconto
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Validade</Label>
                                <Input
                                    type="date"
                                    value={itemEndDate}
                                    onChange={e => setItemEndDate(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">Deixe vazio para sem validade.</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsItemDiscountOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateItemDiscount} disabled={isLoading}>
                                {isLoading ? "Criando..." : "Criar Desconto"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Expiry Dialog */}
            <Dialog open={editExpiryOpen} onOpenChange={setEditExpiryOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Editar Validade</DialogTitle>
                        <DialogDescription>{editExpiryName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label>Data de Validade</Label>
                        <Input
                            type="date"
                            value={editExpiryDate}
                            onChange={e => setEditExpiryDate(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Deixe vazio para remover a validade.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditExpiryOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveExpiry} disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[20%]">Código</TableHead>
                            <TableHead className="w-[12%]">Valor</TableHead>
                            <TableHead className="w-[12%]">Mínimo</TableHead>
                            <TableHead className="w-[12%]">Uso</TableHead>
                            <TableHead className="w-[16%]">Validade</TableHead>
                            <TableHead className="text-center w-[13%]">Status</TableHead>
                            <TableHead className="text-right w-[15%]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCoupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                                    Nenhum cupom encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialCoupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-bold font-mono">{coupon.code}</TableCell>
                                    <TableCell>
                                        {coupon.type === 'PERCENTAGE'
                                            ? `${Number(coupon.value)}%`
                                            : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(coupon.value))
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {coupon.minOrderValue
                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(coupon.minOrderValue))
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {coupon.usageCount} {coupon.maxUsage ? `/ ${coupon.maxUsage}` : ''}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs ${isExpired(coupon.endDate) ? 'text-red-500 font-semibold' : 'text-slate-600'}`}>
                                            {coupon.endDate ? formatDate(coupon.endDate) : "Sem validade"}
                                            {isExpired(coupon.endDate) && " (expirado)"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Switch
                                                checked={coupon.active}
                                                onCheckedChange={() => handleToggle(coupon.id, coupon.active)}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-500 hover:text-slate-700"
                                                onClick={() => openEditExpiry("coupon", coupon.id, `Cupom: ${coupon.code}`, coupon.endDate)}
                                                title="Editar validade"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Item Discounts Section */}
            {initialItemDiscounts.length > 0 && (
                <>
                    <div className="pt-4">
                        <h2 className="text-lg font-semibold text-slate-800">Descontos por Item</h2>
                        <p className="text-sm text-slate-500">Promoções aplicadas a produtos específicos.</p>
                    </div>

                    <div className="border rounded-lg bg-white overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[20%]">Produto</TableHead>
                                    <TableHead className="w-[12%]">Desconto</TableHead>
                                    <TableHead className="w-[12%]">Estoque Promo</TableHead>
                                    <TableHead className="w-[12%]">Vendidos</TableHead>
                                    <TableHead className="w-[16%]">Validade</TableHead>
                                    <TableHead className="text-center w-[13%]">Status</TableHead>
                                    <TableHead className="text-right w-[15%]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialItemDiscounts.map((discount: ItemDiscount) => (
                                    <TableRow key={discount.id}>
                                        <TableCell className="font-medium">
                                            {discount.product.name}
                                        </TableCell>
                                        <TableCell className="font-bold text-green-600">
                                            {Number(discount.discountPercent)}%
                                        </TableCell>
                                        <TableCell>
                                            {discount.promoStock} unid.
                                        </TableCell>
                                        <TableCell>
                                            {discount.soldCount} / {discount.promoStock}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs ${isExpired(discount.endDate) ? 'text-red-500 font-semibold' : 'text-slate-600'}`}>
                                                {discount.endDate ? formatDate(discount.endDate) : "Sem validade"}
                                                {isExpired(discount.endDate) && " (expirado)"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={discount.active}
                                                    onCheckedChange={() => handleToggleItemDiscount(discount.id, discount.active)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-500 hover:text-slate-700"
                                                    onClick={() => openEditExpiry("item", discount.id, `Desconto: ${discount.product.name}`, discount.endDate)}
                                                    title="Editar validade"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteItemDiscount(discount.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </div>
    );
}
