"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBrand(name: string) {
    if (!name?.trim()) return { success: false, message: "Nome inválido." };

    try {
        const slug = name.toLowerCase()
            .trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        // Check availability
        const existing = await prisma.brand.findUnique({ where: { slug } });
        if (existing) return { success: false, message: "Marca já existe." };

        const newBrand = await prisma.brand.create({
            data: {
                name: name.trim(),
                slug,
            }
        });

        revalidatePath("/admin/produtos");
        return { success: true, brand: newBrand };
    } catch (error) {
        console.error("Create brand error:", error);
        return { success: false, message: "Erro ao criar marca." };
    }
}

export async function deleteBrand(id: string) {
    try {
        // Validation handled in frontend usually, but good to check relations? 
        // Prisma catches foreign key constraint if strict? 
        // We will just try delete.

        await prisma.brand.delete({ where: { id } });
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erro ao excluir marca. Verifique se existem produtos associados." };
    }
}

export async function updateBrand(id: string, newName: string) {
    if (!newName?.trim()) return { success: false, message: "Nome inválido." };

    try {
        const slug = newName.toLowerCase()
            .trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        // Check if another brand has this slug
        const existing = await prisma.brand.findUnique({ where: { slug } });
        if (existing && existing.id !== id) return { success: false, message: "Já existe uma marca com este nome." };

        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: {
                name: newName.trim(),
                slug
            }
        });

        revalidatePath("/admin/produtos");
        return { success: true, brand: updatedBrand };
    } catch (error) {
        console.error("Update brand error:", error);
        return { success: false, message: "Erro ao atualizar marca." };
    }
}

export async function getAllBrands() {
    return await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { products: true } }
        }
    });
}
