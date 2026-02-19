const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to create FELIPE coupon...");
    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: 'FELIPE',
                type: 'PERCENTAGE',
                value: 10,
                minOrderValue: 0,
                maxUsage: 100
            }
        });
        console.log('Success:', coupon);
    } catch (e) {
        console.error('FULL ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
