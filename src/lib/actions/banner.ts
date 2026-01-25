"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBanners() {
    return await prisma.banner.findMany({
        orderBy: { order: "asc" }
    });
}

export async function getActiveBanners() {
    return await prisma.banner.findMany({
        where: { active: true },
        orderBy: { order: "asc" }
    });
}

export async function createBanner(formData: FormData) {
    const label = formData.get("label") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const mobileUrl = formData.get("mobileUrl") as string;
    const link = formData.get("link") as string;
    const active = formData.get("active") === "on";

    try {
        await prisma.banner.create({
            data: {
                label,
                imageUrl,
                mobileUrl,
                link,
                active
            }
        });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao criar banner" };
    }
}

export async function updateBanner(id: string, formData: FormData) {
    const label = formData.get("label") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const mobileUrl = formData.get("mobileUrl") as string;
    const link = formData.get("link") as string;
    const active = formData.get("active") === "on";

    try {
        await prisma.banner.update({
            where: { id },
            data: {
                label,
                imageUrl,
                mobileUrl,
                link,
                active
            }
        });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar banner" };
    }
}

export async function deleteBanner(id: string) {
    try {
        await prisma.banner.delete({ where: { id } });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao deletar banner" };
    }
}
