
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const handle = 'main';

    const existing = await prisma.menu.findFirst({
        where: { handle }
    });

    if (existing) {
        console.log(`Menu '${handle}' already exists.`);
    } else {
        console.log(`Creating menu '${handle}'...`);
        await prisma.menu.create({
            data: {
                title: 'Menu Principal',
                handle: 'main',
                items: {
                    create: [
                        { label: 'INÍCIO', url: '/', order: 1, type: 'custom' },
                        { label: 'PRODUTOS', url: '/produtos', order: 2, type: 'custom' },
                        { label: 'CONTATO', url: '/contato', order: 3, type: 'custom' },
                    ]
                }
            }
        });
        console.log('Menu created successfully.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
