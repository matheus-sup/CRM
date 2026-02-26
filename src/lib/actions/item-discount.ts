"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getItemDiscounts() {
    try {
        const itemDiscounts = await prisma.itemDiscount.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: { take: 1 }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, itemDiscounts };
    } catch (error) {
        console.error("Erro ao buscar descontos por item:", error);
        return { success: false, error: "Erro ao buscar descontos por item" };
    }
}

export async function getProductsForDiscount() {
    try {
        const products = await prisma.product.findMany({
            where: { status: "ACTIVE" },
            select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                images: { take: 1 }
            },
            orderBy: { name: "asc" },
        });
        return { success: true, products };
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return { success: false, error: "Erro ao buscar produtos" };
    }
}

export async function createItemDiscount(data: {
    productId: string;
    discountPercent: number;
    promoStock: number;
    endDate?: Date;
}) {
    try {
        // Check if product already has an active discount
        const existing = await prisma.itemDiscount.findFirst({
            where: { productId: data.productId, active: true }
        });

        if (existing) {
            return { success: false, error: "Este produto ja possui um desconto ativo." };
        }

        const itemDiscount = await prisma.itemDiscount.create({
            data: {
                productId: data.productId,
                discountPercent: data.discountPercent,
                promoStock: data.promoStock,
                endDate: data.endDate,
            },
        });
        revalidatePath("/admin/descontos");
        return { success: true, itemDiscount };
    } catch (error: any) {
        console.error("Erro ao criar desconto por item:", error);
        return { success: false, error: `Erro ao criar: ${error.message}` };
    }
}

export async function updateItemDiscount(id: string, data: {
    endDate?: Date | null;
}) {
    try {
        await prisma.itemDiscount.update({
            where: { id },
            data: { endDate: data.endDate }
        });
        revalidatePath("/admin/descontos");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar desconto" };
    }
}

export async function toggleItemDiscount(id: string, active: boolean) {
    try {
        await prisma.itemDiscount.update({
            where: { id },
            data: { active }
        });
        revalidatePath("/admin/descontos");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar desconto" };
    }
}

export async function deleteItemDiscount(id: string) {
    try {
        await prisma.itemDiscount.delete({ where: { id } });
        revalidatePath("/admin/descontos");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao excluir desconto" };
    }
}

export async function getActiveItemDiscount(productId: string) {
    try {
        const discount = await prisma.itemDiscount.findFirst({
            where: {
                productId,
                active: true,
                soldCount: { lt: prisma.itemDiscount.fields.promoStock }
            }
        });

        if (!discount || discount.soldCount >= discount.promoStock) {
            return { success: false, discount: null };
        }

        if (discount.endDate && new Date() > discount.endDate) {
            return { success: false, discount: null };
        }

        return {
            success: true,
            discount: {
                id: discount.id,
                discountPercent: Number(discount.discountPercent),
                remaining: discount.promoStock - discount.soldCount
            }
        };
    } catch (error) {
        return { success: false, discount: null };
    }
}
