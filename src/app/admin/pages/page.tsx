import Link from "next/link";

const PAGES = [
  ["introduction", "Introduction"], ["preface", "Preface"], ["copyright", "Copyright"],
  ["collaborator", "Collaborator"], ["presentation", "Presentation"], ["contact-us", "Contact Us"],
];

export default function PagesIndex() {
  return (
    <main className="container">
      <p className="eyebrow">Administration</p>
      <h1 className="title">Static Pages</h1>
      {PAGES.map(([slug, label]) => (
        <div key={slug} className="result" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{label}</span>
          <Link href={`/admin/pages/${slug}`}>Edit</Link>
        </div>
      ))}
    </main>
  );
}
