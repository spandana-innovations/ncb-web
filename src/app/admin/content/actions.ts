"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Testaments ---
export async function saveTestament(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const displayPosition = Number(formData.get("displayPosition") ?? 0);
  if (!name) return;
  if (id) await prisma.testament.update({ where: { id }, data: { name, displayPosition } });
  else await prisma.testament.create({ data: { name, displayPosition } });
  revalidatePath("/admin/content");
  redirect("/admin/content");
}

// --- Books ---
export async function saveBook(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const introduction = String(formData.get("introduction") ?? "");
  const displayPosition = Number(formData.get("displayPosition") ?? 0);
  const testamentId = Number(formData.get("testamentId"));
  if (!name || !testamentId) return;
  if (id) await prisma.book.update({ where: { id }, data: { name, introduction, displayPosition, testamentId } });
  else await prisma.book.create({ data: { name, introduction, displayPosition, testamentId } });
  revalidatePath("/admin/content");
  redirect(`/admin/content?testament=${testamentId}`);
}

export async function deleteBook(id: number) {
  await prisma.book.delete({ where: { id } });
  revalidatePath("/admin/content");
}

// --- Chapters ---
export async function saveChapter(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const heading = String(formData.get("heading") ?? "") || null;
  const audioUrl = String(formData.get("audioUrl") ?? "") || null;
  const displayPosition = Number(formData.get("displayPosition") ?? 0);
  const bookId = Number(formData.get("bookId"));
  if (!name || !bookId) return;
  if (id) await prisma.chapter.update({ where: { id }, data: { name, heading, audioUrl, displayPosition, bookId } });
  else await prisma.chapter.create({ data: { name, heading, audioUrl, displayPosition, bookId } });
  revalidatePath(`/admin/content/book/${bookId}`);
  redirect(`/admin/content/book/${bookId}`);
}

export async function deleteChapter(id: number, bookId: number) {
  await prisma.chapter.delete({ where: { id } });
  revalidatePath(`/admin/content/book/${bookId}`);
}

// --- Verses ---
export async function saveVerse(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const verse = String(formData.get("verse") ?? "");
  const verseNo = String(formData.get("verseNo") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  const commentaryTitle = String(formData.get("commentaryTitle") ?? "") || null;
  const commentaryContent = String(formData.get("commentaryContent") ?? "") || null;
  const chapterId = Number(formData.get("chapterId"));
  if (!verseNo || !chapterId) return;
  if (id) {
    await prisma.verse.update({
      where: { id },
      data: { verse, verseNo, order, commentaryTitle, commentaryContent, chapterId },
    });
  } else {
    await prisma.verse.create({
      data: { verse, verseNo, order, commentaryTitle, commentaryContent, chapterId },
    });
  }
  revalidatePath(`/admin/content/chapter/${chapterId}`);
  redirect(`/admin/content/chapter/${chapterId}`);
}

export async function deleteVerse(id: number, chapterId: number) {
  await prisma.footnoteVerse.deleteMany({ where: { verseId: id } });
  await prisma.commentaryVerse.deleteMany({ where: { verseId: id } });
  await prisma.verse.delete({ where: { id } });
  revalidatePath(`/admin/content/chapter/${chapterId}`);
}
