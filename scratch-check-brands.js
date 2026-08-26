const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("Total published products:", prods.length);
  prods.forEach(p => console.log(` - Brand: "${p.brand}" | Name: "${p.name}" | CreatedAt: ${p.createdAt}`));

  const seenBrands = new Set();
  const selected = [];
  for (const p of prods) {
    const b = (p.brand || '').trim().toLowerCase();
    if (!seenBrands.has(b)) {
      seenBrands.add(b);
      selected.push(p);
      if (selected.length === 4) break;
    }
  }

  console.log("\nSELECTED 4 DISTINCT BRAND WATCHES:");
  selected.forEach(p => console.log(` - [${p.brand}] ${p.name}`));

  await prisma.$disconnect();
}

main();
