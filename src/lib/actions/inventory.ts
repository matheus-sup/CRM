"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createBatch } from "./batch";

type StockEntryItem = {
    productId: string;
    productName: string;
    productSku: string;
    quantityToAdd: number;
    expiresAt: string; // ISO String
    unitCost?: number;
};

export async function addStockBatch(items: StockEntryItem[]) {
    if (!items || items.length === 0) {
        throw new Error("Nenhum item para adicionar.");
    }

    try {
        // Process each item
        for (const item of items) {
            // Check if product is perishable
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { isPerishable: true }
            });

            if (product?.isPerishable) {
                // Perishable products MUST have expiry date
                if (!item.expiresAt) {
                    throw new Error(`Produto perecível "${item.productName}" requer data de validade.`);
                }

                // Create batch for perishable product (this handles stock increment and movement)
                await createBatch({
                    productId: item.productId,
                    quantity: item.quantityToAdd,
                    expiresAt: item.expiresAt,
                    unitCost: item.unitCost
                });
            } else {
                // Non-perishable: update stock directly and optionally set expiry
                await prisma.$transaction(async (tx) => {
                    const updateData: any = {
                        stock: { increment: item.quantityToAdd }
                    };

                    // Only update expiration date if a valid date string is provided
                    if (item.expiresAt) {
                        const date = new Date(item.expiresAt);
                        if (!isNaN(date.getTime())) {
                            updateData.expiresAt = date;
                        }
                    }

                    await tx.product.update({
                        where: { id: item.productId },
                        data: updateData
                    });

                    // Record stock movement
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            type: "IN",
                            quantity: item.quantityToAdd,
                            unitPrice: item.unitCost ?? null,
                            totalValue: item.unitCost ? item.unitCost * item.quantityToAdd : null,
                            reason: item.expiresAt
                                ? `Entrada de estoque - Validade: ${new Date(item.expiresAt).toLocaleDateString("pt-BR")}`
                                : "Entrada de estoque"
                        }
                    });
                });
            }
        }

        revalidatePath("/admin/produtos");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Erro ao dar entrada no estoque:", error);
        throw error;
    }
}
