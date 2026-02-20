const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarCupons() {
    try {
        console.log('🚀 Criando cupons do seu amigo...');
        
        // Cupom BEMVINDO10
        const c1 = await prisma.coupon.upsert({
            where: { code: 'BEMVINDO10' },
            update: {},
            create: {
                code: 'BEMVINDO10',
                type: 'PERCENTAGE',
                value: 10,
                minOrderValue: 0,
                maxUsage: 100,
                active: true
            }
        });
        console.log('✅ Cupom BEMVINDO10 - 10% desconto');

        // Cupom DESCONTO20
        const c2 = await prisma.coupon.upsert({
            where: { code: 'DESCONTO20' },
            update: {},
            create: {
                code: 'DESCONTO20',
                type: 'PERCENTAGE',
                value: 20,
                minOrderValue: 100,
                maxUsage: 50,
                active: true
            }
        });
        console.log('✅ Cupom DESCONTO20 - 20% desconto (mín: R$ 100)');

        // Cupom FRETE
        const c3 = await prisma.coupon.upsert({
            where: { code: 'FRETE' },
            update: {},
            create: {
                code: 'FRETE',
                type: 'FIXED',
                value: 15,
                minOrderValue: 50,
                maxUsage: 200,
                active: true
            }
        });
        console.log('✅ Cupom FRETE - R$ 15 desconto (mín: R$ 50)');

        // Cupom VIP30
        const c4 = await prisma.coupon.upsert({
            where: { code: 'VIP30' },
            update: {},
            create: {
                code: 'VIP30',
                type: 'PERCENTAGE',
                value: 30,
                minOrderValue: 200,
                maxUsage: 20,
                active: true
            }
        });
        console.log('✅ Cupom VIP30 - 30% desconto (mín: R$ 200)');

        console.log('\n✨ 4 cupons criados com sucesso!');
        console.log('Acesse http://localhost:5001/admin/descontos para ver');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

criarCupons();
