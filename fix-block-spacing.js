const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBlockSpacing() {
    console.log('🔧 Ajustando espaçamento dos blocos...\n');

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    if (!draft || !draft.homeLayout) {
        console.error('❌ Draft config não encontrado!');
        return;
    }

    const blocks = JSON.parse(draft.homeLayout);

    // Update each block to have proper full-width styling
    blocks.forEach(block => {
        // Remove all padding defaults
        if (block.styles) {
            block.styles.paddingTop = block.styles.paddingTop || '0';
            block.styles.paddingBottom = block.styles.paddingBottom || '0';
            block.styles.paddingLeft = '0';
            block.styles.paddingRight = '0';
            block.styles.width = '100%';
            block.styles.maxWidth = '100%';
        }

        // For text blocks, update HTML to not have container restrictions
        if (block.type === 'text' && block.content.html) {
            // Remove max-width constraints from containers if any
            block.content.html = block.content.html.replace(/max-w-\[.*?\]/g, 'w-full');
        }
    });

    // Save updated blocks
    await prisma.storeConfig.update({
        where: { id: 'store-config-draft' },
        data: {
            homeLayout: JSON.stringify(blocks)
        }
    });

    console.log('✅ Espaçamento ajustado!');
    console.log('📋 Blocos atualizados:', blocks.length);
    console.log('\n🔄 Atualize o editor (F5) para ver as mudanças');

    await prisma.$disconnect();
}

fixBlockSpacing().catch(console.error);
