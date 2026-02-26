import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Try to update existing tool
    const updated = await prisma.tool.upsert({
      where: { slug: 'venda-lentes-oticas' },
      update: { category: 'optics' },
      create: {
        slug: 'venda-lentes-oticas',
        name: 'Venda de Lentes - Óticas',
        description: 'Sistema completo para venda de lentes de grau. Ideal para óticas e lojas de óculos.',
        icon: 'Glasses',
        category: 'optics',
        price: 10,
        features: JSON.stringify([
          'Seleção de tipo de lente (grau/sem grau)',
          'Espessuras configuráveis (1.56, 1.59, 1.67, 1.74)',
          'Tratamentos (anti-reflexo, filtro azul)',
          'Preços dinâmicos por opção',
          'Modal interativo para escolha',
          'Resumo detalhado do pedido',
          'Envio de receita após compra',
          'Cores e textos personalizáveis'
        ]),
        order: 14,
      }
    });
    console.log('Tool updated/created:', updated.name, '- Category:', updated.category);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
