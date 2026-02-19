"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- MENU ACTIONS ---

export async function createMenu(formData: FormData) {
    const title = formData.get("title") as string;
    const handle = formData.get("handle") as string;

    if (!title || !handle) {
        return { success: false, message: "Título e identificador são obrigatórios." };
    }

    try {
        const menu = await prisma.menu.create({
            data: {
                title,
                handle,
            },
        });

        revalidatePath("/admin/menus");
        return { success: true, message: "Menu criado com sucesso!", redirectTo: `/admin/menus/${menu.id}` };
    } catch (error) {
        console.error("Erro ao criar menu:", error);
        return { success: false, message: "Erro ao criar menu. O identificador deve ser único." };
    }
}

export async function updateMenu(id: string, prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const handle = formData.get("handle") as string;

    if (!title || !handle) {
        return { success: false, message: "Título e identificador são obrigatórios." };
    }

    try {
        await prisma.menu.update({
            where: { id },
            data: { title, handle },
        });

        revalidatePath("/admin/menus");
        revalidatePath(`/admin/menus/${id}`);
        return { success: true, message: "Menu atualizado com sucesso!" };
    } catch (error) {
        return { success: false, message: "Erro ao atualizar menu." };
    }
}

export async function deleteMenu(id: string) {
    try {
        await prisma.menu.delete({ where: { id } });
        revalidatePath("/admin/menus");
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erro ao excluir menu." };
    }
}

// --- MENU ITEM ACTIONS ---

export async function addMenuItem(menuId: string, prevState: any, formData: FormData) {
    const label = formData.get("label") as string;
    const url = formData.get("url") as string;

    if (!label) {
        return { success: false, message: "O nome do link é obrigatório." };
    }

    try {
        await prisma.menuItem.create({
            data: {
                menuId,
                label,
                url: url || "#",
                type: "custom", // Default to custom link for now
                order: 99 // Append to end
            }
        });

        revalidatePath(`/admin/menus/${menuId}`);
        return { success: true, message: "Item adicionado!" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao adicionar item." };
    }
}

export async function deleteMenuItem(itemId: string, menuId: string) {
    try {
        await prisma.menuItem.delete({ where: { id: itemId } });
        revalidatePath(`/admin/menus/${menuId}`);
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erro ao remover item." };
    }
}

export async function updateMenuItem(itemId: string, menuId: string, data: { label: string; url: string }) {
    try {
        await prisma.menuItem.update({
            where: { id: itemId },
            data: {
                label: data.label,
                url: data.url,
            },
        });
        revalidatePath(`/admin/menus/${menuId}`);
        return { success: true, message: "Item atualizado!" };
    } catch (error) {
        return { success: false, message: "Erro ao atualizar item." };
    }
}
