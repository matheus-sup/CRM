"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

interface CreateMovementParams {
    productId: string;
    type: StockMovementType;
    quantity: number;
    unitPrice?: number;
    reason?: string;
    orderId?: string;
}

// Criar movimentação e atualizar estoque
export async function createStockMovement(params: CreateMovementParams) {
    const { productId, type, quantity, unitPrice, reason, orderId } = params;

    return await prisma.$transaction(async (tx) => {
        // Calcular delta de estoque
        const stockDelta = type === "IN" ? Math.abs(quantity) : -Math.abs(quantity);

        // Atualizar estoque do produto
        const product = await tx.product.update({
            where: { id: productId },
            data: { stock: { increment: stockDelta } },
        });

        // Criar registro de movimentação
        const movement = await tx.stockMovement.create({
            data: {
                productId,
                type,
                quantity: stockDelta,
                unitPrice: unitPrice ?? null,
                totalValue: unitPrice ? unitPrice * Math.abs(quantity) : null,
                reason,
                orderId,
            },
        });

        return { product, movement };
    });
}

// Buscar histórico de movimentações de um produto
export async function getProductMovements(productId: string) {
    const movements = await prisma.stockMovement.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        include: {
            order: { select: { code: true } },
        },
    });

    // Converter Decimal para number para serialização
    return movements.map((m) => ({
        ...m,
        unitPrice: m.unitPrice ? Number(m.unitPrice) : null,
        totalValue: m.totalValue ? Number(m.totalValue) : null,
    }));
}

// Entrada de estoque em lote com histórico
export async function addStockBatchWithHistory(
    items: {
        productId: string;
        quantity: number;
        unitPrice?: number;
        expiresAt?: string;
        reason?: string;
    }[]
) {
    return await prisma.$transaction(async (tx) => {
        for (const item of items) {
            // Atualizar estoque e validade
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: { increment: item.quantity },
                    expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
                },
            });

            // Registrar movimentação
            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    type: "IN",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalValue: item.unitPrice ? item.unitPrice * item.quantity : null,
                    reason: item.reason || "Entrada de estoque",
                },
            });
        }

        revalidatePath("/admin/produtos");
        return { success: true };
    });
}

// Ajuste manual de estoque
export async function adjustStock(params: {
    productId: string;
    newQuantity: number;
    reason: string;
}) {
    const product = await prisma.product.findUnique({
        where: { id: params.productId },
        select: { stock: true, price: true },
    });

    if (!product) throw new Error("Produto não encontrado");

    const difference = params.newQuantity - product.stock;

    if (difference === 0) {
        return { success: true, message: "Nenhuma alteração necessária" };
    }

    const result = await prisma.$transaction(async (tx) => {
        // Atualizar estoque
        const updated = await tx.product.update({
            where: { id: params.productId },
            data: { stock: params.newQuantity },
        });

        // Registrar movimentação
        await tx.stockMovement.create({
            data: {
                productId: params.productId,
                type: "ADJUSTMENT",
                quantity: difference,
                reason: params.reason,
            },
        });

        return updated;
    });

    revalidatePath("/admin/produtos");

    return { success: true, product: result };
}

// Registrar saída por venda (chamado pelo checkout)
export async function recordSaleMovement(
    items: {
        productId: string;
        quantity: number;
        price: number;
        name: string;
    }[],
    orderId: string,
    orderCode: number
) {
    return await prisma.$transaction(async (tx) => {
        for (const item of items) {
            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    type: "OUT",
                    quantity: -item.quantity,
                    unitPrice: item.price,
                    totalValue: item.price * item.quantity,
                    reason: `Venda - Pedido #${orderCode}`,
                    orderId,
                },
            });
        }
    });
}
