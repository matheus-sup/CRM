"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServices, getAvailableSlots, createAppointment, seedDefaultService } from "@/lib/actions/scheduling";

interface SchedulingBlockProps {
  content: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    primaryColor?: string;
  };
  styles: any;
  isAdmin?: boolean;
}

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

type BookingStep = "service" | "date" | "time" | "form" | "confirmation";

// Formata data no timezone local (evita problema de UTC)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SchedulingBlock({ content, styles, isAdmin }: SchedulingBlockProps) {
  const [step, setStep] = useState<BookingStep>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Booking state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Confirmation
  const [appointmentCode, setAppointmentCode] = useState<string | null>(null);

  const primaryColor = content.primaryColor || styles?.buttonColor || "#3b82f6";

  // Settings state
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);

  // Load services and settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Seed default service if none exist
        await seedDefaultService();
        const [servicesData, settingsData] = await Promise.all([
          getServices(),
          import("@/lib/actions/scheduling").then((m) => m.getScheduleSettings()),
        ]);
        setServices(servicesData);
        setMaxAdvanceDays(settingsData.maxAdvanceDays || 30);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load available slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !selectedService) return;

      setLoadingSlots(true);
      try {
        const dateStr = formatLocalDate(selectedDate);
        const slots = await getAvailableSlots(dateStr, selectedService.id);
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error loading slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedDate, selectedService]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("date");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const dateStr = formatLocalDate(selectedDate);
      const appointment = await createAppointment({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        serviceId: selectedService.id,
        date: dateStr,
        startTime: selectedTime,
        notes: notes || undefined,
      });

      setAppointmentCode(appointment.code);
      setStep("confirmation");
    } catch (error: any) {
      alert(error.message || "Erro ao criar agendamento");
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep("service");
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setAppointmentCode(null);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: styles?.headingColor }}>
          {content.title || "Agende seu Horário"}
        </h2>
        {content.subtitle && (
          <p className="text-gray-600">{content.subtitle}</p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {(["service", "date", "time", "form"] as BookingStep[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s || ["service", "date", "time", "form"].indexOf(step) > i
                  ? "text-white"
                  : "bg-gray-200 text-gray-500"
              )}
              style={{
                backgroundColor:
                  step === s || ["service", "date", "time", "form"].indexOf(step) > i
                    ? primaryColor
                    : undefined,
              }}
            >
              {["service", "date", "time", "form"].indexOf(step) > i ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div
                className={cn(
                  "w-12 h-1 mx-1",
                  ["service", "date", "time", "form"].indexOf(step) > i
                    ? ""
                    : "bg-gray-200"
                )}
                style={{
                  backgroundColor:
                    ["service", "date", "time", "form"].indexOf(step) > i
                      ? primaryColor
                      : undefined,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 min-h-[300px]">
        {/* Service Selection */}
        {step === "service" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Escolha o Serviço
            </h3>
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {isAdmin
                  ? "Nenhum serviço cadastrado. Configure os serviços em Configurações > Agendamentos."
                  : "Nenhum serviço disponível no momento."}
              </p>
            ) : (
              <div className="grid gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full p-4 rounded-xl border-2 text-left hover:shadow-md transition-all flex items-center justify-between group"
                    style={{
                      borderColor: selectedService?.id === service.id ? primaryColor : "#e5e7eb",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-12 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500">{service.description}</div>
                        )}
                        <div className="text-sm text-gray-400 mt-1">
                          {service.duration} minutos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: primaryColor }}>
                        {service.price > 0
                          ? `R$ ${service.price.toFixed(2)}`
                          : "Grátis"}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Selection */}
        {step === "date" && (
          <div>
            <button
              onClick={() => setStep("service")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Escolha a Data
            </h3>
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              primaryColor={primaryColor}
              maxAdvanceDays={maxAdvanceDays}
            />
          </div>
        )}

        {/* Time Selection */}
        {step === "time" && (
          <div>
            <button
              onClick={() => setStep("date")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Escolha o Horário
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedDate?.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum horário disponível nesta data.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                      slot.available
                        ? "border-2 hover:shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                    )}
                    style={{
                      borderColor: slot.available
                        ? selectedTime === slot.time
                          ? primaryColor
                          : "#e5e7eb"
                        : undefined,
                      backgroundColor:
                        selectedTime === slot.time ? primaryColor : undefined,
                      color: selectedTime === slot.time ? "white" : undefined,
                    }}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Form */}
        {step === "form" && (
          <div>
            <button
              onClick={() => setStep("time")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Seus Dados
            </h3>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Serviço:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Data:</span>
                <span className="font-medium">
                  {selectedDate?.toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Horário:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                <span className="text-gray-500">Valor:</span>
                <span className="font-bold" style={{ color: primaryColor }}>
                  {selectedService && selectedService.price > 0
                    ? `R$ ${selectedService.price.toFixed(2)}`
                    : "Grátis"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
                    style={{ borderColor: "#e5e7eb", focusRing: primaryColor } as any}
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone/WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail (opcional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Alguma informação adicional..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  content.buttonText || "Confirmar Agendamento"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Confirmation */}
        {step === "confirmation" && (
          <div className="text-center py-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Check className="w-10 h-10" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Agendamento Confirmado!
            </h3>
            <p className="text-gray-500 mb-6">
              Seu agendamento foi realizado com sucesso.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-6">
              <div className="text-sm text-gray-500 mb-1">Código do agendamento</div>
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                {appointmentCode}
              </div>
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Serviço:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Horário:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>

            <button
              onClick={resetBooking}
              className="px-6 py-3 rounded-lg border-2 font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Fazer Novo Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini Calendar Component
function MiniCalendar({
  selectedDate,
  onSelectDate,
  primaryColor,
  maxAdvanceDays = 30,
}: {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  primaryColor: string;
  maxAdvanceDays?: number;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateSelectable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date >= today && date <= maxDate;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getDate() === day &&
      now.getMonth() === currentMonth.getMonth() &&
      now.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg capitalize">
          {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => {
                  if (isDateSelectable(day)) {
                    onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                  }
                }}
                disabled={!isDateSelectable(day)}
                className={cn(
                  "w-full h-full rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                  isDateSelectable(day)
                    ? "hover:bg-gray-100 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed",
                  isToday(day) && !isSelected(day) && "ring-2 ring-inset",
                  isSelected(day) && "text-white"
                )}
                style={{
                  backgroundColor: isSelected(day) ? primaryColor : undefined,
                  ringColor: isToday(day) ? primaryColor : undefined,
                }}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
