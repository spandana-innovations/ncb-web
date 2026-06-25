export function recordPlayed(chapterId: number, label: string) {
  try {
    const entry = { chapterId, label, at: Date.now() };
    const raw = localStorage.getItem("ncb-played");
    let hist: any[] = raw ? JSON.parse(raw) : [];
    hist = hist.filter((h) => h.chapterId !== chapterId);
    hist.unshift(entry);
    localStorage.setItem("ncb-played", JSON.stringify(hist.slice(0, 20)));
  } catch {}
}
