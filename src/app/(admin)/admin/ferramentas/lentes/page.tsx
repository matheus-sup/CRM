"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Palette,
  Settings,
  Layers,
  Sparkles,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getLensConfig,
  updateLensConfig,
  getAllLensTypes,
  createLensType,
  updateLensType,
  deleteLensType,
  getAllLensThicknesses,
  createLensThickness,
  updateLensThickness,
  deleteLensThickness,
  getAllLensTreatments,
  createLensTreatment,
  updateLensTreatment,
  deleteLensTreatment,
  seedLensData,
} from "@/lib/actions/lens";

export default function LensConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Config state
  const [config, setConfig] = useState({
    modalTitle: "Selecione sua Lente",
    modalSubtitle: "",
    primaryColor: "#1f2937",
    accentColor: "#3b82f6",
    backgroundColor: "#ffffff",
    cardBorderColor: "#e5e7eb",
    cardHoverBorderColor: "#3b82f6",
    selectedBorderColor: "#3b82f6",
    priceColor: "#059669",
    enableGradeLens: true,
    enableNoGradeLens: true,
    requireTreatment: false,
    gradeDiscount: 15,
    gradeDiscountLabel: "15% Off em todas as Lentes",
  });

  // Data state
  const [types, setTypes] = useState<any[]>([]);
  const [thicknesses, setThicknesses] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);

  // Modal state
  const [typeDialog, setTypeDialog] = useState(false);
  const [thicknessDialog, setThicknessDialog] = useState(false);
  const [treatmentDialog, setTreatmentDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form state
  const [typeForm, setTypeForm] = useState({
    slug: "",
    name: "",
    description: "",
    iconUrl: "",
    price: 0,
    requiresThickness: true,
    requiresTreatment: true,
  });

  const [thicknessForm, setThicknessForm] = useState({
    lensTypeId: "",
    name: "",
    index: "",
    description: "",
    sphericalRange: "",
    cylindricalRange: "",
    price: 0,
    iconUrl: "",
  });

  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    description: "",
    price: 0,
    iconUrl: "",
    features: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [configData, typesData, thicknessesData, treatmentsData] = await Promise.all([
        getLensConfig(),
        getAllLensTypes(),
        getAllLensThicknesses(),
        getAllLensTreatments(),
      ]);

      if (configData) {
        setConfig({
          modalTitle: configData.modalTitle,
          modalSubtitle: configData.modalSubtitle,
          primaryColor: configData.primaryColor,
          accentColor: configData.accentColor,
          backgroundColor: configData.backgroundColor,
          cardBorderColor: configData.cardBorderColor,
          cardHoverBorderColor: configData.cardHoverBorderColor,
          selectedBorderColor: configData.selectedBorderColor,
          priceColor: configData.priceColor,
          enableGradeLens: configData.enableGradeLens,
          enableNoGradeLens: configData.enableNoGradeLens,
          requireTreatment: configData.requireTreatment,
          gradeDiscount: Number(configData.gradeDiscount) || 0,
          gradeDiscountLabel: configData.gradeDiscountLabel,
        });
      }

      setTypes(typesData);
      setThicknesses(thicknessesData);
      setTreatments(treatmentsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig() {
    setSaving(true);
    try {
      await updateLensConfig(config);
      toast.success("Configuracoes salvas com sucesso!");
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.error("Erro ao salvar configuracoes");
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedData() {
    setSaving(true);
    try {
      await seedLensData();
      await loadData();
      toast.success("Dados de exemplo criados com sucesso!");
    } catch (error) {
      console.error("Failed to seed data:", error);
      toast.error("Erro ao criar dados de exemplo");
    } finally {
      setSaving(false);
    }
  }

  // Type CRUD
  function openTypeDialog(item?: any) {
    if (item) {
      setEditingItem(item);
      setTypeForm({
        slug: item.slug,
        name: item.name,
        description: item.description || "",
        iconUrl: item.iconUrl || "",
        price: Number(item.price) || 0,
        requiresThickness: item.requiresThickness,
        requiresTreatment: item.requiresTreatment,
      });
    } else {
      setEditingItem(null);
      setTypeForm({
        slug: "",
        name: "",
        description: "",
        iconUrl: "",
        price: 0,
        requiresThickness: true,
        requiresTreatment: true,
      });
    }
    setTypeDialog(true);
  }

  async function handleSaveType() {
    setSaving(true);
    try {
      if (editingItem) {
        await updateLensType(editingItem.id, typeForm);
      } else {
        await createLensType(typeForm);
      }
      setTypeDialog(false);
      await loadData();
      toast.success(editingItem ? "Tipo atualizado!" : "Tipo criado!");
    } catch (error) {
      console.error("Failed to save type:", error);
      toast.error("Erro ao salvar tipo");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteType(id: string) {
    if (!confirm("Tem certeza que deseja excluir este tipo de lente?")) return;
    try {
      await deleteLensType(id);
      await loadData();
      toast.success("Tipo excluido!");
    } catch (error) {
      console.error("Failed to delete type:", error);
      toast.error("Erro ao excluir tipo");
    }
  }

  // Thickness CRUD
  function openThicknessDialog(item?: any) {
    if (item) {
      setEditingItem(item);
      setThicknessForm({
        lensTypeId: item.lensTypeId || "",
        name: item.name,
        index: item.index,
        description: item.description || "",
        sphericalRange: item.sphericalRange || "",
        cylindricalRange: item.cylindricalRange || "",
        price: Number(item.price) || 0,
        iconUrl: item.iconUrl || "",
      });
    } else {
      setEditingItem(null);
      setThicknessForm({
        lensTypeId: types[0]?.id || "",
        name: "",
        index: "",
        description: "",
        sphericalRange: "",
        cylindricalRange: "",
        price: 0,
        iconUrl: "",
      });
    }
    setThicknessDialog(true);
  }

  async function handleSaveThickness() {
    setSaving(true);
    try {
      if (editingItem) {
        await updateLensThickness(editingItem.id, thicknessForm);
      } else {
        await createLensThickness(thicknessForm);
      }
      setThicknessDialog(false);
      await loadData();
      toast.success(editingItem ? "Espessura atualizada!" : "Espessura criada!");
    } catch (error) {
      console.error("Failed to save thickness:", error);
      toast.error("Erro ao salvar espessura");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteThickness(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta espessura?")) return;
    try {
      await deleteLensThickness(id);
      await loadData();
      toast.success("Espessura excluida!");
    } catch (error) {
      console.error("Failed to delete thickness:", error);
      toast.error("Erro ao excluir espessura");
    }
  }

  // Treatment CRUD
  function openTreatmentDialog(item?: any) {
    if (item) {
      setEditingItem(item);
      const features = item.features ? JSON.parse(item.features) : [];
      setTreatmentForm({
        name: item.name,
        description: item.description || "",
        price: Number(item.price) || 0,
        iconUrl: item.iconUrl || "",
        features: features.join(", "),
      });
    } else {
      setEditingItem(null);
      setTreatmentForm({
        name: "",
        description: "",
        price: 0,
        iconUrl: "",
        features: "",
      });
    }
    setTreatmentDialog(true);
  }

  async function handleSaveTreatment() {
    setSaving(true);
    try {
      const data = {
        ...treatmentForm,
        features: treatmentForm.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editingItem) {
        await updateLensTreatment(editingItem.id, data);
      } else {
        await createLensTreatment(data);
      }
      setTreatmentDialog(false);
      await loadData();
      toast.success(editingItem ? "Tratamento atualizado!" : "Tratamento criado!");
    } catch (error) {
      console.error("Failed to save treatment:", error);
      toast.error("Erro ao salvar tratamento");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTreatment(id: string) {
    if (!confirm("Tem certeza que deseja excluir este tratamento?")) return;
    try {
      await deleteLensTreatment(id);
      await loadData();
      toast.success("Tratamento excluido!");
    } catch (error) {
      console.error("Failed to delete treatment:", error);
      toast.error("Erro ao excluir tratamento");
    }
  }

  function formatPrice(value: number | any) {
    const num = Number(value) || 0;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/ferramentas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Venda de Lentes - Oticas</h1>
            <p className="text-gray-500">
              Configure as opcoes de lentes para seus produtos de oculos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {types.length === 0 && (
            <Button variant="outline" onClick={handleSeedData} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar Dados de Exemplo
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuracoes
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tipos de Lente
          </TabsTrigger>
          <TabsTrigger value="thicknesses" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Espessuras
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Tratamentos
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Cores
          </TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuracoes Gerais</CardTitle>
              <CardDescription>
                Configure os textos e comportamentos do modal de selecao de lentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titulo do Modal</Label>
                  <Input
                    value={config.modalTitle}
                    onChange={(e) =>
                      setConfig({ ...config, modalTitle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label de Desconto (Lentes com Grau)</Label>
                  <Input
                    value={config.gradeDiscountLabel}
                    onChange={(e) =>
                      setConfig({ ...config, gradeDiscountLabel: e.target.value })
                    }
                    placeholder="15% Off em todas as Lentes"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtitulo do Modal</Label>
                <Textarea
                  value={config.modalSubtitle}
                  onChange={(e) =>
                    setConfig({ ...config, modalSubtitle: e.target.value })
                  }
                  placeholder="Fique tranquilo(a)! Sua receita pode ser enviada apos a finalizacao do pedido..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Lentes com Grau</Label>
                    <p className="text-sm text-gray-500">
                      Habilitar opcao de lentes com grau
                    </p>
                  </div>
                  <Switch
                    checked={config.enableGradeLens}
                    onCheckedChange={(v) =>
                      setConfig({ ...config, enableGradeLens: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Lentes Sem Grau</Label>
                    <p className="text-sm text-gray-500">
                      Habilitar opcao de lentes sem grau
                    </p>
                  </div>
                  <Switch
                    checked={config.enableNoGradeLens}
                    onCheckedChange={(v) =>
                      setConfig({ ...config, enableNoGradeLens: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Tratamento Obrigatorio</Label>
                    <p className="text-sm text-gray-500">
                      Exigir selecao de tratamento
                    </p>
                  </div>
                  <Switch
                    checked={config.requireTreatment}
                    onCheckedChange={(v) =>
                      setConfig({ ...config, requireTreatment: v })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveConfig} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configuracoes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Lente</CardTitle>
                <CardDescription>
                  Opcoes principais: Com Grau ou Sem Grau
                </CardDescription>
              </div>
              <Button onClick={() => openTypeDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Requer Espessura</TableHead>
                    <TableHead>Requer Tratamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="text-gray-500">{type.slug}</TableCell>
                      <TableCell>{formatPrice(type.price)}</TableCell>
                      <TableCell>{type.requiresThickness ? "Sim" : "Nao"}</TableCell>
                      <TableCell>{type.requiresTreatment ? "Sim" : "Nao"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            type.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {type.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openTypeDialog(type)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteType(type.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {types.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Nenhum tipo cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thicknesses Tab */}
        <TabsContent value="thicknesses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Espessuras de Lente</CardTitle>
                <CardDescription>
                  Normal 1.56, Fina 1.59, Super Fina 1.67, Extra Fina 1.74
                </CardDescription>
              </div>
              <Button onClick={() => openThicknessDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Indice</TableHead>
                    <TableHead>Esferica</TableHead>
                    <TableHead>Cilindrica</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thicknesses.map((thickness) => (
                    <TableRow key={thickness.id}>
                      <TableCell className="font-medium">{thickness.name}</TableCell>
                      <TableCell>{thickness.index}</TableCell>
                      <TableCell>{thickness.sphericalRange || "-"}</TableCell>
                      <TableCell>{thickness.cylindricalRange || "-"}</TableCell>
                      <TableCell>{formatPrice(thickness.price)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            thickness.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {thickness.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openThicknessDialog(thickness)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteThickness(thickness.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {thicknesses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Nenhuma espessura cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tratamentos</CardTitle>
                <CardDescription>
                  Anti-reflexo, Filtro de Luz Azul, etc.
                </CardDescription>
              </div>
              <Button onClick={() => openTreatmentDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">{treatment.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {treatment.description || "-"}
                      </TableCell>
                      <TableCell>{formatPrice(treatment.price)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            treatment.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {treatment.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openTreatmentDialog(treatment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTreatment(treatment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {treatments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        Nenhum tratamento cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Cores e Estilizacao</CardTitle>
              <CardDescription>
                Personalize as cores do modal de selecao de lentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cor Principal (Botoes)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) =>
                        setConfig({ ...config, accentColor: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={(e) =>
                        setConfig({ ...config, accentColor: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) =>
                        setConfig({ ...config, backgroundColor: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) =>
                        setConfig({ ...config, backgroundColor: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Borda dos Cards</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.cardBorderColor}
                      onChange={(e) =>
                        setConfig({ ...config, cardBorderColor: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.cardBorderColor}
                      onChange={(e) =>
                        setConfig({ ...config, cardBorderColor: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Borda Selecionada</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.selectedBorderColor}
                      onChange={(e) =>
                        setConfig({ ...config, selectedBorderColor: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.selectedBorderColor}
                      onChange={(e) =>
                        setConfig({ ...config, selectedBorderColor: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor de Precos</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.priceColor}
                      onChange={(e) =>
                        setConfig({ ...config, priceColor: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.priceColor}
                      onChange={(e) =>
                        setConfig({ ...config, priceColor: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-6 mt-6">
                <h3 className="font-semibold mb-4">Preview</h3>
                <div
                  className="p-4 rounded-lg border-2"
                  style={{
                    backgroundColor: config.backgroundColor,
                    borderColor: config.cardBorderColor,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Exemplo de Opcao</h4>
                      <p className="text-sm text-gray-500">Descricao da opcao</p>
                    </div>
                    <span style={{ color: config.priceColor }} className="font-semibold">
                      +R$ 100,00
                    </span>
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg border-2 mt-2"
                  style={{
                    backgroundColor: config.backgroundColor,
                    borderColor: config.selectedBorderColor,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Opcao Selecionada</h4>
                      <p className="text-sm text-gray-500">Esta opcao esta selecionada</p>
                    </div>
                    <span style={{ color: config.priceColor }} className="font-semibold">
                      +R$ 150,00
                    </span>
                  </div>
                </div>
                <Button
                  className="mt-4"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Adicionar ao carrinho
                </Button>
              </div>

              <Button onClick={handleSaveConfig} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Cores
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Type Dialog */}
      <Dialog open={typeDialog} onOpenChange={setTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Tipo de Lente" : "Novo Tipo de Lente"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do tipo de lente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={typeForm.name}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, name: e.target.value })
                  }
                  placeholder="Grau"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={typeForm.slug}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, slug: e.target.value })
                  }
                  placeholder="grau"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                value={typeForm.description}
                onChange={(e) =>
                  setTypeForm({ ...typeForm, description: e.target.value })
                }
                placeholder="Para perto ou longe..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preco Adicional</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={typeForm.price}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL do Icone</Label>
                <Input
                  value={typeForm.iconUrl}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, iconUrl: e.target.value })
                  }
                  placeholder="/icons/glasses.svg"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={typeForm.requiresThickness}
                  onCheckedChange={(v) =>
                    setTypeForm({ ...typeForm, requiresThickness: v })
                  }
                />
                <Label>Requer Espessura</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={typeForm.requiresTreatment}
                  onCheckedChange={(v) =>
                    setTypeForm({ ...typeForm, requiresTreatment: v })
                  }
                />
                <Label>Requer Tratamento</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTypeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveType} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thickness Dialog */}
      <Dialog open={thicknessDialog} onOpenChange={setThicknessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Espessura" : "Nova Espessura"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes da espessura de lente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={thicknessForm.name}
                  onChange={(e) =>
                    setThicknessForm({ ...thicknessForm, name: e.target.value })
                  }
                  placeholder="Normal"
                />
              </div>
              <div className="space-y-2">
                <Label>Indice de Refracao</Label>
                <Input
                  value={thicknessForm.index}
                  onChange={(e) =>
                    setThicknessForm({ ...thicknessForm, index: e.target.value })
                  }
                  placeholder="1.56"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                value={thicknessForm.description}
                onChange={(e) =>
                  setThicknessForm({ ...thicknessForm, description: e.target.value })
                }
                placeholder="Lentes com espessura padrao..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Esferica (Grau)</Label>
                <Input
                  value={thicknessForm.sphericalRange}
                  onChange={(e) =>
                    setThicknessForm({ ...thicknessForm, sphericalRange: e.target.value })
                  }
                  placeholder="+/- 4.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Cilindrica</Label>
                <Input
                  value={thicknessForm.cylindricalRange}
                  onChange={(e) =>
                    setThicknessForm({ ...thicknessForm, cylindricalRange: e.target.value })
                  }
                  placeholder="-2.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Preco</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={thicknessForm.price}
                  onChange={(e) =>
                    setThicknessForm({
                      ...thicknessForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Lente</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={thicknessForm.lensTypeId}
                onChange={(e) =>
                  setThicknessForm({ ...thicknessForm, lensTypeId: e.target.value })
                }
              >
                <option value="">Selecione...</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThicknessDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveThickness} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treatment Dialog */}
      <Dialog open={treatmentDialog} onOpenChange={setTreatmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Tratamento" : "Novo Tratamento"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do tratamento de lente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={treatmentForm.name}
                  onChange={(e) =>
                    setTreatmentForm({ ...treatmentForm, name: e.target.value })
                  }
                  placeholder="Filtro de Luz Azul"
                />
              </div>
              <div className="space-y-2">
                <Label>Preco</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={treatmentForm.price}
                  onChange={(e) =>
                    setTreatmentForm({
                      ...treatmentForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                value={treatmentForm.description}
                onChange={(e) =>
                  setTreatmentForm({ ...treatmentForm, description: e.target.value })
                }
                placeholder="Filtra a luz azul nociva..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Beneficios (separados por virgula)</Label>
              <Input
                value={treatmentForm.features}
                onChange={(e) =>
                  setTreatmentForm({ ...treatmentForm, features: e.target.value })
                }
                placeholder="Antireflexo, Protecao UV, Filtra luz azul"
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Icone</Label>
              <Input
                value={treatmentForm.iconUrl}
                onChange={(e) =>
                  setTreatmentForm({ ...treatmentForm, iconUrl: e.target.value })
                }
                placeholder="/icons/shield.svg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTreatmentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTreatment} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
