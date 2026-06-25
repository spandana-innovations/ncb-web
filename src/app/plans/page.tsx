"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { IconCalendar, IconBook, IconCheckCircle, IconPlay } from "@/components/Icons";
import planData from "./planData.json";

type PlanKey = "bible_in_year" | "nt_90" | "ps_proverbs";
type Progress = Record<string, Record<string | number, boolean>>;
type ResolvedChapter = { label: string; chapterId: number; bookName: string; chapterName: string };

const PLANS = [
  { key: "bible_in_year" as PlanKey, title: "Bible in a Year", subtitle: "OT + NT · 365 days", days: 365, color: "#e41f2c" },
  { key: "nt_90" as PlanKey, title: "New Testament", subtitle: "90 days · ~3 chapters/day", days: 90, color: "#2f6db0" },
  { key: "ps_proverbs" as PlanKey, title: "Psalms & Proverbs", subtitle: "31 days · daily wisdom", days: 31, color: "#9a7b35" },
];

function dayOfYear() {
  const now = new Date(), start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function loadProgress(): Progress { try { return JSON.parse(localStorage.getItem("ncb-plan-progress") ?? "{}"); } catch { return {}; } }
function saveProgress(p: Progress) { try { localStorage.setItem("ncb-plan-progress", JSON.stringify(p)); } catch {} }
function loadActivePlan(): PlanKey | null { try { return localStorage.getItem("ncb-active-plan") as PlanKey | null; } catch { return null; } }
function saveActivePlan(k: PlanKey | null) { try { localStorage.setItem("ncb-active-plan", k ?? ""); } catch {} }
function loadStartDay(): number { try { return parseInt(localStorage.getItem("ncb-plan-start") ?? "0"); } catch { return 0; } }
function saveStartDay(d: number) { try { localStorage.setItem("ncb-plan-start", String(d)); } catch {} }

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function ChapterRow({ ch, done, onMark }: { ch: ResolvedChapter; done: boolean; onMark: () => void }) {
  return (
    <div className={`reading-plan__chapter${done ? " done" : ""}`}>
      <div className="reading-plan__ch-info">
        <span className="reading-plan__ch-name">{ch.bookName} · {ch.chapterName.replace("Ch. ", "Chapter ")}</span>
      </div>
      <div className="reading-plan__ch-actions">
        <Link href={`/read/${ch.chapterId}`} className="reading-plan__read-btn">
          <IconPlay size={14} /> Read
        </Link>
        <button
          className={`reading-plan__done-btn${done ? " checked" : ""}`}
          onClick={onMark}
          aria-label={done ? "Mark unread" : "Mark read"}
        >
          <IconCheckCircle size={18} />
        </button>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [activePlan, setActivePlan] = useState<PlanKey | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [startDay, setStartDay] = useState(0);
  const [view, setView] = useState<"plans" | "today" | "calendar">("plans");
  const [resolvedChapters, setResolvedChapters] = useState<ResolvedChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    const ap = loadActivePlan();
    setActivePlan(ap);
    setStartDay(loadStartDay());
    if (ap) setView("today");
  }, []);

  const currentPlanDay = useMemo(() => Math.max(0, dayOfYear() - startDay), [startDay]);

  // Resolve today's chapters to IDs when viewing Today tab
  useEffect(() => {
    if (view !== "today" || !activePlan) return;
    const data = (planData as any)[activePlan];
    const reading = data?.[currentPlanDay];
    if (!reading) return;
    const chapters: string[] = [...(reading.ot ?? []), ...(reading.nt ?? []), ...(reading.ps ?? []), ...(reading.pr ?? [])];
    if (chapters.length === 0) return;
    setLoadingChapters(true);
    fetch("/api/plans/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapters }),
    })
      .then(r => r.json())
      .then(j => setResolvedChapters(j.data ?? []))
      .finally(() => setLoadingChapters(false));
  }, [view, activePlan, currentPlanDay]);

  function selectPlan(key: PlanKey) {
    const sd = dayOfYear();
    setActivePlan(key); setStartDay(sd); saveActivePlan(key); saveStartDay(sd);
    setView("today");
  }

  function toggleChapter(chapterId: number) {
    if (!activePlan) return;
    const key = `${activePlan}_ch_${chapterId}`;
    const next: Progress = { ...progress, [activePlan]: { ...(progress[activePlan] ?? {}), [chapterId]: !progress[activePlan]?.[chapterId] } };
    setProgress(next); saveProgress(next);
  }

  function toggleDay(plan: PlanKey, day: number) {
    const next: Progress = { ...progress, [plan]: { ...(progress[plan] ?? {}), [`day_${day}`]: !progress[plan]?.[`day_${day}`] } };
    setProgress(next); saveProgress(next);
  }

  function markAllToday() {
    if (!activePlan) return;
    const planProgress = progress[activePlan] ?? {};
    const allDone = resolvedChapters.every(ch => planProgress[ch.chapterId]);
    const updates: Record<number | string, boolean> = {};
    resolvedChapters.forEach(ch => { updates[ch.chapterId] = !allDone; });
    updates[`day_${currentPlanDay}`] = !allDone;
    const next: Progress = { ...progress, [activePlan]: { ...planProgress, ...updates } };
    setProgress(next); saveProgress(next);
  }

  const planProgress = activePlan ? progress[activePlan] ?? {} : {};
  const doneCount = Object.entries(planProgress).filter(([k, v]) => k.startsWith("day_") && v).length;
  const planDays = activePlan ? PLANS.find(p => p.key === activePlan)!.days : 0;
  const todayDone = !!planProgress[`day_${currentPlanDay}`];
  const chapsDoneToday = resolvedChapters.filter(ch => planProgress[ch.chapterId]).length;
  const allChapsDone = resolvedChapters.length > 0 && chapsDoneToday === resolvedChapters.length;

  // Auto-mark day done when all chapters are read
  useEffect(() => {
    if (!activePlan || !allChapsDone || todayDone) return;
    const next: Progress = { ...progress, [activePlan]: { ...(progress[activePlan] ?? {}), [`day_${currentPlanDay}`]: true } };
    setProgress(next); saveProgress(next);
  }, [allChapsDone]);

  return (
    <main className="container reading">
      <p className="eyebrow">Daily Scripture</p>
      <h1 className="title">Reading Plans</h1>

      <div className="seg" style={{ marginBottom: "1.2rem" }}>
        <button className={`seg__btn${view === "plans" ? " active" : ""}`} onClick={() => setView("plans")}>Plans</button>
        <button className={`seg__btn${view === "today" ? " active" : ""}`} onClick={() => setView("today")} disabled={!activePlan}>Today</button>
        <button className={`seg__btn${view === "calendar" ? " active" : ""}`} onClick={() => setView("calendar")} disabled={!activePlan}>Calendar</button>
      </div>

      {/* ── PLANS ── */}
      {view === "plans" && (
        <div>
          {activePlan && (
            <div className="plan-active-banner">
              <IconCalendar size={16} />
              <span>Active: <b>{PLANS.find(p => p.key === activePlan)?.title}</b> · Day {currentPlanDay + 1} · {doneCount}/{planDays}</span>
            </div>
          )}
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: "1.2rem" }}>
            Select a plan to start your daily reading. Progress is saved on this device.
          </p>
          {PLANS.map(plan => {
            const pd = progress[plan.key] ?? {};
            const done = Object.entries(pd).filter(([k,v]) => k.startsWith("day_") && v).length;
            const isActive = activePlan === plan.key;
            return (
              <div key={plan.key} className={`plan-card${isActive ? " active" : ""}`} style={{ "--plan-color": plan.color } as any}>
                <div className="plan-card__top">
                  <div>
                    <div className="plan-card__title">{plan.title}</div>
                    <div className="plan-card__sub">{plan.subtitle}</div>
                  </div>
                  {isActive && <span className="plan-card__badge">Active</span>}
                </div>
                <div className="plan-card__progress">
                  <div className="plan-card__bar"><div style={{ width: `${(done / plan.days) * 100}%` }} /></div>
                  <span>{done}/{plan.days} days</span>
                </div>
                <button className="plan-card__btn" onClick={() => selectPlan(plan.key)}>
                  {isActive ? "Continue →" : "Start plan"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TODAY ── */}
      {view === "today" && activePlan && (
        <div>
          <div className="reading-plan__header">
            <div>
              <div className="reading-plan__date">{todayLabel()}</div>
              <div className="reading-plan__day">Day {currentPlanDay + 1} of {planDays}</div>
            </div>
            <div className={`reading-plan__status${todayDone ? " done" : ""}`}>
              {todayDone ? "✓ Done" : `${chapsDoneToday}/${resolvedChapters.length}`}
            </div>
          </div>

          <div style={{ marginBottom: "0.8rem", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
            Tap a chapter to read. Check ✓ when done. Day auto-completes when all chapters are read.
          </div>

          {loadingChapters && <p className="empty">Loading today's reading…</p>}

          {!loadingChapters && resolvedChapters.length > 0 && (
            <>
              {activePlan === "bible_in_year" && (
                <>
                  <div className="reading-plan__section">Old Testament</div>
                  {resolvedChapters.filter(ch => !["Matthew","Mark","Luke","John","Acts","Romans","1-Corinthians","2-Corinthians","Galatians","Ephesians","Philippians","Colossians","1-Thessalonians","2-Thessalonians","1-Timothy","2-Timothy","Titus","Philemon","Hebrews","James","1-Peter","2-Peter","1-John","2-John","3-John","Jude","Revelation"].some(nt => ch.bookName.includes(nt))).map(ch => (
                    <ChapterRow key={ch.chapterId} ch={ch} done={!!planProgress[ch.chapterId]} onMark={() => toggleChapter(ch.chapterId)} />
                  ))}
                  <div className="reading-plan__section">New Testament</div>
                  {resolvedChapters.filter(ch => ["Matthew","Mark","Luke","John","Acts","Romans","1-Corinthians","2-Corinthians","Galatians","Ephesians","Philippians","Colossians","1-Thessalonians","2-Thessalonians","1-Timothy","2-Timothy","Titus","Philemon","Hebrews","James","1-Peter","2-Peter","1-John","2-John","3-John","Jude","Revelation"].some(nt => ch.bookName.includes(nt) || ch.bookName === nt)).map(ch => (
                    <ChapterRow key={ch.chapterId} ch={ch} done={!!planProgress[ch.chapterId]} onMark={() => toggleChapter(ch.chapterId)} />
                  ))}
                </>
              )}
              {activePlan !== "bible_in_year" && resolvedChapters.map(ch => (
                <ChapterRow key={ch.chapterId} ch={ch} done={!!planProgress[ch.chapterId]} onMark={() => toggleChapter(ch.chapterId)} />
              ))}

              <button className={`plan-today__mark${todayDone ? " done" : ""}`} onClick={markAllToday} style={{ marginTop: "1rem" }}>
                {todayDone ? "✓ Day Complete — tap to undo" : "Mark entire day as done"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {view === "calendar" && activePlan && (
        <div>
          <div className="plan-active-banner" style={{ marginBottom: "1rem" }}>
            <IconCalendar size={16} />
            <span>{PLANS.find(p => p.key === activePlan)?.title} · {doneCount}/{planDays} days completed</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: "0.8rem" }}>
            Tap any day to toggle. Today is highlighted in red.
          </p>
          <div className="plan-cal">
            {Array.from({ length: Math.min(planDays, 60) }, (_, i) => {
              const done = !!planProgress[`day_${i}`];
              const isToday = i === currentPlanDay;
              return (
                <button key={i} onClick={() => toggleDay(activePlan, i)}
                  className={`plan-cal__day${done ? " done" : ""}${isToday ? " today" : ""}`}
                  title={`Day ${i + 1}`}>
                  {done ? "✓" : i + 1}
                </button>
              );
            })}
            {planDays > 60 && <span className="plan-cal__more">+{planDays - 60} more days</span>}
          </div>
        </div>
      )}
    </main>
  );
}
