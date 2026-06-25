import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageEditor from "../PageEditor";

export const dynamic = "force-dynamic";

const MODELS: Record<string, string> = {
  introduction: "introduction", preface: "preface", copyright: "copyright",
  collaborator: "collaborator", presentation: "presentation", "contact-us": "contactUs",
};
const LABELS: Record<string, string> = {
  introduction: "Introduction", preface: "Preface", copyright: "Copyright",
  collaborator: "Collaborators", presentation: "Presentation", "contact-us": "Contact Us",
};

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = MODELS[slug];
  if (!model) notFound();
  const row = await (prisma as any)[model].findFirst();
  return (
    <PageEditor
      slug={slug}
      label={LABELS[slug]}
      initialContent={row?.content ?? ""}
    />
  );
}
