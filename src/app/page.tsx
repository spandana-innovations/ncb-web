import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HomeExtras from "@/components/HomeExtras";

// Cache the home page for 1 hour — books never change
export const revalidate = 3600;

export default async function Home() {
  const testaments = await prisma.testament.findMany({
    orderBy: { displayPosition: "asc" },
    include: {
      books: {
        orderBy: { displayPosition: "asc" },
        select: {
          id: true,
          name: true,
          // Only fetch the very first chapter per book
          chapters: {
            orderBy: { displayPosition: "asc" },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  return (
    <main className="home">
      <div className="home-extras-wrap"><HomeExtras /></div>
      {testaments.map((t: any) => (
        <section key={t.id} className="testament">
          <h2 className="testament__name">{t.name}</h2>
          <div className="book-grid">
            {t.books.map((b: any) => {
              const first = b.chapters[0];
              const inner = <span className="book-block__name">{b.name}</span>;
              return first ? (
                <Link key={b.id} href={`/read/${first.id}`} className="book-block">{inner}</Link>
              ) : (
                <span key={b.id} className="book-block book-block--empty">{inner}</span>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
