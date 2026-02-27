import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default async function MyOrdersPage() {
    const user = await getCurrentUser();

    if (!user) return null; // Layout handles redirect

    const orders = await prisma.order.findMany({
        where: { customerId: user.id },
        orderBy: { createdAt: "desc" },
        include: { items: true }
    });

    if (orders.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-200 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PackageOpen className="h-8 w-8 text-slate-300" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Você ainda não tem pedidos</h2>
                <p className="text-slate-500 mb-6">Aproveite nossas ofertas e faça sua primeira compra!</p>
                <Link href="/">
                    <Button>Ir para a Loja</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Meus Pedidos</h1>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:border-primary/20 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                            <div>
                                <div className="text-sm font-bold text-slate-800">Pedido #{order.code}</div>
                                <div className="text-xs text-slate-500">
                                    {format(order.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </div>
                            </div>
                            <Badge variant={order.status === 'PAID' ? 'default' : 'secondary'} className={order.status === 'PAID' ? 'bg-green-600' : ''}>
                                {order.status === 'PENDING' && 'Aguardando Pagamento'}
                                {order.status === 'PAID' && 'Pago'}
                                {order.status === 'FULFILLED' && 'Enviado'}
                                {order.status === 'CANCELLED' && 'Cancelado'}
                            </Badge>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mb-4">
                            {order.items.map(item => (
                                <div key={item.id} className="h-16 w-16 bg-slate-50 rounded border shrink-0 flex items-center justify-center text-xs font-bold text-slate-300">
                                    IMG
                                </div>
                            ))}
                            {order.items.length > 5 && (
                                <div className="h-16 w-16 bg-slate-50 rounded border shrink-0 flex items-center justify-center text-xs text-slate-500">
                                    +{order.items.length - 5}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="font-bold text-slate-800">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                            </div>
                            {/* We could add a "Ver Detalhes" button linking to a customer-facing order detail page later */}
                            <Button variant="outline" size="sm">Ver Detalhes</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
