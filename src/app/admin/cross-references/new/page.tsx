import CrossRefEditor from "@/components/CrossRefEditor";
import { createCrossReference } from "../actions";

export default function NewCrossRef() {
  async function save(verseIds: number[]) {
    "use server";
    await createCrossReference(verseIds);
  }
  return (
    <main className="container reading">
      <p className="eyebrow">Administration</p>
      <h1 className="title">New Cross Reference</h1>
      <CrossRefEditor initial={[]} onSave={save} />
    </main>
  );
}
