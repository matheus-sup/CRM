const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const config = await prisma.storeConfig.findFirst();
        console.log('--- CONFIG DEBUG ---');
        console.log('Footer BG:', config?.footerBg);
        console.log('Footer Text:', config?.footerText);
        console.log('Theme:', config?.theme);
        console.log('Full Config Keys:', Object.keys(config || {}));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
