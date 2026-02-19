const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    console.log('🔍 Verificando dados no banco...\n');

    const brands = await prisma.brand.findMany();
    const categories = await prisma.category.findMany({
        where: { parentId: null }
    });
    const products = await prisma.product.findMany({
        where: { isFeatured: true }
    });

    console.log('📦 BRANDS:', brands.length);
    if (brands.length > 0) {
        brands.slice(0, 3).forEach(b => console.log(`  - ${b.name}`));
    } else {
        console.log('  ⚠️  Nenhuma marca encontrada');
    }

    console.log('\n📁 CATEGORIAS (principais):', categories.length);
    if (categories.length > 0) {
        categories.slice(0, 5).forEach(c => console.log(`  - ${c.name}`));
    } else {
        console.log('  ⚠️  Nenhuma categoria encontrada');
    }

    console.log('\n⭐ PRODUTOS EM DESTAQUE:', products.length);
    if (products.length > 0) {
        products.slice(0, 3).forEach(p => console.log(`  - ${p.name}`));
    } else {
        console.log('  ⚠️  Nenhum produto em destaque');
    }

    await prisma.$disconnect();
}

checkData().catch(console.error);
