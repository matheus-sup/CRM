"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

// =============================================================================
// LENS CONFIG
// =============================================================================

export async function getLensConfig() {
  let config = await prisma.lensConfig.findUnique({
    where: { id: "lens-config" },
  });

  if (!config) {
    // Create default config
    config = await prisma.lensConfig.create({
      data: { id: "lens-config" },
    });
  }

  // Convert Decimal to number for client components
  return {
    ...config,
    gradeDiscount: Number(config.gradeDiscount) || 0,
  };
}

export async function updateLensConfig(data: {
  modalTitle?: string;
  modalSubtitle?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  cardBorderColor?: string;
  cardHoverBorderColor?: string;
  selectedBorderColor?: string;
  priceColor?: string;
  gradeLensIcon?: string;
  noGradeLensIcon?: string;
  enableGradeLens?: boolean;
  enableNoGradeLens?: boolean;
  requireTreatment?: boolean;
  gradeDiscount?: number;
  gradeDiscountLabel?: string;
}) {
  const config = await prisma.lensConfig.upsert({
    where: { id: "lens-config" },
    update: {
      ...data,
      gradeDiscount: data.gradeDiscount !== undefined ? new Decimal(data.gradeDiscount) : undefined,
    },
    create: {
      id: "lens-config",
      ...data,
      gradeDiscount: data.gradeDiscount !== undefined ? new Decimal(data.gradeDiscount) : undefined,
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return config;
}

// =============================================================================
// LENS TYPES
// =============================================================================

export async function getLensTypes() {
  const types = await prisma.lensType.findMany({
    where: { isActive: true },
    include: {
      thicknesses: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  // Convert Decimals to numbers for client components
  return types.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
    thicknesses: t.thicknesses.map((th) => ({
      ...th,
      price: Number(th.price) || 0,
    })),
  }));
}

export async function getAllLensTypes() {
  const types = await prisma.lensType.findMany({
    include: {
      thicknesses: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  // Convert Decimals to numbers
  return types.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
    thicknesses: t.thicknesses.map((th) => ({
      ...th,
      price: Number(th.price) || 0,
    })),
  }));
}

export async function createLensType(data: {
  slug: string;
  name: string;
  description?: string;
  iconUrl?: string;
  price?: number;
  requiresThickness?: boolean;
  requiresTreatment?: boolean;
  order?: number;
}) {
  const lensType = await prisma.lensType.create({
    data: {
      ...data,
      price: new Decimal(data.price || 0),
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return lensType;
}

export async function updateLensType(
  id: string,
  data: {
    slug?: string;
    name?: string;
    description?: string;
    iconUrl?: string;
    price?: number;
    requiresThickness?: boolean;
    requiresTreatment?: boolean;
    isActive?: boolean;
    order?: number;
  }
) {
  const lensType = await prisma.lensType.update({
    where: { id },
    data: {
      ...data,
      price: data.price !== undefined ? new Decimal(data.price) : undefined,
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return lensType;
}

export async function deleteLensType(id: string) {
  await prisma.lensType.delete({ where: { id } });
  revalidatePath("/admin/ferramentas/lentes");
}

// =============================================================================
// LENS THICKNESS
// =============================================================================

export async function getLensThicknesses(lensTypeId?: string) {
  const thicknesses = await prisma.lensThickness.findMany({
    where: {
      isActive: true,
      ...(lensTypeId && { lensTypeId }),
    },
    orderBy: { order: "asc" },
  });

  // Convert Decimals to numbers for client components
  return thicknesses.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
  }));
}

export async function getAllLensThicknesses() {
  const thicknesses = await prisma.lensThickness.findMany({
    orderBy: { order: "asc" },
  });

  // Convert Decimals to numbers
  return thicknesses.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
  }));
}

export async function createLensThickness(data: {
  lensTypeId?: string;
  name: string;
  index: string;
  description?: string;
  sphericalRange?: string;
  cylindricalRange?: string;
  price?: number;
  iconUrl?: string;
  order?: number;
}) {
  const thickness = await prisma.lensThickness.create({
    data: {
      ...data,
      price: new Decimal(data.price || 0),
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return thickness;
}

export async function updateLensThickness(
  id: string,
  data: {
    lensTypeId?: string | null;
    name?: string;
    index?: string;
    description?: string;
    sphericalRange?: string;
    cylindricalRange?: string;
    price?: number;
    iconUrl?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  const thickness = await prisma.lensThickness.update({
    where: { id },
    data: {
      ...data,
      price: data.price !== undefined ? new Decimal(data.price) : undefined,
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return thickness;
}

export async function deleteLensThickness(id: string) {
  await prisma.lensThickness.delete({ where: { id } });
  revalidatePath("/admin/ferramentas/lentes");
}

// =============================================================================
// LENS TREATMENT
// =============================================================================

export async function getLensTreatments() {
  const treatments = await prisma.lensTreatment.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  // Convert Decimals to numbers for client components
  return treatments.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
  }));
}

export async function getAllLensTreatments() {
  const treatments = await prisma.lensTreatment.findMany({
    orderBy: { order: "asc" },
  });

  // Convert Decimals to numbers
  return treatments.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
  }));
}

export async function createLensTreatment(data: {
  name: string;
  description?: string;
  price?: number;
  iconUrl?: string;
  features?: string[];
  order?: number;
}) {
  const treatment = await prisma.lensTreatment.create({
    data: {
      ...data,
      price: new Decimal(data.price || 0),
      features: data.features ? JSON.stringify(data.features) : undefined,
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return treatment;
}

export async function updateLensTreatment(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    iconUrl?: string;
    features?: string[];
    isActive?: boolean;
    order?: number;
  }
) {
  const treatment = await prisma.lensTreatment.update({
    where: { id },
    data: {
      ...data,
      price: data.price !== undefined ? new Decimal(data.price) : undefined,
      features: data.features ? JSON.stringify(data.features) : undefined,
    },
  });

  revalidatePath("/admin/ferramentas/lentes");
  return treatment;
}

export async function deleteLensTreatment(id: string) {
  await prisma.lensTreatment.delete({ where: { id } });
  revalidatePath("/admin/ferramentas/lentes");
}

// =============================================================================
// SEED DEFAULT DATA
// =============================================================================

export async function seedLensData() {
  // Create default config
  await prisma.lensConfig.upsert({
    where: { id: "lens-config" },
    update: {},
    create: {
      id: "lens-config",
      gradeDiscountLabel: "15% Off em todas as Lentes",
      gradeDiscount: new Decimal(15),
    },
  });

  // Create lens types
  const grauType = await prisma.lensType.upsert({
    where: { slug: "grau" },
    update: {},
    create: {
      slug: "grau",
      name: "Grau",
      description: "Para perto ou longe\nTodas as nossas lentes possuem UV 400",
      requiresThickness: true,
      requiresTreatment: true,
      order: 0,
    },
  });

  await prisma.lensType.upsert({
    where: { slug: "sem-grau" },
    update: {},
    create: {
      slug: "sem-grau",
      name: "Sem Grau - Com filtro Azul",
      description: "Lentes sem grau com\nproteção filtro azul e UV 400",
      requiresThickness: false,
      requiresTreatment: false,
      price: new Decimal(0),
      order: 1,
    },
  });

  // Create thicknesses for grade lenses
  const thicknessData = [
    {
      name: "Normal",
      index: "1.56",
      description: "Lentes com espessura padrão, com índice de refração de 1.56.\nContemplam hipermetropia e miopia (Esférico/Esf) até +/- 4.00 e astigmatismo (Cilíndrico/Cil) até -2.00",
      sphericalRange: "+/- 4.00",
      cylindricalRange: "-2.00",
      price: 115.51,
      order: 0,
    },
    {
      name: "Fina",
      index: "1.59",
      description: "Lentes mais leves, mais finas e resistentes. Com índice de refração de 1.59.\nContemplam hipermetropia e miopia (Esférico/Esf) até +/- 6.00 e astigmatismo (Cilíndrico/Cil) até -4.00",
      sphericalRange: "+/- 6.00",
      cylindricalRange: "-4.00",
      price: 186.91,
      order: 1,
    },
    {
      name: "Super Fina",
      index: "1.67",
      description: "Lentes ainda mais finas e mais leves, ideal para o uso em graus mais altos. Com índice de refração 1.67.\nContemplam hipermetropia e miopia (Esférico/Esf) até +/- 8.00 e astigmatismo (Cilíndrico/Cil) até -4.00",
      sphericalRange: "+/- 8.00",
      cylindricalRange: "-4.00",
      price: 365.41,
      order: 2,
    },
    {
      name: "Extra Fina",
      index: "1.74",
      description: "Lentes com a maior tecnologia em índice de refração, ideais para graus muito altos. Com índice de refração 1.74.\nContemplam hipermetropia e miopia (Esférico/Esf) até +/- 12.00 e astigmatismo (Cilíndrico/Cil) até -6.00",
      sphericalRange: "+/- 12.00",
      cylindricalRange: "-6.00",
      price: 549.90,
      order: 3,
    },
  ];

  for (const data of thicknessData) {
    const existing = await prisma.lensThickness.findFirst({
      where: { index: data.index, lensTypeId: grauType.id },
    });

    if (!existing) {
      await prisma.lensThickness.create({
        data: {
          ...data,
          lensTypeId: grauType.id,
          price: new Decimal(data.price),
        },
      });
    }
  }

  // Create treatments
  const treatmentData = [
    {
      name: "Tradicional",
      description: "Possui antireflexo, resistente a arranhões e proteção de 100% contra raios UV",
      price: 0,
      features: ["Antireflexo", "Resistente a arranhões", "100% proteção UV"],
      order: 0,
    },
    {
      name: "Filtro de Luz Azul",
      description: "Filtra a luz azul nociva emitida por telas como celulares, monitores e telas evitando dores de cabeça e ajudando a ter uma noite de sono melhor. Além disso acompanha antireflexo, proteção de 100% contra raios UV",
      price: 179.90,
      features: ["Filtra luz azul", "Antireflexo", "100% proteção UV", "Melhora o sono"],
      order: 1,
    },
  ];

  for (const data of treatmentData) {
    const existing = await prisma.lensTreatment.findFirst({
      where: { name: data.name },
    });

    if (!existing) {
      await prisma.lensTreatment.create({
        data: {
          ...data,
          price: new Decimal(data.price),
          features: JSON.stringify(data.features),
        },
      });
    }
  }

  revalidatePath("/admin/ferramentas/lentes");
  return { success: true };
}

// =============================================================================
// GET ALL DATA FOR MODAL
// =============================================================================

export async function getLensModalData() {
  const [config, types, treatments] = await Promise.all([
    getLensConfig(),
    getLensTypes(),
    getLensTreatments(),
  ]);

  return {
    config,
    types,
    treatments: treatments.map((t) => ({
      ...t,
      features: t.features ? JSON.parse(t.features as string) : [],
    })),
  };
}
