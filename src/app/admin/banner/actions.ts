"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveBanner(formData: FormData) {
  const desktopImage = String(formData.get("desktopImage") ?? "") || null;
  const mobileImage = String(formData.get("mobileImage") ?? "") || null;
  const existing = await prisma.banner.findFirst();
  if (existing) {
    await prisma.banner.update({ where: { id: existing.id }, data: { desktopImage, mobileImage } });
  } else {
    await prisma.banner.create({ data: { desktopImage, mobileImage } });
  }
  revalidatePath("/admin/banner");
  redirect("/admin/banner");
}
