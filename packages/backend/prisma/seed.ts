import { DEFAULT_SETTINGS } from "../src/lib/settings";
import { prisma } from "../src/lib/prisma";

async function main() {
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        isSystem: setting.isSystem,
        description: setting.description,
      },
      create: setting,
    });
  }

  console.log("Settings seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
