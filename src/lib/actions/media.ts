"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { writeFile, unlink } from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function uploadMedia(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const copyright = formData.get("copyright") as string;
        const altText = formData.get("altText") as string;

        if (!file) {
            return { success: false, message: "Nenhum arquivo enviado." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Simple unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); // Sanitize
        const filename = `${uniqueSuffix}-${originalName}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Write file to public/uploads
        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;

        // Save to DB
        const media = await prisma.media.create({
            data: {
                url,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
                copyright,
                altText
            }
        });

        revalidatePath("/admin/site");
        return { success: true, media };

    } catch (error) {
        console.error("Erro ao fazer upload:", error);
        return { success: false, message: "Erro ao salvar o arquivo." };
    }
}

export async function addExternalMedia(url: string, copyright?: string, altText?: string) {
    try {
        const media = await prisma.media.create({
            data: {
                url, // External URL
                copyright,
                altText,
                mimeType: "external/url"
            }
        });

        revalidatePath("/admin/site");
        return { success: true, media };
    } catch (error) {
        console.error("Erro ao adicionar mídia externa:", error);
        return { success: false, message: "Erro ao adicionar link." };
    }
}

export async function getMediaLibrary(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const media = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
    });

    const total = await prisma.media.count();

    return { media, total, pages: Math.ceil(total / limit) };
}

export async function deleteMedia(id: string) {
    try {
        const media = await prisma.media.findUnique({ where: { id } });

        if (!media) return { success: false, message: "Mídia não encontrada" };

        // Delete from DB
        await prisma.media.delete({ where: { id } });

        // If local file, delete from disk
        if (media.url.startsWith("/uploads/")) {
            const filepath = path.join(process.cwd(), "public", media.url);
            try {
                await unlink(filepath);
            } catch (err) {
                console.warn("Could not delete file from disk (might ideally not exist):", err);
            }
        }

        revalidatePath("/admin/site");
        return { success: true };
    } catch (error) {
        console.error("Erro ao apagar mídia:", error);
        return { success: false, message: "Erro ao apagar." };
    }
}
