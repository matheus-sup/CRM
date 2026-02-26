import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parse, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, ShoppingBag, Package, Users, Store, Globe, Trophy, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TopCustomers } from "@/components/admin/dashboard/top-customers";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { SellersCard } from "@/components/admin/dashboard/SellersCard";

interface PageProps {
    searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const fromDate = params.from ? parse(params.from, "yyyy-MM-dd", new Date()) : null;
    const toDate = params.to ? parse(params.to, "yyyy-MM-dd", new Date()) : null;

    // Build date filter
    const dateFilter = fromDate && toDate ? {
        createdAt: {
            gte: startOfDay(fromDate),
            lte: endOfDay(toDate)
        }
    } : {};

    // 1. Fetch Data
    const totalOrders = await prisma.order.count({ where: dateFilter });
    const activeProducts = await prisma.product.count({ where: { status: "ACTIVE" } });

    // Fetch all orders with date filter
    const allOrders = await prisma.order.findMany({
        where: dateFilter,
        include: { customer: true, seller: true },
        orderBy: { createdAt: 'desc' },
        take: 1000
    });

    // 2. Calculate Stats
    const validOrders = allOrders.filter(o => o.status !== "CANCELLED");
    const totalRevenue = validOrders.reduce((acc, curr) => acc + Number(curr.total), 0);

    const onlineOrders = validOrders.filter(o => o.origin === "ONLINE");
    const onlineRevenue = onlineOrders.reduce((acc, curr) => acc + Number(curr.total), 0);

    const storeOrders = validOrders.filter(o => o.origin === "STORE");
    const storeRevenue = storeOrders.reduce((acc, curr) => acc + Number(curr.total), 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const recentOrders = allOrders.slice(0, 5);

    // 3. Top Customers Logic
    const customerMap = new Map();
    validOrders.forEach(order => {
        if (!order.customerId || !order.customer) return;
        const cid = order.customerId;
        if (!customerMap.has(cid)) {
            customerMap.set(cid, {
                id: cid,
                name: order.customer.name,
                email: order.customer.email || "Sem email",
                totalSpent: 0,
                ordersCount: 0
            });
        }
        const c = customerMap.get(cid);
        c.totalSpent += Number(order.total);
        c.ordersCount += 1;
    });

    const topCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    // 4. Sellers Logic
    const sellerMap = new Map<string, { id: string; name: string; total: number }>();
    validOrders.forEach(order => {
        if (!order.sellerId || !order.seller) return;
        const sid = order.sellerId;
        if (!sellerMap.has(sid)) {
            sellerMap.set(sid, {
                id: sid,
                name: order.seller.name,
                total: 0
            });
        }
        const s = sellerMap.get(sid)!;
        s.total += Number(order.total);
    });

    const sellerSales = Array.from(sellerMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    // 5. Recommendations Logic (Mocked for now)
    const recommendations = [
        { id: 1, title: "Preferência de login", completed: false, link: "/admin/configuracoes" },
        { id: 2, title: "Adicione seu primeiro produto", completed: activeProducts > 0, link: "/admin/produtos/novo" },
    ];

    return (
        <div className="space-y-6">
            <DashboardHeader />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-8 bg-linear-to-br from-gray-200 to-gray-300 text-gray-800 rounded-3xl shadow-xl mb-10 relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Online: {totalRevenue > 0 ? ((onlineRevenue / totalRevenue) * 100).toFixed(0) : 0}%</span>
                            <span className="flex items-center gap-1"><Store className="h-3 w-3" /> Loja: {totalRevenue > 0 ? ((storeRevenue / totalRevenue) * 100).toFixed(0) : 0}%</span>
                        </div>
                    </CardContent>
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {allOrders.filter(o => o.status === "PENDING").length} pendentes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageOrderValue)}
                        </div>
                    </CardContent>
                </Card>
                <SellersCard sellers={sellerSales} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Left Column */}
                <div className="col-span-4 space-y-6">
                    {/* Chart Area */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Visão de Vendas</CardTitle>
                            <CardDescription>O crescimento da sua loja.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2 h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-md relative overflow-hidden mx-6 mb-6">
                            {/* Placeholder for Chart */}
                            <span className="text-sm">Gráfico de Vendas (Implementado no Futuro)</span>
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimos Pedidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? <p className="text-sm text-center py-4">Nenhum pedido ainda.</p> : recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {order.origin === "STORE" ? <Store className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{order.customer?.name || "Visitante"}</p>
                                                <p className="text-xs text-muted-foreground">#{order.code} • {format(order.createdAt, "dd/MM")}</p>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-sm">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Right Column */}
                <div className="col-span-3 space-y-6">
                    <TopCustomers customers={topCustomers} />

                    {/* Shortcuts/Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start text-left font-normal" asChild>
                                <Link href="/admin/site">Conectar Canais de Venda</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recommendations Section */}
            <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        Complete sua loja
                    </CardTitle>
                    <CardDescription>Passos recomendados para vender mais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recommendations.map((item) => (
                            <Link key={item.id} href={item.link} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${item.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                                <div className={`mt-0.5 ${item.completed ? 'text-green-600' : 'text-slate-300'}`}>
                                    {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${item.completed ? 'text-green-800 line-through' : 'text-slate-700'}`}>{item.title}</p>
                                    <span className="text-xs text-blue-600 mt-1 block font-medium">Configurar &rarr;</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
