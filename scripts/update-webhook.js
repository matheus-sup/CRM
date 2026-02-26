const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.chatConfig.findUnique({
    where: { id: 'chat-config' }
  });

  const baseUrl = config.evolutionUrl.replace(/\/$/, '');
  const webhookUrl = 'https://cfbf6140f087e358-38-252-149-33.serveousercontent.com/api/chat/webhook';

  console.log('=== ATUALIZANDO WEBHOOK ===');
  console.log('Nova URL:', webhookUrl);

  const url = `${baseUrl}/webhook/set/${config.evolutionInstance}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.evolutionApiKey,
      },
      body: JSON.stringify({
        webhook: {
          url: webhookUrl,
          enabled: true,
          events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE'],
          webhookByEvents: false,
          webhookBase64: true,
        },
      }),
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Resposta:', text);

    if (response.ok) {
      console.log('\n✅ Webhook atualizado com sucesso!');
    } else {
      console.log('\n❌ Erro ao atualizar webhook');
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

main()
  .catch(e => console.error('Erro:', e.message))
  .finally(() => prisma.$disconnect());
