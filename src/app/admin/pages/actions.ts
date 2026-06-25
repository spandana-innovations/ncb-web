"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MODELS: Record<string, "introduction" | "preface" | "copyright" | "collaborator" | "presentation" | "contactUs"> = {
  introduction: "introduction", preface: "preface", copyright: "copyright",
  collaborator: "collaborator", presentation: "presentation", "contact-us": "contactUs",
};

export async function savePage(formData: FormData) {
  const slug = String(formData.get("slug"));
  const content = String(formData.get("content") ?? "");
  const model = MODELS[slug];
  if (!model) return;
  const m = (prisma as any)[model];
  const existing = await m.findFirst();
  if (existing) await m.update({ where: { id: existing.id }, data: { content } });
  else await m.create({ data: { content } });
  revalidatePath(`/admin/pages/${slug}`);
  redirect("/admin/pages");
}
