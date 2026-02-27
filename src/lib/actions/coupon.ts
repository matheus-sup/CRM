"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCoupons() {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
        });
        // Serialize Decimal fields to numbers for client components
        const serializedCoupons = coupons.map(coupon => ({
            ...coupon,
            value: Number(coupon.value),
            minOrderValue: Number(coupon.minOrderValue),
        }));
        return { success: true, coupons: serializedCoupons };
    } catch (error) {
        console.error("Erro ao buscar cupons:", error);
        return { success: false, error: "Erro ao buscar cupons" };
    }
}

export async function createCoupon(data: {
    code: string;
    type: string;
    value: number;
    minOrderValue?: number;
    maxUsage?: number;
    endDate?: Date;
}) {
    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                minOrderValue: data.minOrderValue || 0,
                maxUsage: data.maxUsage,
                endDate: data.endDate
            },
        });
        revalidatePath("/admin/descontos");
        return { success: true, coupon };
    } catch (error: any) {
        console.error("Erro ao criar cupom:", error);
        // Check for Unique Constraint Violation (P2002)
        if (error.code === 'P2002') {
            return { success: false, error: "O código do cupom já existe." };
        }
        return { success: false, error: `Erro ao criar: ${error.message}` };
    }
}

export async function updateCoupon(id: string, data: {
    endDate?: Date | null;
}) {
    try {
        await prisma.coupon.update({
            where: { id },
            data: { endDate: data.endDate }
        });
        revalidatePath("/admin/descontos");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar cupom" };
    }
}

export async function toggleCoupon(id: string, active: boolean) {
    try {
        await prisma.coupon.update({
            where: { id },
            data: { active }
        });
        revalidatePath("/admin/descontos");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar cupom" };
    }
}

export async function deleteCoupon(id: string) {
    try {
        await prisma.coupon.delete({ where: { id } });
        revalidatePath("/admin/descontos");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao excluir cupom" };
    }
}

export async function validateCoupon(code: string, cartTotal: number) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return { success: false, message: "Cupom inválido." };
        }

        if (!coupon.active) {
            return { success: false, message: "Cupom inativo." };
        }

        if (coupon.endDate && new Date() > coupon.endDate) {
            return { success: false, message: "Cupom expirado." };
        }

        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            return { success: false, message: "Limite de uso do cupom atingido." };
        }

        if (coupon.minOrderValue && cartTotal < Number(coupon.minOrderValue)) {
            return {
                success: false,
                message: `Valor mínimo para este cupom: R$ ${Number(coupon.minOrderValue).toFixed(2)}`
            };
        }

        return {
            success: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: Number(coupon.value)
            }
        };

    } catch (error) {
        console.error("Validation error:", error);
        return { success: false, message: "Erro ao validar cupom." };
    }
}

export async function ensureWelcomeCoupon() {
    try {
        const existing = await prisma.coupon.findUnique({
            where: { code: "BEMVINDO10" }
        });

        if (!existing) {
            await prisma.coupon.create({
                data: {
                    code: "BEMVINDO10",
                    type: "PERCENTAGE",
                    value: 10,
                    minOrderValue: 0,
                    active: true
                }
            });
            revalidatePath("/admin/descontos");
            return { success: true, message: "Cupom BEMVINDO10 criado com sucesso!" };
        }
        return { success: true, message: "Cupom BEMVINDO10 já existe." };
    } catch (error) {
        return { success: false, error: "Erro ao criar cupom BEMVINDO10." };
    }
}
