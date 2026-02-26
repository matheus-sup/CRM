const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const msgs = await p.chatMessage.findMany({
        where: { direction: 'in' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { conversation: true }
    });

    console.log('Últimas mensagens recebidas:');
    msgs.forEach(m => {
        console.log('---');
        console.log('De:', m.conversation.name || m.conversation.phoneNumber);
        console.log('Msg:', m.content);
        console.log('Data:', m.createdAt);
    });

    await p.$disconnect();
}

main().catch(console.error);
