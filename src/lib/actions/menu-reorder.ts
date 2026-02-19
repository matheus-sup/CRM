"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Move a single menu item up or down
export async function moveMenuItem(menuId: string, itemId: string, direction: "up" | "down") {
    try {
        // Get all items for this menu, sorted by order
        const items = await prisma.menuItem.findMany({
            where: { menuId },
            orderBy: { order: "asc" },
        });

        const currentIndex = items.findIndex(item => item.id === itemId);
        if (currentIndex === -1) {
            return { success: false, message: "Item não encontrado." };
        }

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= items.length) {
            return { success: false, message: "Não é possível mover nesta direção." };
        }

        // Swap the orders
        const currentItem = items[currentIndex];
        const targetItem = items[targetIndex];

        await prisma.$transaction([
            prisma.menuItem.update({
                where: { id: currentItem.id },
                data: { order: targetItem.order },
            }),
            prisma.menuItem.update({
                where: { id: targetItem.id },
                data: { order: currentItem.order },
            }),
        ]);

        revalidatePath(`/admin/menus/${menuId}`);
        revalidatePath(`/admin/menus`);
        revalidatePath(`/admin/editor`);
        return { success: true };
    } catch (error) {
        console.error("Failed to move menu item:", error);
        return { success: false, message: "Erro ao mover item." };
    }
}

// Accepts an array of item IDs in the desired order
export async function reorderMenuItems(menuId: string, orderedIds: string[]) {
    try {
        const transaction = orderedIds.map((id, index) =>
            prisma.menuItem.update({
                where: { id },
                data: { order: index },
            })
        );

        await prisma.$transaction(transaction);
        revalidatePath(`/admin/menus/${menuId}`);
        revalidatePath(`/admin/menus`);
        revalidatePath(`/admin/editor`);
        return { success: true };
    } catch (error) {
        console.error("Failed to reorder menu items:", error);
        return { success: false, message: "Erro ao reordenar itens." };
    }
}
