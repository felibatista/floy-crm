import { DEFAULT_SETTINGS } from "../src/lib/settings";
import { prisma } from "../src/lib/prisma";
import { hash } from "bcrypt";

async function main() {
  // Seed Settings
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
  console.log("✓ Settings seeded");

  // Seed Users
  const passwordHash = await hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "admin@floy.com" },
    update: {},
    create: {
      name: "Admin Principal",
      email: "admin@floy.com",
      passwordHash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "dev@floy.com" },
    update: {},
    create: {
      name: "Developer",
      email: "dev@floy.com",
      passwordHash,
    },
  });
  console.log("✓ Users seeded (2)");

  // Seed Clients
  const client1 = await prisma.client.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "ACME Corporation",
      email: "contacto@acme.com",
      phone: "+54 11 1234-5678",
      company: "ACME Corp S.A.",
      address: "Av. Corrientes 1234, CABA",
      slug: "acme-corp",
      isPortalEnabled: true,
      passwordHash: await hash("acme2024", 10),
    },
  });

  const client2 = await prisma.client.upsert({
    where: { slug: "techstart" },
    update: {},
    create: {
      name: "TechStart Solutions",
      email: "info@techstart.io",
      phone: "+54 11 9876-5432",
      company: "TechStart SRL",
      address: "Av. del Libertador 5678, CABA",
      slug: "techstart",
      isPortalEnabled: false,
    },
  });
  console.log("✓ Clients seeded (2)");

  // Seed Projects
  await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Portal Web ACME",
      description:
        "Desarrollo del portal web corporativo para ACME Corporation",
      clientId: client1.id,
      status: "active",
      startDate: new Date("2024-01-15"),
    },
  });

  await prisma.project.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "App Mobile TechStart",
      description: "Aplicación móvil para gestión de inventario",
      clientId: client2.id,
      status: "active",
      startDate: new Date("2024-03-01"),
    },
  });
  console.log("✓ Projects seeded (2)");

  console.log("\n🌱 Seed completed successfully!");
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
