const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const config = await prisma.chatConfig.findUnique({ where: { id: 'chat-config' } });
    if (!config || !config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
        console.log('Evolution API não configurada');
        return;
    }

    const baseUrl = config.evolutionUrl.replace(/\/$/, '');
    const webhookUrl = 'https://crm-felipe-2026.loca.lt/api/chat/webhook';

    console.log('Configurando webhook...');
    console.log('Instance:', config.evolutionInstance);
    console.log('Webhook URL:', webhookUrl);

    const response = await fetch(baseUrl + '/webhook/set/' + config.evolutionInstance, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': config.evolutionApiKey
        },
        body: JSON.stringify({
            webhook: {
                url: webhookUrl,
                enabled: true,
                events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE'],
                webhookByEvents: false,
                webhookBase64: false,
                headers: {
                    'bypass-tunnel-reminder': 'true'
                }
            }
        })
    });

    const result = await response.json();
    console.log('Resultado:', JSON.stringify(result, null, 2));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
