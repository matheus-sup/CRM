const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Slate-900 from Tailwind = #0f172a
        const result = await prisma.storeConfig.updateMany({
            data: {
                footerBg: '#0f172a',
                footerText: '#cbd5e1' // Slate-300 for better contrast
            }
        });
        console.log('Footer colors restored to Slate-900 theme!');
        console.log('Updated:', result.count, 'record(s)');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
