import { PrismaPg } from "@prisma/adapter-pg";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Prisma 7 named exports don't resolve with moduleResolution:"bundler"
// but the runtime import works fine since @prisma/client does export PrismaClient
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaInstance = any;

function createPrismaClient(): PrismaInstance {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaInstance | undefined;
};

export const prisma: PrismaInstance =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
