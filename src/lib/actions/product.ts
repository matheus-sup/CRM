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
    const description = formData.get("description") as string;

    // Helper to safely parse decimals (handles commas and dots)
    const parseDecimal = (value: FormDataEntryValue | null) => {
        if (!value || typeof value !== "string") return null;
        const cleaned = value.replace(",", "."); // Allow comma as decimal separator
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    };

    const parseIntSafe = (value: FormDataEntryValue | null) => {
        if (!value || typeof value !== "string") return 0;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const price = parseDecimal(formData.get("price"));
    if (price === null) {
        throw new Error("Preço inválido");
    }

    const compareAtPrice = parseDecimal(formData.get("compareAtPrice"));
    const costPerItem = parseDecimal(formData.get("costPerItem"));
    const stock = parseIntSafe(formData.get("stock"));
    const weight = parseDecimal(formData.get("weight"));
    const length = parseDecimal(formData.get("length"));
    const width = parseDecimal(formData.get("width"));
    const height = parseDecimal(formData.get("height"));

    const sku = formData.get("sku") as string | null;
    // Treat empty string as null for category
    const rawCategoryId = formData.get("categoryId") as string | null;
    const categoryId = rawCategoryId && rawCategoryId.trim() !== "" ? rawCategoryId : null;

    const barcode = formData.get("barcode") as string | null;
    const brand = formData.get("brand") as string | null;
    const videoUrl = formData.get("videoUrl") as string | null;
    const seoTitle = formData.get("seoTitle") as string | null;
    const seoDescription = formData.get("seoDescription") as string | null;
    const isNewArrival = formData.get("isNewArrival") === "true";

    const rawExpiresAt = formData.get("expiresAt") as string | null;
    const expiresAt = rawExpiresAt ? new Date(rawExpiresAt as string) : null;

    // Simple slug generation
    let slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!slug) {
        slug = `product-${Date.now()}`;
    }

    // Base data without relations that might cause scalar/relation conflicts
    const data: any = {
        name,
        slug: id ? undefined : slug, // Don't update slug if editing
        description,
        price,
        compareAtPrice,
        costPerItem,
        stock,
        sku: sku || null,
        barcode: barcode || null,
        brand: brand || null,
        videoUrl: videoUrl || null,
        weight,
        length,
        width,
        height,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isNewArrival,
        expiresAt: expiresAt && !isNaN(expiresAt.getTime()) ? expiresAt : null,
        status: "ACTIVE",
    };

    // Handle Category Relation
    if (categoryId) {
        data.category = { connect: { id: categoryId } };
    } else if (id) {
        // If updating and no category provided, disconnect it
        data.category = { disconnect: true };
    }

    if (id) {
        await prisma.product.update({
            where: { id },
            data,
        });
    } else {
        // Create Logic
        // Ensure slug is unique by appending timestamp if collision (basic heuristic, in real app better logic needed)
        // For now, we rely on the generated slug but catch collision if we wanted to be 100% safe.
        // But the previous code just crashed.

        // Check for existing slug to prevent crash
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
            data.slug = slug;
        }

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
