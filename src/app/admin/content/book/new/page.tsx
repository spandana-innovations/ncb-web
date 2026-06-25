import { saveBook } from "../../actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewBook({ searchParams }: { searchParams: Promise<{ testament?: string }> }) {
  const { testament } = await searchParams;
  const testaments = await prisma.testament.findMany({ orderBy: { displayPosition: "asc" } });
  const inp = { width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" } as const;
  return (
    <main className="container reading">
      <p className="eyebrow">Administration</p>
      <h1 className="title">New Book</h1>
      <form action={saveBook}>
        <label className="eyebrow">Name</label>
        <input name="name" style={inp} required />
        <label className="eyebrow">Testament</label>
        <select name="testamentId" defaultValue={testament ?? ""} style={inp} required>
          {testaments.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <label className="eyebrow">Display position</label>
        <input name="displayPosition" type="number" defaultValue={0} style={inp} />
        <label className="eyebrow">Introduction (HTML allowed)</label>
        <textarea name="introduction" rows={6} style={{ ...inp, fontFamily: "var(--serif)" }} />
        <button className="btn" type="submit">Save book</button>
      </form>
    </main>
  );
}
