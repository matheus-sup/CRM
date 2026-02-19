const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNewsletterFullWidth() {
    console.log('🔧 Ajustando newsletter para largura completa...\n');

    const draft = await prisma.storeConfig.findUnique({
        where: { id: 'store-config-draft' }
    });

    if (!draft || !draft.homeLayout) {
        console.error('❌ Draft config não encontrado!');
        return;
    }

    const config = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    const blocks = JSON.parse(draft.homeLayout);

    // Find and update newsletter block
    const newsletterBlock = blocks.find(b => b.id === 'newsletter-section');

    if (newsletterBlock) {
        // Update with full-width HTML (no container, no py-24)
        newsletterBlock.content.html = `
            <div class="w-full text-white" style="background-color: ${config.footerBg || '#0f172a'}; padding: 6rem 0;">
                <div class="max-w-4xl mx-auto px-4 text-center">
                    <svg class="h-12 w-12 mx-auto mb-6 opacity-80" style="color: ${config.themeColor || '#6366f1'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h2 class="text-4xl font-bold mb-4">Entre para o Clube</h2>
                    <p class="max-w-md mx-auto mb-8 opacity-70">Receba novidades, dicas de beleza e ofertas exclusivas diretamente no seu e-mail.</p>
                    <div class="max-w-md mx-auto flex gap-2">
                        <input type="email" placeholder="Seu melhor e-mail" class="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-full h-12 px-6 focus:outline-none focus:ring-2">
                        <button class="rounded-full h-12 px-8 font-bold hover:opacity-90 transition" style="background-color: ${config.themeColor || '#6366f1'}; color: #ffffff">Inscrever</button>
                    </div>
                </div>
            </div>
        `;

        // Ensure no padding on the block wrapper
        newsletterBlock.styles.paddingTop = '0';
        newsletterBlock.styles.paddingBottom = '0';
        newsletterBlock.styles.paddingLeft = '0';
        newsletterBlock.styles.paddingRight = '0';
        newsletterBlock.styles.margin = '0';

        console.log('✅ Newsletter atualizado para largura completa!');
    }

    // Also update other text blocks to remove container restrictions
    blocks.forEach(block => {
        if (block.type === 'text' && block.content.html) {
            // Remove container classes that restrict width
            block.content.html = block.content.html
                .replace(/class="container mx-auto/g, 'class="w-full')
                .replace(/class="py-\d+/g, 'class="');

            // Ensure no padding
            if (block.styles) {
                block.styles.paddingTop = block.styles.paddingTop || '0';
                block.styles.paddingBottom = block.styles.paddingBottom || '0';
                block.styles.paddingLeft = '0';
                block.styles.paddingRight = '0';
            }
        }
    });

    // Save updated blocks
    await prisma.storeConfig.update({
        where: { id: 'store-config-draft' },
        data: {
            homeLayout: JSON.stringify(blocks)
        }
    });

    console.log('✅ Todos os blocos ajustados!');
    console.log('\n🔄 Atualize o editor (F5) - Agora sem espaços brancos!');

    await prisma.$disconnect();
}

fixNewsletterFullWidth().catch(console.error);
