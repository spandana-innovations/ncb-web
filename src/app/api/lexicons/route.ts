import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const letter = url.searchParams.get("letter")?.trim();

  const where: any = {};
  if (q) where.title = { contains: q };
  if (category) where.category = category;
  if (letter) where.title = { startsWith: letter };

  const lexicons = await prisma.lexicon.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { title: "asc" },
  });
  return ok(lexicons);
}
