"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- PAGE ACTIONS ---

export async function createPage(formData: FormData) {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string; // Will likely be HTML from a rich text editor

    if (!title || !slug) {
        return { success: false, message: "Título e URL (slug) são obrigatórios." };
    }

    try {
        const page = await prisma.page.create({
            data: {
                title,
                slug,
                content: content || "<p>Conteúdo da página...</p>",
                published: true
            },
        });

        revalidatePath("/admin/paginas");
        return { success: true, message: "Página criada com sucesso!", redirectTo: `/admin/paginas/${page.id}` };
    } catch (error) {
        console.error("Erro ao criar página:", error);
        return { success: false, message: "Erro ao criar página. Verifique se a URL já existe." };
    }
}

export async function updatePage(id: string, prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "on";

    if (!title || !slug) {
        return { success: false, message: "Título e URL são obrigatórios." };
    }

    try {
        await prisma.page.update({
            where: { id },
            data: { title, slug, content, published },
        });

        revalidatePath("/admin/paginas");
        revalidatePath(`/admin/paginas/${id}`);
        return { success: true, message: "Página atualizada com sucesso!" };
    } catch (error) {
        return { success: false, message: "Erro ao atualizar página." };
    }
}

export async function deletePage(id: string) {
    try {
        await prisma.page.delete({ where: { id } });
        revalidatePath("/admin/paginas");
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erro ao excluir página." };
    }
}

export async function getPage(id: string) {
    return await prisma.page.findUnique({ where: { id } });
}

export async function togglePagePublished(id: string) {
    try {
        const page = await prisma.page.findUnique({ where: { id } });
        if (!page) {
            return { success: false, message: "Página não encontrada." };
        }

        await prisma.page.update({
            where: { id },
            data: { published: !page.published }
        });

        revalidatePath("/admin/paginas");
        revalidatePath(`/${page.slug}`);
        return { success: true, published: !page.published };
    } catch (error) {
        return { success: false, message: "Erro ao alterar status da página." };
    }
}
