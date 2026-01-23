const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clean up existing if needed (optional)
    // await prisma.product.deleteMany({})

    const gloss = await prisma.product.upsert({
        where: { slug: 'gloss-volume-intenso-max-love' },
        update: {},
        create: {
            name: 'Gloss Volume Intenso Max Love',
            slug: 'gloss-volume-intenso-max-love',
            description: 'O Gloss Volume Intenso da Max Love proporciona brilho espelhado e sensação de volume imediato. Fórmula hidratante com Ácido Hialurônico.',
            price: 19.90,
            compareAtPrice: 24.90,
            stock: 50,
            status: 'ACTIVE',
            categoryId: null, // Can map to a category implementation later
        },
    })

    console.log('Created product:', gloss.name)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
