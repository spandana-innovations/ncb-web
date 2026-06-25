"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function saveUser(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!name || !email) return;

  if (id) {
    // Edit existing — no password change here
    await prisma.user.update({ where: { id }, data: { name, email } });
  } else {
    // New user — password required
    if (!password || password !== confirm) return;
    if (password.length < 8) return;
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hash },
    });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function resetPassword(formData: FormData) {
  const id = Number(formData.get("id"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!id || !password || password !== confirm || password.length < 8) return;

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id }, data: { password: hash } });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: number) {
  // Prevent deleting the last user
  const count = await prisma.user.count();
  if (count <= 1) return; // Always keep at least one admin

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
