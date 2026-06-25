import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const books = await prisma.book.findMany({
    orderBy: { displayPosition: "asc" },
  });
  return ok(books);
}
