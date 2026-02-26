"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { getDeliveryStats } from "@/lib/actions/delivery";

export function DeliveryReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getDeliveryStats(
        new Date(dateRange.start),
        new Date(dateRange.end + "T23:59:59")
      );
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Período:</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
              />
              <span className="text-slate-400">até</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
              />
            </div>
            <Button onClick={loadStats} variant="outline" size="sm">
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              no período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {(stats?.revenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              pedidos entregues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.avgTicket || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.ordersByStatus?.DELIVERED || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.ordersByStatus?.CANCELLED || 0} cancelados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: "NEW", label: "Novos", color: "bg-blue-500" },
                { key: "CONFIRMED", label: "Confirmados", color: "bg-yellow-500" },
                { key: "PREPARING", label: "Preparando", color: "bg-orange-500" },
                { key: "OUT_FOR_DELIVERY", label: "Em Entrega", color: "bg-purple-500" },
                { key: "DELIVERED", label: "Entregues", color: "bg-green-500" },
                { key: "CANCELLED", label: "Cancelados", color: "bg-red-500" },
              ].map((status) => {
                const count = stats?.ordersByStatus?.[status.key] || 0;
                const total = stats?.totalOrders || 1;
                const percentage = ((count / total) * 100).toFixed(1);

                return (
                  <div key={status.key} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span className="flex-1 text-sm">{status.label}</span>
                    <span className="font-medium">{count}</span>
                    <span className="text-xs text-slate-500 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topItems?.length === 0 ? (
              <p className="text-center text-slate-400 py-4">
                Nenhum item vendido no período
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.topItems?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm truncate">{item.name}</span>
                    <span className="font-medium">
                      {item._sum?.quantity || 0}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
