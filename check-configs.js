const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfigs() {
    console.log('🔍 Verificando configurações...\n');

    // Check live config
    const live = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    console.log('📌 LIVE CONFIG (store-config):');
    console.log('  homeLayout type:', typeof live?.homeLayout);
    if (typeof live?.homeLayout === 'string') {
        if (live.homeLayout === 'modern') {
            console.log('  ✓ Using ModernHome (legacy)');
        } else if (live.homeLayout.startsWith('[') || live.homeLayout.startsWith('{')) {
            const blocks = JSON.parse(live.homeLayout);
            console.log('  ✓ Using Page Builder - blocks:', blocks.length);
            blocks.forEach((b, i) => {
                console.log(`    ${i + 1}. ${b.id} (${b.type})`);
            });
        }
    }

    // Check draft config
    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    console.log('\n📝 DRAFT CONFIG (store-config-draft):');
    if (draft?.homeLayout) {
        const blocks = JSON.parse(draft.homeLayout);
        console.log('  ✓ Blocks:', blocks.length);
        blocks.forEach((b, i) => {
            console.log(`    ${i + 1}. ${b.id} (${b.type})`);
        });
    } else {
        console.log('  ❌ No draft config found');
    }

    await prisma.$disconnect();
}

checkConfigs().catch(console.error);
