"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// SCHEDULING SETTINGS
// =============================================================================

export async function getScheduleSettings() {
  let settings = await prisma.scheduleSettings.findUnique({
    where: { id: "schedule-settings" },
  });

  if (!settings) {
    settings = await prisma.scheduleSettings.create({
      data: { id: "schedule-settings" },
    });
  }

  return {
    ...settings,
    workingHours: JSON.parse(settings.workingHours),
  };
}

export async function updateScheduleSettings(data: {
  businessName?: string;
  workingHours?: { day: number; start: string; end: string }[];
  slotDuration?: number;
  bufferTime?: number;
  maxAdvanceDays?: number;
  minAdvanceHours?: number;
  sendConfirmation?: boolean;
  sendReminder?: boolean;
  reminderHours?: number;
}) {
  const settings = await prisma.scheduleSettings.upsert({
    where: { id: "schedule-settings" },
    update: {
      ...data,
      workingHours: data.workingHours ? JSON.stringify(data.workingHours) : undefined,
    },
    create: {
      id: "schedule-settings",
      ...data,
      workingHours: data.workingHours ? JSON.stringify(data.workingHours) : undefined,
    },
  });

  revalidatePath("/admin/agendamentos");
  return settings;
}

// =============================================================================
// SERVICES
// =============================================================================

export async function getServices() {
  const services = await prisma.scheduleService.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      providers: {
        include: { provider: true },
      },
    },
  });

  return services.map((s) => ({
    ...s,
    price: Number(s.price),
    providers: s.providers.map((sp) => ({
      ...sp,
      customPrice: sp.customPrice ? Number(sp.customPrice) : null,
      provider: sp.provider,
    })),
  }));
}

export async function createService(data: {
  name: string;
  description?: string;
  duration: number;
  price: number;
  color?: string;
}) {
  const service = await prisma.scheduleService.create({
    data: {
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      color: data.color || "#3b82f6",
    },
  });

  revalidatePath("/admin/agendamentos");
  return service;
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    color?: string;
    isActive?: boolean;
  }
) {
  const service = await prisma.scheduleService.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/agendamentos");
  return service;
}

export async function deleteService(id: string) {
  await prisma.scheduleService.delete({ where: { id } });
  revalidatePath("/admin/agendamentos");
}

// =============================================================================
// PROVIDERS (Optional)
// =============================================================================

export async function getProviders() {
  const providers = await prisma.scheduleProvider.findMany({
    where: { isActive: true },
    include: {
      services: {
        include: { service: true },
      },
      availability: true,
    },
  });

  return providers;
}

export async function createProvider(data: {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}) {
  const provider = await prisma.scheduleProvider.create({ data });
  revalidatePath("/admin/agendamentos");
  return provider;
}

export async function updateProvider(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    isActive?: boolean;
  }
) {
  const provider = await prisma.scheduleProvider.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/agendamentos");
  return provider;
}

// =============================================================================
// APPOINTMENTS
// =============================================================================

// Generate unique appointment code
async function generateAppointmentCode(): Promise<string> {
  const lastAppointment = await prisma.appointment.findFirst({
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });

  let nextNumber = 1;
  if (lastAppointment?.code) {
    const match = lastAppointment.code.match(/AGD-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `AGD-${String(nextNumber).padStart(4, "0")}`;
}

export async function getAppointments(filters?: {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  providerId?: string;
  serviceId?: string;
}) {
  const where: any = {};

  if (filters?.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  if (filters?.startDate && filters?.endDate) {
    where.date = { gte: filters.startDate, lte: filters.endDate };
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.providerId) {
    where.providerId = filters.providerId;
  }

  if (filters?.serviceId) {
    where.serviceId = filters.serviceId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      service: true,
      provider: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return appointments.map((a) => ({
    id: a.id,
    code: a.code,
    customerName: a.customerName,
    customerEmail: a.customerEmail,
    customerPhone: a.customerPhone,
    serviceId: a.serviceId,
    providerId: a.providerId,
    date: a.date.toISOString(),
    startTime: a.startTime,
    endTime: a.endTime,
    duration: a.duration,
    status: a.status,
    price: Number(a.price),
    isPaid: a.isPaid,
    notes: a.notes,
    internalNotes: a.internalNotes,
    cancelledAt: a.cancelledAt?.toISOString() || null,
    cancelReason: a.cancelReason,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    service: {
      id: a.service.id,
      name: a.service.name,
      color: a.service.color,
      price: Number(a.service.price),
    },
    provider: a.provider ? {
      id: a.provider.id,
      name: a.provider.name,
    } : null,
  }));
}

export async function getAppointmentByCode(code: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { code },
    include: {
      service: true,
      provider: true,
    },
  });

  if (!appointment) return null;

  return {
    id: appointment.id,
    code: appointment.code,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    customerPhone: appointment.customerPhone,
    serviceId: appointment.serviceId,
    providerId: appointment.providerId,
    date: appointment.date.toISOString(),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    duration: appointment.duration,
    status: appointment.status,
    price: Number(appointment.price),
    isPaid: appointment.isPaid,
    notes: appointment.notes,
    internalNotes: appointment.internalNotes,
    cancelledAt: appointment.cancelledAt?.toISOString() || null,
    cancelReason: appointment.cancelReason,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    service: {
      id: appointment.service.id,
      name: appointment.service.name,
      color: appointment.service.color,
      price: Number(appointment.service.price),
    },
    provider: appointment.provider ? {
      id: appointment.provider.id,
      name: appointment.provider.name,
    } : null,
  };
}

export async function createAppointment(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  serviceId: string;
  providerId?: string;
  date: string; // ISO date string
  startTime: string;
  notes?: string;
}) {
  // Get service for duration and price
  const service = await prisma.scheduleService.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    throw new Error("Serviço não encontrado");
  }

  // Calculate end time
  const [hours, minutes] = data.startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + service.duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

  // Check for conflicts
  const dateObj = parseLocalDate(data.date);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      providerId: data.providerId || undefined,
      status: { notIn: ["CANCELLED"] },
    },
  });

  // Check time conflicts
  for (const existing of existingAppointments) {
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    const newStart = startMinutes;
    const newEnd = endMinutes;

    if (newStart < existingEnd && newEnd > existingStart) {
      throw new Error("Este horário já está ocupado");
    }
  }

  const code = await generateAppointmentCode();

  const appointment = await prisma.appointment.create({
    data: {
      code,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      serviceId: data.serviceId,
      providerId: data.providerId || null,
      date: dateObj,
      startTime: data.startTime,
      endTime,
      duration: service.duration,
      price: service.price,
      notes: data.notes,
      status: "CONFIRMED",
    },
    include: {
      service: true,
      provider: true,
    },
  });

  revalidatePath("/admin/agendamentos");

  return {
    id: appointment.id,
    code: appointment.code,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    customerPhone: appointment.customerPhone,
    serviceId: appointment.serviceId,
    providerId: appointment.providerId,
    date: appointment.date.toISOString(),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    duration: appointment.duration,
    status: appointment.status,
    price: Number(appointment.price),
    isPaid: appointment.isPaid,
    notes: appointment.notes,
    internalNotes: appointment.internalNotes,
    cancelledAt: appointment.cancelledAt?.toISOString() || null,
    cancelReason: appointment.cancelReason,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    service: {
      id: appointment.service.id,
      name: appointment.service.name,
      color: appointment.service.color,
      price: Number(appointment.service.price),
    },
    provider: appointment.provider ? {
      id: appointment.provider.id,
      name: appointment.provider.name,
    } : null,
  };
}

export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  cancelReason?: string
) {
  const data: any = { status };

  if (status === "CANCELLED") {
    data.cancelledAt = new Date();
    data.cancelReason = cancelReason;
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/agendamentos");
  return appointment;
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newStartTime: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) {
    throw new Error("Agendamento não encontrado");
  }

  // Calculate new end time
  const [hours, minutes] = newStartTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + appointment.duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

  // Check for conflicts (excluding current appointment)
  const dateObj = parseLocalDate(newDate);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      id: { not: id },
      date: { gte: startOfDay, lte: endOfDay },
      providerId: appointment.providerId || undefined,
      status: { notIn: ["CANCELLED"] },
    },
  });

  for (const existing of existingAppointments) {
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    const newStart = startMinutes;
    const newEnd = endMinutes;

    if (newStart < existingEnd && newEnd > existingStart) {
      throw new Error("Este horário já está ocupado");
    }
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      date: dateObj,
      startTime: newStartTime,
      endTime,
    },
  });

  revalidatePath("/admin/agendamentos");
  return updated;
}

// =============================================================================
// AVAILABLE SLOTS
// =============================================================================

export async function getAvailableSlots(
  date: string,
  serviceId: string,
  providerId?: string
) {
  const settings = await getScheduleSettings();
  const service = await prisma.scheduleService.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return [];
  }

  const dateObj = parseLocalDate(date);
  const dayOfWeek = dateObj.getDay();

  // Get working hours for this day
  const workingHours = settings.workingHours as { day: number; start: string; end: string }[];
  const dayHours = workingHours.find((wh) => wh.day === dayOfWeek);

  if (!dayHours) {
    return []; // Not a working day
  }

  // Get existing appointments for this day
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      providerId: providerId || undefined,
      status: { notIn: ["CANCELLED"] },
    },
  });

  // Generate all possible slots
  const slotDuration = settings.slotDuration;
  const serviceDuration = service.duration;
  const bufferTime = settings.bufferTime;

  const slots: { time: string; available: boolean }[] = [];

  const startMinutes = timeToMinutes(dayHours.start);
  const endMinutes = timeToMinutes(dayHours.end);

  for (let time = startMinutes; time + serviceDuration <= endMinutes; time += slotDuration) {
    const slotStart = time;
    const slotEnd = time + serviceDuration;

    // Check if this slot conflicts with any existing appointment
    let available = true;

    for (const existing of existingAppointments) {
      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime) + bufferTime;

      if (slotStart < existingEnd && slotEnd > existingStart) {
        available = false;
        break;
      }
    }

    // Check if slot is in the past
    const now = new Date();
    const slotDateTime = new Date(dateObj);
    slotDateTime.setHours(Math.floor(time / 60), time % 60, 0, 0);

    if (slotDateTime <= now) {
      // Add minimum advance hours check
      const minAdvanceMs = settings.minAdvanceHours * 60 * 60 * 1000;
      if (slotDateTime.getTime() - now.getTime() < minAdvanceMs) {
        available = false;
      }
    }

    slots.push({
      time: minutesToTime(time),
      available,
    });
  }

  return slots;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Converte string de data para Date no timezone local (evita problema de UTC)
function parseLocalDate(dateString: string): Date {
  // Se a string já tem 'T', usa diretamente
  if (dateString.includes("T")) {
    const date = new Date(dateString);
    // Cria uma nova data no timezone local
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  }
  // Se é apenas YYYY-MM-DD, interpreta como local
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// =============================================================================
// SEED DEFAULT SERVICE
// =============================================================================

export async function seedDefaultService() {
  const existingServices = await prisma.scheduleService.count();

  if (existingServices === 0) {
    await prisma.scheduleService.create({
      data: {
        name: "Consulta",
        description: "Consulta padrão de 1 hora",
        duration: 60,
        price: 100,
        color: "#3b82f6",
      },
    });
  }

  return { success: true };
}
