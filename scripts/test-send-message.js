const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.chatConfig.findUnique({
    where: { id: 'chat-config' }
  });

  // Buscar uma conversa para testar
  const conversations = await prisma.chatConversation.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });

  console.log('=== CONVERSAS RECENTES ===');
  conversations.forEach(c => {
    console.log(`- ${c.name || 'Sem nome'}: ${c.phoneNumber}`);
  });

  if (conversations.length === 0) {
    console.log('Nenhuma conversa encontrada!');
    return;
  }

  // Pegar a primeira conversa para testar
  const testNumber = conversations[0].phoneNumber;
  console.log('\n=== TESTANDO ENVIO ===');
  console.log('Número:', testNumber);

  // Limpar número
  let cleanNumber = testNumber.replace(/\D/g, '');
  if (cleanNumber.length === 10 || cleanNumber.length === 11) {
    cleanNumber = '55' + cleanNumber;
  }
  console.log('Número formatado:', cleanNumber);

  const baseUrl = config.evolutionUrl.replace(/\/$/, '');
  const url = `${baseUrl}/message/sendText/${config.evolutionInstance}`;

  console.log('URL:', url);

  const body = {
    number: cleanNumber,
    text: 'Teste de conexão - ' + new Date().toLocaleTimeString('pt-BR'),
  };

  console.log('Body:', JSON.stringify(body));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.evolutionApiKey,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log('Status HTTP:', response.status);
    console.log('Resposta:', text);

    if (response.ok) {
      console.log('✅ Mensagem enviada com sucesso!');
    } else {
      console.log('❌ Erro ao enviar mensagem');
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

main()
  .catch(e => console.error('Erro:', e.message))
  .finally(() => prisma.$disconnect());
