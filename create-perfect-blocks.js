const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPerfectBlocks() {
    console.log('🎨 Criando blocos PERFEITOS para o site...\n');

    const config = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    if (!config) {
        console.error('❌ Config não encontrado!');
        return;
    }

    // Create perfect blocks that match ModernHome exactly
    const blocks = [
        // 1. HERO - Purple gradient background
        {
            id: 'hero-main',
            type: 'hero',
            content: {
                title: config.storeName || 'Minha Loja',
                subtitle: config.description || 'Sua loja online com os melhores produtos. Qualidade e atendimento diferenciado para você.',
                buttonText: 'Ver Coleção',
                buttonLink: '/produtos'
            },
            styles: {
                minHeight: '80vh',
                background: `linear-gradient(to bottom right, ${config.themeColor || '#6366f1'}, #4c1d95)`,
                textColor: '#ffffff',
                textAlign: 'center',
                paddingTop: '0',
                paddingBottom: '0',
                paddingLeft: '0',
                paddingRight: '0',
                buttonColor: config.themeColor || '#6366f1',
                buttonTextColor: '#ffffff',
                fullWidth: true
            }
        },

        // 2. BRANDS - Dedicated block type
        {
            id: 'brands-section',
            type: 'brands',
            content: {},
            styles: {
                paddingTop: '0',
                paddingBottom: '0',
                paddingLeft: '0',
                paddingRight: '0',
                headingColor: config.headingColor || '#111827',
                fullWidth: true
            }
        },

        // 3. CATEGORIES - Dedicated block type
        {
            id: 'categories-section',
            type: 'categories',
            content: {},
            styles: {
                paddingTop: '0',
                paddingBottom: '0',
                paddingLeft: '0',
                paddingRight: '0',
                headingColor: config.headingColor || '#111827',
                fullWidth: true
            }
        },

        // 4. FEATURED PRODUCTS
        {
            id: 'products-featured',
            type: 'product-grid',
            content: {
                collectionType: 'featured',
                title: 'Os Queridinhos do Momento',
                subtitle: 'Produtos selecionados a dedo que estão definindo tendências.',
                limit: 4
            },
            styles: {
                paddingTop: '5rem',
                paddingBottom: '5rem',
                paddingLeft: '0',
                paddingRight: '0',
                backgroundColor: 'rgb(248, 250, 252)',
                textColor: config.headingColor || '#111827',
                accentColor: config.themeColor || '#6366f1',
                fullWidth: true
            }
        },

        // 5. NEWSLETTER
        {
            id: 'newsletter-section',
            type: 'text',
            content: {
                html: `<div style="padding: 6rem 0; background-color: ${config.footerBg || '#0f172a'}; color: #ffffff; width: 100%;">
                    <div style="max-width: 56rem; margin: 0 auto; padding: 0 1rem; text-center;">
                        <svg style="height: 3rem; width: 3rem; margin: 0 auto 1.5rem; opacity: 0.8; color: ${config.themeColor || '#6366f1'};" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <h2 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; color: #ffffff;">Entre para o Clube</h2>
                        <p style="max-width: 28rem; margin: 0 auto 2rem; opacity: 0.7; color: #ffffff;">Receba novidades, dicas de beleza e ofertas exclusivas diretamente no seu e-mail.</p>
                        <div style="max-width: 28rem; margin: 0 auto; display: flex; gap: 0.5rem;">
                            <input type="email" placeholder="Seu melhor e-mail" style="flex: 1; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; border-radius: 9999px; height: 3rem; padding: 0 1.5rem; outline: none;">
                            <button style="border-radius: 9999px; height: 3rem; padding: 0 2rem; font-weight: 700; background-color: ${config.themeColor || '#6366f1'}; color: #ffffff; border: none; cursor: pointer;">Inscrever</button>
                        </div>
                    </div>
                </div>`
            },
            styles: {
                paddingTop: '0',
                paddingBottom: '0',
                paddingLeft: '0',
                paddingRight: '0',
                fullWidth: true
            }
        }
    ];

    console.log('✅ Blocos criados:', blocks.length);
    blocks.forEach((block, i) => {
        console.log(`  ${i + 1}. ${block.id} (${block.type})`);
    });

    // Update BOTH draft AND live configs
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

    console.log('\n✅ Blocos perfeitos salvos no DRAFT e LIVE!');
    console.log('\n🎯 O site agora está 100% no Page Builder!');
    console.log('\n📋 Estrutura do site:');
    console.log('   1. Hero com gradiente roxo');
    console.log('   2. Marcas parceiras (dinâmico)');
    console.log('   3. Categorias em destaque (dinâmico)');
    console.log('   4. Produtos em destaque');
    console.log('   5. Newsletter');
    console.log('\n🔄 Atualize a página do site (F5) para ver!');

    await prisma.$disconnect();
}

createPerfectBlocks().catch(console.error);
