"use client";

const VOTD = [
  { t: "For I know the plans I have for you, plans for your welfare and not for evil, to give you a future and a hope.", r: "Jeremiah 29:11" },
  { t: "The Lord is my shepherd; I shall not want.", r: "Psalms 23:1" },
  { t: "I can do all things through Christ who strengthens me.", r: "Philippians 4:13" },
  { t: "Trust in the Lord with all your heart, and do not rely on your own insight.", r: "Proverbs 3:5" },
  { t: "Be strong and courageous; do not be frightened, for the Lord your God is with you wherever you go.", r: "Joshua 1:9" },
  { t: "Love is patient; love is kind; love is not envious or boastful or arrogant.", r: "1 Corinthians 13:4" },
  { t: "In the beginning when God created the heavens and the earth.", r: "Genesis 1:1" },
];

export default function HomeExtras() {
  const dayIndex = Math.floor(Date.now() / 86400000) % VOTD.length;
  const votd = VOTD[dayIndex];
  return (
    <div className="home-extras">
      <div className="vod">
        <small>Verse of the day</small>
        <p>{votd.t}</p>
        <b>{votd.r}</b>
      </div>
    </div>
  );
}
