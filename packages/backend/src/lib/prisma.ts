import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const validateConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1+1 AS result`;
    console.log("Database connection validated.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export { prisma, validateConnection };
