const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const config = await prisma.storeConfig.findFirst();
        console.log('Current Config Theme Color:', config?.themeColor);
        console.log('Current Config Secondary:', config?.secondaryColor);
        console.log('Current Config Background:', config?.backgroundColor);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
