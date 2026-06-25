import { saveLexicon } from "../actions";

export default function NewLexicon() {
  return (
    <main className="container reading">
      <p className="eyebrow">Administration</p>
      <h1 className="title">New Lexicon Entry</h1>
      <form action={saveLexicon}>
        <label className="eyebrow">Title</label>
        <input name="title" className="searchbar" style={{ width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" }} required />
        <label className="eyebrow">Category</label>
        <input name="category" style={{ width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" }} />
        <label className="eyebrow">Description (HTML allowed)</label>
        <textarea name="description" rows={8} style={{ width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)", fontFamily: "var(--serif)" }} />
        <button className="btn" type="submit">Save entry</button>
      </form>
    </main>
  );
}
