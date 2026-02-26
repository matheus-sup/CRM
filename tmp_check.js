const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const messages = await p.chatMessage.findMany({
        where: { mediaType: 'audio' },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log('Mensagens de áudio:');
    messages.forEach(m => {
        console.log('---');
        console.log('ID:', m.id);
        console.log('Content:', m.content);
        console.log('MediaType:', m.mediaType);
        console.log('MediaUrl:', m.mediaUrl || '(vazio)');
    });

    await p.$disconnect();
}

main();
