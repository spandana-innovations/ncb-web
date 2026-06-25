// Imports content from the converted legacy SQLite file into the
// active Prisma database (local dev file or Turso).
//
// Usage:
//   node scripts/import-from-sqlite.mjs /path/to/bettery1_ncb_clean.sqlite
//
// It reads the OLD table shapes and writes into the NEW schema. The
// schema is intentionally close to the original, so most tables copy 1:1.
// The only reshapes: banners (media URLs -> columns) are left null here
// because the source had no media rows; set them later in the admin.

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const SRC = process.argv[2];
if (!SRC) {
  console.error("Usage: node scripts/import-from-sqlite.mjs <legacy.sqlite>");
  process.exit(1);
}

// Read the legacy file with a second libsql client (file: URL).
const srcDb = createClient({ url: `file:${SRC}` });
const rows = async (t) => (await srcDb.execute(`SELECT * FROM ${t}`)).rows;
const has = async (t) =>
  (await srcDb.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    args: [t],
  })).rows.length > 0;

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;
const adapter = new PrismaLibSQL(
  url.startsWith("libsql:") ? { url, authToken } : { url }
);
const prisma = new PrismaClient({ adapter });

// Insert in FK-safe order, in chunks, using createMany.
async function copy(table, model, mapFn, filterFn) {
  if (!(await has(table))) {
    console.log(`- ${table}: source table missing, skipped`);
    return;
  }
  let raw = await rows(table);
  let skipped = 0;
  if (filterFn) {
    const before = raw.length;
    raw = raw.filter(filterFn);
    skipped = before - raw.length;
  }
  const data = raw.map(mapFn);
  const CHUNK = 500;
  for (let i = 0; i < data.length; i += CHUNK) {
    await prisma[model].createMany({ data: data.slice(i, i + CHUNK) });
  }
  console.log(
    `+ ${table}: ${data.length} rows` +
      (skipped ? ` (skipped ${skipped} orphan rows)` : "")
  );
}

const ts = (r) => ({ createdAt: r.created_at ?? null, updatedAt: r.updated_at ?? null });

async function main() {
  console.log("Importing from", SRC, "->", url);

  // Pre-load valid id sets so we can skip orphan rows that would
  // violate the new schema's foreign keys (a few exist in source data).
  const idSet = async (t) =>
    new Set((await srcDb.execute(`SELECT id FROM ${t}`)).rows.map((r) => r.id));
  const chapterIds = await idSet("chapters");
  const verseIds = await idSet("verses");
  const footnoteIds = await idSet("footnotes");
  const commentaryIds = await idSet("commentaries");

  await copy("testaments", "testament", (r) => ({
    id: r.id, name: r.name, displayPosition: r.display_position, ...ts(r),
  }));
  await copy("books", "book", (r) => ({
    id: r.id, name: r.name, displayPosition: r.display_position,
    introduction: r.introduction ?? "", testamentId: r.testament_id, ...ts(r),
  }));
  await copy("chapters", "chapter", (r) => ({
    id: r.id, name: r.name, heading: r.heading ?? null,
    displayPosition: r.display_position, bookId: r.book_id, ...ts(r),
  }));
  await copy("verses", "verse", (r) => ({
    id: r.id, verse: r.verse, verseNo: String(r.verse_no), order: r.order,
    chapterId: r.chapter_id, commentaryContent: r.commentary_content ?? null,
    commentaryTitle: r.commentary_title ?? null, ...ts(r),
  }), (r) => chapterIds.has(r.chapter_id));
  await copy("footnotes", "footnote", (r) => ({ id: r.id, ...ts(r) }));
  await copy("footnote_verse", "footnoteVerse", (r) => ({
    id: r.id, verseId: r.verse_id, footnoteId: r.footnote_id, ...ts(r),
  }), (r) => verseIds.has(r.verse_id) && footnoteIds.has(r.footnote_id));
  await copy("commentaries", "commentary", (r) => ({
    id: r.id, title: r.title, content: r.content, ...ts(r),
  }));
  await copy("commentary_verse", "commentaryVerse", (r) => ({
    id: r.id, commentaryId: r.commentary_id, verseId: r.verse_id, ...ts(r),
  }), (r) => commentaryIds.has(r.commentary_id) && verseIds.has(r.verse_id));
  await copy("lexicons", "lexicon", (r) => ({
    id: r.id, title: r.title, description: r.description,
    category: r.category ?? "", ...ts(r),
  }));

  for (const [t, m] of [
    ["introductions", "introduction"], ["prefaces", "preface"],
    ["copyrights", "copyright"], ["collaborators", "collaborator"],
    ["presentations", "presentation"], ["contact_us", "contactUs"],
  ]) {
    await copy(t, m, (r) => ({ id: r.id, content: r.content, ...ts(r) }));
  }

  await copy("messages", "message", (r) => ({
    id: r.id, title: r.title, content: r.content, ...ts(r),
  }));

  // banners: legacy media library stored files elsewhere; import id only.
  await copy("banners", "banner", (r) => ({
    id: r.id, desktopImage: null, mobileImage: null, ...ts(r),
  }));

  await copy("users", "user", (r) => ({
    id: r.id, name: r.name, email: r.email,
    emailVerifiedAt: r.email_verified_at ?? null, password: r.password,
    rememberToken: r.remember_token ?? null, ...ts(r),
  }));

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
