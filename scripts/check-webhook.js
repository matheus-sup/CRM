const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.chatConfig.findUnique({
    where: { id: 'chat-config' }
  });

  const baseUrl = config.evolutionUrl.replace(/\/$/, '');

  // Check current webhook configuration
  const url = `${baseUrl}/webhook/find/${config.evolutionInstance}`;

  console.log('=== VERIFICANDO WEBHOOK ===');
  console.log('URL:', url);

  try {
    const response = await fetch(url, {
      headers: { apikey: config.evolutionApiKey },
    });

    const text = await response.text();
    console.log('Status HTTP:', response.status);
    console.log('Configuração do Webhook:', text);

    const data = JSON.parse(text);
    if (data.url) {
      console.log('\n✅ Webhook configurado para:', data.url);
      console.log('Eventos:', data.events || 'Todos');
      console.log('Ativo:', data.enabled ? 'Sim' : 'Não');
    } else {
      console.log('\n❌ Webhook NÃO configurado!');
      console.log('Configure o webhook para: https://seu-dominio.com/api/chat/webhook');
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

main()
  .catch(e => console.error('Erro:', e.message))
  .finally(() => prisma.$disconnect());
