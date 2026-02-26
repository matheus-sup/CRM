"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Settings,
  MoreVertical,
  AlertCircle,
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAppointments,
  getServices,
  createService,
  updateService,
  deleteService,
  updateAppointmentStatus,
  getScheduleSettings,
  updateScheduleSettings,
} from "@/lib/actions/scheduling";

type Appointment = {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  price: number;
  notes: string | null;
  service: {
    id: string;
    name: string;
    color: string;
    price: number;
  };
  provider: {
    id: string;
    name: string;
  } | null;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
  isActive: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pendente", color: "text-amber-700", bg: "bg-amber-100" },
  CONFIRMED: { label: "Confirmado", color: "text-blue-700", bg: "bg-blue-100" },
  COMPLETED: { label: "Concluído", color: "text-green-700", bg: "bg-green-100" },
  CANCELLED: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100" },
  NO_SHOW: { label: "Não compareceu", color: "text-gray-700", bg: "bg-gray-100" },
};

export default function AgendamentosPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");

  // Service Dialog
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceDuration, setServiceDuration] = useState(60);
  const [servicePrice, setServicePrice] = useState(0);
  const [serviceColor, setServiceColor] = useState("#3b82f6");
  const [savingService, setSavingService] = useState(false);

  // Settings Dialog
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState<{
    slotDuration: number;
    bufferTime: number;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    workingHours: { day: number; start: string; end: string; enabled: boolean }[];
  }>({
    slotDuration: 30,
    bufferTime: 0,
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    workingHours: [
      { day: 0, start: "09:00", end: "18:00", enabled: false }, // Domingo
      { day: 1, start: "09:00", end: "18:00", enabled: true },  // Segunda
      { day: 2, start: "09:00", end: "18:00", enabled: true },  // Terça
      { day: 3, start: "09:00", end: "18:00", enabled: true },  // Quarta
      { day: 4, start: "09:00", end: "18:00", enabled: true },  // Quinta
      { day: 5, start: "09:00", end: "18:00", enabled: true },  // Sexta
      { day: 6, start: "09:00", end: "18:00", enabled: false }, // Sábado
    ],
  });

  const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  useEffect(() => {
    loadData();
    loadSettings();
  }, [selectedDate]);

  async function loadSettings() {
    try {
      const data = await getScheduleSettings();
      const workingHoursData = data.workingHours as { day: number; start: string; end: string }[];

      // Map to include enabled flag
      const mappedHours = [0, 1, 2, 3, 4, 5, 6].map((day) => {
        const found = workingHoursData.find((wh) => wh.day === day);
        return found
          ? { ...found, enabled: true }
          : { day, start: "09:00", end: "18:00", enabled: false };
      });

      setSettings({
        slotDuration: data.slotDuration,
        bufferTime: data.bufferTime,
        minAdvanceHours: data.minAdvanceHours,
        maxAdvanceDays: data.maxAdvanceDays,
        workingHours: mappedHours,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const enabledHours = settings.workingHours
        .filter((wh) => wh.enabled)
        .map(({ day, start, end }) => ({ day, start, end }));

      await updateScheduleSettings({
        slotDuration: settings.slotDuration,
        bufferTime: settings.bufferTime,
        minAdvanceHours: settings.minAdvanceHours,
        maxAdvanceDays: settings.maxAdvanceDays,
        workingHours: enabledHours,
      });
      toast.success("Configurações salvas com sucesso!");
      setSettingsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSavingSettings(false);
    }
  }

  function updateWorkingHour(day: number, field: "start" | "end" | "enabled", value: string | boolean) {
    setSettings((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((wh) =>
        wh.day === day ? { ...wh, [field]: value } : wh
      ),
    }));
  }

  async function loadData() {
    setLoading(true);
    try {
      const [appointmentsData, servicesData] = await Promise.all([
        getAppointments({ date: selectedDate }),
        getServices(),
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(appointmentId: string, status: string) {
    try {
      await updateAppointmentStatus(appointmentId, status as any);
      toast.success("Status atualizado");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    }
  }

  function openCancelDialog(id: string) {
    setCancellingId(id);
    setCancelReason("");
    setCancelDialogOpen(true);
  }

  async function handleCancelWithReason() {
    if (!cancellingId) return;

    setCancelling(true);
    try {
      await updateAppointmentStatus(cancellingId, "CANCELLED", cancelReason || undefined);
      toast.success("Agendamento cancelado");
      setCancelDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar");
    } finally {
      setCancelling(false);
    }
  }

  async function handleSaveService() {
    if (!serviceName.trim()) {
      toast.error("Nome do serviço é obrigatório");
      return;
    }

    setSavingService(true);
    try {
      if (editingService) {
        await updateService(editingService.id, {
          name: serviceName,
          description: serviceDescription || undefined,
          duration: serviceDuration,
          price: servicePrice,
          color: serviceColor,
        });
        toast.success("Serviço atualizado");
      } else {
        await createService({
          name: serviceName,
          description: serviceDescription || undefined,
          duration: serviceDuration,
          price: servicePrice,
          color: serviceColor,
        });
        toast.success("Serviço criado");
      }
      setServiceDialogOpen(false);
      resetServiceForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar serviço");
    } finally {
      setSavingService(false);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      await deleteService(id);
      toast.success("Serviço excluído");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir serviço");
    }
  }

  function resetServiceForm() {
    setEditingService(null);
    setServiceName("");
    setServiceDescription("");
    setServiceDuration(60);
    setServicePrice(0);
    setServiceColor("#3b82f6");
  }

  function openEditService(service: Service) {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description || "");
    setServiceDuration(service.duration);
    setServicePrice(service.price);
    setServiceColor(service.color);
    setServiceDialogOpen(true);
  }

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Generate time slots for the day view (8am to 8pm)
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${String(hour).padStart(2, "0")}:00`);
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agendamentos</h1>
              <p className="text-slate-500 text-sm">
                Gerencie seus agendamentos e serviços
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button
              onClick={() => {
                resetServiceForm();
                setServiceDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Services Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Serviços</CardTitle>
                <CardDescription>
                  {services.length} serviço(s) cadastrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {services.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum serviço cadastrado
                  </p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                          <span className="font-medium text-sm">
                            {service.name}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditService(service)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>{service.duration} min</span>
                        <span>R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Resumo do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-bold">{appointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Confirmados</span>
                    <span className="font-medium text-blue-600">
                      {appointments.filter((a) => a.status === "CONFIRMED").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Concluídos</span>
                    <span className="font-medium text-green-600">
                      {appointments.filter((a) => a.status === "COMPLETED").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Receita prevista
                    </span>
                    <span className="font-bold text-green-600">
                      R$ {appointments
                        .filter((a) => a.status !== "CANCELLED")
                        .reduce((sum, a) => sum + a.price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    const link = `${window.location.origin}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Link copiado!");
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar link da loja
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => window.open("/", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver página de agendamento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={prevDay}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={nextDay}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {selectedDate.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </CardTitle>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoje
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                    <Calendar className="w-12 h-12 mb-4 opacity-50" />
                    <p>Nenhum agendamento nesta data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              {/* Time */}
                              <div className="text-center min-w-[60px]">
                                <div className="text-lg font-bold text-gray-900">
                                  {appointment.startTime}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {appointment.duration} min
                                </div>
                              </div>

                              {/* Service Color Bar */}
                              <div
                                className="w-1 h-16 rounded-full"
                                style={{ backgroundColor: appointment.service.color }}
                              />

                              {/* Details */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">
                                    {appointment.customerName}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">
                                    {appointment.code}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {appointment.service.name}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {appointment.customerPhone}
                                  </span>
                                  {appointment.customerEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {appointment.customerEmail}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  STATUS_CONFIG[appointment.status]?.bg,
                                  STATUS_CONFIG[appointment.status]?.color
                                )}
                              >
                                {STATUS_CONFIG[appointment.status]?.label}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(appointment.id, "CONFIRMED")
                                    }
                                  >
                                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                                    Confirmar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(appointment.id, "COMPLETED")
                                    }
                                  >
                                    <Check className="w-4 h-4 mr-2 text-green-600" />
                                    Concluir
                                  </DropdownMenuItem>
                                  {/* Só mostra "Não compareceu" se o horário já passou */}
                                  {(() => {
                                    const appointmentDateTime = new Date(appointment.date);
                                    const [hours, minutes] = appointment.endTime.split(":").map(Number);
                                    appointmentDateTime.setHours(hours, minutes, 0, 0);
                                    return appointmentDateTime < new Date();
                                  })() && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(appointment.id, "NO_SHOW")
                                      }
                                    >
                                      <AlertCircle className="w-4 h-4 mr-2 text-gray-600" />
                                      Não compareceu
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => openCancelDialog(appointment.id)}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Notes */}
                          {appointment.notes && (
                            <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                              <strong>Obs:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Nome do serviço *</Label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Ex: Consulta, Corte de cabelo"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Descrição (opcional)</Label>
              <Input
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Breve descrição do serviço"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Duração (min) *</Label>
                <Input
                  type="number"
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(Number(e.target.value))}
                  min={15}
                  step={15}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Preço (R$)</Label>
                <Input
                  type="number"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  min={0}
                  step={0.01}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Cor</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={serviceColor}
                  onChange={(e) => setServiceColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Input
                  value={serviceColor}
                  onChange={(e) => setServiceColor(e.target.value)}
                  className="w-24 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setServiceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveService} disabled={savingService}>
              {savingService && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingService ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog - Complete */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações de Agendamento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
            {/* Horários de Funcionamento */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Horários de Funcionamento</Label>
              <div className="space-y-2">
                {settings.workingHours.map((wh) => (
                  <div
                    key={wh.day}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border transition-colors",
                      wh.enabled ? "bg-white" : "bg-gray-50"
                    )}
                  >
                    <Switch
                      checked={wh.enabled}
                      onCheckedChange={(checked) => updateWorkingHour(wh.day, "enabled", checked)}
                    />
                    <span className={cn("w-20 text-sm font-medium", !wh.enabled && "text-gray-400")}>
                      {DAY_NAMES[wh.day]}
                    </span>
                    {wh.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={wh.start}
                          onChange={(e) => updateWorkingHour(wh.day, "start", e.target.value)}
                          className="h-8 text-sm w-24"
                        />
                        <span className="text-gray-400 text-sm">até</span>
                        <Input
                          type="time"
                          value={wh.end}
                          onChange={(e) => updateWorkingHour(wh.day, "end", e.target.value)}
                          className="h-8 text-sm w-24"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Regras de Agendamento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Intervalo entre horários</Label>
                <Select
                  value={String(settings.slotDuration)}
                  onValueChange={(v) => setSettings((p) => ({ ...p, slotDuration: Number(v) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Buffer entre agendamentos</Label>
                <Select
                  value={String(settings.bufferTime)}
                  onValueChange={(v) => setSettings((p) => ({ ...p, bufferTime: Number(v) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem buffer</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Antecedência mínima</Label>
                <Select
                  value={String(settings.minAdvanceHours)}
                  onValueChange={(v) => setSettings((p) => ({ ...p, minAdvanceHours: Number(v) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem mínimo</SelectItem>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="12">12 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Agendar com até</Label>
                <Select
                  value={String(settings.maxAdvanceDays)}
                  onValueChange={(v) => setSettings((p) => ({ ...p, maxAdvanceDays: Number(v) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Como funciona:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs">
                    <li>Horários são exibidos a cada <strong>{settings.slotDuration} min</strong></li>
                    <li>Horários ocupados são bloqueados automaticamente</li>
                    <li>Clientes só agendam com {settings.minAdvanceHours}h+ de antecedência</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Cancelar Agendamento
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label className="text-sm">Motivo do cancelamento (opcional)</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Cliente solicitou cancelamento"
              rows={2}
              className="mt-1"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelWithReason}
              disabled={cancelling}
            >
              {cancelling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
