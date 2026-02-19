
// Use the temp client we generated
import { PrismaClient } from '../../prisma/generated-client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting migration...");

    // Fetch all products that have a legacy string brand
    // Note: The new schema mapped 'brandLegacy' to the 'brand' column.
    // So asking for brandLegacy gives us the string.
    const products = await prisma.product.findMany({
        where: {
            brandLegacy: {
                not: null
            }
        },
        select: {
            id: true,
            brandLegacy: true
        }
    });

    console.log(`Found ${products.length} products with legacy brand.`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const p of products) {
        if (!p.brandLegacy) continue;

        const brandName = p.brandLegacy.trim();
        if (!brandName) continue;

        const slug = brandName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        // Find or create brand
        let brand = await prisma.brand.findUnique({ where: { slug } });

        if (!brand) {
            brand = await prisma.brand.create({
                data: {
                    name: brandName,
                    slug
                }
            });
            createdCount++;
            console.log(`Created brand: ${brandName}`);
        }

        // Link product to brand
        await prisma.product.update({
            where: { id: p.id },
            data: {
                brandId: brand.id
                // We keep brandLegacy for now as backup? Or clear it? 
                // Let's keep it for safety until confirmed.
            }
        });
        updatedCount++;
    }

    console.log(`Migration complete.`);
    console.log(`Brands created: ${createdCount}`);
    console.log(`Products updated: ${updatedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
