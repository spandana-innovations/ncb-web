import CrossRefEditor from "@/components/CrossRefEditor";
import { updateCrossReference } from "../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCrossRef({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const footnoteId = Number(id);
  const fn = await prisma.footnote.findUnique({
    where: { id: footnoteId },
    include: { verses: { include: { verse: { include: { chapter: { include: { book: true } } } } } } },
  });
  if (!fn) notFound();

  const initial = fn.verses.map((fv: any) => ({
    id: fv.verse.id,
    label: `${fv.verse.chapter.book.name} ${fv.verse.chapter.name}:${fv.verse.verseNo}`,
  }));

  async function save(verseIds: number[]) {
    "use server";
    await updateCrossReference(footnoteId, verseIds);
  }

  return (
    <main className="container reading">
      <p className="eyebrow">Administration</p>
      <h1 className="title">Edit Cross Reference #{footnoteId}</h1>
      <CrossRefEditor initial={initial} onSave={save} />
    </main>
  );
}
