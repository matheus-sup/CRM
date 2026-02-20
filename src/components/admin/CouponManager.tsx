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
import { Plus, Trash, Tag } from "lucide-react";
import { toast } from "sonner";
import { createCoupon, deleteCoupon, toggleCoupon } from "@/lib/actions/coupon";
import {
    createItemDiscount,
    deleteItemDiscount,
    toggleItemDiscount,
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

    // Item Discount Form State
    const [selectedProductId, setSelectedProductId] = useState("");
    const [discountPercent, setDiscountPercent] = useState("");
    const [promoStock, setPromoStock] = useState("");

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
            maxUsage: maxUsage ? Number(maxUsage) : undefined
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
    }

    const resetItemDiscountForm = () => {
        setSelectedProductId("");
        setDiscountPercent("");
        setPromoStock("");
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
            promoStock: Number(promoStock)
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
            toast.success("Desconto excluido.");
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
                    <DialogContent>
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Desconto por Item</DialogTitle>
                            <DialogDescription>
                                Configure um desconto especifico para um produto.
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
                                <Label>Quantidade na Promocao</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 50"
                                    value={promoStock}
                                    onChange={e => setPromoStock(e.target.value)}
                                    min="1"
                                />
                                <p className="text-xs text-slate-500">
                                    Quantidade de unidades disponiveis com desconto
                                </p>
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

            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25%]">Código</TableHead>
                            <TableHead className="w-[15%]">Valor</TableHead>
                            <TableHead className="w-[15%]">Mínimo</TableHead>
                            <TableHead className="w-[15%]">Uso</TableHead>
                            <TableHead className="text-center w-[15%]">Status</TableHead>
                            <TableHead className="text-right w-[15%]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCoupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
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
                                        <div className="flex justify-center">
                                            <Switch
                                                checked={coupon.active}
                                                onCheckedChange={() => handleToggle(coupon.id, coupon.active)}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(coupon.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
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
                        <p className="text-sm text-slate-500">Promocoes aplicadas a produtos especificos.</p>
                    </div>

                    <div className="border rounded-lg bg-white overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Produto</TableHead>
                                    <TableHead className="w-[15%]">Desconto</TableHead>
                                    <TableHead className="w-[15%]">Estoque Promo</TableHead>
                                    <TableHead className="w-[15%]">Vendidos</TableHead>
                                    <TableHead className="text-center w-[15%]">Status</TableHead>
                                    <TableHead className="text-right w-[15%]">Acoes</TableHead>
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
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={discount.active}
                                                    onCheckedChange={() => handleToggleItemDiscount(discount.id, discount.active)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteItemDiscount(discount.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
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
