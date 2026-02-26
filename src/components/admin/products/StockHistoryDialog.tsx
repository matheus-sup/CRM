"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getProductMovements } from "@/lib/actions/stock-movement";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2 } from "lucide-react";

interface Movement {
    id: string;
    type: string;
    quantity: number;
    unitPrice: number | null;
    totalValue: number | null;
    reason: string | null;
    createdAt: Date;
    order?: { code: number } | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
}

export function StockHistoryDialog({ open, onOpenChange, productId, productName }: Props) {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getProductMovements(productId).then((data) => {
                setMovements(data);
                setLoading(false);
            });
        }
    }, [open, productId]);

    const getIcon = (type: string) => {
        switch (type) {
            case "IN":
                return <ArrowUpCircle className="h-5 w-5 text-green-600" />;
            case "OUT":
                return <ArrowDownCircle className="h-5 w-5 text-red-600" />;
            default:
                return <RefreshCw className="h-5 w-5 text-blue-600" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "IN":
                return "Entrada";
            case "OUT":
                return "Saida";
            default:
                return "Ajuste";
        }
    };

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case "IN":
                return "bg-green-100 text-green-700";
            case "OUT":
                return "bg-red-100 text-red-700";
            default:
                return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Historico de Movimentacoes</DialogTitle>
                    <p className="text-sm text-muted-foreground">{productName}</p>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : movements.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma movimentacao registrada.</p>
                        <p className="text-sm">As movimentacoes aparecerão aqui após entradas, vendas ou ajustes.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {movements.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border"
                            >
                                <div className="mt-0.5">{getIcon(m.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(m.type)}`}>
                                            {getTypeLabel(m.type)}
                                        </span>
                                        <span className={`font-bold ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                            {m.quantity > 0 ? "+" : ""}
                                            {m.quantity} un
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 mt-1">
                                        {m.reason || "Sem observacao"}
                                        {m.order && (
                                            <span className="ml-2 text-blue-600">
                                                Pedido #{m.order.code}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    {m.totalValue !== null && m.totalValue > 0 && (
                                        <div className="text-sm font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(m.totalValue)}
                                        </div>
                                    )}
                                    {m.unitPrice !== null && m.unitPrice > 0 && (
                                        <div className="text-xs text-slate-500">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(m.unitPrice)}{" "}
                                            /un
                                        </div>
                                    )}
                                    <div className="text-xs text-slate-400 mt-1">
                                        {new Date(m.createdAt).toLocaleString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
