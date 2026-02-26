import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.tool.count();
  console.log("Tools in DB:", count);

  const tools = await prisma.tool.findMany({ select: { name: true, category: true } });
  console.log("\nFerramentas por categoria:");

  const grouped: Record<string, string[]> = {};
  for (const tool of tools) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool.name);
  }

  for (const [cat, names] of Object.entries(grouped)) {
    console.log(`\n${cat}:`);
    names.forEach(n => console.log(`  - ${n}`));
  }
}

main()
  .finally(() => prisma.$disconnect());
