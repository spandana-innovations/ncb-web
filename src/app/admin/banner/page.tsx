import { saveBanner } from "./actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BannerAdmin() {
  const banner = await prisma.banner.findFirst();
  const inp = { width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" } as const;
  return (
    <main className="container reading">
      <p className="eyebrow">Administration</p>
      <h1 className="title">Home Banner</h1>
      <p className="empty" style={{ marginBottom: "1.5rem" }}>
        Paste image URLs for now. (Direct upload to Vercel Blob can be added later.)
      </p>
      <form action={saveBanner}>
        <label className="eyebrow">Desktop banner image URL</label>
        <input name="desktopImage" defaultValue={banner?.desktopImage ?? ""} style={inp} />
        {banner?.desktopImage ? <img src={banner.desktopImage} alt="" style={{ maxWidth: "100%", marginBottom: "1rem", border: "1px solid var(--rule)" }} /> : null}
        <label className="eyebrow">Mobile banner image URL</label>
        <input name="mobileImage" defaultValue={banner?.mobileImage ?? ""} style={inp} />
        {banner?.mobileImage ? <img src={banner.mobileImage} alt="" style={{ maxWidth: "100%", marginBottom: "1rem", border: "1px solid var(--rule)" }} /> : null}
        <button className="btn" type="submit">Save banner</button>
      </form>
    </main>
  );
}
