"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveLexicon(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "");

  if (!title) return;

  if (id) {
    await prisma.lexicon.update({ where: { id }, data: { title, category, description } });
  } else {
    await prisma.lexicon.create({ data: { title, category, description } });
  }
  revalidatePath("/admin/lexicons");
  redirect("/admin/lexicons");
}

export async function deleteLexicon(id: number) {
  await prisma.lexicon.delete({ where: { id } });
  revalidatePath("/admin/lexicons");
}
