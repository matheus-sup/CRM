"use server";

import { prisma } from "@/lib/prisma";

export async function getDistinctBrands() {
    try {
        const brands = await prisma.product.findMany({
            select: { brand: true },
            where: { brand: { not: "" } },
            distinct: ['brand']
        });
        return brands.map(b => b.brand).filter(Boolean) as string[];
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}
