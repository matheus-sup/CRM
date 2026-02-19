const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.storeConfig.updateMany({
            data: {
                // Identidade da Loja
                storeName: 'GUT Cosméticos & Makes',
                description: 'Sua loja favorita de cosméticos, maquiagens e produtos de beleza. Trabalhamos com as melhores marcas do mercado para realçar sua beleza natural.',
                legalName: 'GUT Cosméticos e Maquiagens LTDA',
                cnpj: '00.000.000/0001-00',

                // Contato
                email: 'contato@gutcosmeticos.com.br',
                phone: '(11) 99999-9999',
                whatsapp: '5511999999999',
                address: 'Av. Paulista, 1000 - Bela Vista\nSão Paulo - SP, 01310-100',

                // Redes Sociais (placeholders)
                instagram: 'https://instagram.com/gutcosmeticos',
                facebook: 'https://facebook.com/gutcosmeticos',
                youtube: '',
                tiktok: '',
                twitter: '',
                pinterest: '',

                // Cores do Tema (Rosa/Pink para cosméticos)
                themeColor: '#db2777',      // Pink-600
                accentColor: '#ec4899',     // Pink-500
                priceColor: '#db2777',      // Pink-600
                secondaryColor: '#fce7f3',  // Pink-100
                backgroundColor: '#ffffff',

                // Cabeçalho
                headerColor: '#ffffff',
                headerText: 'GUT Cosméticos',
                headerSubtext: 'Beleza que transforma',
                headerSearchPlaceholder: 'Buscar produtos, marcas...',
                menuColor: '#334155',       // Slate-700

                // Rodapé
                footerBg: '#0f172a',         // Slate-900
                footerText: '#cbd5e1',       // Slate-300

                // Textos
                headingColor: '#111827',    // Gray-900
                bodyColor: '#334155',       // Slate-700

                // Botões
                headerBtnBg: '#db2777',
                headerBtnText: '#ffffff',
                productBtnBg: '#db2777',
                productBtnText: '#ffffff',

                // Carrinho
                cartCountBg: '#22c55e',     // Green-500
                cartCountText: '#ffffff',
                searchBtnBg: '#db2777',
                searchIconColor: '#ffffff',

                // Configurações de Produto
                showInstallments: true,
                enableQuickBuy: true,
                showColorVariations: true,
                showHoverImage: true,
                showCardCarousel: false,
                showLowStockWarning: true,
                showProductSold: false,
                showPromoPrice: true,
                showDiscountPayment: true,
                showInstallmentsDetail: true,
                showVariations: true,
                showMeasurements: true,
                showSKU: false,
                showStockQuantity: false,
                showShippingSimulator: true,
                showBuyInfo: true,
                showRelatedProducts: true,

                // Carrinho
                enableQuickCart: true,
                cartAction: 'drawer',
                showCartRecommendations: true,
                showShippingCalculator: true,
                minPurchaseValue: 0,

                // Grid de Produtos
                mobileColumns: 2,
                desktopColumns: 4,
                paginationType: 'infinite',

                // Newsletter e Rodapé
                newsletterEnabled: true,
                showPaymentMethods: true,
                showSocialIcons: true,
                paymentText: 'Aceitamos todos os cartões, PIX e Boleto Bancário.',
                creditsText: 'por Bkaiser Solutions',

                // Layout
                homeLayout: 'modern',
                maintenanceMode: false,
                maintenanceMessage: 'Estamos em manutenção. Voltaremos em breve!',
            }
        });

        console.log('✅ Configuração da GUT Cosméticos atualizada com sucesso!');
        console.log('📦 Registros atualizados:', result.count);

    } catch (e) {
        console.error('❌ Erro:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
