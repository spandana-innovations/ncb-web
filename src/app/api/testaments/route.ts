import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// Full navigation tree: testaments -> books -> chapters (no verse bodies)
export async function GET() {
  const testaments = await prisma.testament.findMany({
    orderBy: { displayPosition: "asc" },
    include: {
      books: {
        orderBy: { displayPosition: "asc" },
        include: {
          chapters: {
            orderBy: { displayPosition: "asc" },
            select: { id: true, name: true, displayPosition: true },
          },
        },
      },
    },
  });
  return ok(testaments);
}
