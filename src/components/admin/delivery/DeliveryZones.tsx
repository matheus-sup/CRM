"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, MapPin, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  getStoreCoordinates,
} from "@/lib/actions/delivery";

// Load map dynamically to avoid SSR issues
const DeliveryZoneMap = dynamic(
  () => import("./DeliveryZoneMap").then((mod) => mod.DeliveryZoneMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-slate-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    ),
  }
);

type PolygonZone = {
  coordinates: [number, number][];
};

type DeliveryZone = {
  id: string;
  name: string;
  type: string;
  neighborhoods: string[];
  zipCodes: string[];
  radiusKm: number | null;
  centerLat: number | null;
  centerLng: number | null;
  coordinates: string | null;
  deliveryFee: number;
  freeDeliveryMin: number | null;
  estimatedTime: number;
  isActive: boolean;
};

export function DeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [saving, setSaving] = useState(false);
  const [storeCenter, setStoreCenter] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default

  const [form, setForm] = useState({
    name: "",
    deliveryFee: "",
    freeDeliveryMin: "",
    estimatedTime: "45",
  });

  const [mapZone, setMapZone] = useState<PolygonZone | null>(null);

  useEffect(() => {
    loadZones();
    loadStoreCoordinates();
  }, []);

  async function loadStoreCoordinates() {
    try {
      const coords = await getStoreCoordinates();
      if (coords && coords.lat && coords.lng) {
        setStoreCenter([coords.lat, coords.lng]);
      }
    } catch (error) {
      console.error("Error loading store coordinates:", error);
    }
  }

  async function loadZones() {
    try {
      const data = await getDeliveryZones();
      setZones(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  }

  function openDialog(zone?: DeliveryZone) {
    if (zone) {
      setEditingZone(zone);
      setForm({
        name: zone.name,
        deliveryFee: String(zone.deliveryFee),
        freeDeliveryMin: zone.freeDeliveryMin ? String(zone.freeDeliveryMin) : "",
        estimatedTime: String(zone.estimatedTime),
      });
      // Handle polygon data
      if (zone.type === "polygon" && zone.coordinates) {
        try {
          const coords = JSON.parse(zone.coordinates);
          setMapZone({ coordinates: coords });
        } catch {
          setMapZone(null);
        }
      } else if (zone.type === "circle" && zone.centerLat && zone.centerLng && zone.radiusKm) {
        // Convert legacy circle to a rough polygon (square approximation)
        const lat = Number(zone.centerLat);
        const lng = Number(zone.centerLng);
        const radiusKm = Number(zone.radiusKm);
        const latDiff = radiusKm / 111; // approx degrees
        const lngDiff = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
        setMapZone({
          coordinates: [
            [lat + latDiff, lng - lngDiff],
            [lat + latDiff, lng + lngDiff],
            [lat - latDiff, lng + lngDiff],
            [lat - latDiff, lng - lngDiff],
          ],
        });
      } else {
        setMapZone(null);
      }
    } else {
      setEditingZone(null);
      setForm({
        name: "",
        deliveryFee: "",
        freeDeliveryMin: "",
        estimatedTime: "45",
      });
      setMapZone(null);
    }
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.deliveryFee) {
      toast.error("Nome e taxa são obrigatórios");
      return;
    }

    if (!mapZone || !mapZone.coordinates || mapZone.coordinates.length < 3) {
      toast.error("Desenhe a área no mapa (mínimo 3 pontos)");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        type: "polygon",
        coordinates: JSON.stringify(mapZone.coordinates),
        deliveryFee: parseFloat(form.deliveryFee),
        freeDeliveryMin: form.freeDeliveryMin ? parseFloat(form.freeDeliveryMin) : undefined,
        estimatedTime: parseInt(form.estimatedTime) || 45,
      };

      if (editingZone) {
        await updateDeliveryZone(editingZone.id, data);
        toast.success("Área atualizada!");
      } else {
        await createDeliveryZone(data);
        toast.success("Área criada!");
      }
      setShowDialog(false);
      loadZones();
    } catch (error) {
      toast.error("Erro ao salvar área");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta área de entrega?")) return;

    try {
      await deleteDeliveryZone(id);
      toast.success("Área excluída!");
      loadZones();
    } catch (error) {
      toast.error("Erro ao excluir área");
    }
  }

  async function handleToggleActive(zone: DeliveryZone) {
    try {
      await updateDeliveryZone(zone.id, { isActive: !zone.isActive });
      loadZones();
    } catch (error) {
      toast.error("Erro ao alterar status");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Áreas de Entrega</h2>
          <p className="text-sm text-slate-500">
            Desenhe as áreas de entrega no mapa
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Área
        </Button>
      </div>

      {/* Map with all zones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Map className="w-4 h-4 text-red-600" />
            Mapa de Cobertura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryZoneMap
            initialCenter={storeCenter}
            initialZones={zones.map((z) => ({
              id: z.id,
              name: z.name,
              type: z.type,
              coordinates: z.coordinates || undefined,
              centerLat: z.centerLat ? Number(z.centerLat) : undefined,
              centerLng: z.centerLng ? Number(z.centerLng) : undefined,
              radiusKm: z.radiusKm ? Number(z.radiusKm) : undefined,
              deliveryFee: z.deliveryFee,
              isActive: z.isActive,
            }))}
            isEditing={false}
          />
        </CardContent>
      </Card>

      {/* Zones list */}
      {zones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhuma área de entrega configurada</p>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira área
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <Card key={zone.id} className={!zone.isActive ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    {zone.name}
                  </CardTitle>
                  <Switch
                    checked={zone.isActive}
                    onCheckedChange={() => handleToggleActive(zone)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {zone.type === "polygon" && zone.coordinates && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Área personalizada
                    </Badge>
                  </div>
                )}
                {zone.type === "circle" && zone.radiusKm && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Raio: {Number(zone.radiusKm).toFixed(1)} km
                    </Badge>
                  </div>
                )}

                {zone.neighborhoods && zone.neighborhoods.length > 0 && (
                  <div>
                    <span className="text-sm text-slate-500">Bairros:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {zone.neighborhoods.slice(0, 3).map((n, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {n}
                        </Badge>
                      ))}
                      {zone.neighborhoods.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{zone.neighborhoods.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Taxa de entrega:</span>
                  <span className="font-semibold">
                    {zone.deliveryFee === 0 ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      `R$ ${zone.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {zone.freeDeliveryMin && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Grátis acima de:</span>
                    <span className="font-medium text-green-600">
                      R$ {zone.freeDeliveryMin.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tempo estimado:</span>
                  <span className="font-medium">{zone.estimatedTime} min</span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDialog(zone)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(zone.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingZone ? "Editar Área" : "Nova Área de Entrega"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Nome da Área *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Centro, Zona Sul, 5km"
              />
            </div>

            {/* Map for defining zone */}
            <div>
              <Label className="mb-2 block">Área de Cobertura *</Label>
              <DeliveryZoneMap
                initialCenter={
                  mapZone?.coordinates?.[0] ||
                  (editingZone?.centerLat && editingZone?.centerLng
                    ? [Number(editingZone.centerLat), Number(editingZone.centerLng)]
                    : storeCenter)
                }
                initialZones={zones
                  .filter((z) => z.id !== editingZone?.id)
                  .map((z) => ({
                    id: z.id,
                    name: z.name,
                    type: z.type,
                    coordinates: z.coordinates || undefined,
                    centerLat: z.centerLat ? Number(z.centerLat) : undefined,
                    centerLng: z.centerLng ? Number(z.centerLng) : undefined,
                    radiusKm: z.radiusKm ? Number(z.radiusKm) : undefined,
                    deliveryFee: z.deliveryFee,
                    isActive: z.isActive,
                  }))}
                isEditing={true}
                editingZone={mapZone}
                onEditingZoneChange={setMapZone}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Taxa de Entrega (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                  placeholder="5.00"
                />
              </div>
              <div>
                <Label>Grátis acima de (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.freeDeliveryMin}
                  onChange={(e) => setForm({ ...form, freeDeliveryMin: e.target.value })}
                  placeholder="50.00"
                />
              </div>
            </div>
            <div>
              <Label>Tempo estimado (minutos)</Label>
              <Input
                type="number"
                value={form.estimatedTime}
                onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                placeholder="45"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
