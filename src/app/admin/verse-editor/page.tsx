import { prisma } from "@/lib/prisma";
import VerseEditorClient from "./VerseEditorClient";

export const dynamic = "force-dynamic";

export default async function VerseEditorPage() {
  const allBooks = await prisma.book.findMany({
    orderBy: { displayPosition: "asc" },
    select: { id: true, name: true },
  });
  return <VerseEditorClient allBooks={allBooks} />;
}
