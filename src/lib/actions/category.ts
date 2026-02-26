"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const parentId = formData.get("parentId") as string | null;

        if (!name) return { success: false, message: "Nome da categoria é obrigatório." };

        // Simple slugify
        const slug = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        await prisma.category.create({
            data: {
                name,
                slug: parentId ? `${slug}-${Date.now()}` : slug, // Avoid slug collisions for subcats or just unique
                parentId: parentId || null
            }
        });

        revalidatePath("/admin/produtos");
        return { success: true, message: "Categoria criada com sucesso!" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao criar categoria." };
    }
}

export async function updateCategory(id: string, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        if (!name) return { success: false, message: "Nome da categoria é obrigatório." };

        const slug = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        await prisma.category.update({
            where: { id },
            data: { name, slug }
        });

        revalidatePath("/admin/produtos");
        return { success: true, message: "Categoria atualizada com sucesso!" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao atualizar categoria." };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id }
        });
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (e) {
        return { success: false, message: "Não foi possível excluir a categoria." };
    }
}
