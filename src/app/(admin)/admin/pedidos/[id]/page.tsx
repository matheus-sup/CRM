import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Simple action to update status (inline for MVP)
import { revalidatePath } from "next/cache";

async function updateStatus(id: string, status: string) {
    "use server";
    await prisma.order.update({
        where: { id },
        data: { status }
    });
    revalidatePath(`/admin/pedidos/${id}`);
    revalidatePath("/admin/pedidos");
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    // Next.js 15+ Params are async
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            items: true
        }
    });

    if (!order) {
        return <div>Pedido não encontrado.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/pedidos">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pedido #{order.code}</h1>
                        <p className="text-sm text-slate-500">
                            {format(order.createdAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                    {/* Status Actions */}
                    <form action={updateStatus.bind(null, id, "PAID")}>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-2" disabled={order.status === "PAID"}>
                            <CheckCircle className="h-4 w-4" /> Marcar como Pago
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-white shadow-sm p-6">
                        <h2 className="font-bold text-lg mb-4">Itens do Pedido</h2>
                        <div className="divide-y">
                            {order.items.map(item => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                            IMG
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">{item.name}</div>
                                            <div className="text-sm text-slate-500">{item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price))}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-700">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}</span>
                        </div>
                    </div>
                </div>

                {/* Customer & Status Info */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-white shadow-sm p-6">
                        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Status</h2>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                                <span className="text-sm font-medium">Atual</span>
                                <Badge>{order.status}</Badge>
                            </div>
                            <form action={updateStatus.bind(null, id, "FULFILLED")}>
                                <Button variant="outline" className="w-full justify-start gap-2" disabled={order.status === "FULFILLED"}>
                                    <Truck className="h-4 w-4" /> Marcar como Enviado
                                </Button>
                            </form>
                            <form action={updateStatus.bind(null, id, "CANCELLED")}>
                                <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" disabled={order.status === "CANCELLED"}>
                                    <XCircle className="h-4 w-4" /> Cancelar Pedido
                                </Button>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Delivery & Address */}
                <div className="rounded-lg border bg-white shadow-sm p-6">
                    <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Entrega</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Método de Envio</div>
                            <div className="font-medium flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                {order.shippingTitle || "Entrega Padrão"}
                                {order.shippingCost > 0 && ` - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.shippingCost))}`}
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Endereço</div>
                            <div className="text-sm font-medium">{order.addressStreet}, {order.addressNumber} {order.addressComplement}</div>
                            <div className="text-sm text-slate-600">{order.addressDistrict}</div>
                            <div className="text-sm text-slate-600">{order.addressCity} - {order.addressState}</div>
                            <div className="text-sm text-slate-600 font-mono mt-1">{order.addressZip}</div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-lg border bg-white shadow-sm p-6">
                    <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Cliente</h2>
                    {order.customerName ? (
                        <div className="space-y-3">
                            <div>
                                <div className="font-medium">{order.customerName}</div>
                                <div className="text-xs text-slate-400">Nome no Pedido</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">{order.customerEmail}</div>
                                {order.customerPhone && <div className="text-sm text-slate-600">{order.customerPhone}</div>}
                            </div>
                            <div className="bg-slate-50 p-2 rounded text-xs text-slate-500">
                                Pagamento via <span className="font-bold uppercase">{order.paymentMethod}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-600 italic">
                            Cliente não identificado.
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
