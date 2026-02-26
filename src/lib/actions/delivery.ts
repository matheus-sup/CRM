"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// DELIVERY SETTINGS
// =============================================================================

export async function getDeliverySettings() {
  let settings = await prisma.deliverySettings.findUnique({
    where: { id: "delivery-settings" },
  });

  if (!settings) {
    settings = await prisma.deliverySettings.create({
      data: { id: "delivery-settings" },
    });
  }

  return {
    ...settings,
    minOrderValue: Number(settings.minOrderValue),
    storeLatitude: settings.storeLatitude ? Number(settings.storeLatitude) : null,
    storeLongitude: settings.storeLongitude ? Number(settings.storeLongitude) : null,
    operatingHours: JSON.parse(settings.operatingHours),
    paymentMethods: JSON.parse(settings.paymentMethods),
  };
}

export async function updateDeliverySettings(data: {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  storePhone?: string;
  storeWhatsapp?: string;
  storeAddress?: string;
  storeCity?: string;
  storeState?: string;
  storeZipCode?: string;
  operatingHours?: { day: number; open: string; close: string }[];
  minOrderValue?: number;
  avgPrepTime?: number;
  maxDeliveryTime?: number;
  paymentMethods?: string[];
  acceptCashChange?: boolean;
  primaryColor?: string;
  accentColor?: string;
  isOpen?: boolean;
}) {
  const settings = await prisma.deliverySettings.upsert({
    where: { id: "delivery-settings" },
    update: {
      ...data,
      operatingHours: data.operatingHours ? JSON.stringify(data.operatingHours) : undefined,
      paymentMethods: data.paymentMethods ? JSON.stringify(data.paymentMethods) : undefined,
    },
    create: {
      id: "delivery-settings",
      ...data,
      operatingHours: data.operatingHours ? JSON.stringify(data.operatingHours) : undefined,
      paymentMethods: data.paymentMethods ? JSON.stringify(data.paymentMethods) : undefined,
    },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return settings;
}

export async function toggleDeliveryOpen(isOpen: boolean, pauseReason?: string) {
  const settings = await prisma.deliverySettings.update({
    where: { id: "delivery-settings" },
    data: {
      isOpen,
      pauseReason: isOpen ? null : pauseReason,
      pausedUntil: isOpen ? null : undefined,
    },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return { isOpen: settings.isOpen };
}

// =============================================================================
// DELIVERY ZONES
// =============================================================================

export async function getStoreCoordinates() {
  const settings = await prisma.deliverySettings.findUnique({
    where: { id: "delivery-settings" },
  });

  if (settings?.storeLatitude && settings?.storeLongitude) {
    return {
      lat: Number(settings.storeLatitude),
      lng: Number(settings.storeLongitude),
    };
  }

  // Default to São Paulo if no coordinates set
  return { lat: -23.5505, lng: -46.6333 };
}

export async function getDeliveryZones() {
  const zones = await prisma.deliveryZone.findMany({
    orderBy: { order: "asc" },
  });

  return zones.map((z) => ({
    ...z,
    deliveryFee: Number(z.deliveryFee),
    freeDeliveryMin: z.freeDeliveryMin ? Number(z.freeDeliveryMin) : null,
    radiusKm: z.radiusKm ? Number(z.radiusKm) : null,
    centerLat: z.centerLat ? Number(z.centerLat) : null,
    centerLng: z.centerLng ? Number(z.centerLng) : null,
    coordinates: z.coordinates,
    neighborhoods: z.neighborhoods ? JSON.parse(z.neighborhoods) : [],
    zipCodes: z.zipCodes ? JSON.parse(z.zipCodes) : [],
  }));
}

export async function createDeliveryZone(data: {
  name: string;
  type?: string;
  neighborhoods?: string[];
  zipCodes?: string[];
  radiusKm?: number;
  centerLat?: number;
  centerLng?: number;
  coordinates?: string;
  deliveryFee: number;
  freeDeliveryMin?: number;
  estimatedTime?: number;
}) {
  const zone = await prisma.deliveryZone.create({
    data: {
      name: data.name,
      type: data.type || "neighborhood",
      neighborhoods: data.neighborhoods ? JSON.stringify(data.neighborhoods) : null,
      zipCodes: data.zipCodes ? JSON.stringify(data.zipCodes) : null,
      radiusKm: data.radiusKm,
      centerLat: data.centerLat,
      centerLng: data.centerLng,
      coordinates: data.coordinates,
      deliveryFee: data.deliveryFee,
      freeDeliveryMin: data.freeDeliveryMin,
      estimatedTime: data.estimatedTime || 45,
    },
  });

  revalidatePath("/admin/delivery");
  return {
    ...zone,
    deliveryFee: Number(zone.deliveryFee),
    freeDeliveryMin: zone.freeDeliveryMin ? Number(zone.freeDeliveryMin) : null,
    radiusKm: zone.radiusKm ? Number(zone.radiusKm) : null,
    centerLat: zone.centerLat ? Number(zone.centerLat) : null,
    centerLng: zone.centerLng ? Number(zone.centerLng) : null,
    coordinates: zone.coordinates,
    neighborhoods: zone.neighborhoods ? JSON.parse(zone.neighborhoods) : [],
    zipCodes: zone.zipCodes ? JSON.parse(zone.zipCodes) : [],
  };
}

export async function updateDeliveryZone(id: string, data: {
  name?: string;
  type?: string;
  neighborhoods?: string[];
  zipCodes?: string[];
  radiusKm?: number;
  centerLat?: number;
  centerLng?: number;
  coordinates?: string;
  deliveryFee?: number;
  freeDeliveryMin?: number;
  estimatedTime?: number;
  isActive?: boolean;
}) {
  const zone = await prisma.deliveryZone.update({
    where: { id },
    data: {
      ...data,
      neighborhoods: data.neighborhoods ? JSON.stringify(data.neighborhoods) : undefined,
      zipCodes: data.zipCodes ? JSON.stringify(data.zipCodes) : undefined,
    },
  });

  revalidatePath("/admin/delivery");
  return {
    ...zone,
    deliveryFee: Number(zone.deliveryFee),
    freeDeliveryMin: zone.freeDeliveryMin ? Number(zone.freeDeliveryMin) : null,
    radiusKm: zone.radiusKm ? Number(zone.radiusKm) : null,
    centerLat: zone.centerLat ? Number(zone.centerLat) : null,
    centerLng: zone.centerLng ? Number(zone.centerLng) : null,
    coordinates: zone.coordinates,
    neighborhoods: zone.neighborhoods ? JSON.parse(zone.neighborhoods) : [],
    zipCodes: zone.zipCodes ? JSON.parse(zone.zipCodes) : [],
  };
}

export async function deleteDeliveryZone(id: string) {
  await prisma.deliveryZone.delete({ where: { id } });
  revalidatePath("/admin/delivery");
}

// =============================================================================
// MENU CATEGORIES
// =============================================================================

export async function getDeliveryCategories() {
  const categories = await prisma.deliveryCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({
      ...item,
      price: Number(item.price),
      compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
      customizations: item.customizations ? JSON.parse(item.customizations) : [],
      extras: item.extras ? JSON.parse(item.extras) : [],
      tags: item.tags ? JSON.parse(item.tags) : [],
    })),
  }));
}

export async function getAllDeliveryCategories() {
  const categories = await prisma.deliveryCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return categories;
}

export async function createDeliveryCategory(data: {
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  const maxOrder = await prisma.deliveryCategory.aggregate({
    _max: { order: true },
  });

  const category = await prisma.deliveryCategory.create({
    data: {
      ...data,
      order: (maxOrder._max.order || 0) + 1,
    },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return category;
}

export async function updateDeliveryCategory(id: string, data: {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}) {
  const category = await prisma.deliveryCategory.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return category;
}

export async function deleteDeliveryCategory(id: string) {
  await prisma.deliveryCategory.delete({ where: { id } });
  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
}

// =============================================================================
// MENU ITEMS
// =============================================================================

export async function getDeliveryMenuItems(categoryId?: string) {
  const items = await prisma.deliveryMenuItem.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { order: "asc" },
    include: { category: true },
  });

  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    customizations: item.customizations ? JSON.parse(item.customizations) : [],
    extras: item.extras ? JSON.parse(item.extras) : [],
    tags: item.tags ? JSON.parse(item.tags) : [],
  }));
}

export async function createDeliveryMenuItem(data: {
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  compareAtPrice?: number;
  customizations?: Array<{
    name: string;
    required: boolean;
    maxSelect?: number;
    options: Array<{ name: string; price: number }>;
  }>;
  extras?: Array<{ name: string; price: number }>;
  tags?: string[];
}) {
  const maxOrder = await prisma.deliveryMenuItem.aggregate({
    where: { categoryId: data.categoryId },
    _max: { order: true },
  });

  const item = await prisma.deliveryMenuItem.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      customizations: data.customizations ? JSON.stringify(data.customizations) : null,
      extras: data.extras ? JSON.stringify(data.extras) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      order: (maxOrder._max.order || 0) + 1,
    },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return {
    ...item,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    customizations: item.customizations ? JSON.parse(item.customizations) : [],
    extras: item.extras ? JSON.parse(item.extras) : [],
    tags: item.tags ? JSON.parse(item.tags) : [],
  };
}

export async function updateDeliveryMenuItem(id: string, data: {
  categoryId?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  compareAtPrice?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  customizations?: Array<{
    name: string;
    required: boolean;
    maxSelect?: number;
    options: Array<{ name: string; price: number }>;
  }>;
  extras?: Array<{ name: string; price: number }>;
  tags?: string[];
}) {
  const item = await prisma.deliveryMenuItem.update({
    where: { id },
    data: {
      ...data,
      customizations: data.customizations ? JSON.stringify(data.customizations) : undefined,
      extras: data.extras ? JSON.stringify(data.extras) : undefined,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
    },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return {
    ...item,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    customizations: item.customizations ? JSON.parse(item.customizations) : [],
    extras: item.extras ? JSON.parse(item.extras) : [],
    tags: item.tags ? JSON.parse(item.tags) : [],
  };
}

export async function deleteDeliveryMenuItem(id: string) {
  await prisma.deliveryMenuItem.delete({ where: { id } });
  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
}

export async function toggleMenuItemAvailability(id: string) {
  const item = await prisma.deliveryMenuItem.findUnique({ where: { id } });
  if (!item) throw new Error("Item não encontrado");

  const updated = await prisma.deliveryMenuItem.update({
    where: { id },
    data: { isAvailable: !item.isAvailable },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
  return { isAvailable: updated.isAvailable };
}

export async function reorderDeliveryMenuItems(items: { id: string; order: number }[]) {
  await Promise.all(
    items.map((item) =>
      prisma.deliveryMenuItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );
  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
}

export async function reorderDeliveryCategories(categories: { id: string; order: number }[]) {
  await Promise.all(
    categories.map((cat) =>
      prisma.deliveryCategory.update({
        where: { id: cat.id },
        data: { order: cat.order },
      })
    )
  );
  revalidatePath("/admin/delivery");
  revalidatePath("/cardapio");
}

// =============================================================================
// DELIVERY ORDERS
// =============================================================================

async function generateDeliveryOrderCode(): Promise<string> {
  const lastOrder = await prisma.deliveryOrder.findFirst({
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });

  let nextNumber = 1;
  if (lastOrder?.code) {
    const match = lastOrder.code.match(/DEL-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `DEL-${String(nextNumber).padStart(4, "0")}`;
}

export async function getDeliveryOrders(filters?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}) {
  const where: any = {};

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.startDate && filters?.endDate) {
    where.createdAt = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }

  if (filters?.search) {
    where.OR = [
      { code: { contains: filters.search } },
      { customerName: { contains: filters.search } },
      { customerPhone: { contains: filters.search } },
    ];
  }

  const orders = await prisma.deliveryOrder.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    couponDiscount: Number(order.couponDiscount),
    changeFor: order.changeFor ? Number(order.changeFor) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      customizations: item.customizations ? JSON.parse(item.customizations) : [],
    })),
  }));
}

export async function getDeliveryOrdersByStatus() {
  const statuses = ["NEW", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  const result: Record<string, any[]> = {};

  for (const status of statuses) {
    const orders = await prisma.deliveryOrder.findMany({
      where: { status },
      include: { items: true },
      orderBy: { createdAt: status === "DELIVERED" || status === "CANCELLED" ? "desc" : "asc" },
      take: status === "DELIVERED" || status === "CANCELLED" ? 20 : undefined,
    });

    result[status] = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      couponDiscount: Number(order.couponDiscount),
      changeFor: order.changeFor ? Number(order.changeFor) : null,
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        customizations: item.customizations ? JSON.parse(item.customizations) : [],
      })),
    }));
  }

  return result;
}

export async function createDeliveryOrder(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerDocument?: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressReference?: string;
  items: Array<{
    productId?: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    customizations?: Array<{ name: string; price: number }>;
    notes?: string;
  }>;
  paymentMethod: string;
  changeFor?: number;
  couponCode?: string;
  customerNotes?: string;
  source?: string;
}) {
  const code = await generateDeliveryOrderCode();

  // Calculate totals
  let subtotal = 0;
  for (const item of data.items) {
    let itemTotal = item.price * item.quantity;
    if (item.customizations) {
      for (const custom of item.customizations) {
        itemTotal += custom.price * item.quantity;
      }
    }
    subtotal += itemTotal;
  }

  // Get delivery fee based on neighborhood
  const zone = await prisma.deliveryZone.findFirst({
    where: {
      isActive: true,
      neighborhoods: { contains: data.addressNeighborhood },
    },
  });

  let deliveryFee = zone ? Number(zone.deliveryFee) : 0;

  // Check for free delivery
  if (zone?.freeDeliveryMin && subtotal >= Number(zone.freeDeliveryMin)) {
    deliveryFee = 0;
  }

  // Check coupon
  let couponDiscount = 0;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.couponCode },
    });
    if (coupon && coupon.active) {
      if (coupon.type === "PERCENTAGE") {
        couponDiscount = subtotal * (Number(coupon.value) / 100);
      } else {
        couponDiscount = Number(coupon.value);
      }
    }
  }

  const total = subtotal + deliveryFee - couponDiscount;

  // Calculate estimated delivery time
  const settings = await getDeliverySettings();
  const estimatedMinutes = settings.avgPrepTime + (zone?.estimatedTime || 30);
  const estimatedDelivery = new Date(Date.now() + estimatedMinutes * 60 * 1000);

  const order = await prisma.deliveryOrder.create({
    data: {
      code,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerDocument: data.customerDocument,
      addressStreet: data.addressStreet,
      addressNumber: data.addressNumber,
      addressComplement: data.addressComplement,
      addressNeighborhood: data.addressNeighborhood,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressZipCode: data.addressZipCode,
      addressReference: data.addressReference,
      subtotal,
      deliveryFee,
      discount: couponDiscount,
      total,
      paymentMethod: data.paymentMethod,
      changeFor: data.changeFor,
      couponCode: data.couponCode,
      couponDiscount,
      customerNotes: data.customerNotes,
      source: data.source || "ONLINE",
      estimatedDelivery,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations ? JSON.stringify(item.customizations) : null,
          notes: item.notes,
        })),
      },
    },
    include: { items: true },
  });

  revalidatePath("/admin/delivery");

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    couponDiscount: Number(order.couponDiscount),
    changeFor: order.changeFor ? Number(order.changeFor) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      customizations: item.customizations ? JSON.parse(item.customizations) : [],
    })),
  };
}

export async function updateDeliveryOrderStatus(
  id: string,
  status: "NEW" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED",
  extra?: {
    cancelReason?: string;
    deliveryPersonName?: string;
    deliveryPersonPhone?: string;
  }
) {
  const now = new Date();

  const data: any = { status };

  switch (status) {
    case "CONFIRMED":
      data.confirmedAt = now;
      break;
    case "PREPARING":
      data.preparingAt = now;
      break;
    case "OUT_FOR_DELIVERY":
      data.outForDeliveryAt = now;
      if (extra?.deliveryPersonName) data.deliveryPersonName = extra.deliveryPersonName;
      if (extra?.deliveryPersonPhone) data.deliveryPersonPhone = extra.deliveryPersonPhone;
      break;
    case "DELIVERED":
      data.deliveredAt = now;
      data.actualDelivery = now;
      break;
    case "CANCELLED":
      data.cancelledAt = now;
      if (extra?.cancelReason) data.cancelReason = extra.cancelReason;
      break;
  }

  const order = await prisma.deliveryOrder.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/delivery");

  return { id: order.id, status: order.status };
}

export async function getDeliveryOrderByCode(code: string) {
  const order = await prisma.deliveryOrder.findUnique({
    where: { code },
    include: { items: true },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    couponDiscount: Number(order.couponDiscount),
    changeFor: order.changeFor ? Number(order.changeFor) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      customizations: item.customizations ? JSON.parse(item.customizations) : [],
    })),
  };
}

// =============================================================================
// REPORTS
// =============================================================================

export async function getDeliveryStats(startDate?: Date, endDate?: Date) {
  const where: any = {};

  if (startDate && endDate) {
    where.createdAt = { gte: startDate, lte: endDate };
  }

  // Total orders
  const totalOrders = await prisma.deliveryOrder.count({ where });

  // Orders by status
  const ordersByStatus = await prisma.deliveryOrder.groupBy({
    by: ["status"],
    where,
    _count: true,
  });

  // Revenue (only delivered orders)
  const revenue = await prisma.deliveryOrder.aggregate({
    where: { ...where, status: "DELIVERED" },
    _sum: { total: true },
  });

  // Average ticket
  const avgTicket = await prisma.deliveryOrder.aggregate({
    where: { ...where, status: "DELIVERED" },
    _avg: { total: true },
  });

  // Top items
  const topItems = await prisma.deliveryOrderItem.groupBy({
    by: ["name"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });

  return {
    totalOrders,
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
    revenue: revenue._sum.total ? Number(revenue._sum.total) : 0,
    avgTicket: avgTicket._avg.total ? Number(avgTicket._avg.total) : 0,
    topItems,
  };
}

// =============================================================================
// LOCATION SEARCH (Nominatim API)
// =============================================================================

export async function searchLocation(query: string) {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "CRM-App/1.0 (delivery-zone-search)",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error("Nominatim API error:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data)
      ? data.map((item: any) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }))
      : [];
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
}

// =============================================================================
// SEED DEFAULT DATA
// =============================================================================

export async function seedDeliveryDemo() {
  // Create demo categories
  const categories = [
    { name: "Hambúrgueres", description: "Os melhores hambúrgueres da cidade", order: 1 },
    { name: "Pizzas", description: "Pizzas artesanais", order: 2 },
    { name: "Bebidas", description: "Refrigerantes, sucos e mais", order: 3 },
    { name: "Sobremesas", description: "Para adoçar seu dia", order: 4 },
  ];

  for (const cat of categories) {
    const existing = await prisma.deliveryCategory.findFirst({
      where: { name: cat.name },
    });

    if (!existing) {
      await prisma.deliveryCategory.create({ data: cat });
    }
  }

  // Create demo zone
  const existingZone = await prisma.deliveryZone.findFirst();
  if (!existingZone) {
    await prisma.deliveryZone.create({
      data: {
        name: "Centro",
        type: "neighborhood",
        neighborhoods: JSON.stringify(["Centro", "Centro Histórico"]),
        deliveryFee: 5,
        freeDeliveryMin: 50,
        estimatedTime: 30,
      },
    });
  }

  revalidatePath("/admin/delivery");
  return { success: true };
}
