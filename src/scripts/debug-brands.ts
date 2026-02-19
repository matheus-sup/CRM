
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const brands = await prisma.brand.findMany();
    console.log("Total Brands:", brands.length);
    console.table(brands.map(b => ({ id: b.id, name: b.name, slug: b.slug, products: 0 })));

    // Check products with legacy brand
    const products = await prisma.product.findMany({
        where: { brandId: { not: null } },
        select: { name: true, brandId: true }
    });
    console.log("Products with BrandId:", products.length);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
