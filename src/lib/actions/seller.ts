"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSellers() {
    return prisma.seller.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
    });
}

export async function getAllSellers() {
    return prisma.seller.findMany({
        orderBy: { name: "asc" },
    });
}

export async function getSellerById(id: string) {
    return prisma.seller.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    items: true,
                },
            },
        },
    });
}

export async function createSeller(data: {
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
}) {
    const seller = await prisma.seller.create({
        data: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            cpf: data.cpf || null,
        },
    });

    revalidatePath("/admin/vendas");
    return seller;
}

export async function updateSeller(
    id: string,
    data: {
        name?: string;
        email?: string;
        phone?: string;
        cpf?: string;
        isActive?: boolean;
    }
) {
    const seller = await prisma.seller.update({
        where: { id },
        data,
    });

    revalidatePath("/admin/vendas");
    return seller;
}

export async function deleteSeller(id: string) {
    // First check if seller has orders
    const orderCount = await prisma.order.count({
        where: { sellerId: id },
    });

    if (orderCount > 0) {
        // Deactivate instead of delete
        await prisma.seller.update({
            where: { id },
            data: { isActive: false },
        });
    } else {
        await prisma.seller.delete({
            where: { id },
        });
    }

    revalidatePath("/admin/vendas");
}

export async function getSellersWithStats(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
        createdAt: {
            gte: startDate,
            lte: endDate,
        },
    } : {};

    const sellers = await prisma.seller.findMany({
        where: { isActive: true },
        include: {
            orders: {
                where: {
                    status: { not: "CANCELLED" },
                    ...dateFilter,
                },
                include: {
                    items: true,
                },
            },
        },
        orderBy: { name: "asc" },
    });

    return sellers.map((seller) => {
        const totalSales = seller.orders.reduce(
            (acc, order) => acc + Number(order.total),
            0
        );
        const salesCount = seller.orders.length;
        const totalItems = seller.orders.reduce(
            (acc, order) =>
                acc + order.items.reduce((sum, item) => sum + item.quantity, 0),
            0
        );

        // P.A. = Peças por Atendimento (items per sale)
        const pa = salesCount > 0 ? totalItems / salesCount : 0;

        // TKM = Ticket Médio (average ticket)
        const tkm = salesCount > 0 ? totalSales / salesCount : 0;

        return {
            id: seller.id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            cpf: seller.cpf,
            isActive: seller.isActive,
            createdAt: seller.createdAt,
            totalSales,
            salesCount,
            totalItems,
            pa: Number(pa.toFixed(2)),
            tkm: Number(tkm.toFixed(2)),
        };
    });
}
