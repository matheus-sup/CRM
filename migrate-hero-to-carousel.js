const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateHeroToCarousel() {
    console.log('🔄 Migrando Hero para formato de Carrossel...\n');

    const config = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    if (!config || !config.homeLayout) {
        console.error('❌ Config draft não encontrado!');
        return;
    }

    let blocks = JSON.parse(config.homeLayout);

    // Find hero blocks
    let migrated = false;
    blocks = blocks.map(block => {
        if (block.type === 'hero') {
            // Check if already migrated (has slides array)
            if (block.content.slides) {
                console.log('✓ Hero já está no formato de carrossel');
                return block;
            }

            // Migrate to carousel format
            console.log('🔄 Convertendo Hero para carrossel...');
            migrated = true;

            return {
                ...block,
                content: {
                    slides: [
                        {
                            id: 'slide-1',
                            title: block.content.title || 'Novo Banner',
                            subtitle: block.content.subtitle || 'Subtítulo do banner',
                            buttonText: block.content.buttonText || 'Ver Mais',
                            buttonLink: block.content.buttonLink || '/produtos'
                        }
                    ],
                    autoplay: false,
                    autoplayInterval: 5
                },
                styles: block.styles
            };
        }
        return block;
    });

    if (migrated) {
        // Update draft config
        await prisma.storeConfig.update({
            where: { id: 'store-config-draft' },
            data: {
                homeLayout: JSON.stringify(blocks)
            }
        });

        console.log('\n✅ Hero migrado para formato de carrossel!');
        console.log('\n📝 Agora você pode:');
        console.log('   ✓ Adicionar múltiplas páginas');
        console.log('   ✓ Personalizar cada página com textos diferentes');
        console.log('   ✓ Navegar com setas ← →');
        console.log('   ✓ Ativar autoplay automático');
        console.log('\n🔄 Atualize o editor (F5) para ver as novas opções!');
    } else {
        console.log('✓ Nenhum hero encontrado para migrar');
    }

    await prisma.$disconnect();
}

migrateHeroToCarousel().catch(console.error);
