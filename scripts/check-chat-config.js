const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.chatConfig.findUnique({
    where: { id: 'chat-config' }
  });

  if (config) {
    console.log('=== CONFIGURAÇÃO DO CHAT ===');
    console.log('Evolution URL:', config.evolutionUrl || '❌ NÃO CONFIGURADO');
    console.log('Evolution Instance:', config.evolutionInstance || '❌ NÃO CONFIGURADO');
    console.log('API Key:', config.evolutionApiKey ? '✅ Configurada (' + config.evolutionApiKey.substring(0, 8) + '...)' : '❌ NÃO CONFIGURADO');
    console.log('Bot Enabled:', config.botEnabled ? '✅ Sim' : '❌ Não');
  } else {
    console.log('❌ Configuração do chat não encontrada!');
  }
}

main()
  .catch(e => console.error('Erro:', e.message))
  .finally(() => prisma.$disconnect());
