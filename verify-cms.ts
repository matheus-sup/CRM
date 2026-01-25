import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("Verifying Database Connection...");
    try {
        const config = await prisma.storeConfig.findUnique({
            where: { id: "store-config" },
        });
        console.log("Live Config:", config);

        const draft = await prisma.storeConfig.findUnique({
            where: { id: "store-config-draft" },
        });
        console.log("Draft Config:", draft);
    } catch (error) {
        console.error("Database Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
