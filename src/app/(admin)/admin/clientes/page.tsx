import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function CustomersPage() {
    // Fetch customers with their orders to calculate LTV (Lifetime Value)
    const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        include: { orders: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Clientes (CRM)</h1>
                    <p className="text-slate-500">Gerencie sua base de contatos.</p>
                </div>
            </div>

            <div className="flex gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por nome ou telefone" className="pl-10 bg-white" />
                </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex text-sm font-bold text-slate-600">
                    <div className="w-[10%]">ID</div>
                    <div className="w-[25%]">Cliente</div>
                    <div className="w-[18%]">WhatsApp</div>
                    <div className="w-[12%]">Pedidos</div>
                    <div className="w-[15%]">Total Gasto</div>
                    <div className="w-[20%] text-right">Ações</div>
                </div>
                {customers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum cliente cadastrado ainda.
                    </div>
                ) : (
                    <div>
                        {customers.map((constomer, index) => {
                            const totalSpent = constomer.orders.reduce((acc, order) => acc + Number(order.total), 0);
                            const clientId = String(customers.length - index).padStart(4, "0");

                            return (
                                <div key={constomer.id} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <div className="w-[10%]">
                                        <span className="text-xs font-mono text-slate-500">#{clientId}</span>
                                    </div>
                                    <div className="w-[25%]">
                                        <div className="font-bold text-slate-800">{constomer.name}</div>
                                        <div className="text-xs text-slate-400">Desde {format(constomer.createdAt, "MMM yyyy", { locale: ptBR })}</div>
                                    </div>
                                    <div className="w-[18%] text-sm text-slate-600">
                                        {constomer.phone || "-"}
                                    </div>
                                    <div className="w-[12%]">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                                            {constomer.orders.length}
                                        </span>
                                    </div>
                                    <div className="w-[15%] font-medium text-slate-700">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                                    </div>
                                    <div className="w-[20%] flex justify-end gap-2">
                                        <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" asChild>
                                            <a href={`https://wa.me/55${constomer.phone}`} target="_blank">
                                                <MessageCircle className="h-3 w-3" /> Falar
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
