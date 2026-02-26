import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const toolsData = [
  // ==================== AGENDAMENTOS ====================
  {
    slug: "agendamentos-online",
    name: "Agendamentos Online",
    description: "Sistema completo de agendamentos para seus clientes. Ideal para salões, barbearias, clínicas e consultórios.",
    icon: "Calendar",
    category: "scheduling",
    price: 10,
    features: JSON.stringify([
      "Agenda visual com calendário",
      "Confirmação automática por WhatsApp",
      "Lembretes de compromissos",
      "Múltiplos profissionais",
      "Bloqueio de horários",
      "Integração com Google Calendar"
    ]),
    order: 1,
  },

  // ==================== CARDÁPIOS ====================
  {
    slug: "cardapio-digital",
    name: "Cardápio Digital (QR Code)",
    description: "Cardápio digital interativo acessado por QR Code. Perfeito para restaurantes, bares e cafeterias.",
    icon: "QrCode",
    category: "menu",
    price: 10,
    features: JSON.stringify([
      "QR Code personalizado",
      "Fotos dos pratos",
      "Preços atualizados em tempo real",
      "Categorias organizadas",
      "Modo claro e escuro",
      "Destaque para promoções"
    ]),
    order: 2,
  },

  // ==================== DELIVERY ====================
  {
    slug: "delivery-proprio",
    name: "Delivery Próprio",
    description: "Sistema de delivery próprio sem taxas de marketplaces. Seu cliente pede direto pelo seu site, igual ao iFood mas sem comissões.",
    icon: "Bike",
    category: "delivery",
    price: 10,
    features: JSON.stringify([
      "Carrinho de compras completo",
      "Rastreamento de pedidos em tempo real",
      "Pagamento online (PIX, Cartão)",
      "Taxa de entrega por região/bairro",
      "Tempo estimado de entrega",
      "Notificações por WhatsApp",
      "Painel de pedidos para cozinha",
      "Histórico de pedidos do cliente"
    ]),
    order: 3,
  },

  // ==================== RESTAURANTES ====================
  {
    slug: "comandas-digitais",
    name: "Comandas Digitais",
    description: "Sistema de comandas eletrônicas para bares e restaurantes. Agilize o atendimento nas mesas.",
    icon: "ClipboardList",
    category: "restaurant",
    price: 10,
    features: JSON.stringify([
      "Comandas por mesa",
      "Divisão de conta",
      "Impressão de pedidos na cozinha",
      "Controle de mesas abertas",
      "Histórico de consumo",
      "Gorjeta opcional"
    ]),
    order: 4,
  },
  {
    slug: "reservas-mesas",
    name: "Reservas de Mesas",
    description: "Sistema de reservas para restaurantes com controle de lotação e confirmação automática.",
    icon: "Utensils",
    category: "restaurant",
    price: 10,
    features: JSON.stringify([
      "Calendário de reservas",
      "Confirmação por WhatsApp/SMS",
      "Controle de capacidade",
      "Lista de espera",
      "Preferências do cliente",
      "Histórico de visitas"
    ]),
    order: 5,
  },

  // ==================== SALÕES E BARBEARIAS ====================
  {
    slug: "gestao-salao",
    name: "Gestão de Salão/Barbearia",
    description: "Sistema completo para gestão de salões de beleza e barbearias com agenda de profissionais.",
    icon: "Scissors",
    category: "beauty",
    price: 10,
    features: JSON.stringify([
      "Agenda por profissional",
      "Catálogo de serviços com preços",
      "Tempo médio de cada serviço",
      "Comissão por profissional",
      "Ficha do cliente (histórico)",
      "Lembretes automáticos"
    ]),
    order: 6,
  },

  // ==================== VENDAS ====================
  {
    slug: "catalogo-whatsapp",
    name: "Catálogo WhatsApp",
    description: "Catálogo de produtos integrado ao WhatsApp. Clientes pedem diretamente pelo chat.",
    icon: "MessageCircle",
    category: "sales",
    price: 10,
    features: JSON.stringify([
      "Link direto para WhatsApp",
      "Carrinho pelo chat",
      "Fotos de produtos",
      "Preços e descrições",
      "Mensagens automáticas",
      "Compartilhável em redes"
    ]),
    order: 7,
  },
  {
    slug: "orcamentos-online",
    name: "Orçamentos Online",
    description: "Sistema de orçamentos e propostas comerciais. Ideal para serviços e projetos sob medida.",
    icon: "FileText",
    category: "sales",
    price: 10,
    features: JSON.stringify([
      "Formulário de solicitação",
      "Templates de proposta",
      "Envio por e-mail",
      "Assinatura digital",
      "Histórico de orçamentos",
      "Conversão em pedido"
    ]),
    order: 8,
  },
  {
    slug: "gift-cards",
    name: "Gift Cards / Vales-Presente",
    description: "Venda vales-presente digitais. Ótimo para datas especiais e presentear.",
    icon: "Gift",
    category: "sales",
    price: 10,
    features: JSON.stringify([
      "Valores personalizados",
      "Design customizado",
      "Envio por e-mail",
      "Código único",
      "Validade configurável",
      "Saldo parcial"
    ]),
    order: 9,
  },
  {
    slug: "lista-presentes",
    name: "Lista de Presentes",
    description: "Listas de presentes para casamentos, chás de bebê e outras ocasiões especiais.",
    icon: "Heart",
    category: "sales",
    price: 10,
    features: JSON.stringify([
      "Listas personalizadas",
      "Link compartilhável",
      "Cotas de presentes",
      "Notificação de compras",
      "Mensagens para noivos",
      "Controle de entregas"
    ]),
    order: 10,
  },
  {
    slug: "clube-assinaturas",
    name: "Clube de Assinaturas",
    description: "Crie clubes de assinatura com entregas recorrentes. Receita previsível todo mês.",
    icon: "RefreshCw",
    category: "sales",
    price: 10,
    features: JSON.stringify([
      "Planos mensais/anuais",
      "Produtos recorrentes",
      "Gestão de assinantes",
      "Cobrança automática",
      "Pausar/cancelar",
      "Relatórios de MRR"
    ]),
    order: 11,
  },

  // ==================== MARKETING ====================
  {
    slug: "programa-fidelidade",
    name: "Programa de Fidelidade",
    description: "Fidelize seus clientes com pontos, cashback e recompensas. Aumente a recorrência de compras.",
    icon: "Award",
    category: "marketing",
    price: 10,
    features: JSON.stringify([
      "Acúmulo de pontos",
      "Cashback configurável",
      "Níveis de fidelidade (Bronze, Prata, Ouro)",
      "Recompensas personalizadas",
      "Aniversário do cliente",
      "Relatórios de engajamento"
    ]),
    order: 12,
  },
  {
    slug: "avaliacoes-reviews",
    name: "Avaliações e Reviews",
    description: "Colete avaliações dos clientes e exiba no seu site. Aumente a confiança e conversão.",
    icon: "Star",
    category: "marketing",
    price: 10,
    features: JSON.stringify([
      "Avaliações com estrelas",
      "Fotos de clientes",
      "Moderação de reviews",
      "Widget para o site",
      "E-mail automático pós-compra",
      "Integração com Google"
    ]),
    order: 13,
  },
  {
    slug: "cupons-promocoes",
    name: "Cupons e Promoções",
    description: "Crie cupons de desconto, ofertas relâmpago e promoções para aumentar vendas.",
    icon: "Percent",
    category: "marketing",
    price: 10,
    features: JSON.stringify([
      "Cupons por % ou valor fixo",
      "Ofertas por tempo limitado",
      "Compre X leve Y",
      "Frete grátis condicional",
      "Cupom de primeira compra",
      "Relatórios de uso"
    ]),
    order: 14,
  },

  // ==================== LOJAS FÍSICAS ====================
  {
    slug: "vitrine-digital",
    name: "Vitrine Digital",
    description: "Transforme sua loja física em digital. Exiba produtos na vitrine com QR Code para compra.",
    icon: "Monitor",
    category: "retail",
    price: 10,
    features: JSON.stringify([
      "QR Code por produto",
      "Compra mesmo com loja fechada",
      "Estoque sincronizado",
      "Preços atualizados",
      "Promoções em destaque",
      "Analytics de escaneamento"
    ]),
    order: 15,
  },
  {
    slug: "prova-social",
    name: "Prova Social (Vendas ao Vivo)",
    description: "Mostre vendas em tempo real no seu site. Gera urgência e confiança nos visitantes.",
    icon: "Users",
    category: "marketing",
    price: 10,
    features: JSON.stringify([
      "Notificações de vendas",
      "\"João de SP comprou...\"",
      "Pessoas visualizando agora",
      "Estoque baixo (urgência)",
      "Posição personalizável",
      "Configuração de frequência"
    ]),
    order: 16,
  },

  // ==================== ATENDIMENTO ====================
  {
    slug: "chat-online",
    name: "Chat Online / Chatbot",
    description: "Atendimento em tempo real com chat ao vivo e respostas automáticas por chatbot.",
    icon: "MessageSquare",
    category: "support",
    price: 10,
    features: JSON.stringify([
      "Chat em tempo real",
      "Respostas automáticas (FAQ)",
      "Horário de atendimento",
      "Histórico de conversas",
      "Transferir para WhatsApp",
      "Múltiplos atendentes"
    ]),
    order: 17,
  },

  // ==================== LOGÍSTICA ====================
  {
    slug: "rastreamento-pedidos",
    name: "Rastreamento de Pedidos",
    description: "Página de rastreamento para clientes acompanharem seus pedidos em tempo real.",
    icon: "Truck",
    category: "logistics",
    price: 10,
    features: JSON.stringify([
      "Status em tempo real",
      "Notificações automáticas",
      "Link de rastreio",
      "Integração com transportadoras",
      "Previsão de entrega",
      "Histórico de movimentação"
    ]),
    order: 18,
  },
];

async function main() {
  console.log("🌱 Iniciando seed das ferramentas...\n");

  for (const tool of toolsData) {
    const result = await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool,
    });
    console.log(`✅ ${result.name}`);
  }

  console.log(`\n🎉 ${toolsData.length} ferramentas criadas/atualizadas com sucesso!`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
