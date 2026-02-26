"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { parseCsv } from "@/lib/csv-helper";

export async function importProducts(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) return { success: false, message: "Nenhum arquivo enviado." };

    try {
        const text = await file.text();
        const rows = parseCsv(text);

        let count = 0;
        let errors = 0;

        for (const row of rows) {
            try {
                // Validation / Parsing
                const name = row.name?.trim();
                if (!name) continue;

                // Helper to parse BRL floats "19,90" -> 19.90
                const parseBrlFloat = (val: string) => {
                    if (!val) return 0;
                    return parseFloat(val.replace(/\./g, "").replace(",", "."));
                };

                const price = parseBrlFloat(row.price);
                const costPerItem = parseBrlFloat(row.costPerItem);
                const stock = parseInt(row.stock || "0", 10);

                // Construct Slug
                let slug = name.toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/[\s_-]+/g, "-");

                // Check existing by SKU or Barcode to Update?
                // For simplicity MVP: Upsert by SKU if present, else Create. 
                // Using SKU as unique identifier for bulk update is standard.

                const sku = row.sku?.trim() || null;
                const barcode = row.barcode?.trim() || null;

                if (sku) {
                    // Try to find by SKU
                    const existing = await prisma.product.findFirst({ where: { sku } });
                    if (existing) {
                        await prisma.product.update({
                            where: { id: existing.id },
                            data: {
                                name,
                                description: row.description,
                                price,
                                stock,
                                barcode,
                                costPerItem
                            }
                        });
                        count++;
                        continue;
                    }
                }

                // If no SKU match or no SKU, create new
                const existingSlug = await prisma.product.findUnique({ where: { slug } });
                if (existingSlug) slug = `${slug}-${Date.now()}`;

                await prisma.product.create({
                    data: {
                        name,
                        slug,
                        description: row.description,
                        price,
                        stock,
                        sku,
                        barcode,
                        costPerItem,
                        status: "ACTIVE"
                    }
                });
                count++;

            } catch (e) {
                console.error("Row error", e);
                errors++;
            }
        }

        revalidatePath("/admin/produtos");
        revalidateTag("products");
        return { success: true, message: `Processado: ${count} salvos, ${errors} erros.` };

    } catch (error) {
        console.error("Import error", error);
        return { success: false, message: "Erro ao processar arquivo." };
    }
}


// Cached version for faster loads
const getCachedProducts = unstable_cache(
    async () => {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                barcode: true,
                price: true,
                costPerItem: true,
                stock: true,
                expiresAt: true,
                isPerishable: true,
                brandLegacy: true,
                images: {
                    take: 1,
                    select: { url: true }
                },
                brand: {
                    select: { name: true }
                },
                category: {
                    select: { id: true, name: true }
                },
                batches: {
                    where: { quantity: { gt: 0 } },
                    orderBy: { expiresAt: "asc" },
                    take: 1,
                    select: { expiresAt: true }
                }
            },
        });

        return products.map(product => ({
            ...product,
            price: product.price.toNumber(),
            costPerItem: product.costPerItem?.toNumber() || null,
            nextBatchExpiry: product.batches[0]?.expiresAt || null,
        }));
    },
    ["products-list"],
    { revalidate: 30, tags: ["products"] }
);

export async function getProducts() {
    return getCachedProducts();
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true, images: true, brand: true },
    });

    if (!product) return null;

    return {
        ...product,
        price: product.price.toNumber(),
        compareAtPrice: product.compareAtPrice?.toNumber() || null,
        costPerItem: product.costPerItem?.toNumber() || null,
        weight: product.weight?.toNumber() || null,
        length: product.length?.toNumber() || null,
        width: product.width?.toNumber() || null,
        height: product.height?.toNumber() || null,
    };
}

export async function getProductBySlug(slug: string) {
    return await prisma.product.findUnique({
        where: { slug },
        include: { variants: true, images: true, brand: true, category: true },
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
    const isPerishable = formData.get("isPerishable") === "true";
    const measurements = formData.get("measurements") as string | null;

    const rawExpiresAt = formData.get("expiresAt") as string | null;
    const expiresAt = rawExpiresAt ? new Date(rawExpiresAt as string) : null;

    // Check for uniqueness conflicts (SKU, Barcode, Name)
    // Only check if values are present. Exclude current product if editing (id).

    if (sku) {
        const existingSku = await prisma.product.findFirst({
            where: {
                sku,
                id: id ? { not: id } : undefined // Exclude self
            }
        });
        if (existingSku) {
            return { success: false, message: `Já existe um produto com o SKU "${sku}".` };
        }
    }

    if (barcode) {
        const existingBarcode = await prisma.product.findFirst({
            where: {
                barcode,
                id: id ? { not: id } : undefined // Exclude self
            }
        });
        if (existingBarcode) {
            return { success: false, message: `Já existe um produto com o código de barras "${barcode}".` };
        }
    }

    // Name Check (Warning logic)
    // We need a way to know if user confirmed. 
    // We check for "force" flag in formData.
    const forceSave = formData.get("forceSave") === "true";

    if (!forceSave) {
        const existingName = await prisma.product.findFirst({
            where: {
                name,
                id: id ? { not: id } : undefined
            }
        });
        if (existingName) {
            return {
                success: false,
                requiresConfirmation: true,
                message: `Já existe um produto com o nome "${name}". Deseja continuar?`
            };
        }
    }

    // Simple slug formation
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
        // brand: brand || null, // REMOVED: This conflicts with relation field. Handled below.
        videoUrl: videoUrl || null,
        weight,
        length,
        width,
        height,
        measurements: measurements || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isNewArrival,
        isPerishable,
        expiresAt: isPerishable ? null : (expiresAt && !isNaN(expiresAt.getTime()) ? expiresAt : null),
        status: "ACTIVE",
    };

    // Handle Category Relation
    if (categoryId) {
        data.category = { connect: { id: categoryId } };
    } else if (id) {
        // If updating and no category provided, disconnect it
        data.category = { disconnect: true };
    }

    // Handle Brand Relation
    // The frontend should pass 'brandId' if selected from list.
    // The legacy 'brand' string field is mapped to 'brandLegacy' in schema but we might still receive it.
    // Ideally we transition to brandId completely.

    // If we receive brandId, connect it.
    // If we only receive brand name string (and no ID), we should find or create it.

    let targetBrandId = formData.get("brandId") as string | null;
    const brandName = formData.get("brandName") as string | null;

    if (!targetBrandId && brandName && brandName.trim()) {
        // "Create on the fly" or "Find by name" logic if the UI sends a name but no ID.
        // For strictness, let's assume UI handles creation via the "Add Brand" button and sends ID.
        // BUT for safety/legacy support:
        const slug = brandName.toLowerCase().trim().replace(/\s+/g, "-");
        const existing = await prisma.brand.findFirst({ where: { slug } });
        if (existing) {
            targetBrandId = existing.id;
        } else {
            const newBrand = await prisma.brand.create({
                data: { name: brandName.trim(), slug }
            });
            targetBrandId = newBrand.id;
        }
    }

    if (targetBrandId) {
        data.brand = { connect: { id: targetBrandId } };
    } else if (id) {
        data.brand = { disconnect: true };
    }

    // Clear legacy field if we are switching to relation
    if (data.brand) {
        data.brandLegacy = null;
    }

    let targetProductId = id;

    if (id) {
        await prisma.product.update({
            where: { id },
            data,
        });
    } else {
        // Create Logic
        // ... (existing logic)
        let uniqueSlug = slug;
        let counter = 1;
        while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${Date.now()}-${counter}`;
            counter++;
        }
        slug = uniqueSlug;

        const product = await prisma.product.create({
            data: {
                ...data,
                slug,
            },
        });
        targetProductId = product.id;

        // For perishable products with initial stock, create the first batch
        if (isPerishable && stock > 0 && expiresAt && !isNaN(expiresAt.getTime())) {
            await prisma.productBatch.create({
                data: {
                    productId: product.id,
                    quantity: stock,
                    initialQty: stock,
                    expiresAt: expiresAt,
                    unitCost: costPerItem || null,
                }
            });

            // Also create a stock movement record for the initial stock
            await prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    type: "IN",
                    quantity: stock,
                    unitPrice: costPerItem || null,
                    totalValue: costPerItem ? costPerItem * stock : null,
                    reason: "Estoque inicial",
                }
            });
        }
    }

    // Handle Image Deletions (for existing products)
    // Get the IDs of images to keep
    const keepImageIds = formData.getAll("keepImageIds") as string[];

    if (id && targetProductId) {
        // Delete images that are NOT in the keepImageIds list
        const imagesToDelete = await prisma.productImage.findMany({
            where: {
                productId: targetProductId,
                id: { notIn: keepImageIds },
            },
        });

        // Delete files from disk and database
        if (imagesToDelete.length > 0) {
            const fs = require("fs");
            const path = require("path");

            for (const img of imagesToDelete) {
                // Delete file from disk if it's a local upload
                if (img.url.startsWith("/uploads/")) {
                    const filePath = path.join(process.cwd(), "public", img.url);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }

            // Delete from database
            await prisma.productImage.deleteMany({
                where: {
                    productId: targetProductId,
                    id: { notIn: keepImageIds },
                },
            });
        }
    }

    // Handle Image Uploads
    // Valid for both Create and Update
    const images = formData.getAll("images") as File[];

    if (images && images.length > 0 && targetProductId) {
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const image of images) {
            if (image.size > 0 && image.name) {
                const ext = path.extname(image.name);
                const filename = `${Date.now()}-${Math.round(Math.random() * 1000)}${ext}`;
                const filepath = path.join(uploadDir, filename);

                const buffer = Buffer.from(await image.arrayBuffer());
                fs.writeFileSync(filepath, buffer);

                await prisma.productImage.create({
                    data: {
                        productId: targetProductId,
                        url: `/uploads/${filename}`,
                        alt: name
                    }
                });
            }
        }
    }

    revalidatePath("/admin/produtos");
    revalidatePath("/");
    revalidateTag("products");
    redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/produtos");
    revalidatePath("/");
    revalidateTag("products");
    redirect("/admin/produtos");
}
