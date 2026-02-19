const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfigs() {
    const live = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    console.log('\n=== DIFERENÇAS ENCONTRADAS ===\n');

    const allKeys = new Set([...Object.keys(live || {}), ...Object.keys(draft || {})]);

    for (const key of allKeys) {
        const liveVal = live?.[key];
        const draftVal = draft?.[key];

        // Skip dates and id
        if (key === 'createdAt' || key === 'updatedAt' || key === 'id') continue;

        if (JSON.stringify(liveVal) !== JSON.stringify(draftVal)) {
            console.log(`\n${key}:`);
            console.log('  LIVE:', typeof liveVal === 'string' && liveVal.length > 80 ? liveVal.substring(0, 80) + '...' : liveVal);
            console.log('  DRAFT:', typeof draftVal === 'string' && draftVal.length > 80 ? draftVal.substring(0, 80) + '...' : draftVal);
        }
    }

    await prisma.$disconnect();
}

checkConfigs().catch(console.error);
