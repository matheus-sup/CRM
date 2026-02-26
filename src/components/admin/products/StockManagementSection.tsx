"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Package,
    Plus,
    History,
    Settings2,
    Calendar,
    Loader2,
    AlertTriangle,
    Trash2,
} from "lucide-react";
import { StockHistoryDialog } from "./StockHistoryDialog";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { addStockBatch } from "@/lib/actions/inventory";
import { getProductBatches, deleteBatch } from "@/lib/actions/batch";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface ProductData {
    id: string;
    name: string;
    stock: number;
    isPerishable: boolean;
}

interface Batch {
    id: string;
    quantity: number;
    expiresAt: Date;
    createdAt: Date;
}

interface StockManagementSectionProps {
    product: ProductData;
}

export function StockManagementSection({ product }: StockManagementSectionProps) {
    const { toast } = useToast();
    const router = useRouter();

    // Dialog states
    const [showAddStock, setShowAddStock] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);

    // Add stock form
    const [quantity, setQuantity] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [loading, setLoading] = useState(false);

    // Batches for perishable products
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);

    // Load batches for perishable products
    useEffect(() => {
        if (product.isPerishable) {
            setLoadingBatches(true);
            getProductBatches(product.id).then((data) => {
                setBatches(data);
                setLoadingBatches(false);
            });
        }
    }, [product.id, product.isPerishable]);

    const handleAddStock = async () => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast({ title: "Quantidade inválida", variant: "destructive" });
            return;
        }

        if (product.isPerishable && !expiresAt) {
            toast({ title: "Produto perecível requer data de validade", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await addStockBatch([{
                productId: product.id,
                productName: product.name,
                productSku: "",
                quantityToAdd: qty,
                expiresAt: expiresAt,
            }]);

            toast({ title: "Estoque adicionado com sucesso!" });
            setShowAddStock(false);
            setQuantity("");
            setExpiresAt("");
            router.refresh();

            // Reload batches
            if (product.isPerishable) {
                const newBatches = await getProductBatches(product.id);
                setBatches(newBatches);
            }
        } catch (error: any) {
            toast({ title: error.message || "Erro ao adicionar estoque", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBatch = async (batchId: string) => {
        if (!confirm("Tem certeza que deseja excluir este lote? O estoque será removido.")) {
            return;
        }

        setDeletingBatchId(batchId);
        try {
            await deleteBatch(batchId);
            toast({ title: "Lote excluído com sucesso!" });
            router.refresh();

            // Reload batches
            const newBatches = await getProductBatches(product.id);
            setBatches(newBatches);
        } catch (error: any) {
            toast({ title: error.message || "Erro ao excluir lote", variant: "destructive" });
        } finally {
            setDeletingBatchId(null);
        }
    };

    const getDaysUntilExpiry = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getExpiryBadge = (date: Date) => {
        const days = getDaysUntilExpiry(date);

        if (days < 0) {
            return <Badge variant="destructive">Vencido</Badge>;
        } else if (days <= 7) {
            return <Badge className="bg-orange-100 text-orange-700 border-orange-200">{days}d</Badge>;
        } else if (days <= 30) {
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{days}d</Badge>;
        }
        return <Badge className="bg-green-50 text-green-700 border-green-200">{days}d</Badge>;
    };

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Gestão de Estoque
                </h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHistory(true)}
                    >
                        <History className="h-4 w-4 mr-1" />
                        Histórico
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdjust(true)}
                    >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Ajustar
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setShowAddStock(true)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Entrada
                    </Button>
                </div>
            </div>

            {/* Stock Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Estoque Atual</div>
                    <div className="text-3xl font-bold text-slate-800">{product.stock}</div>
                    <div className="text-xs text-muted-foreground">unidades</div>
                </div>
                {product.isPerishable && (
                    <div className="bg-amber-50 p-4 rounded-lg text-center border border-amber-200">
                        <div className="text-sm text-amber-700">Controle por Lote</div>
                        <div className="text-3xl font-bold text-amber-800">{batches.length}</div>
                        <div className="text-xs text-amber-600">lotes ativos</div>
                    </div>
                )}
            </div>

            {/* Batches List for Perishable Products */}
            {product.isPerishable && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Lotes por Validade (FEFO)
                    </h3>
                    {loadingBatches ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground bg-slate-50 rounded-lg border-2 border-dashed">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum lote cadastrado.</p>
                            <p className="text-xs">Adicione estoque para criar lotes.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {batches.map((batch) => {
                                const days = getDaysUntilExpiry(batch.expiresAt);
                                const isExpired = days < 0;
                                const isUrgent = days >= 0 && days <= 7;

                                return (
                                    <div
                                        key={batch.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                            isExpired
                                                ? "bg-red-50 border-red-200"
                                                : isUrgent
                                                ? "bg-orange-50 border-orange-200"
                                                : "bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{batch.quantity}</div>
                                                <div className="text-xs text-muted-foreground">un</div>
                                            </div>
                                            <div className="border-l pl-3">
                                                <div className="text-sm font-medium">
                                                    Validade: {new Date(batch.expiresAt).toLocaleDateString("pt-BR")}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Entrada: {new Date(batch.createdAt).toLocaleDateString("pt-BR")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getExpiryBadge(batch.expiresAt)}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteBatch(batch.id)}
                                                disabled={deletingBatchId === batch.id}
                                            >
                                                {deletingBatchId === batch.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Add Stock Dialog */}
            <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Entrada de Estoque</DialogTitle>
                        <p className="text-sm text-muted-foreground">{product.name}</p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Quantidade a adicionar</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Validade {product.isPerishable ? "(Obrigatório)" : "(Opcional)"}
                            </Label>
                            <Input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className={product.isPerishable && !expiresAt ? "border-amber-400" : ""}
                            />
                            {product.isPerishable && (
                                <p className="text-xs text-amber-600">
                                    Cada entrada criará um lote com esta validade (FEFO)
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddStock(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddStock}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Entrada
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <StockHistoryDialog
                open={showHistory}
                onOpenChange={setShowHistory}
                productId={product.id}
                productName={product.name}
            />

            {/* Adjustment Dialog */}
            <StockAdjustmentDialog
                open={showAdjust}
                onOpenChange={setShowAdjust}
                product={{
                    id: product.id,
                    name: product.name,
                    stock: product.stock,
                }}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
