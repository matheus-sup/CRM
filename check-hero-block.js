const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHeroBlock() {
    const live = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    const blocks = JSON.parse(live.homeLayout);
    const hero = blocks.find(b => b.type === 'hero');

    console.log('🔍 Hero Block Data:\n');
    console.log(JSON.stringify(hero, null, 2));

    await prisma.$disconnect();
}

checkHeroBlock().catch(console.error);
