
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const latestProduct = await prisma.product.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { images: true }
        });

        if (!latestProduct) {
            console.log("No products found.");
            return;
        }

        console.log("Latest Product:", latestProduct.name, "(ID:", latestProduct.id, ")");
        console.log("Images found in DB:", latestProduct.images.length);

        latestProduct.images.forEach(img => {
            console.log(" - Image URL:", img.url);
            // Check if file exists
            const relativePath = img.url.startsWith('/') ? img.url.slice(1) : img.url;
            const absolutePath = path.join(process.cwd(), 'public', relativePath);
            if (fs.existsSync(absolutePath)) {
                console.log("   [OK] File exists on disk.");
            } else {
                console.log("   [MISSING] File NOT found at:", absolutePath);
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
