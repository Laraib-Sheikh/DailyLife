// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client/index");
import { PrismaPg } from "@prisma/adapter-pg";

type PrismaClientType = InstanceType<typeof PrismaClient>;

function createPrismaClient(): PrismaClientType {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter }) as PrismaClientType;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
