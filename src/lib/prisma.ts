import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildDatasourceUrl(): string {
    const envUrl = process.env.DATABASE_URL || "";
    // If it's a relative SQLite path, resolve to absolute so it works in Next.js production builds
    if (envUrl.startsWith("file:./") || envUrl.startsWith("file:../")) {
        const relativePath = envUrl.replace("file:", "");
        // Resolve relative to the prisma/ directory (where schema.prisma lives)
        const absolutePath = path.resolve(process.cwd(), "prisma", relativePath);
        return `file:${absolutePath}`;
    }
    return envUrl;
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasourceUrl: buildDatasourceUrl(),
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
