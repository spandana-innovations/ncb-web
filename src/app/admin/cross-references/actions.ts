"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// A "cross reference" = a Footnote with >=2 linked verses.
export async function createCrossReference(verseIds: number[]) {
  const fn = await prisma.footnote.create({ data: {} });
  await prisma.footnoteVerse.createMany({
    data: verseIds.map((vid) => ({ footnoteId: fn.id, verseId: vid })),
  });
  revalidatePath("/admin/cross-references");
  redirect("/admin/cross-references");
}

export async function updateCrossReference(footnoteId: number, verseIds: number[]) {
  await prisma.footnoteVerse.deleteMany({ where: { footnoteId } });
  await prisma.footnoteVerse.createMany({
    data: verseIds.map((vid) => ({ footnoteId, verseId: vid })),
  });
  revalidatePath("/admin/cross-references");
  redirect("/admin/cross-references");
}

export async function deleteCrossReference(footnoteId: number) {
  await prisma.footnoteVerse.deleteMany({ where: { footnoteId } });
  await prisma.footnote.delete({ where: { id: footnoteId } });
  revalidatePath("/admin/cross-references");
}
