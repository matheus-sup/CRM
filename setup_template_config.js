const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.storeConfig.updateMany({
            data: {
                // Identidade Genérica
                storeName: 'Minha Loja',
                description: 'Sua loja online com os melhores produtos. Qualidade e atendimento diferenciado para você.',
                legalName: 'Razão Social da Empresa LTDA',
                cnpj: '00.000.000/0001-00',

                // Contato Genérico
                email: 'contato@minhaloja.com.br',
                phone: '(00) 00000-0000',
                whatsapp: '5500000000000',
                address: 'Rua Exemplo, 123 - Centro\nCidade - UF, 00000-000',

                // Redes Sociais (vazias ou placeholder)
                instagram: '',
                facebook: '',
                youtube: '',
                tiktok: '',
                twitter: '',
                pinterest: '',

                // Cores Neutras do Tema
                themeColor: '#6366f1',      // Indigo-500
                accentColor: '#8b5cf6',     // Violet-500
                priceColor: '#6366f1',      // Indigo-500
                secondaryColor: '#e0e7ff',  // Indigo-100
                backgroundColor: '#ffffff',

                // Cabeçalho
                headerColor: '#ffffff',
                headerText: 'Minha Loja',
                headerSubtext: 'Slogan da sua empresa',
                headerSearchPlaceholder: 'Buscar produtos...',
                menuColor: '#334155',

                // Rodapé
                footerBg: '#0f172a',
                footerText: '#cbd5e1',

                // Textos
                headingColor: '#111827',
                bodyColor: '#334155',

                // Botões
                headerBtnBg: '#6366f1',
                headerBtnText: '#ffffff',
                productBtnBg: '#6366f1',
                productBtnText: '#ffffff',

                // Carrinho
                cartCountBg: '#22c55e',
                cartCountText: '#ffffff',
                searchBtnBg: '#6366f1',
                searchIconColor: '#ffffff',

                // Textos do Rodapé
                paymentText: 'Aceitamos todos os cartões, PIX e Boleto.',
                creditsText: 'por Sua Agência',

                // Manutenção
                maintenanceMessage: 'Estamos em manutenção. Voltaremos em breve!',
            }
        });

        console.log('✅ Configuração genérica aplicada com sucesso!');
        console.log('📦 Registros atualizados:', result.count);

    } catch (e) {
        console.error('❌ Erro:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
