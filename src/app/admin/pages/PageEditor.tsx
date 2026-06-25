"use client";
import { useState, useRef, useCallback } from "react";
import { savePage } from "./actions";

const TOOLBAR = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "separator" },
  { cmd: "insertParagraph", label: "¶", title: "Paragraph" },
  { cmd: "formatBlock:h2", label: "H2", title: "Heading 2" },
  { cmd: "formatBlock:h3", label: "H3", title: "Heading 3" },
  { cmd: "separator" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bullet list" },
  { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
  { cmd: "separator" },
  { cmd: "removeFormat", label: "Clear", title: "Remove formatting" },
];

export default function PageEditor({ slug, label, initialContent }: {
  slug: string; label: string; initialContent: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function exec(cmd: string) {
    if (cmd.startsWith("formatBlock:")) {
      document.execCommand("formatBlock", false, cmd.split(":")[1]);
    } else {
      document.execCommand(cmd, false);
    }
    editorRef.current?.focus();
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("content", editorRef.current?.innerHTML ?? "");
    await savePage(fd);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize: ".78rem", color: "var(--soft)", marginBottom: ".2rem" }}>Static Pages › {label}</div>
          <h1>{label}</h1>
        </div>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
          {saved && <span style={{ fontSize: ".8rem", color: "var(--green)", fontWeight: 600 }}>✓ Saved</span>}
          <button onClick={handleSave} disabled={saving} className="adm-btn adm-btn--primary adm-btn--lg">
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>

      <div className="adm-editor-wrap">
        {/* Editor */}
        <div className="adm-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="adm-editor-toolbar">
            {TOOLBAR.map((t, i) =>
              t.cmd === "separator"
                ? <div key={i} style={{ width: "1px", background: "var(--rule)", margin: "0 .2rem" }} />
                : <button key={t.cmd} onClick={() => exec(t.cmd)} title={t.title}>{t.label}</button>
            )}
          </div>
          <div
            ref={editorRef}
            className="adm-editor-area"
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: initialContent }}
            onInput={() => setHtml(editorRef.current?.innerHTML ?? "")}
            style={{ flex: 1, minHeight: "400px", padding: "1.25rem" }}
          />
        </div>

        {/* Mobile preview */}
        <div>
          <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--soft)", marginBottom: ".75rem" }}>
            Mobile preview
          </div>
          <div className="adm-mobile-preview">
            <div className="adm-mobile-screen">
              <div className="adm-mobile-status">
                <span style={{ color: "#fff", fontSize: ".65rem", fontWeight: 700 }}>The New Community Bible</span>
              </div>
              <div className="adm-mobile-content">
                <div style={{ fontSize: ".6rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#6e6e73", marginBottom: ".3rem" }}>New Community Bible</div>
                <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: ".75rem" }}>{label}</div>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
