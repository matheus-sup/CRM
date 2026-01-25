"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface OrdersListProps {
    orders: any[];
}

export function OrdersList({ orders }: OrdersListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-700 hover:bg-green-100";
            case "PENDING": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            case "CANCELLED": return "bg-red-100 text-red-700 hover:bg-red-100";
            case "FULFILLED": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PAID": return "Pago";
            case "PENDING": return "Pendente";
            case "CANCELLED": return "Cancelado";
            case "FULFILLED": return "Enviado";
            default: return status;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por número do pedido ou cliente" className="pl-10 bg-white" />
                </div>
                <Button variant="outline" className="gap-2 bg-white text-slate-600">
                    <Filter className="h-4 w-4" /> Filtrar
                </Button>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex text-sm font-bold text-slate-600">
                    <div className="w-[15%]">Pedido</div>
                    <div className="w-[25%]">Cliente</div>
                    <div className="w-[20%]">Data</div>
                    <div className="w-[15%]">Status</div>
                    <div className="w-[15%]">Total</div>
                    <div className="w-[10%] text-right">Detalhes</div>
                </div>
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhuma venda registrada ainda.
                    </div>
                ) : (
                    <div>
                        {orders.map((order) => (
                            <div key={order.id} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="w-[15%] font-bold text-blue-600">
                                    #{order.code}
                                </div>
                                <div className="w-[25%] text-sm text-slate-700">
                                    {order.customer?.name || "Visitante (WhatsApp)"}
                                </div>
                                <div className="w-[20%] text-sm text-slate-500">
                                    {format(new Date(order.createdAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                </div>
                                <div className="w-[15%]">
                                    <Badge className={getStatusColor(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>
                                <div className="w-[15%] font-medium text-slate-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                                </div>
                                <div className="w-[10%] flex justify-end">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/admin/pedidos/${order.id}`}>
                                            <Eye className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
