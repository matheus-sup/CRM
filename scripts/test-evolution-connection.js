const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.chatConfig.findUnique({
    where: { id: 'chat-config' }
  });

  if (!config || !config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
    console.log('❌ Evolution API não configurada!');
    return;
  }

  const baseUrl = config.evolutionUrl.replace(/\/$/, '');
  const url = `${baseUrl}/instance/connectionState/${config.evolutionInstance}`;

  console.log('Testando conexão...');
  console.log('URL:', url);

  try {
    const response = await fetch(url, {
      headers: { apikey: config.evolutionApiKey },
    });

    const text = await response.text();
    console.log('Status HTTP:', response.status);
    console.log('Resposta:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      const state = data.state || data.instance?.state;
      if (state === 'open') {
        console.log('✅ WhatsApp CONECTADO!');
      } else {
        console.log('❌ WhatsApp NÃO conectado. Status:', state);
        console.log('   Você precisa escanear o QR Code na Evolution API.');
      }
    }
  } catch (error) {
    console.log('❌ Erro ao conectar:', error.message);
  }
}

main()
  .catch(e => console.error('Erro:', e.message))
  .finally(() => prisma.$disconnect());
