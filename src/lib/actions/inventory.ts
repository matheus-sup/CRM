"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type StockEntryItem = {
    productId: string;
    productName: string;
    productSku: string;
    quantityToAdd: number;
    expiresAt: string; // ISO String
};

export async function addStockBatch(items: StockEntryItem[]) {
    if (!items || items.length === 0) {
        throw new Error("Nenhum item para adicionar.");
    }

    try {
        await prisma.$transaction(
            items.map((item) => {
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

                return prisma.product.update({
                    where: { id: item.productId },
                    data: updateData
                });
            })
        );

        revalidatePath("/admin/inventario");
        revalidatePath("/admin/produtos");
        revalidatePath("/admin/inventario/entrada");

        return { success: true };
    } catch (error) {
        console.error("Erro ao dar entrada no estoque:", error);
        throw new Error("Falha ao processar entrada de estoque.");
    }
}
