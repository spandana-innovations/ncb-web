import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const groups = await prisma.lexicon.groupBy({
    by: ["category"],
    _count: { id: true },
  });
  const cats = groups.map((g: any) => ({ category: g.category, count: g._count.id }));
  return ok(cats);
}
