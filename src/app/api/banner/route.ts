import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const banner = await prisma.banner.findFirst();
  return ok({
    desktop_banner: banner?.desktopImage ?? null,
    mobile_banner: banner?.mobileImage ?? null,
  });
}
