import { PrismaPg } from "@prisma/adapter-pg";

// PrismaClient is imported from the generated client directly to avoid
// Prisma 7's bundler module resolution issue with the @prisma/client re-export chain.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require(".prisma/client") as typeof import(".prisma/client");

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
