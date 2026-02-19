const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recreateExactBlocks() {
    console.log('🔄 Recriando blocos EXATOS do site real...\n');

    const config = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    if (!config) {
        console.error('❌ Config não encontrado!');
        return;
    }

    // Create EXACT blocks matching the real site
    const blocks = [
        // 1. HERO - Exato como no site real
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

        // 2. BRANDS - Sem padding, fullWidth
        {
            id: 'brands-section',
            type: 'text',
            content: {
                html: `<div style="padding: 2.5rem 0; border-bottom: 1px solid #e2e8f0; background-color: rgba(248, 250, 252, 0.5);">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem; text-center;">
                        <p style="font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 1.5rem;">Nossas Marcas Parceiras</p>
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; align-items: center; opacity: 0.7; filter: grayscale(100%);">
                            <!-- Brands will be loaded dynamically -->
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
        },

        // 3. CATEGORIES
        {
            id: 'categories-section',
            type: 'text',
            content: {
                html: `<div style="padding: 5rem 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem;">
                            <h2 style="font-size: 1.875rem; font-weight: 700; color: ${config.headingColor || '#111827'};">Categorias em Destaque</h2>
                            <a href="/categorias" style="font-size: 0.875rem; font-weight: 500; opacity: 0.7; text-decoration: none; color: ${config.bodyColor || '#334155'};">Ver todas →</a>
                        </div>
                        <div id="categories-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; min-height: 400px;">
                            @media (min-width: 768px) {
                                #categories-grid {
                                    grid-template-columns: repeat(4, 1fr);
                                }
                            }
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
                backgroundColor: 'rgb(248 250 252)',
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

    console.log('✓ Blocos criados:', blocks.length);
    blocks.forEach((block, i) => {
        console.log(`  ${i + 1}. ${block.id} (${block.type})`);
    });

    // Save to DRAFT
    await prisma.storeConfig.upsert({
        where: { id: 'store-config-draft' },
        update: {
            homeLayout: JSON.stringify(blocks)
        },
        create: {
            id: 'store-config-draft',
            storeName: config.storeName,
            themeColor: config.themeColor,
            homeLayout: JSON.stringify(blocks)
        }
    });

    console.log('\n✅ Blocos recriados e salvos no DRAFT!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Atualize o editor (F5)');
    console.log('2. Clique em "Publicar" no editor');
    console.log('3. O site real vai usar o Page Builder');
    console.log('\n🎨 Agora você pode editar tudo visualmente!');

    await prisma.$disconnect();
}

recreateExactBlocks().catch(console.error);
