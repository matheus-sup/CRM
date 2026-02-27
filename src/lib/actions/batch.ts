"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Criar lote para produto perecível
export async function createBatch(params: {
    productId: string;
    quantity: number;
    expiresAt: string;
    unitCost?: number;
}) {
    const { productId, quantity, expiresAt, unitCost } = params;

    return await prisma.$transaction(async (tx) => {
        // Criar o lote
        const batch = await tx.productBatch.create({
            data: {
                productId,
                quantity,
                initialQty: quantity,
                expiresAt: new Date(expiresAt),
                unitCost: unitCost ?? null,
            },
        });

        // Incrementar estoque do produto
        await tx.product.update({
            where: { id: productId },
            data: { stock: { increment: quantity } },
        });

        // Registrar movimentação
        await tx.stockMovement.create({
            data: {
                productId,
                type: "IN",
                quantity,
                unitPrice: unitCost,
                totalValue: unitCost ? unitCost * quantity : null,
                reason: `Entrada de lote - Validade: ${new Date(expiresAt).toLocaleDateString("pt-BR")}`,
            },
        });

        return batch;
    });
}

// Buscar lotes de um produto ordenados por validade (FEFO)
export async function getProductBatches(productId: string) {
    const batches = await prisma.productBatch.findMany({
        where: { productId, quantity: { gt: 0 } },
        orderBy: { expiresAt: "asc" },
    });
    // Serialize Decimal fields for client components
    return batches.map(batch => ({
        ...batch,
        unitCost: batch.unitCost ? Number(batch.unitCost) : null,
    }));
}

// Consumir estoque usando FEFO (First Expired, First Out)
export async function consumeBatchesFEFO(
    productId: string,
    quantity: number,
    reason?: string,
    orderId?: string
) {
    return await prisma.$transaction(async (tx) => {
        // Buscar lotes com estoque, ordenados por validade
        const batches = await tx.productBatch.findMany({
            where: { productId, quantity: { gt: 0 } },
            orderBy: { expiresAt: "asc" },
        });

        let remaining = quantity;
        const consumedBatches: { batchId: string; quantity: number; expiresAt: Date }[] = [];

        for (const batch of batches) {
            if (remaining <= 0) break;

            const consume = Math.min(batch.quantity, remaining);

            // Atualizar lote
            await tx.productBatch.update({
                where: { id: batch.id },
                data: { quantity: { decrement: consume } },
            });

            consumedBatches.push({
                batchId: batch.id,
                quantity: consume,
                expiresAt: batch.expiresAt,
            });

            remaining -= consume;
        }

        // Se ainda restou quantidade, significa que não há estoque suficiente
        if (remaining > 0) {
            throw new Error(`Estoque insuficiente. Faltam ${remaining} unidades.`);
        }

        // Decrementar estoque do produto
        await tx.product.update({
            where: { id: productId },
            data: { stock: { decrement: quantity } },
        });

        // Registrar movimentação com detalhes dos lotes
        const batchDetails = consumedBatches
            .map((b) => `${b.quantity}un (val: ${b.expiresAt.toLocaleDateString("pt-BR")})`)
            .join(", ");

        await tx.stockMovement.create({
            data: {
                productId,
                type: "OUT",
                quantity: -quantity,
                reason: reason ? `${reason} | Lotes: ${batchDetails}` : `Lotes: ${batchDetails}`,
                orderId,
            },
        });

        return consumedBatches;
    });
}

// Buscar próxima validade do produto (para exibição na lista)
export async function getNextExpiry(productId: string) {
    const batch = await prisma.productBatch.findFirst({
        where: { productId, quantity: { gt: 0 } },
        orderBy: { expiresAt: "asc" },
        select: { expiresAt: true },
    });

    return batch?.expiresAt ?? null;
}

// Buscar todos os produtos com validade próxima ou vencidos
export async function getExpiringProducts(daysAhead: number = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    // Produtos perecíveis (buscar pelo lote mais próximo)
    const perishableBatches = await prisma.productBatch.findMany({
        where: {
            quantity: { gt: 0 },
            expiresAt: { lte: futureDate },
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    stock: true,
                    images: { take: 1 },
                },
            },
        },
        orderBy: { expiresAt: "asc" },
    });

    // Produtos não perecíveis com validade definida
    const nonPerishableProducts = await prisma.product.findMany({
        where: {
            isPerishable: false,
            expiresAt: { lte: futureDate, not: null },
            stock: { gt: 0 },
        },
        select: {
            id: true,
            name: true,
            stock: true,
            expiresAt: true,
            images: { take: 1 },
        },
        orderBy: { expiresAt: "asc" },
    });

    // Combinar e formatar resultados
    const results: {
        productId: string;
        productName: string;
        stock: number;
        expiresAt: Date;
        imageUrl?: string;
        isExpired: boolean;
        daysUntilExpiry: number;
    }[] = [];

    // Agrupar lotes por produto (pegar apenas o mais próximo)
    const seenProducts = new Set<string>();

    for (const batch of perishableBatches) {
        if (seenProducts.has(batch.productId)) continue;
        seenProducts.add(batch.productId);

        const daysUntil = Math.ceil(
            (batch.expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        results.push({
            productId: batch.productId,
            productName: batch.product.name,
            stock: batch.quantity,
            expiresAt: batch.expiresAt,
            imageUrl: batch.product.images[0]?.url,
            isExpired: daysUntil < 0,
            daysUntilExpiry: daysUntil,
        });
    }

    for (const product of nonPerishableProducts) {
        if (seenProducts.has(product.id)) continue;

        const daysUntil = Math.ceil(
            (product.expiresAt!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        results.push({
            productId: product.id,
            productName: product.name,
            stock: product.stock,
            expiresAt: product.expiresAt!,
            imageUrl: product.images[0]?.url,
            isExpired: daysUntil < 0,
            daysUntilExpiry: daysUntil,
        });
    }

    // Ordenar por dias até expirar
    results.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return results;
}

// Excluir um lote do estoque
export async function deleteBatch(batchId: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
        // Buscar o lote
        const batch = await tx.productBatch.findUnique({
            where: { id: batchId },
            include: { product: { select: { name: true } } },
        });

        if (!batch) {
            throw new Error("Lote não encontrado");
        }

        if (batch.quantity <= 0) {
            throw new Error("Este lote já está vazio");
        }

        // Decrementar estoque do produto
        await tx.product.update({
            where: { id: batch.productId },
            data: { stock: { decrement: batch.quantity } },
        });

        // Registrar movimentação de saída
        await tx.stockMovement.create({
            data: {
                productId: batch.productId,
                type: "OUT",
                quantity: -batch.quantity,
                reason: reason || `Lote excluído - Validade: ${batch.expiresAt.toLocaleDateString("pt-BR")}`,
            },
        });

        // Deletar o lote
        await tx.productBatch.delete({
            where: { id: batchId },
        });

        revalidatePath("/admin/produtos");

        return { success: true, quantity: batch.quantity };
    });
}

// Estatísticas de validade para o dashboard
export async function getExpiryStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    // Contar lotes vencidos
    const expiredBatches = await prisma.productBatch.count({
        where: {
            quantity: { gt: 0 },
            expiresAt: { lt: today },
        },
    });

    // Contar lotes vencendo em 7 dias
    const expiringIn7Days = await prisma.productBatch.count({
        where: {
            quantity: { gt: 0 },
            expiresAt: { gte: today, lte: in7Days },
        },
    });

    // Contar lotes vencendo em 30 dias
    const expiringIn30Days = await prisma.productBatch.count({
        where: {
            quantity: { gt: 0 },
            expiresAt: { gte: today, lte: in30Days },
        },
    });

    // Produtos não perecíveis
    const expiredProducts = await prisma.product.count({
        where: {
            isPerishable: false,
            expiresAt: { lt: today, not: null },
            stock: { gt: 0 },
        },
    });

    const productsExpiringIn7Days = await prisma.product.count({
        where: {
            isPerishable: false,
            expiresAt: { gte: today, lte: in7Days },
            stock: { gt: 0 },
        },
    });

    const productsExpiringIn30Days = await prisma.product.count({
        where: {
            isPerishable: false,
            expiresAt: { gte: today, lte: in30Days },
            stock: { gt: 0 },
        },
    });

    return {
        expired: expiredBatches + expiredProducts,
        expiringIn7Days: expiringIn7Days + productsExpiringIn7Days,
        expiringIn30Days: expiringIn30Days + productsExpiringIn30Days,
    };
}
