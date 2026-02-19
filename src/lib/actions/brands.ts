"use server";

import { prisma } from "@/lib/prisma";

export async function getDistinctBrands() {
    try {
        const brands = await prisma.brand.findMany({
            where: { products: { some: {} } },
            orderBy: { name: 'asc' }
        });
        return brands.map(b => b.name);
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}
