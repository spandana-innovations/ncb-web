import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const revalidate = 86400;

const TITLES: Record<string, string> = {
  presentation: "Presentation",
  preface: "Preface",
  introduction: "General Introduction",
  collaborators: "Collaborators",
  copyright: "Copyright",
  contact: "Contact Us",
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

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = TITLES[slug];
  if (!title) notFound();
  const content = await getContent(slug);
  if (content === null) notFound();

  return (
    <main className="container reading">
      <p className="eyebrow">New Community Bible</p>
      <h1 className="title">{title}</h1>
      <article className="prose page-fade" dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  );
}
