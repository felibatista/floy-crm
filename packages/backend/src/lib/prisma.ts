import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
  poolConfig: {
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  }
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

const validateConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1+1 AS result`;
      console.log("Database connection validated.");
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
      console.log(`Retrying in ${(i + 1) * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
    }
  }
};

export { prisma, validateConnection };
