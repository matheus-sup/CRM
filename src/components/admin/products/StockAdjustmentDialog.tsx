"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { adjustStock } from "@/lib/actions/stock-movement";
import { Loader2, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: {
        id: string;
        name: string;
        stock: number;
    };
    onSuccess?: () => void;
}

export function StockAdjustmentDialog({ open, onOpenChange, product, onSuccess }: Props) {
    const [newQuantity, setNewQuantity] = useState(product.stock);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const difference = newQuantity - product.stock;

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert("Informe o motivo do ajuste");
            return;
        }

        setLoading(true);
        try {
            await adjustStock({
                productId: product.id,
                newQuantity,
                reason,
            });
            onOpenChange(false);
            onSuccess?.();
            // Reset state for next use
            setReason("");
        } catch (error) {
            alert("Erro ao ajustar estoque");
        } finally {
            setLoading(false);
        }
    };

    // Reset quantity when dialog opens with new product
    useState(() => {
        setNewQuantity(product.stock);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajustar Estoque</DialogTitle>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Current Stock Display */}
                    <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <Label className="text-xs text-muted-foreground">Estoque Atual</Label>
                        <div className="text-3xl font-bold">{product.stock}</div>
                        <span className="text-sm text-muted-foreground">unidades</span>
                    </div>

                    {/* Quick Adjustment Buttons */}
                    <div className="flex justify-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewQuantity(Math.max(0, newQuantity - 10))}
                        >
                            -10
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                        >
                            -1
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewQuantity(newQuantity + 1)}
                        >
                            +1
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewQuantity(newQuantity + 10)}
                        >
                            +10
                        </Button>
                    </div>

                    {/* New Quantity Input */}
                    <div className="space-y-2">
                        <Label htmlFor="newQty">Nova Quantidade</Label>
                        <Input
                            id="newQty"
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                            min={0}
                            className="text-center text-lg font-medium"
                        />
                        {difference !== 0 && (
                            <div
                                className={`flex items-center justify-center gap-1 text-sm font-medium ${
                                    difference > 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {difference > 0 ? (
                                    <ArrowUp className="h-4 w-4" />
                                ) : (
                                    <ArrowDown className="h-4 w-4" />
                                )}
                                {difference > 0 ? "+" : ""}
                                {difference} unidades
                            </div>
                        )}
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Motivo do Ajuste <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Ex: Correcao de inventario, perda por avaria, transferencia entre lojas..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            O motivo sera registrado no historico de movimentacoes.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || difference === 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Ajuste
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
