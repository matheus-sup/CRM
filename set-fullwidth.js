const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setFullWidth() {
    console.log('🔧 Ativando fullWidth em todos os blocos...\n');

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    if (!draft || !draft.homeLayout) {
        console.error('❌ Draft config não encontrado!');
        return;
    }

    const blocks = JSON.parse(draft.homeLayout);

    // Set fullWidth: true for all blocks
    blocks.forEach(block => {
        if (!block.styles) {
            block.styles = {};
        }
        block.styles.fullWidth = true;

        console.log(`✓ ${block.id}: fullWidth = true`);
    });

    // Save updated blocks
    await prisma.storeConfig.update({
        where: { id: 'store-config-draft' },
        data: {
            homeLayout: JSON.stringify(blocks)
        }
    });

    console.log('\n✅ Todos os blocos agora ocupam largura completa!');
    console.log('🔄 Atualize o editor (F5) - SEM espaços laterais!');

    await prisma.$disconnect();
}

setFullWidth().catch(console.error);
