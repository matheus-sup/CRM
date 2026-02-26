"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  UtensilsCrossed,
  MapPin,
  Settings,
  BarChart3,
  Loader2,
  Power,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { getDeliverySettings, toggleDeliveryOpen, seedDeliveryDemo } from "@/lib/actions/delivery";
import { DeliveryKanban } from "@/components/admin/delivery/DeliveryKanban";
import { DeliveryMenu } from "@/components/admin/delivery/DeliveryMenu";
import { DeliveryZones } from "@/components/admin/delivery/DeliveryZones";
import { DeliverySettingsForm } from "@/components/admin/delivery/DeliverySettingsForm";
import { DeliveryReports } from "@/components/admin/delivery/DeliveryReports";

export default function DeliveryPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [togglingOpen, setTogglingOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getDeliverySettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleOpen() {
    setTogglingOpen(true);
    try {
      const result = await toggleDeliveryOpen(!settings.isOpen);
      setSettings({ ...settings, isOpen: result.isOpen });
      toast.success(result.isOpen ? "Delivery aberto!" : "Delivery fechado");
    } catch (error) {
      toast.error("Erro ao alterar status");
    } finally {
      setTogglingOpen(false);
    }
  }

  async function handleSeedDemo() {
    try {
      await seedDeliveryDemo();
      toast.success("Dados de exemplo criados!");
      loadData();
    } catch (error) {
      toast.error("Erro ao criar dados de exemplo");
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-slate-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-red-600" />
              </div>
              Delivery Próprio
            </h1>
            <p className="text-slate-500 mt-1">
              Gerencie seu cardápio, pedidos e entregas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSeedDemo}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Dados Demo
            </Button>

            <Button
              variant={settings?.isOpen ? "default" : "outline"}
              className={settings?.isOpen ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={handleToggleOpen}
              disabled={togglingOpen}
            >
              {togglingOpen ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Power className="w-4 h-4 mr-2" />
              )}
              {settings?.isOpen ? "Aberto" : "Fechado"}
            </Button>

            <Badge
              variant="outline"
              className={
                settings?.isOpen
                  ? "border-green-500 text-green-700 bg-green-50"
                  : "border-red-500 text-red-700 bg-red-50"
              }
            >
              {settings?.isOpen ? "Recebendo pedidos" : "Delivery pausado"}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white border p-1 h-auto">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Cardápio
            </TabsTrigger>
            <TabsTrigger
              value="zones"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Áreas de Entrega
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <DeliveryKanban />
          </TabsContent>

          <TabsContent value="menu">
            <DeliveryMenu />
          </TabsContent>

          <TabsContent value="zones">
            <DeliveryZones />
          </TabsContent>

          <TabsContent value="reports">
            <DeliveryReports />
          </TabsContent>

          <TabsContent value="settings">
            <DeliverySettingsForm settings={settings} onUpdate={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
