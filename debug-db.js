const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const config = await prisma.storeConfig.findUnique({
            where: { id: 'store-config' }
        });
        console.log('--- LIVE CONFIG ---');
        console.log(config);

        const draft = await prisma.storeConfig.findUnique({
            where: { id: 'store-config-draft' }
        });
        console.log('--- DRAFT CONFIG ---');
        console.log(draft);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
