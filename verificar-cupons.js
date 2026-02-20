const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarCupons() {
    try {
        const cupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
        console.log('\n📊 Cupons no banco de dados:');
        console.log(`Total: ${cupons.length}\n`);
        
        if (cupons.length === 0) {
            console.log('❌ Nenhum cupom encontrado!');
        } else {
            cupons.forEach((c, i) => {
                console.log(`${i + 1}. ${c.code}`);
                console.log(`   Tipo: ${c.type}`);
                console.log(`   Valor: ${c.value}`);
                console.log(`   Ativo: ${c.active}`);
                console.log(`   Criado em: ${new Date(c.createdAt).toLocaleString('pt-BR')}\n`);
            });
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verificarCupons();
