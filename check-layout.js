const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLayout() {
    const live = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    console.log('\n=== LIVE CONFIG (Site Real) ===');
    console.log('homeLayout:', live?.homeLayout);

    console.log('\n=== DRAFT CONFIG (Editor) ===');
    console.log('homeLayout:', draft?.homeLayout);

    console.log('\n=== ANÁLISE ===');
    if (live?.homeLayout === draft?.homeLayout) {
        console.log('✓ homeLayout está SINCRONIZADO');
    } else {
        console.log('✗ homeLayout está DIFERENTE!');
        console.log('\nIsso explica por que o preview é diferente do site real.');
        console.log('Solução: Clique em PUBLICAR no editor para sincronizar.');
    }

    await prisma.$disconnect();
}

checkLayout().catch(console.error);
