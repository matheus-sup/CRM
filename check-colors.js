const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColors() {
    const live = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    console.log('\n=== CORES NO SITE REAL (LIVE) ===');
    console.log('themeColor (primária):', live?.themeColor);
    console.log('backgroundColor:', live?.backgroundColor);
    console.log('headerColor:', live?.headerColor);
    console.log('footerBg:', live?.footerBg);
    console.log('bannerTextColor:', live?.bannerTextColor);

    console.log('\n=== CORES NO EDITOR (DRAFT) ===');
    console.log('themeColor (primária):', draft?.themeColor);
    console.log('backgroundColor:', draft?.backgroundColor);
    console.log('headerColor:', draft?.headerColor);
    console.log('footerBg:', draft?.footerBg);
    console.log('bannerTextColor:', draft?.bannerTextColor);

    console.log('\n=== ANÁLISE ===');
    if (live?.themeColor === draft?.themeColor) {
        console.log('✓ Cores primárias são IGUAIS');
    } else {
        console.log('✗ Cores primárias são DIFERENTES');
        console.log(`  Site usa: ${live?.themeColor} (roxo)`);
        console.log(`  Editor usa: ${draft?.themeColor}`);
    }

    await prisma.$disconnect();
}

checkColors().catch(console.error);
