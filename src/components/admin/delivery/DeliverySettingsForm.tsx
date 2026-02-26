"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { updateDeliverySettings } from "@/lib/actions/delivery";

type Props = {
  settings: any;
  onUpdate: () => void;
};

export function DeliverySettingsForm({ settings, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: settings?.storeName || "",
    storeDescription: settings?.storeDescription || "",
    storeLogo: settings?.storeLogo || "",
    storeBanner: settings?.storeBanner || "",
    storePhone: settings?.storePhone || "",
    storeWhatsapp: settings?.storeWhatsapp || "",
    storeAddress: settings?.storeAddress || "",
    storeCity: settings?.storeCity || "",
    storeState: settings?.storeState || "",
    storeZipCode: settings?.storeZipCode || "",
    minOrderValue: String(settings?.minOrderValue || 0),
    avgPrepTime: String(settings?.avgPrepTime || 30),
    maxDeliveryTime: String(settings?.maxDeliveryTime || 60),
    acceptCashChange: settings?.acceptCashChange ?? true,
    primaryColor: settings?.primaryColor || "#ef4444",
    accentColor: settings?.accentColor || "#fef2f2",
  });

  async function handleSave() {
    setSaving(true);
    try {
      await updateDeliverySettings({
        storeName: form.storeName,
        storeDescription: form.storeDescription || undefined,
        storeLogo: form.storeLogo || undefined,
        storeBanner: form.storeBanner || undefined,
        storePhone: form.storePhone || undefined,
        storeWhatsapp: form.storeWhatsapp || undefined,
        storeAddress: form.storeAddress || undefined,
        storeCity: form.storeCity || undefined,
        storeState: form.storeState || undefined,
        storeZipCode: form.storeZipCode || undefined,
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        avgPrepTime: parseInt(form.avgPrepTime) || 30,
        maxDeliveryTime: parseInt(form.maxDeliveryTime) || 60,
        acceptCashChange: form.acceptCashChange,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
      });
      toast.success("Configurações salvas!");
      onUpdate();
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Estabelecimento</CardTitle>
          <CardDescription>
            Dados que aparecerão no cardápio online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nome do Estabelecimento</Label>
              <Input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                placeholder="Meu Restaurante"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={form.storeWhatsapp}
                onChange={(e) => setForm({ ...form, storeWhatsapp: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={form.storeDescription}
              onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
              placeholder="Os melhores hambúrgueres da cidade..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>URL do Logo</Label>
              <Input
                value={form.storeLogo}
                onChange={(e) => setForm({ ...form, storeLogo: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>URL do Banner</Label>
              <Input
                value={form.storeBanner}
                onChange={(e) => setForm({ ...form, storeBanner: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>
            Usado para cálculo de distância (se aplicável)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Endereço Completo</Label>
            <Input
              value={form.storeAddress}
              onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
              placeholder="Rua Example, 123"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Cidade</Label>
              <Input
                value={form.storeCity}
                onChange={(e) => setForm({ ...form, storeCity: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Input
                value={form.storeState}
                onChange={(e) => setForm({ ...form, storeState: e.target.value })}
                placeholder="SP"
              />
            </div>
            <div>
              <Label>CEP</Label>
              <Input
                value={form.storeZipCode}
                onChange={(e) => setForm({ ...form, storeZipCode: e.target.value })}
                placeholder="00000-000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Config */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Entrega</CardTitle>
          <CardDescription>
            Tempos e valores mínimos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Pedido Mínimo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.minOrderValue}
                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Tempo de Preparo (min)</Label>
              <Input
                type="number"
                value={form.avgPrepTime}
                onChange={(e) => setForm({ ...form, avgPrepTime: e.target.value })}
                placeholder="30"
              />
            </div>
            <div>
              <Label>Tempo Máx. Entrega (min)</Label>
              <Input
                type="number"
                value={form.maxDeliveryTime}
                onChange={(e) => setForm({ ...form, maxDeliveryTime: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Aceitar troco em dinheiro</Label>
              <p className="text-sm text-slate-500">
                Permitir que o cliente informe troco para pagamento em dinheiro
              </p>
            </div>
            <Switch
              checked={form.acceptCashChange}
              onCheckedChange={(checked) => setForm({ ...form, acceptCashChange: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Cores do cardápio online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  placeholder="#ef4444"
                />
              </div>
            </div>
            <div>
              <Label>Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  placeholder="#fef2f2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
