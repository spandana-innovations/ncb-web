"use client";
import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./Settings";
import { BookmarkProvider } from "./Bookmarks";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <BookmarkProvider>{children}</BookmarkProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}
