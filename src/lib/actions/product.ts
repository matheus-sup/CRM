"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: { variants: true },
    });
}

export async function getProductById(id: string) {
    return await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
    });
}

export async function getProductBySlug(slug: string) {
    return await prisma.product.findUnique({
        where: { slug },
        include: { variants: true },
    });
}

export async function upsertProduct(formData: FormData) {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string | null;
    const categoryId = formData.get("categoryId") as string | null;
    const costPerItem = formData.get("costPerItem") ? parseFloat(formData.get("costPerItem") as string) : null;
    const barcode = formData.get("barcode") as string | null;
    const brand = formData.get("brand") as string | null;
    const videoUrl = formData.get("videoUrl") as string | null;
    const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null;
    const length = formData.get("length") ? parseFloat(formData.get("length") as string) : null;
    const width = formData.get("width") ? parseFloat(formData.get("width") as string) : null;
    const height = formData.get("height") ? parseFloat(formData.get("height") as string) : null;
    const seoTitle = formData.get("seoTitle") as string | null;
    const seoDescription = formData.get("seoDescription") as string | null;

    // Simple slug generation
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const data = {
        name,
        slug: id ? undefined : slug,
        description,
        price,
        compareAtPrice,
        costPerItem,
        stock,
        sku,
        barcode,
        brand,
        videoUrl,
        weight,
        length,
        width,
        height,
        seoTitle,
        seoDescription,
        categoryId: categoryId || null,
        status: "ACTIVE",
    };

    if (id) {
        await prisma.product.update({
            where: { id },
            data,
        });
    } else {
        await prisma.product.create({
            data: {
                ...data,
                slug,
            },
        });
    }

    revalidatePath("/admin/produtos");
    revalidatePath("/admin/inventario");
    revalidatePath("/");
    redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/produtos");
}
