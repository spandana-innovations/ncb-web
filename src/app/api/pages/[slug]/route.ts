import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  presentation: "Presentation", preface: "Preface", introduction: "General Introduction",
  collaborators: "Collaborators", copyright: "Copyright", contact: "Contact Us",
};

async function getContent(slug: string): Promise<string | null> {
  switch (slug) {
    case "presentation": return (await prisma.presentation.findFirst())?.content ?? null;
    case "preface": return (await prisma.preface.findFirst())?.content ?? null;
    case "introduction": return (await prisma.introduction.findFirst())?.content ?? null;
    case "collaborators": return (await prisma.collaborator.findFirst())?.content ?? null;
    case "copyright": return (await prisma.copyright.findFirst())?.content ?? null;
    case "contact": return (await prisma.contactUs.findFirst())?.content ?? null;
    default: return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = TITLES[slug];
  if (!title) return fail("Unknown page");
  const content = await getContent(slug);
  return ok({ title, content: content ?? "" });
}
