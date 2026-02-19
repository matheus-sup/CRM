const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfigs() {
    const live = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    console.log('\n=== LIVE CONFIG (Site Real) ===');
    console.log('homeLayout:', live?.homeLayout?.substring(0, 100) + '...');
    console.log('themeColor:', live?.themeColor);
    console.log('storeName:', live?.storeName);

    console.log('\n=== DRAFT CONFIG (Editor) ===');
    console.log('homeLayout:', draft?.homeLayout?.substring(0, 100) + '...');
    console.log('themeColor:', draft?.themeColor);
    console.log('storeName:', draft?.storeName);

    console.log('\n=== SINCRONIZAÇÃO ===');
    if (JSON.stringify(live) === JSON.stringify(draft)) {
        console.log('✓ Configs estão SINCRONIZADAS');
    } else {
        console.log('✗ Configs estão DIFERENTES - Precisa clicar em PUBLICAR no editor');
    }

    await prisma.$disconnect();
}

checkConfigs().catch(console.error);
