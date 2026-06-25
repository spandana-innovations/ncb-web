import "./globals.css";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import HeaderControls from "@/components/HeaderControls";
import MobileMenu from "@/components/MobileMenu";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import BrandName from "@/components/BrandName";

export const metadata: Metadata = {
  title: "The New Community Bible",
  description: "Read the New Community Bible — cross-references, commentary, lexicon, audio.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
};
export const viewport: Viewport = {
  themeColor: "#e41f2c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Splash />
          <header className="site-header">
            <div className="site-header__inner">
              <MobileMenu />
              <BrandName />
              <HeaderControls />
            </div>
          </header>
          {children}
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
