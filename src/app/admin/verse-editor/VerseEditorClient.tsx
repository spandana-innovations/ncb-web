"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  saveVerseAction, resolveJumpAction, lookupVerseRefAction,
  addCrossRefAction, removeCrossRefAction, loadChapterAction, loadCrossRefsAction,
} from "./actions";

type VerseMeta = { id: number; verseNo: string; order: number; text: string; hasCommentary: boolean; xrefCount: number; verse: string; commentaryTitle: string | null; commentaryContent: string | null; };
type XRef = { footnoteId: number; verseId: number; ref: string; text: string; html: string };
type RefPreview = { id: number; ref: string; text: string; html: string };

// Strip HTML tags → plain text for editing
function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").trim();
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 7px", borderRadius:20, fontSize:11, fontWeight:600, background:`${color}18`, color }}>{children}</span>;
}

function Spinner() {
  return <span style={{ display:"inline-block", width:14, height:14, border:"2px solid #fff4", borderTopColor:"var(--red)", borderRadius:"50%", animation:"spin .7s linear infinite" }} />;
}

function SaveBar({ status, onSave, onDiscard }: { status: string; onSave:()=>void; onDiscard:()=>void }) {
  const C:Record<string,string> = { idle:"var(--adm-soft)", dirty:"#9a7b35", saving:"var(--adm-soft)", saved:"#34c759", error:"#c00" };
  const L:Record<string,string> = { idle:"No changes", dirty:"Unsaved changes", saving:"Saving…", saved:"✓ Saved", error:"Save failed — try again" };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderTop:"1px solid var(--adm-rule)", background:"var(--adm-surface2)", flexShrink:0 }}>
      <span style={{ flex:1, fontSize:12, color:C[status]||"var(--adm-soft)", fontWeight:status==="saved"?600:400 }}>{L[status]??""}</span>
      <button className="adm-btn adm-btn--gray adm-btn--sm" onClick={onDiscard} disabled={status==="idle"||status==="saving"}>Discard</button>
      <button className="adm-btn adm-btn--primary" onClick={onSave} disabled={status==="idle"||status==="saving"||status==="saved"}>
        {status==="saving"?"Saving…":"Save changes"}
      </button>
    </div>
  );
}

export default function VerseEditorClient({ allBooks }: { allBooks: { id:number; name:string }[] }) {
  // Nav state
  const [jumpInput, setJumpInput] = useState("");
  const [jumpHint, setJumpHint] = useState<string|null>(null);
  const [currentBook, setCurrentBook] = useState("");
  const [currentChapterId, setCurrentChapterId] = useState<number|null>(null);
  const [currentChapterName, setCurrentChapterName] = useState("");
  const [chapterList, setChapterList] = useState<{id:number;name:string}[]>([]);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [verses, setVerses] = useState<VerseMeta[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number|null>(null);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Edit state
  const [verseText, setVerseText] = useState(""); // plain text
  const [commentTitle, setCommentTitle] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [verseOrder, setVerseOrder] = useState("");
  const [tab, setTab] = useState<"verse"|"commentary"|"xref">("verse");
  const [saveStatus, setSaveStatus] = useState<"idle"|"dirty"|"saving"|"saved"|"error">("idle");
  const origRef = useRef({ text:"", commentTitle:"", commentBody:"", order:"" });

  // XRef state
  const [xrefs, setXrefs] = useState<XRef[]>([]);
  const [refInput, setRefInput] = useState("");
  const [refPreview, setRefPreview] = useState<RefPreview|null>(null);
  const [refStatus, setRefStatus] = useState<"idle"|"loading"|"found"|"notfound"|"exists"|"adding">("idle");

  const selectedVerse = selectedIdx !== null ? verses[selectedIdx] : null;

  // Mark dirty
  useEffect(() => {
    if (!selectedVerse) return;
    const changed = verseText !== origRef.current.text || commentTitle !== origRef.current.commentTitle || commentBody !== origRef.current.commentBody || verseOrder !== origRef.current.order;
    setSaveStatus(changed ? "dirty" : "idle");
  }, [verseText, commentTitle, commentBody, verseOrder]);

  // Load verse into editor
  useEffect(() => {
    if (!selectedVerse) return;
    const plain = htmlToText(selectedVerse.verse);
    setVerseText(plain);
    setCommentTitle(selectedVerse.commentaryTitle ?? "");
    setCommentBody(selectedVerse.commentaryContent ?? "");
    setVerseOrder(String(selectedVerse.order));
    origRef.current = { text: plain, commentTitle: selectedVerse.commentaryTitle ?? "", commentBody: selectedVerse.commentaryContent ?? "", order: String(selectedVerse.order) };
    setSaveStatus("idle");
    setXrefs([]); setRefInput(""); setRefPreview(null); setRefStatus("idle");
    loadCrossRefsAction(selectedVerse.id).then(setXrefs);
  }, [selectedVerse?.id]);

  // Jump bar
  async function handleJump(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const q = jumpInput.trim(); if (!q) return;
    setJumpHint("Searching…");
    const result = await resolveJumpAction(q);
    if (result.type === "none") { setJumpHint("Not found — try \"Genesis 1\" or \"John 3:16\""); return; }
    setCurrentBook(result.bookName ?? ""); setCurrentChapterName(result.chapterName ?? "");
    if (result.chapterId) {
      await loadChapter(result.chapterId, result.bookName);
      if (result.type === "verse" && result.verseId) {
        const loaded = await loadChapterAction(result.chapterId);
        const idx = loaded.findIndex((v:any) => v.id === result.verseId);
        if (idx >= 0) setSelectedIdx(idx);
      }
    }
    setJumpHint(null);
  }

  async function loadChapter(chapterId: number, bookName?: string) {
    setLoadingChapter(true); setSelectedIdx(null);
    const loaded = await loadChapterAction(chapterId);
    setVerses(loaded); setCurrentChapterId(chapterId); setLoadingChapter(false);
    if (bookName !== undefined) setCurrentBook(bookName);
  }

  // Load chapter list when book changes
  useEffect(() => {
    if (!currentBook) return;
    const book = allBooks.find(b => b.name === currentBook); if (!book) return;
    fetch(`/api/admin/chapters?bookId=${book.id}`)
      .then(r => r.json()).then(d => { setChapterList(d.chapters ?? []); const idx = d.chapters?.findIndex((c:any) => c.id === currentChapterId) ?? -1; setChapterIdx(idx >= 0 ? idx : 0); })
      .catch(()=>{});
  }, [currentBook]);

  // Chapter prev/next
  async function navChapter(dir: -1|1) {
    const next = chapterIdx + dir;
    if (next < 0 || next >= chapterList.length) return;
    const ch = chapterList[next];
    setChapterIdx(next); setCurrentChapterName(ch.name);
    await loadChapter(ch.id);
  }

  // Save
  async function save() {
    if (!selectedVerse) return;
    setSaveStatus("saving");
    try {
      await saveVerseAction({ id: selectedVerse.id, verse: verseText, commentaryTitle: commentTitle||null, commentaryContent: commentBody||null, order: Number(verseOrder)||selectedVerse.order });
      origRef.current = { text: verseText, commentTitle, commentBody, order: verseOrder };
      setVerses(vs => vs.map((v,i) => i===selectedIdx ? { ...v, text: verseText.slice(0,80), hasCommentary:!!(commentTitle||commentBody), commentaryTitle: commentTitle||null, commentaryContent: commentBody||null, order: Number(verseOrder)||v.order } : v));
      setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 3000);
    } catch { setSaveStatus("error"); }
  }

  function discard() {
    setVerseText(origRef.current.text); setCommentTitle(origRef.current.commentTitle);
    setCommentBody(origRef.current.commentBody); setVerseOrder(origRef.current.order);
    setSaveStatus("idle");
  }

  // Cross-ref lookup
  async function handleRefLookup(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const q = refInput.trim(); if (!q||!selectedVerse) return;
    if (!/^.+\s+\d+:\d+$/.test(q)) { setRefStatus("notfound"); setRefPreview(null); return; }
    setRefStatus("loading"); setRefPreview(null);
    const result = await lookupVerseRefAction(q, selectedVerse.id);
    if (!result) { setRefStatus("notfound"); return; }
    if (xrefs.some(x => x.verseId === result.id)) { setRefStatus("exists"); setRefPreview(result); return; }
    setRefStatus("found"); setRefPreview(result);
  }

  async function confirmAddXref() {
    if (!refPreview||!selectedVerse) return;
    setRefStatus("adding");
    const newXref = await addCrossRefAction(selectedVerse.id, refPreview.id);
    if (newXref) {
      setXrefs(prev => [...prev, { footnoteId: newXref.footnoteId, verseId: refPreview.id, ref: refPreview.ref, text: refPreview.text, html: refPreview.html }]);
      setVerses(vs => vs.map((v,i) => i===selectedIdx ? { ...v, xrefCount: v.xrefCount+1 } : v));
    }
    setRefInput(""); setRefPreview(null); setRefStatus("idle");
  }

  async function removeXref(footnoteId:number, toVerseId:number) {
    if (!selectedVerse) return;
    await removeCrossRefAction(footnoteId, selectedVerse.id, toVerseId);
    setXrefs(prev => prev.filter(x => !(x.footnoteId===footnoteId&&x.verseId===toVerseId)));
    setVerses(vs => vs.map((v,i) => i===selectedIdx ? { ...v, xrefCount: Math.max(0,v.xrefCount-1) } : v));
  }

  function navVerse(dir:-1|1) {
    if (selectedIdx===null) { setSelectedIdx(0); return; }
    const next = selectedIdx+dir;
    if (next>=0&&next<verses.length) setSelectedIdx(next);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const panel: React.CSSProperties = { borderRight:"1px solid var(--adm-rule)", display:"flex", flexDirection:"column", overflow:"hidden" };

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"grid", gridTemplateColumns:"290px 1fr 320px", height:"calc(100vh - 56px)", overflow:"hidden" }}>

        {/* ── LEFT PANEL ── */}
        <div style={panel}>
          {/* Jump input */}
          <div style={{ padding:12, borderBottom:"1px solid var(--adm-rule)", background:"var(--adm-surface2)", flexShrink:0 }}>
            <div style={{ position:"relative", marginBottom:8 }}>
              <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"var(--adm-softer)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input className="adm-input" style={{ paddingLeft:30, fontSize:13 }}
                value={jumpInput} onChange={e=>{setJumpInput(e.target.value);setJumpHint(null);}}
                onKeyDown={handleJump} placeholder="Genesis 1  or  John 3:16  then ↵" />
            </div>
            {jumpHint && <div style={{ fontSize:11, color:jumpHint.includes("Not")?"#c00":"var(--adm-soft)", marginBottom:6 }}>{jumpHint}</div>}

            {/* Chapter selector: dropdown + prev/next */}
            {chapterList.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button className="adm-btn adm-btn--gray adm-btn--sm" style={{ padding:"4px 8px", flexShrink:0 }} onClick={()=>navChapter(-1)} disabled={chapterIdx===0}>‹</button>
                <select className="adm-select" style={{ flex:1, fontSize:12, padding:"4px 8px" }}
                  value={currentChapterId??""} onChange={async e=>{
                    const id=Number(e.target.value);
                    const idx=chapterList.findIndex(c=>c.id===id);
                    setChapterIdx(idx); setCurrentChapterName(chapterList[idx]?.name??"");
                    await loadChapter(id);
                  }}>
                  {chapterList.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="adm-btn adm-btn--gray adm-btn--sm" style={{ padding:"4px 8px", flexShrink:0 }} onClick={()=>navChapter(1)} disabled={chapterIdx>=chapterList.length-1}>›</button>
              </div>
            )}
            {currentBook && <div style={{ fontSize:11, color:"var(--adm-soft)", marginTop:6 }}>{currentBook} · {verses.length} verses</div>}
          </div>

          {/* Verse list */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {loadingChapter && <div style={{ padding:"20px 16px", color:"var(--adm-soft)", fontSize:13, textAlign:"center" }}>Loading…</div>}
            {!loadingChapter && verses.length===0 && (
              <div style={{ padding:"32px 16px", textAlign:"center", color:"var(--adm-softer)", fontSize:13 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity:.3, marginBottom:8, display:"block", margin:"0 auto 8px" }}><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/></svg>
                Type a reference above and press Enter
              </div>
            )}
            {verses.map((v,i) => (
              <div key={v.id} onClick={()=>setSelectedIdx(i)} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderBottom:"1px solid var(--adm-rule)", cursor:"pointer", background:i===selectedIdx?"rgba(228,31,44,.07)":"transparent", borderLeft:i===selectedIdx?"2.5px solid var(--red)":"2.5px solid transparent" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"var(--red)", minWidth:20, flexShrink:0 }}>{v.verseNo}</span>
                <span style={{ fontSize:12, color:"var(--adm-soft)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1 }}>{v.text}</span>
                {/* Indicators */}
                <span style={{ display:"flex", gap:3, alignItems:"center", flexShrink:0 }}>
                  {v.hasCommentary && <span title="Has commentary" style={{ fontSize:9, fontWeight:700, background:"rgba(154,123,53,.15)", color:"#7a5f10", padding:"1px 4px", borderRadius:4 }}>C</span>}
                  {v.xrefCount>0 && <span title={`${v.xrefCount} cross-refs`} style={{ fontSize:9, fontWeight:700, background:"rgba(52,199,89,.15)", color:"#177a40", padding:"1px 4px", borderRadius:4 }}>{v.xrefCount}</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Prev/Next verse */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderTop:"1px solid var(--adm-rule)", background:"var(--adm-surface2)", flexShrink:0 }}>
            <button className="adm-btn adm-btn--gray adm-btn--sm" onClick={()=>navVerse(-1)} disabled={selectedIdx===null||selectedIdx===0}>‹ Prev</button>
            <span style={{ fontSize:12, color:"var(--adm-soft)" }}>{selectedIdx!==null?`v${selectedIdx+1} of ${verses.length}`:"—"}</span>
            <button className="adm-btn adm-btn--gray adm-btn--sm" onClick={()=>navVerse(1)} disabled={selectedIdx===null||selectedIdx>=verses.length-1}>Next ›</button>
          </div>
        </div>

        {/* ── MIDDLE PANEL ── */}
        <div style={{ ...panel, borderRight:"1px solid var(--adm-rule)" }}>
          {!selectedVerse ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--adm-softer)", gap:10, padding:32 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ opacity:.25 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--adm-soft)" }}>Select a verse to edit</div>
              <div style={{ fontSize:12 }}>Use the jump bar or click a verse on the left</div>
            </div>
          ) : (
            <>
              {/* Tabs — Verse / Commentary / Cross References */}
              <div style={{ display:"flex", borderBottom:"1px solid var(--adm-rule)", background:"var(--adm-surface2)", flexShrink:0 }}>
                {(["verse","commentary","xref"] as const).map(t => (
                  <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 16px", fontSize:13, border:"none", background:"none", cursor:"pointer", fontFamily:"var(--adm-sans)", borderBottom:`2.5px solid ${tab===t?"var(--red)":"transparent"}`, color:tab===t?"var(--red)":"var(--adm-soft)", fontWeight:tab===t?600:400 }}>
                    {t==="verse"?"Verse":t==="commentary"?<>Commentary{selectedVerse.hasCommentary&&<span style={{ marginLeft:5, background:"rgba(154,123,53,.15)", color:"#7a5f10", fontSize:10, padding:"1px 6px", borderRadius:10, fontWeight:600 }}>Note</span>}</>:<>Cross refs{xrefs.length>0&&<span style={{ marginLeft:5, background:"rgba(52,199,89,.15)", color:"#177a40", fontSize:10, padding:"1px 6px", borderRadius:10, fontWeight:600 }}>{xrefs.length}</span>}</>}
                  </button>
                ))}
                <div style={{ flex:1 }}/>
                <span style={{ padding:"10px 14px", fontSize:11, color:"var(--adm-soft)" }}>{currentBook} · {currentChapterName} · v{selectedVerse.verseNo}</span>
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:16 }}>

                {/* ── VERSE TAB ── */}
                {tab==="verse" && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, height:"100%" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div>
                        <div className="adm-label" style={{ marginBottom:5 }}>Verse text (plain)</div>
                        <textarea className="adm-textarea" style={{ width:"100%", height:160, fontSize:14, lineHeight:1.7 }}
                          value={verseText} onChange={e=>setVerseText(e.target.value)}
                          placeholder="Type the verse text here…" />
                        <div style={{ fontSize:11, color:"var(--adm-soft)", marginTop:4 }}>Type plain text — formatting is preserved automatically</div>
                      </div>
                      <div>
                        <div className="adm-label" style={{ marginBottom:5 }}>Verse index (order)</div>
                        <input className="adm-input" type="number" value={verseOrder} onChange={e=>setVerseOrder(e.target.value)} style={{ width:100, fontSize:13 }} />
                        <div style={{ fontSize:11, color:"var(--adm-soft)", marginTop:4 }}>Change to reorder this verse within the chapter</div>
                      </div>
                    </div>
                    <div>
                      <div className="adm-label" style={{ marginBottom:5 }}>Preview</div>
                      <div style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-rule)", borderRadius:10, padding:"14px 16px", fontSize:15, lineHeight:1.75, color:"var(--adm-ink)", minHeight:160 }}>
                        <span style={{ fontSize:"0.62em", color:"var(--red)", verticalAlign:"super", fontWeight:700, marginRight:3 }}>{selectedVerse.verseNo}</span>
                        {verseText}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── COMMENTARY TAB ── */}
                {tab==="commentary" && (
                  <div>
                    <div className="adm-label" style={{ marginBottom:5 }}>Commentary title</div>
                    <input className="adm-input" style={{ marginBottom:14 }} value={commentTitle} onChange={e=>setCommentTitle(e.target.value)} placeholder="e.g. The significance of this passage…" />
                    <div className="adm-label" style={{ marginBottom:5 }}>Commentary body</div>
                    <textarea className="adm-textarea" style={{ width:"100%", height:200, marginBottom:14, fontSize:14, lineHeight:1.7 }}
                      value={commentBody} onChange={e=>setCommentBody(e.target.value)} placeholder="Write your commentary here…" />
                    {commentBody && (
                      <>
                        <div className="adm-label" style={{ marginBottom:5 }}>Preview</div>
                        <div style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-rule)", borderRadius:10, padding:"12px 16px", fontSize:14, lineHeight:1.75 }} dangerouslySetInnerHTML={{ __html: commentBody }} />
                      </>
                    )}
                  </div>
                )}

                {/* ── CROSS REFERENCES TAB ── */}
                {tab==="xref" && (
                  <div>
                    {/* Add cross-ref at TOP */}
                    <div style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-rule)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                      <div className="adm-label" style={{ marginBottom:8 }}>Add a cross-reference</div>
                      <div style={{ position:"relative" }}>
                        <input className="adm-input" style={{ fontSize:13, paddingRight:refStatus==="loading"?36:undefined }}
                          value={refInput} onChange={e=>{setRefInput(e.target.value);setRefPreview(null);setRefStatus("idle");}}
                          onKeyDown={handleRefLookup} placeholder="John 3:16  then press ↵" disabled={!selectedVerse} />
                        {refStatus==="loading"&&<span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}><Spinner /></span>}
                      </div>
                      <div style={{ fontSize:11, color:"var(--adm-soft)", marginTop:5 }}>
                        Format: <code style={{ background:"var(--adm-surface)", padding:"1px 5px", borderRadius:4 }}>Book Chapter:Verse</code> e.g. <code style={{ background:"var(--adm-surface)", padding:"1px 5px", borderRadius:4 }}>1 Cor 13:4</code>
                      </div>
                      {refStatus==="notfound"&&<div style={{ fontSize:12, color:"#c00", marginTop:6 }}>Verse not found — check the format</div>}
                      {refStatus==="exists"&&<div style={{ fontSize:12, color:"#9a7b35", marginTop:6 }}>Already linked to this verse</div>}

                      {/* Preview card before confirming */}
                      {refPreview&&refStatus==="found"&&(
                        <div style={{ border:"1.5px solid var(--red)", borderRadius:8, overflow:"hidden", marginTop:10 }}>
                          <div style={{ background:"rgba(228,31,44,.08)", padding:"7px 10px", borderBottom:"1px solid rgba(228,31,44,.15)" }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"var(--red)" }}>{refPreview.ref}</div>
                          </div>
                          <div style={{ padding:"8px 10px", fontSize:13, lineHeight:1.6, color:"var(--adm-ink)", background:"var(--adm-surface)" }}>{refPreview.text.slice(0,200)}{refPreview.text.length>200?"…":""}</div>
                          <div style={{ padding:"8px 10px", borderTop:"1px solid var(--adm-rule)", display:"flex", gap:8, background:"var(--adm-surface2)" }}>
                            <button className="adm-btn adm-btn--primary adm-btn--sm" style={{ flex:1, justifyContent:"center" }} onClick={confirmAddXref}>Link this verse</button>
                            <button className="adm-btn adm-btn--gray adm-btn--sm" onClick={()=>{setRefInput("");setRefPreview(null);setRefStatus("idle");}}>Cancel</button>
                          </div>
                        </div>
                      )}
                      {refStatus==="adding"&&<div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, fontSize:13, color:"var(--adm-soft)" }}><Spinner />Adding cross-reference…</div>}
                    </div>

                    {/* Existing xrefs */}
                    <div className="adm-label" style={{ marginBottom:8 }}>{xrefs.length} linked verse{xrefs.length!==1?"s":""}</div>
                    {xrefs.length===0&&<div style={{ fontSize:13, color:"var(--adm-softer)", fontStyle:"italic" }}>No cross-references yet. Use the input above to link verses.</div>}
                    {xrefs.map(x=>(
                      <div key={`${x.footnoteId}-${x.verseId}`} style={{ border:"1px solid var(--adm-rule)", borderRadius:8, padding:"10px 12px", marginBottom:8, background:"var(--adm-surface)" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--adm-soft)", marginBottom:4 }}>{x.ref}</div>
                        <div style={{ fontSize:13, color:"var(--adm-ink)", lineHeight:1.6 }}>{x.text.slice(0,200)}{x.text.length>200?"…":""}</div>
                        <button onClick={()=>removeXref(x.footnoteId,x.verseId)} style={{ marginTop:6, background:"none", border:"none", color:"#c00", fontSize:12, cursor:"pointer", padding:0, fontFamily:"var(--adm-sans)" }}>Remove link</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SaveBar status={saveStatus} onSave={save} onDiscard={discard} />
            </>
          )}
        </div>

        {/* ── RIGHT: empty / hint ── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--adm-surface2)", padding:24, textAlign:"center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ opacity:.12, marginBottom:12 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h4"/></svg>
          <div style={{ fontSize:13, color:"var(--adm-softer)", lineHeight:1.6 }}>
            Use the three tabs in the editor<br/>to switch between<br/>Verse · Commentary · Cross refs
          </div>
        </div>
      </div>
    </>
  );
}
