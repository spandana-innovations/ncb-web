"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Bookmark = {
  verseId: number; ref: string; chapterId: number; text: string;
  group?: string;
};
export type Group = { name: string; color: string };

const DEFAULT_GROUPS: Group[] = [
  { name: "Favourites", color: "#e41f2c" },
  { name: "Study", color: "#9a7b35" },
  { name: "Comfort", color: "#3a8a5f" },
];

type Ctx = {
  bookmarks: Bookmark[]; groups: Group[];
  isBookmarked: (id: number) => boolean;
  toggle: (b: Bookmark) => void;
  remove: (id: number) => void;
  setGroup: (verseId: number, group: string | undefined) => void;
  addGroup: (name: string, color: string) => void;
  renameGroup: (oldName: string, newName: string) => void;
  deleteGroup: (name: string) => void;
};
const Ctx = createContext<Ctx | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS);

  useEffect(() => {
    try {
      const b = localStorage.getItem("ncb-bookmarks"); if (b) setBookmarks(JSON.parse(b));
      const g = localStorage.getItem("ncb-groups"); if (g) setGroups(JSON.parse(g));
    } catch {}
  }, []);

  const saveB = (list: Bookmark[]) => { setBookmarks(list); try { localStorage.setItem("ncb-bookmarks", JSON.stringify(list)); } catch {} };
  const saveG = (list: Group[]) => { setGroups(list); try { localStorage.setItem("ncb-groups", JSON.stringify(list)); } catch {} };

  const isBookmarked = useCallback((id: number) => bookmarks.some((b) => b.verseId === id), [bookmarks]);
  const toggle = useCallback((b: Bookmark) => {
    setBookmarks((prev) => {
      const exists = prev.some((x) => x.verseId === b.verseId);
      const next = exists ? prev.filter((x) => x.verseId !== b.verseId) : [b, ...prev];
      try { localStorage.setItem("ncb-bookmarks", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const remove = useCallback((id: number) => saveB(bookmarks.filter((x) => x.verseId !== id)), [bookmarks]);
  const setGroup = useCallback((verseId: number, group: string | undefined) =>
    saveB(bookmarks.map((b) => b.verseId === verseId ? { ...b, group } : b)), [bookmarks]);
  const addGroup = useCallback((name: string, color: string) => {
    const n = name.trim(); if (!n || groups.some((g) => g.name === n)) return;
    saveG([...groups, { name: n, color }]);
  }, [groups]);
  const renameGroup = useCallback((oldName: string, newName: string) => {
    const n = newName.trim(); if (!n || groups.some((g) => g.name === n)) return;
    saveG(groups.map((g) => g.name === oldName ? { ...g, name: n } : g));
    saveB(bookmarks.map((b) => b.group === oldName ? { ...b, group: n } : b));
  }, [groups, bookmarks]);
  const deleteGroup = useCallback((name: string) => {
    saveG(groups.filter((g) => g.name !== name));
    // bookmarks in that group fall back to Unsorted
    saveB(bookmarks.map((b) => b.group === name ? { ...b, group: undefined } : b));
  }, [groups, bookmarks]);

  return (
    <Ctx.Provider value={{ bookmarks, groups, isBookmarked, toggle, remove, setGroup, addGroup, renameGroup, deleteGroup }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookmarks() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBookmarks must be used within BookmarkProvider");
  return c;
}
