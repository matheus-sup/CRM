const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertNewsletterToVisual() {
    console.log('🔄 Convertendo Newsletter para Editor Visual...\n');

    const config = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    if (!config || !config.homeLayout) {
        console.error('❌ Config não encontrado!');
        return;
    }

    const blocks = JSON.parse(config.homeLayout);

    // Find newsletter block (currently type "text")
    const newsletterIndex = blocks.findIndex(b => b.id === 'newsletter-section');

    if (newsletterIndex === -1) {
        console.error('❌ Bloco de newsletter não encontrado!');
        return;
    }

    console.log('✓ Newsletter encontrado - convertendo para editor visual...');

    // Convert to new newsletter block with visual editor
    blocks[newsletterIndex] = {
        id: 'newsletter-section',
        type: 'newsletter',
        content: {
            title: 'Entre para o Clube',
            description: 'Receba novidades, dicas de beleza e ofertas exclusivas diretamente no seu e-mail.',
            placeholder: 'Seu melhor e-mail',
            buttonText: 'Inscrever'
        },
        styles: {
            backgroundColor: config.footerBg || '#0f172a',
            titleColor: '#ffffff',
            textColor: '#ffffff',
            iconColor: config.themeColor || '#6366f1',
            buttonColor: config.themeColor || '#6366f1',
            buttonTextColor: '#ffffff',
            inputTextColor: '#ffffff',
            paddingTop: '0',
            paddingBottom: '0',
            paddingLeft: '0',
            paddingRight: '0',
            fullWidth: true
        }
    };

    console.log('✅ Newsletter convertido!');
    console.log('   Tipo: text → newsletter');
    console.log('   Agora editável visualmente!');

    // Update both draft and live configs
    await prisma.storeConfig.update({
        where: { id: 'store-config-draft' },
        data: {
            homeLayout: JSON.stringify(blocks)
        }
    });

    await prisma.storeConfig.update({
        where: { id: 'store-config' },
        data: {
            homeLayout: JSON.stringify(blocks)
        }
    });

    console.log('\n✅ Conversão concluída! Atualize o editor (F5)');
    console.log('\n🎨 Agora você pode editar:');
    console.log('   ✓ Título');
    console.log('   ✓ Descrição');
    console.log('   ✓ Placeholder ("Seu melhor e-mail")');
    console.log('   ✓ Texto do botão');
    console.log('   ✓ Todas as cores!');
    console.log('\n📝 SEM CÓDIGO HTML! Tudo visual! 🎉');

    await prisma.$disconnect();
}

convertNewsletterToVisual().catch(console.error);
