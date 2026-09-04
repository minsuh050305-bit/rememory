import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, Search, Grid3x3, Layers, User, ArrowLeft, MapPin, Users,
  Sparkles, Camera, ScanLine, Image as ImageIcon, ChevronRight,
  Clock, X, Check, Heart, Plus, ShieldCheck, ChevronDown, RotateCcw,
} from "lucide-react";

/* ----------------------------- design tokens ----------------------------- */
const T = {
  bg: "#141216",
  surface: "#1C1A1F",
  surface2: "#242127",
  line: "#312D34",
  ink: "#F4F0E8",
  inkDim: "#A79FAE",
  inkFaint: "#726B78",
  gold: "#C9A671",
  goldDim: "#8A7550",
  rose: "#B98A82",
  sage: "#8C9A82",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }
.pl-app { font-family: 'Manrope', sans-serif; -webkit-font-smoothing: antialiased; }
.pl-serif { font-family: 'Fraunces', serif; }
.pl-scroll::-webkit-scrollbar { display: none; }
.pl-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.pl-fade-in { animation: plFadeIn .35s ease both; }
@keyframes plFadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
.pl-tap { transition: transform .12s ease, opacity .12s ease; }
.pl-tap:active { transform: scale(0.96); opacity: 0.85; }
`;

/* -------------------------------- helpers --------------------------------- */
const img = (seed, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function shortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function daysAgo(iso) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return diff;
}

/* --------------------------------- data ------------------------------------ */
const PHOTOS = [
  // Japan trip
  { id: "p1", seed: "tokyo-street-1", kind: "photo", date: "2026-08-12", location: "Shibuya, Tokyo", collections: ["Japan Trip", "Tokyo", "Friends", "2026 Summer"], tags: ["Street", "Night", "City"], context: "Friends · Night walk", keywords: ["도쿄", "일본", "시부야", "친구", "야경", "japan", "tokyo", "night"] },
  { id: "p2", seed: "tokyo-ramen-1", kind: "photo", date: "2026-08-13", location: "Shinjuku, Tokyo", collections: ["Japan Trip", "Tokyo", "Food", "2026 Summer"], tags: ["Ramen", "Food", "Dinner"], context: "Friends · Dinner", keywords: ["라멘", "일본", "도쿄", "ramen", "japan food", "먹었던"] },
  { id: "p3", seed: "tokyo-temple-1", kind: "photo", date: "2026-08-14", location: "Asakusa, Tokyo", collections: ["Japan Trip", "Tokyo", "Places", "2026 Summer"], tags: ["Temple", "Culture", "Day"], context: "Sightseeing · Afternoon", keywords: ["도쿄", "일본", "절", "temple", "japan"] },
  { id: "p4", seed: "tokyo-shopping-1", kind: "photo", date: "2026-08-15", location: "Ginza, Tokyo", collections: ["Japan Trip", "Tokyo", "Shopping", "2026 Summer"], tags: ["Shopping", "Street"], context: "Shopping · Afternoon", keywords: ["도쿄", "일본", "쇼핑", "shopping", "japan"] },
  { id: "p5", seed: "tokyo-friends-1", kind: "photo", date: "2026-08-16", location: "Harajuku, Tokyo", collections: ["Japan Trip", "Tokyo", "Friends", "2026 Summer"], tags: ["Friends", "Portrait"], context: "Friends · Afternoon", keywords: ["도쿄", "일본", "친구", "japan", "friends"] },
  { id: "p6", seed: "tokyo-skyline-1", kind: "photo", date: "2026-08-17", location: "Odaiba, Tokyo", collections: ["Japan Trip", "Tokyo", "Night", "2026 Summer"], tags: ["Skyline", "Night"], context: "Night · Last day", keywords: ["도쿄", "일본", "야경", "japan", "night"] },
  // Busan trip (last summer)
  { id: "p7", seed: "busan-beach-1", kind: "photo", date: "2025-07-20", location: "Haeundae, Busan", collections: ["Busan Trip", "Beach", "Places"], tags: ["Beach", "Ocean", "Summer"], context: "Beach day · Afternoon", keywords: ["부산", "바다", "여름", "busan", "beach", "작년"] },
  { id: "p8", seed: "busan-sunset-1", kind: "photo", date: "2025-07-20", location: "Gwangalli, Busan", collections: ["Busan Trip", "Sunsets", "Beach", "Memories"], tags: ["Sunset", "Ocean"], context: "Sunset · Evening", keywords: ["부산", "바다", "노을", "busan", "sunset"] },
  { id: "p9", seed: "busan-food-1", kind: "photo", date: "2025-07-21", location: "Nampo-dong, Busan", collections: ["Busan Trip", "Food", "Restaurants"], tags: ["Seafood", "Dinner"], context: "Friends · Dinner", keywords: ["부산", "회", "seafood", "busan"] },
  { id: "p10", seed: "busan-friends-1", kind: "photo", date: "2025-07-21", location: "Haeundae, Busan", collections: ["Busan Trip", "Friends", "Beach"], tags: ["Friends", "Beach"], context: "Friends · Beach", keywords: ["부산", "친구", "바다", "busan", "friends"] },
  // Cafes / friends
  { id: "p11", seed: "cafe-latte-1", kind: "photo", date: "2026-08-21", location: "Seongsu, Seoul", collections: ["Cafes", "Friends"], tags: ["Cafe", "Coffee"], context: "Friends · Cafe · Afternoon", keywords: ["성수", "카페", "친구", "cafe", "seongsu"] },
  { id: "p12", seed: "cafe-interior-1", kind: "photo", date: "2026-07-05", location: "Seongsu, Seoul", collections: ["Cafes"], tags: ["Cafe", "Interior"], context: "Solo · Afternoon", keywords: ["성수", "카페", "cafe"] },
  { id: "p13", seed: "cafe-dessert-1", kind: "photo", date: "2026-06-18", location: "Hannam, Seoul", collections: ["Cafes", "Friends"], tags: ["Cafe", "Dessert"], context: "Friends · Cafe", keywords: ["카페", "디저트", "친구", "cafe"] },
  { id: "p14", seed: "cafe-friends-1", kind: "photo", date: "2026-05-02", location: "Yeonnam, Seoul", collections: ["Cafes", "Friends"], tags: ["Cafe", "Friends"], context: "Friends · Cafe", keywords: ["카페", "친구", "cafe", "friends"] },
  // Restaurants / family
  { id: "p15", seed: "pasta-dinner-1", kind: "photo", date: "2026-04-11", location: "Itaewon, Seoul", collections: ["Restaurants", "Friends"], tags: ["Dinner", "Pasta"], context: "Friends · Dinner", keywords: ["파스타", "친구", "저녁", "restaurant"] },
  { id: "p16", seed: "bbq-dinner-1", kind: "photo", date: "2026-03-08", location: "Mapo, Seoul", collections: ["Restaurants", "Family"], tags: ["BBQ", "Dinner"], context: "Family · Dinner", keywords: ["가족", "고기", "family", "dinner"] },
  { id: "p17", seed: "family-dinner-1", kind: "photo", date: "2026-02-14", location: "Home", collections: ["Family"], tags: ["Family", "Dinner"], context: "Family · Evening", keywords: ["가족", "family"] },
  { id: "p18", seed: "family-bday-1", kind: "photo", date: "2026-01-30", location: "Home", collections: ["Family", "Birthdays", "Memories"], tags: ["Birthday", "Cake"], context: "Family · Birthday", keywords: ["가족", "생일", "birthday", "family"] },
  // Pets / memories
  { id: "p19", seed: "cat-sleep-1", kind: "photo", date: "2026-08-02", location: "Home", collections: ["Pets", "Memories"], tags: ["Cat", "Home"], context: "Home · Morning", keywords: ["고양이", "cat", "pet"] },
  { id: "p20", seed: "cat-play-1", kind: "photo", date: "2026-07-19", location: "Home", collections: ["Pets"], tags: ["Cat", "Play"], context: "Home · Evening", keywords: ["고양이", "cat", "pet", "강아지"] },
  { id: "p21", seed: "sunset-city-1", kind: "photo", date: "2026-06-27", location: "Hangang, Seoul", collections: ["Sunsets", "Memories", "Friends"], tags: ["Sunset", "River"], context: "Friends · Sunset", keywords: ["노을", "한강", "sunset"] },
  { id: "p22", seed: "sunset-roof-1", kind: "photo", date: "2026-06-06", location: "Seoul", collections: ["Sunsets", "Memories"], tags: ["Sunset", "Rooftop"], context: "Solo · Evening", keywords: ["노을", "sunset"] },
  { id: "p23", seed: "park-picnic-1", kind: "photo", date: "2026-05-17", location: "Seonyudo Park, Seoul", collections: ["Parks", "Friends"], tags: ["Park", "Picnic"], context: "Friends · Picnic", keywords: ["공원", "친구", "park", "picnic"] },
  { id: "p24", seed: "park-blossom-1", kind: "photo", date: "2026-04-02", location: "Yeouido, Seoul", collections: ["Parks"], tags: ["Park", "Spring"], context: "Solo · Afternoon", keywords: ["공원", "벚꽃", "park"] },
  // Screenshots — wishlist / shopping
  { id: "p25", seed: "bag-product-1", kind: "screenshot", date: daysAgoISO(48), location: null, collections: ["Wishlist", "Shopping", "Things I Want"], tags: ["Product", "Bag"], why: "Wishlist", context: "Saved from a shopping app", keywords: ["가방", "검은색", "black bag", "wishlist", "쇼핑"] },
  { id: "p26", seed: "sneaker-product-1", kind: "screenshot", date: daysAgoISO(21), location: null, collections: ["Wishlist", "Shopping", "Things I Want"], tags: ["Product", "Shoes"], why: "Wishlist", context: "Saved from a shopping app", keywords: ["신발", "sneakers", "wishlist"] },
  { id: "p27", seed: "watch-product-1", kind: "screenshot", date: daysAgoISO(9), location: null, collections: ["Wishlist", "Shopping"], tags: ["Product", "Watch"], why: "Wishlist", context: "Saved from a shopping app", keywords: ["시계", "watch", "wishlist"] },
  // Screenshots — tickets
  { id: "p28", seed: "ticket-concert-1", kind: "screenshot", date: "2026-07-30", location: null, collections: ["Tickets"], tags: ["Ticket", "Concert"], why: "Concert ticket", context: "Saved reservation", keywords: ["티켓", "콘서트", "ticket"] },
  { id: "p29", seed: "ticket-flight-1", kind: "screenshot", date: "2026-08-10", location: null, collections: ["Tickets"], tags: ["Ticket", "Flight"], why: "Flight ticket", context: "Saved reservation", keywords: ["티켓", "항공권", "flight ticket"] },
  // Screenshots — study
  { id: "p30", seed: "study-notes-1", kind: "screenshot", date: "2026-08-25", location: null, collections: ["Study"], tags: ["Notes", "Study"], why: "Lecture notes", context: "Saved for later", keywords: ["공부", "study", "notes"] },
  { id: "p31", seed: "study-vocab-1", kind: "screenshot", date: "2026-08-27", location: null, collections: ["Study"], tags: ["Vocabulary", "Study"], why: "Vocabulary list", context: "Saved for later", keywords: ["단어", "study", "vocab"] },
  // Screenshots — ideas
  { id: "p32", seed: "interior-idea-1", kind: "screenshot", date: "2026-08-29", location: null, collections: ["Ideas"], tags: ["Interior", "Inspiration"], why: "Interior inspiration", context: "Saved idea", keywords: ["인테리어", "아이디어", "interior idea"] },
  // Documents
  { id: "p33", seed: "receipt-doc-1", kind: "document", date: "2026-08-19", location: null, collections: ["Documents"], tags: ["Receipt"], why: "Receipt", context: "Saved document", keywords: ["영수증", "receipt", "document"] },
  { id: "p34", seed: "tokyo-street-2", kind: "photo", date: "2026-08-12", location: "Shibuya, Tokyo", collections: ["Japan Trip", "Tokyo", "2026 Summer"], tags: ["Street"], context: "Sightseeing", keywords: ["도쿄", "일본", "japan"] },
];

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const COLLECTION_META = [
  { name: "Japan Trip", emoji: "🇯🇵", group: "Trips", label: "Japan" },
  { name: "Busan Trip", emoji: "🇰🇷", group: "Trips", label: "Busan" },
  { name: "Friends", emoji: "👤", group: "People" },
  { name: "Family", emoji: "👤", group: "People" },
  { name: "Cafes", emoji: "☕", group: "Places" },
  { name: "Restaurants", emoji: "🍜", group: "Places" },
  { name: "Parks", emoji: "🏞️", group: "Places" },
  { name: "Wishlist", emoji: "🛍️", group: "Things" },
  { name: "Tickets", emoji: "🎫", group: "Things" },
  { name: "Documents", emoji: "📄", group: "Things" },
  { name: "Sunsets", emoji: "🌅", group: "Memories" },
  { name: "Pets", emoji: "🐱", group: "Memories" },
  { name: "Birthdays", emoji: "🎂", group: "Memories" },
  { name: "Study", emoji: "📚", group: "Screenshots" },
  { name: "Ideas", emoji: "💡", group: "Screenshots" },
];

function photosFor(name) {
  return PHOTOS.filter((p) => p.collections.includes(name));
}
function coverFor(name) {
  const list = photosFor(name);
  return list[0];
}

const SEARCH_SUGGESTIONS = [
  "작년 여름에 부산에서 찍은 바다 사진",
  "친구들이랑 카페에서 찍은 사진",
  "내가 사고 싶어서 저장해둔 검은색 가방",
  "일본 여행 때 먹었던 라멘",
  "강아지 사진만 보여줘",
];

function runSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = PHOTOS.map((p) => {
    const hay = [
      ...(p.keywords || []),
      ...(p.tags || []),
      ...(p.collections || []),
      p.location || "",
      p.context || "",
    ]
      .join(" ")
      .toLowerCase();
    let score = 0;
    tokens.forEach((t) => {
      if (t.length < 2) return;
      if (hay.includes(t)) score += 2;
      else if (t.length >= 2 && [...hay].some((c) => t.includes(c))) score += 0;
    });
    return { p, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.p);
}

/* ------------------------------- small bits -------------------------------- */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px]" style={{ color: T.ink }}>
      <span className="font-semibold">9:41</span>
      <div className="flex items-center gap-1.5">
        <div style={{ width: 16, height: 10, border: `1.5px solid ${T.ink}`, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function KindBadge({ kind }) {
  const map = {
    photo: { icon: Camera, label: "Photo" },
    screenshot: { icon: ScanLine, label: "Screenshot" },
    document: { icon: ImageIcon, label: "Document" },
  };
  const { icon: Icon, label } = map[kind] || map.photo;
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px]"
      style={{ background: "rgba(20,18,22,0.55)", color: T.ink, backdropFilter: "blur(6px)" }}
    >
      <Icon size={11} />
      <span>{label}</span>
    </div>
  );
}

function ScreenshotThumb({ photo }) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-3"
      style={{ background: `linear-gradient(155deg, ${T.surface2}, ${T.surface})` }}
    >
      <div className="flex flex-col gap-1.5">
        <div style={{ height: 6, width: "70%", borderRadius: 3, background: T.line }} />
        <div style={{ height: 6, width: "45%", borderRadius: 3, background: T.line }} />
      </div>
      <ScanLine size={18} color={T.goldDim} />
    </div>
  );
}

function PhotoThumb({ photo, onClick, ratio = "aspect-square" }) {
  return (
    <button
      onClick={onClick}
      className={`pl-tap relative overflow-hidden rounded-xl w-full ${ratio}`}
      style={{ background: T.surface2 }}
    >
      {photo.kind === "photo" || photo.kind === "document" ? (
        <img src={img(photo.seed, 400, 400)} alt="" className="w-full h-full object-cover" />
      ) : (
        <ScreenshotThumb photo={photo} />
      )}
    </button>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between px-5 mb-3">
      <h3 className="pl-serif text-[19px]" style={{ color: T.ink }}>{title}</h3>
      {action && (
        <button onClick={onAction} className="text-[12px] flex items-center gap-0.5 pl-tap" style={{ color: T.inkDim }}>
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

/* --------------------------------- onboarding -------------------------------- */
function Onboarding({ onDone }) {
  const [stage, setStage] = useState("intro"); // intro -> analyzing -> done
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage !== "analyzing") return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => setStage("done"), 350);
          return 100;
        }
        return p + Math.random() * 14 + 6;
      });
    }, 180);
    return () => clearInterval(t);
  }, [stage]);

  if (stage === "intro") {
    return (
      <div className="h-full flex flex-col justify-between px-7 pt-16 pb-10" style={{ background: T.bg }}>
        <div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: T.surface2 }}>
            <Sparkles size={22} color={T.gold} />
          </div>
          <h1 className="pl-serif text-[32px] leading-[1.15] mb-4" style={{ color: T.ink }}>
            Don't organize your photos.
            <br />Let it understand them.
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: T.inkDim }}>
            This app reads the photos and screenshots already in your gallery, understands what's in them,
            and quietly builds a library you can search in your own words. Nothing is moved or deleted —
            your gallery stays exactly as it is.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-6 px-1">
            <ShieldCheck size={16} color={T.sage} />
            <p className="text-[12px]" style={{ color: T.inkFaint }}>Your gallery is never edited or moved.</p>
          </div>
          <button
            onClick={() => setStage("analyzing")}
            className="pl-tap w-full py-4 rounded-full text-[15px] font-semibold"
            style={{ background: T.gold, color: "#1B1710" }}
          >
            Allow photo access
          </button>
        </div>
      </div>
    );
  }

  if (stage === "analyzing") {
    return (
      <div className="h-full flex flex-col items-center justify-center px-10 gap-7" style={{ background: T.bg }}>
        <div className="grid grid-cols-4 gap-1.5 pl-fade-in">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((s, i) => (
            <div key={s} className="w-14 h-14 rounded-lg overflow-hidden" style={{ opacity: progress > i * 11 ? 1 : 0.15, transition: "opacity .4s" }}>
              <img src={img("onb-" + s, 100, 100)} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
        </div>
        <div className="w-full text-center">
          <p className="pl-serif text-[17px] mb-2" style={{ color: T.ink }}>Understanding your photos</p>
          <p className="text-[12.5px] mb-5" style={{ color: T.inkFaint }}>
            {progress < 40 ? "Reading images and screenshots…" : progress < 75 ? "Finding people, places and moments…" : "Building your collections…"}
          </p>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: T.surface2 }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%`, background: T.gold, transition: "width .18s linear" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-10 text-center gap-5" style={{ background: T.bg }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(140,154,130,0.15)" }}>
        <Check size={24} color={T.sage} />
      </div>
      <div>
        <p className="pl-serif text-[20px] mb-2" style={{ color: T.ink }}>12,483 photos understood</p>
        <p className="text-[13px]" style={{ color: T.inkDim }}>Your library is ready. You can search it any time, in your own words.</p>
      </div>
      <button onClick={onDone} className="pl-tap mt-4 px-8 py-3.5 rounded-full text-[14px] font-semibold" style={{ background: T.gold, color: "#1B1710" }}>
        Open my library
      </button>
    </div>
  );
}

/* ---------------------------------- home ------------------------------------ */
function HomeScreen({ onOpenPhoto, onOpenCollection, goSearch }) {
  const recent = PHOTOS.slice(0, 8);
  const featured = ["Japan Trip", "Cafes", "Friends", "Wishlist"];
  const rediscoverPhoto = PHOTOS.find((p) => p.id === "p18");
  const rediscoverScreenshot = PHOTOS.find((p) => p.id === "p25");

  return (
    <div className="pl-fade-in pb-6">
      <div className="px-5 pt-5 pb-6">
        <p className="text-[12.5px] mb-1" style={{ color: T.inkFaint }}>Good afternoon</p>
        <h1 className="pl-serif text-[26px]" style={{ color: T.ink }}>Your Library</h1>
        <p className="text-[12.5px] mt-1" style={{ color: T.inkDim }}>12,483 photos · 34 new this week</p>
      </div>

      <button onClick={goSearch} className="pl-tap mx-5 mb-7 flex items-center gap-2.5 px-4 py-3 rounded-2xl w-[calc(100%-40px)]" style={{ background: T.surface }}>
        <Search size={16} color={T.inkFaint} />
        <span className="text-[13.5px]" style={{ color: T.inkFaint }}>Search your memories…</span>
      </button>

      <SectionHeader title="Recent" />
      <div className="flex gap-2 px-5 overflow-x-auto pl-scroll mb-8">
        {recent.map((p) => (
          <div key={p.id} className="w-[92px] h-[92px] shrink-0">
            <PhotoThumb photo={p} onClick={() => onOpenPhoto(p)} />
          </div>
        ))}
      </div>

      <SectionHeader title="AI Collections" action="See all" onAction={() => onOpenCollection(null, "all")} />
      <div className="grid grid-cols-2 gap-3 px-5 mb-8">
        {featured.map((name) => {
          const meta = COLLECTION_META.find((c) => c.name === name);
          const list = photosFor(name);
          const cover = list[0];
          return (
            <button key={name} onClick={() => onOpenCollection(name)} className="pl-tap relative rounded-2xl overflow-hidden aspect-square" style={{ background: T.surface2 }}>
              {cover && (cover.kind === "photo" || cover.kind === "document") ? (
                <img src={img(cover.seed, 300, 300)} className="w-full h-full object-cover" alt="" style={{ opacity: 0.85 }} />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(155deg, ${T.surface2}, ${T.surface})` }} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(15,13,16,0.85) 100%)" }} />
              <div className="absolute left-3 bottom-2.5 text-left">
                <p className="text-[13.5px] font-semibold" style={{ color: T.ink }}>{meta.emoji} {name}</p>
                <p className="text-[11px]" style={{ color: T.inkDim }}>{list.length} photos</p>
              </div>
            </button>
          );
        })}
      </div>

      <SectionHeader title="Rediscover" />
      <div className="flex gap-3 px-5 overflow-x-auto pl-scroll">
        {rediscoverPhoto && (
          <button onClick={() => onOpenPhoto(rediscoverPhoto)} className="pl-tap shrink-0 w-[210px] rounded-2xl overflow-hidden relative" style={{ background: T.surface }}>
            <img src={img(rediscoverPhoto.seed, 400, 260)} className="w-full h-[130px] object-cover" alt="" />
            <div className="p-3 text-left">
              <p className="text-[11px] mb-1" style={{ color: T.gold }}>You might remember this</p>
              <p className="text-[12.5px]" style={{ color: T.ink }}>{shortDate(rediscoverPhoto.date)}</p>
              <p className="text-[11.5px] mt-0.5" style={{ color: T.inkFaint }}>{rediscoverPhoto.context}</p>
            </div>
          </button>
        )}
        {rediscoverScreenshot && (
          <button onClick={() => onOpenPhoto(rediscoverScreenshot)} className="pl-tap shrink-0 w-[210px] rounded-2xl overflow-hidden relative" style={{ background: T.surface }}>
            <div className="w-full h-[130px]"><ScreenshotThumb photo={rediscoverScreenshot} /></div>
            <div className="p-3 text-left">
              <p className="text-[11px] mb-1" style={{ color: T.gold }}>You saved this</p>
              <p className="text-[12.5px]" style={{ color: T.ink }}>{daysAgo(rediscoverScreenshot.date)} days ago</p>
              <p className="text-[11.5px] mt-0.5" style={{ color: T.inkFaint }}>{rediscoverScreenshot.why} · saved to Wishlist</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- search ------------------------------------ */
function SearchScreen({ onOpenPhoto }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const inputRef = useRef(null);

  const results = useMemo(() => runSearch(submitted), [submitted]);

  function submit(q) {
    setQuery(q);
    setSubmitted(q);
  }

  return (
    <div className="pl-fade-in pb-6 h-full flex flex-col">
      <div className="px-5 pt-5 pb-4">
        <h1 className="pl-serif text-[24px] mb-4" style={{ color: T.ink }}>Search</h1>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: T.surface }}>
          <Search size={16} color={T.inkFaint} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(query)}
            placeholder="Search your memories…"
            className="bg-transparent outline-none flex-1 text-[13.5px]"
            style={{ color: T.ink }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setSubmitted(""); }} className="pl-tap">
              <X size={15} color={T.inkFaint} />
            </button>
          )}
        </div>
      </div>

      {!submitted && (
        <div className="px-5 flex-1 overflow-y-auto pl-scroll">
          <p className="text-[11.5px] uppercase tracking-wide mb-3" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>Try asking</p>
          <div className="flex flex-col gap-2 mb-8">
            {SEARCH_SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => submit(s)} className="pl-tap text-left px-4 py-3 rounded-2xl text-[13px]" style={{ background: T.surface, color: T.inkDim }}>
                <Sparkles size={12} className="inline mr-2 mb-0.5" color={T.gold} />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {submitted && (
        <div className="flex-1 overflow-y-auto pl-scroll">
          <div className="px-5 pb-3">
            <p className="text-[12px]" style={{ color: T.inkFaint }}>
              {results.length > 0 ? `${results.length} results for "${submitted}"` : `No matches for "${submitted}"`}
            </p>
          </div>
          {results.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 px-5">
              {results.map((p) => (
                <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />
              ))}
            </div>
          ) : (
            <div className="px-8 pt-6 text-center">
              <p className="text-[13px]" style={{ color: T.inkDim }}>Try describing the place, people, or what it looked like — the app matches meaning, not exact words.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- library ------------------------------------ */
function LibraryScreen({ onOpenPhoto }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Photos", "Screenshots", "Documents"];
  const filtered = PHOTOS.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Photos") return p.kind === "photo";
    if (filter === "Screenshots") return p.kind === "screenshot";
    if (filter === "Documents") return p.kind === "document";
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="pl-fade-in pb-6">
      <div className="px-5 pt-5 pb-4">
        <h1 className="pl-serif text-[24px] mb-1" style={{ color: T.ink }}>Library</h1>
        <p className="text-[12.5px]" style={{ color: T.inkDim }}>{filtered.length} items</p>
      </div>
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto pl-scroll">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="pl-tap shrink-0 px-4 py-1.5 rounded-full text-[12.5px]"
            style={{
              background: filter === f ? T.gold : T.surface,
              color: filter === f ? "#1B1710" : T.inkDim,
              fontWeight: filter === f ? 700 : 500,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 px-5">
        {filtered.map((p) => (
          <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- collections ------------------------------------ */
function CollectionsScreen({ onOpenCollection }) {
  const groups = ["Trips", "People", "Places", "Things", "Memories", "Screenshots"];
  return (
    <div className="pl-fade-in pb-6">
      <div className="px-5 pt-5 pb-5">
        <h1 className="pl-serif text-[24px]" style={{ color: T.ink }}>Collections</h1>
        <p className="text-[12.5px] mt-1" style={{ color: T.inkDim }}>Built automatically. A photo can live in more than one.</p>
      </div>
      {groups.map((g) => {
        const items = COLLECTION_META.filter((c) => c.group === g);
        if (items.every((c) => photosFor(c.name).length === 0)) return null;
        return (
          <div key={g} className="mb-7">
            <p className="px-5 mb-2.5 text-[12px] uppercase" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>{g}</p>
            <div className="flex gap-3 px-5 overflow-x-auto pl-scroll">
              {items.map((c) => {
                const list = photosFor(c.name);
                if (list.length === 0) return null;
                const cover = list[0];
                return (
                  <button key={c.name} onClick={() => onOpenCollection(c.name)} className="pl-tap shrink-0 w-[128px] text-left">
                    <div className="w-[128px] h-[128px] rounded-2xl overflow-hidden mb-2" style={{ background: T.surface2 }}>
                      {cover.kind === "photo" || cover.kind === "document" ? (
                        <img src={img(cover.seed, 260, 260)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <ScreenshotThumb photo={cover} />
                      )}
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: T.ink }}>{c.emoji} {c.label || c.name}</p>
                    <p className="text-[11px]" style={{ color: T.inkFaint }}>{list.length} photos</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CollectionDetail({ name, onBack, onOpenPhoto }) {
  const meta = COLLECTION_META.find((c) => c.name === name);
  const list = photosFor(name).sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="absolute inset-0 pl-fade-in overflow-y-auto pl-scroll" style={{ background: T.bg }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pt-1 pb-4">
        <button onClick={onBack} className="pl-tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.surface }}>
          <ArrowLeft size={16} color={T.ink} />
        </button>
      </div>
      <div className="px-5 pb-5">
        <h1 className="pl-serif text-[26px]" style={{ color: T.ink }}>{meta?.emoji} {name}</h1>
        <p className="text-[12.5px] mt-1" style={{ color: T.inkDim }}>{list.length} photos</p>
      </div>
      <div className="grid grid-cols-3 gap-1 px-5 pb-8">
        {list.map((p) => (
          <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- photo detail ------------------------------------ */
function PhotoDetail({ photo, onBack, onOpenPhoto, onOpenCollection }) {
  const related = PHOTOS.filter(
    (p) => p.id !== photo.id && p.collections.some((c) => photo.collections.includes(c))
  ).slice(0, 6);
  const [saved, setSaved] = useState(false);

  return (
    <div className="absolute inset-0 pl-fade-in overflow-y-auto pl-scroll" style={{ background: T.bg }}>
      <div className="relative">
        <div className="w-full aspect-square">
          {photo.kind === "photo" || photo.kind === "document" ? (
            <img src={img(photo.seed, 700, 700)} className="w-full h-full object-cover" alt="" />
          ) : (
            <div style={{ height: "100%" }}><ScreenshotThumb photo={photo} /></div>
          )}
        </div>
        <div className="absolute inset-x-0 top-0" style={{ background: "linear-gradient(180deg, rgba(10,9,11,0.55), transparent 55%)" }}>
          <StatusBar />
          <div className="flex items-center justify-between px-4 pt-1">
            <button onClick={onBack} className="pl-tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(20,18,22,0.55)", backdropFilter: "blur(6px)" }}>
              <ArrowLeft size={16} color="#fff" />
            </button>
            <div className="flex items-center gap-2">
              <div><KindBadge kind={photo.kind} /></div>
              <button onClick={() => setSaved((s) => !s)} className="pl-tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(20,18,22,0.55)", backdropFilter: "blur(6px)" }}>
                <Heart size={15} color={saved ? T.rose : "#fff"} fill={saved ? T.rose : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-10">
        <p className="text-[11.5px] uppercase mb-2.5" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>AI understands this as</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {photo.tags.map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full text-[12px]" style={{ background: T.surface, color: T.ink }}>{t}</span>
          ))}
          {photo.location && (
            <span className="px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1" style={{ background: T.surface, color: T.ink }}>
              <MapPin size={11} /> {photo.location}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[11px] mb-1" style={{ color: T.inkFaint }}>Date</p>
            <p className="text-[13px]" style={{ color: T.ink }}>{formatDate(photo.date)}</p>
          </div>
          <div>
            <p className="text-[11px] mb-1" style={{ color: T.inkFaint }}>Context</p>
            <p className="text-[13px]" style={{ color: T.ink }}>{photo.context || "—"}</p>
          </div>
        </div>

        {photo.why && (
          <div className="mb-6 px-4 py-3 rounded-2xl" style={{ background: T.surface }}>
            <p className="text-[11px] mb-1" style={{ color: T.inkFaint }}>Why you saved it</p>
            <p className="text-[13.5px]" style={{ color: T.ink }}>{photo.why}</p>
          </div>
        )}

        <p className="text-[11.5px] uppercase mb-2.5" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>Collections</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {photo.collections.map((c) => (
            <button key={c} onClick={() => onOpenCollection(c)} className="pl-tap px-3 py-1.5 rounded-full text-[12px]" style={{ background: "rgba(201,166,113,0.12)", color: T.gold }}>
              {c}
            </button>
          ))}
        </div>

        {related.length > 0 && (
          <>
            <p className="text-[11.5px] uppercase mb-2.5" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>Related photos</p>
            <div className="grid grid-cols-3 gap-1.5">
              {related.map((p) => (
                <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- settings ------------------------------------ */
function SettingsScreen() {
  const rows = [
    { label: "Photo access", value: "Full library" },
    { label: "Auto analysis", value: "On", toggle: true },
    { label: "Analyzed photos", value: "12,483 / 12,483" },
    { label: "Storage used", value: "84 MB" },
    { label: "Notifications", value: "On", toggle: true },
    { label: "Privacy", value: "" },
    { label: "Data management", value: "" },
  ];
  const [toggles, setToggles] = useState({ "Auto analysis": true, Notifications: true });
  return (
    <div className="pl-fade-in pb-8">
      <div className="px-5 pt-5 pb-6 flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: T.surface2 }}>
          <User size={22} color={T.inkDim} />
        </div>
        <div>
          <h1 className="pl-serif text-[20px]" style={{ color: T.ink }}>Your library</h1>
          <p className="text-[12px]" style={{ color: T.inkFaint }}>12,483 photos · since Jan 2026</p>
        </div>
      </div>
      <div className="px-5">
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center justify-between py-3.5" style={{ borderBottom: i < rows.length - 1 ? `1px solid ${T.line}` : "none" }}>
            <span className="text-[13.5px]" style={{ color: T.ink }}>{r.label}</span>
            {r.toggle ? (
              <button
                onClick={() => setToggles((t) => ({ ...t, [r.label]: !t[r.label] }))}
                className="pl-tap w-10 h-6 rounded-full relative"
                style={{ background: toggles[r.label] ? T.gold : T.surface2 }}
              >
                <div className="w-4.5 h-4.5 rounded-full absolute top-0.5" style={{ width: 18, height: 18, background: T.bg, left: toggles[r.label] ? 20 : 3, transition: "left .15s" }} />
              </button>
            ) : (
              <span className="text-[12.5px] flex items-center gap-1" style={{ color: T.inkFaint }}>
                {r.value} <ChevronRight size={13} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- tab bar ------------------------------------ */
function TabBar({ active, setActive }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "library", label: "Library", icon: Grid3x3 },
    { id: "collections", label: "Collections", icon: Layers },
    { id: "settings", label: "Profile", icon: User },
  ];
  return (
    <div className="flex items-center justify-around px-2 pt-2.5" style={{ background: T.bg, borderTop: `1px solid ${T.line}`, paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => setActive(t.id)} className="pl-tap flex flex-col items-center gap-1 px-2">
            <Icon size={20} color={isActive ? T.gold : T.inkFaint} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px]" style={{ color: isActive ? T.gold : T.inkFaint, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------- app root ------------------------------------ */
export default function PhotoLibraryApp() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState("home");
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [detailCollection, setDetailCollection] = useState(null);
  const [photoHistory, setPhotoHistory] = useState([]);

  function openPhoto(p) {
    if (detailPhoto) setPhotoHistory((h) => [...h, detailPhoto]);
    setDetailPhoto(p);
  }
  function backFromPhoto() {
    if (photoHistory.length > 0) {
      const prev = photoHistory[photoHistory.length - 1];
      setPhotoHistory((h) => h.slice(0, -1));
      setDetailPhoto(prev);
    } else {
      setDetailPhoto(null);
    }
  }
  function openCollection(name) {
    setDetailPhoto(null);
    setPhotoHistory([]);
    setDetailCollection(name);
  }

  const screens = {
    home: <HomeScreen onOpenPhoto={openPhoto} onOpenCollection={openCollection} goSearch={() => setTab("search")} />,
    search: <SearchScreen onOpenPhoto={openPhoto} />,
    library: <LibraryScreen onOpenPhoto={openPhoto} />,
    collections: <CollectionsScreen onOpenCollection={openCollection} />,
    settings: <SettingsScreen />,
  };

  return (
    <div className="pl-app w-full h-full flex items-center justify-center" style={{ background: "#0B0A0C", minHeight: 720, padding: "24px 0" }}>
      <style>{FONTS}</style>
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 780,
          maxHeight: "92vh",
          background: T.bg,
          borderRadius: 44,
          border: `8px solid #0B0A0C`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        {!booted ? (
          <Onboarding onDone={() => setBooted(true)} />
        ) : (
          <div className="relative w-full h-full flex flex-col">
            {!detailCollection && !detailPhoto && <StatusBar />}
            <div className="flex-1 overflow-y-auto pl-scroll relative">
              {screens[tab]}
            </div>
            {!detailCollection && !detailPhoto && <TabBar active={tab} setActive={setTab} />}

            {detailCollection && !detailPhoto && (
              <CollectionDetail name={detailCollection} onBack={() => setDetailCollection(null)} onOpenPhoto={openPhoto} />
            )}
            {detailPhoto && (
              <PhotoDetail
                photo={detailPhoto}
                onBack={backFromPhoto}
                onOpenPhoto={openPhoto}
                onOpenCollection={openCollection}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
