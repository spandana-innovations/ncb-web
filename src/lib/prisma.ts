import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makeClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const adapter = new PrismaLibSQL(
    url.startsWith("libsql:") ? { url, authToken } : { url }
  );
  return new PrismaClient({ adapter });
}

// Reuse across hot-reloads in dev AND across requests in prod
export const prisma = globalThis.__prisma ?? makeClient();
globalThis.__prisma = prisma;
