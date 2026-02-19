const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToPageBuilder() {
    console.log('🔄 Iniciando migração para Page Builder...\n');

    // Get current config
    const config = await prisma.storeConfig.findUnique({
        where: { id: 'store-config' }
    });

    if (!config) {
        console.error('❌ Config não encontrado!');
        return;
    }

    console.log('✓ Config carregado');
    console.log('  Theme Color:', config.themeColor);
    console.log('  Store Name:', config.storeName);

    // Create Page Builder blocks matching the current ModernHome layout
    const blocks = [
        // 1. HERO BLOCK
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
                paddingTop: '5rem',
                paddingBottom: '5rem',
                buttonColor: config.themeColor || '#6366f1',
                buttonTextColor: '#ffffff'
            }
        },

        // 2. BRANDS SECTION
        {
            id: 'brands-section',
            type: 'text',
            content: {
                html: `
                    <div class="py-10 border-b bg-slate-50/50">
                        <div class="container mx-auto px-4 text-center">
                            <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6">Nossas Marcas Parceiras</p>
                            <div id="brands-container" class="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                                <!-- Brands will be loaded dynamically -->
                            </div>
                        </div>
                    </div>
                `
            },
            styles: {
                paddingTop: '0',
                paddingBottom: '0'
            }
        },

        // 3. CATEGORIES SECTION
        {
            id: 'categories-section',
            type: 'text',
            content: {
                html: `
                    <div class="py-20 container mx-auto px-4">
                        <div class="flex items-center justify-between mb-10">
                            <h2 class="text-3xl font-bold tracking-tight" style="color: ${config.headingColor || '#111827'}">Categorias em Destaque</h2>
                            <a href="/categorias" class="text-sm font-medium hover:underline flex items-center gap-1 opacity-70">Ver todas →</a>
                        </div>
                        <div id="categories-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[400px]">
                            <!-- Categories will be loaded dynamically -->
                        </div>
                    </div>
                `
            },
            styles: {
                paddingTop: '0',
                paddingBottom: '0'
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
                backgroundColor: 'rgb(248 250 252)',
                textColor: config.headingColor || '#111827',
                accentColor: config.themeColor || '#6366f1'
            }
        },

        // 5. NEWSLETTER
        {
            id: 'newsletter-section',
            type: 'text',
            content: {
                html: `
                    <div class="py-24 text-white" style="background-color: ${config.footerBg || '#0f172a'}">
                        <div class="container mx-auto px-4 text-center">
                            <svg class="h-12 w-12 mx-auto mb-6 opacity-80" style="color: ${config.themeColor || '#6366f1'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <h2 class="text-4xl font-bold mb-4">Entre para o Clube</h2>
                            <p class="max-w-md mx-auto mb-8 opacity-70">Receba novidades, dicas de beleza e ofertas exclusivas diretamente no seu e-mail.</p>
                            <div class="max-w-md mx-auto flex gap-2">
                                <input type="email" placeholder="Seu melhor e-mail" class="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-full h-12 px-6 focus:outline-none focus:ring-2" style="border-color: rgba(255,255,255,0.2)">
                                <button class="rounded-full h-12 px-8 font-bold" style="background-color: ${config.themeColor || '#6366f1'}; color: #ffffff">Inscrever</button>
                            </div>
                        </div>
                    </div>
                `
            },
            styles: {
                paddingTop: '0',
                paddingBottom: '0'
            }
        }
    ];

    console.log('\n✓ Blocos criados:', blocks.length);
    blocks.forEach((block, i) => {
        console.log(`  ${i + 1}. ${block.id} (${block.type})`);
    });

    // Save to DRAFT config
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

    console.log('\n✅ Migração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Atualize o editor (F5)');
    console.log('2. Você verá os blocos clicáveis');
    console.log('3. Clique em "Publicar" para aplicar ao site real');
    console.log('\n🎨 Agora você tem controle total sobre cada seção!');

    await prisma.$disconnect();
}

migrateToPageBuilder().catch(console.error);
