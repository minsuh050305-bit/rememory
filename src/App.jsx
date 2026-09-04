import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, Search, Grid3x3, Layers, User, ArrowLeft, MapPin,
  Sparkles, Camera, ScanLine, Image as ImageIcon, ChevronRight,
  X, Check, Heart, Plus, Upload,
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
html, body, #root { height: 100%; }
.pl-app { font-family: 'Manrope', sans-serif; -webkit-font-smoothing: antialiased; }
.pl-serif { font-family: 'Fraunces', serif; }
.pl-scroll::-webkit-scrollbar { display: none; }
.pl-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.pl-fade-in { animation: plFadeIn .3s ease both; }
@keyframes plFadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
.pl-tap { transition: transform .12s ease, opacity .12s ease; }
.pl-tap:active { transform: scale(0.96); opacity: 0.85; }
`;

/* -------------------------------- helpers --------------------------------- */
const img = (seed, w = 400, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function shortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function daysAgo(iso) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
}
function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function photoSrc(photo) {
  return photo.url || img(photo.seed, 500, 500);
}

/* --------------------------------- sample data ------------------------------------ */
/* This is bundled demo content, clearly labeled as such in the UI — it is NOT read
   from the device. Real photos only enter the app through the file picker below. */
const SAMPLE_PHOTOS = [
  { id: "p1", seed: "tokyo-street-1", kind: "photo", date: "2026-08-12", location: "Shibuya, Tokyo", collections: ["Japan Trip", "Tokyo", "Friends", "2026 Summer"], tags: ["Street", "Night", "City"], context: "Friends · Night walk", keywords: ["도쿄", "일본", "시부야", "친구", "야경", "japan", "tokyo", "night"] },
  { id: "p2", seed: "tokyo-ramen-1", kind: "photo", date: "2026-08-13", location: "Shinjuku, Tokyo", collections: ["Japan Trip", "Tokyo", "Food", "2026 Summer"], tags: ["Ramen", "Food", "Dinner"], context: "Friends · Dinner", keywords: ["라멘", "일본", "도쿄", "ramen", "japan food", "먹었던"] },
  { id: "p3", seed: "tokyo-temple-1", kind: "photo", date: "2026-08-14", location: "Asakusa, Tokyo", collections: ["Japan Trip", "Tokyo", "Places", "2026 Summer"], tags: ["Temple", "Culture", "Day"], context: "Sightseeing · Afternoon", keywords: ["도쿄", "일본", "절", "temple", "japan"] },
  { id: "p4", seed: "tokyo-shopping-1", kind: "photo", date: "2026-08-15", location: "Ginza, Tokyo", collections: ["Japan Trip", "Tokyo", "Shopping", "2026 Summer"], tags: ["Shopping", "Street"], context: "Shopping · Afternoon", keywords: ["도쿄", "일본", "쇼핑", "shopping", "japan"] },
  { id: "p5", seed: "tokyo-friends-1", kind: "photo", date: "2026-08-16", location: "Harajuku, Tokyo", collections: ["Japan Trip", "Tokyo", "Friends", "2026 Summer"], tags: ["Friends", "Portrait"], context: "Friends · Afternoon", keywords: ["도쿄", "일본", "친구", "japan", "friends"] },
  { id: "p6", seed: "tokyo-skyline-1", kind: "photo", date: "2026-08-17", location: "Odaiba, Tokyo", collections: ["Japan Trip", "Tokyo", "Night", "2026 Summer"], tags: ["Skyline", "Night"], context: "Night · Last day", keywords: ["도쿄", "일본", "야경", "japan", "night"] },
  { id: "p7", seed: "busan-beach-1", kind: "photo", date: "2025-07-20", location: "Haeundae, Busan", collections: ["Busan Trip", "Beach", "Places"], tags: ["Beach", "Ocean", "Summer"], context: "Beach day · Afternoon", keywords: ["부산", "바다", "여름", "busan", "beach", "작년"] },
  { id: "p8", seed: "busan-sunset-1", kind: "photo", date: "2025-07-20", location: "Gwangalli, Busan", collections: ["Busan Trip", "Sunsets", "Beach", "Memories"], tags: ["Sunset", "Ocean"], context: "Sunset · Evening", keywords: ["부산", "바다", "노을", "busan", "sunset"] },
  { id: "p9", seed: "busan-food-1", kind: "photo", date: "2025-07-21", location: "Nampo-dong, Busan", collections: ["Busan Trip", "Food", "Restaurants"], tags: ["Seafood", "Dinner"], context: "Friends · Dinner", keywords: ["부산", "회", "seafood", "busan"] },
  { id: "p10", seed: "busan-friends-1", kind: "photo", date: "2025-07-21", location: "Haeundae, Busan", collections: ["Busan Trip", "Friends", "Beach"], tags: ["Friends", "Beach"], context: "Friends · Beach", keywords: ["부산", "친구", "바다", "busan", "friends"] },
  { id: "p11", seed: "cafe-latte-1", kind: "photo", date: "2026-08-21", location: "Seongsu, Seoul", collections: ["Cafes", "Friends"], tags: ["Cafe", "Coffee"], context: "Friends · Cafe · Afternoon", keywords: ["성수", "카페", "친구", "cafe", "seongsu"] },
  { id: "p12", seed: "cafe-interior-1", kind: "photo", date: "2026-07-05", location: "Seongsu, Seoul", collections: ["Cafes"], tags: ["Cafe", "Interior"], context: "Solo · Afternoon", keywords: ["성수", "카페", "cafe"] },
  { id: "p13", seed: "cafe-dessert-1", kind: "photo", date: "2026-06-18", location: "Hannam, Seoul", collections: ["Cafes", "Friends"], tags: ["Cafe", "Dessert"], context: "Friends · Cafe", keywords: ["카페", "디저트", "친구", "cafe"] },
  { id: "p14", seed: "cafe-friends-1", kind: "photo", date: "2026-05-02", location: "Yeonnam, Seoul", collections: ["Cafes", "Friends"], tags: ["Cafe", "Friends"], context: "Friends · Cafe", keywords: ["카페", "친구", "cafe", "friends"] },
  { id: "p15", seed: "pasta-dinner-1", kind: "photo", date: "2026-04-11", location: "Itaewon, Seoul", collections: ["Restaurants", "Friends"], tags: ["Dinner", "Pasta"], context: "Friends · Dinner", keywords: ["파스타", "친구", "저녁", "restaurant"] },
  { id: "p16", seed: "bbq-dinner-1", kind: "photo", date: "2026-03-08", location: "Mapo, Seoul", collections: ["Restaurants", "Family"], tags: ["BBQ", "Dinner"], context: "Family · Dinner", keywords: ["가족", "고기", "family", "dinner"] },
  { id: "p17", seed: "family-dinner-1", kind: "photo", date: "2026-02-14", location: "Home", collections: ["Family"], tags: ["Family", "Dinner"], context: "Family · Evening", keywords: ["가족", "family"] },
  { id: "p18", seed: "family-bday-1", kind: "photo", date: "2026-01-30", location: "Home", collections: ["Family", "Birthdays", "Memories"], tags: ["Birthday", "Cake"], context: "Family · Birthday", keywords: ["가족", "생일", "birthday", "family"] },
  { id: "p19", seed: "cat-sleep-1", kind: "photo", date: "2026-08-02", location: "Home", collections: ["Pets", "Memories"], tags: ["Cat", "Home"], context: "Home · Morning", keywords: ["고양이", "cat", "pet"] },
  { id: "p20", seed: "cat-play-1", kind: "photo", date: "2026-07-19", location: "Home", collections: ["Pets"], tags: ["Cat", "Play"], context: "Home · Evening", keywords: ["고양이", "cat", "pet", "강아지"] },
  { id: "p21", seed: "sunset-city-1", kind: "photo", date: "2026-06-27", location: "Hangang, Seoul", collections: ["Sunsets", "Memories", "Friends"], tags: ["Sunset", "River"], context: "Friends · Sunset", keywords: ["노을", "한강", "sunset"] },
  { id: "p22", seed: "sunset-roof-1", kind: "photo", date: "2026-06-06", location: "Seoul", collections: ["Sunsets", "Memories"], tags: ["Sunset", "Rooftop"], context: "Solo · Evening", keywords: ["노을", "sunset"] },
  { id: "p23", seed: "park-picnic-1", kind: "photo", date: "2026-05-17", location: "Seonyudo Park, Seoul", collections: ["Parks", "Friends"], tags: ["Park", "Picnic"], context: "Friends · Picnic", keywords: ["공원", "친구", "park", "picnic"] },
  { id: "p24", seed: "park-blossom-1", kind: "photo", date: "2026-04-02", location: "Yeouido, Seoul", collections: ["Parks"], tags: ["Park", "Spring"], context: "Solo · Afternoon", keywords: ["공원", "벚꽃", "park"] },
  { id: "p25", seed: "bag-product-1", kind: "screenshot", date: daysAgoISO(48), location: null, collections: ["Wishlist", "Shopping", "Things I Want"], tags: ["Product", "Bag"], why: "Wishlist", context: "Saved from a shopping app", keywords: ["가방", "검은색", "black bag", "wishlist", "쇼핑"] },
  { id: "p26", seed: "sneaker-product-1", kind: "screenshot", date: daysAgoISO(21), location: null, collections: ["Wishlist", "Shopping", "Things I Want"], tags: ["Product", "Shoes"], why: "Wishlist", context: "Saved from a shopping app", keywords: ["신발", "sneakers", "wishlist"] },
  { id: "p27", seed: "watch-product-1", kind: "screenshot", date: daysAgoISO(9), location: null, collections: ["Wishlist", "Shopping"], tags: ["Product", "Watch"], why: "Wishlist", context: "Saved from a shopping app", keywords: ["시계", "watch", "wishlist"] },
  { id: "p28", seed: "ticket-concert-1", kind: "screenshot", date: "2026-07-30", location: null, collections: ["Tickets"], tags: ["Ticket", "Concert"], why: "Concert ticket", context: "Saved reservation", keywords: ["티켓", "콘서트", "ticket"] },
  { id: "p29", seed: "ticket-flight-1", kind: "screenshot", date: "2026-08-10", location: null, collections: ["Tickets"], tags: ["Ticket", "Flight"], why: "Flight ticket", context: "Saved reservation", keywords: ["티켓", "항공권", "flight ticket"] },
  { id: "p30", seed: "study-notes-1", kind: "screenshot", date: "2026-08-25", location: null, collections: ["Study"], tags: ["Notes", "Study"], why: "Lecture notes", context: "Saved for later", keywords: ["공부", "study", "notes"] },
  { id: "p31", seed: "study-vocab-1", kind: "screenshot", date: "2026-08-27", location: null, collections: ["Study"], tags: ["Vocabulary", "Study"], why: "Vocabulary list", context: "Saved for later", keywords: ["단어", "study", "vocab"] },
  { id: "p32", seed: "interior-idea-1", kind: "screenshot", date: "2026-08-29", location: null, collections: ["Ideas"], tags: ["Interior", "Inspiration"], why: "Interior inspiration", context: "Saved idea", keywords: ["인테리어", "아이디어", "interior idea"] },
  { id: "p33", seed: "receipt-doc-1", kind: "document", date: "2026-08-19", location: null, collections: ["Documents"], tags: ["Receipt"], why: "Receipt", context: "Saved document", keywords: ["영수증", "receipt", "document"] },
  { id: "p34", seed: "tokyo-street-2", kind: "photo", date: "2026-08-12", location: "Shibuya, Tokyo", collections: ["Japan Trip", "Tokyo", "2026 Summer"], tags: ["Street"], context: "Sightseeing", keywords: ["도쿄", "일본", "japan"] },
];

const COLLECTION_META = [
  { name: "Imported", emoji: "📥", group: "My Photos", label: "가져온 사진" },
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

function photosFor(photos, name) {
  return photos.filter((p) => p.collections.includes(name));
}

const SEARCH_SUGGESTIONS = [
  "작년 여름에 부산에서 찍은 바다 사진",
  "친구들이랑 카페에서 찍은 사진",
  "내가 사고 싶어서 저장해둔 검은색 가방",
  "일본 여행 때 먹었던 라멘",
  "강아지 사진만 보여줘",
];

function runSearch(photos, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = photos.map((p) => {
    const hay = [...(p.keywords || []), ...(p.tags || []), ...(p.collections || []), p.location || "", p.context || ""]
      .join(" ")
      .toLowerCase();
    let score = 0;
    tokens.forEach((t) => {
      if (t.length >= 2 && hay.includes(t)) score += 2;
    });
    return { p, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.p);
}

/* ------------------------------- small bits -------------------------------- */
function KindBadge({ kind }) {
  const map = {
    photo: { icon: Camera, label: "Photo" },
    screenshot: { icon: ScanLine, label: "Screenshot" },
    document: { icon: ImageIcon, label: "Document" },
  };
  const { icon: Icon, label } = map[kind] || map.photo;
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px]" style={{ background: "rgba(20,18,22,0.55)", color: T.ink, backdropFilter: "blur(6px)" }}>
      <Icon size={11} />
      <span>{label}</span>
    </div>
  );
}

function ScreenshotThumb() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3" style={{ background: `linear-gradient(155deg, ${T.surface2}, ${T.surface})` }}>
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
    <button onClick={onClick} className={`pl-tap relative overflow-hidden rounded-xl w-full ${ratio}`} style={{ background: T.surface2 }}>
      {photo.kind === "photo" || photo.kind === "document" ? (
        <img src={photoSrc(photo)} alt="" className="w-full h-full object-cover" />
      ) : (
        <ScreenshotThumb />
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
function Onboarding({ onImportFiles, onSkip, importBusy, importCount }) {
  const fileInputRef = useRef(null);

  if (importBusy) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center px-10 gap-5" style={{ background: T.bg }}>
        <div className="w-10 h-10 rounded-full border-2 pl-fade-in" style={{ borderColor: T.line, borderTopColor: T.gold, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p className="text-[13.5px]" style={{ color: T.inkDim }}>사진 {importCount}장을 가져오는 중…</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between px-7 pt-14 pb-9" style={{ background: T.bg }}>
      <div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: T.surface2 }}>
          <Sparkles size={22} color={T.gold} />
        </div>
        <h1 className="pl-serif text-[30px] leading-[1.18] mb-4" style={{ color: T.ink }}>
          Don't organize your photos.
          <br />Let it understand them.
        </h1>
        <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: T.inkDim }}>
          이 앱은 웹 앱이라, 브라우저 보안 정책상 폰 갤러리에 자동으로 상시 연결될 수 없어요.
          대신 아래에서 직접 사진을 선택하면 그 사진들을 앱으로 가져와요 — 갤러리의 원본은 그대로 남고, 삭제되거나 옮겨지지 않습니다.
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: T.inkFaint }}>
          (자동 동기화와 완전한 AI 분석은 네이티브 앱에서만 가능해요. 지금 화면은 실제 파일 선택 기능이 들어간 웹 프로토타입이에요.)
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) onImportFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button onClick={() => fileInputRef.current?.click()} className="pl-tap w-full py-4 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2" style={{ background: T.gold, color: "#1B1710" }}>
          <Upload size={16} /> 내 사진에서 가져오기
        </button>
        <button onClick={onSkip} className="pl-tap w-full py-3.5 rounded-full text-[13.5px]" style={{ color: T.inkDim, background: T.surface }}>
          가져오지 않고 샘플로 둘러보기
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------- home ------------------------------------ */
function HomeScreen({ photos, onOpenPhoto, onOpenCollection, goSearch }) {
  const recent = [...photos].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  const hasImported = photosFor(photos, "Imported").length > 0;
  const featured = hasImported ? ["Imported", "Japan Trip", "Cafes", "Friends"] : ["Japan Trip", "Cafes", "Friends", "Wishlist"];
  const rediscoverPhoto = photos.find((p) => p.id === "p18");
  const rediscoverScreenshot = photos.find((p) => p.id === "p25");

  return (
    <div className="pl-fade-in pb-6">
      <div className="px-5 pt-3 pb-6">
        <p className="text-[12.5px] mb-1" style={{ color: T.inkFaint }}>Good afternoon</p>
        <h1 className="pl-serif text-[26px]" style={{ color: T.ink }}>Your Library</h1>
        <p className="text-[12.5px] mt-1" style={{ color: T.inkDim }}>{photos.length} photos{hasImported ? ` · ${photosFor(photos, "Imported").length}장 내 폰에서 가져옴` : ""}</p>
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

      <SectionHeader title="AI Collections" action="See all" onAction={() => onOpenCollection(null)} />
      <div className="grid grid-cols-2 gap-3 px-5 mb-8">
        {featured.map((name) => {
          const meta = COLLECTION_META.find((c) => c.name === name);
          const list = photosFor(photos, name);
          const cover = list[0];
          if (!cover) return null;
          return (
            <button key={name} onClick={() => onOpenCollection(name)} className="pl-tap relative rounded-2xl overflow-hidden aspect-square" style={{ background: T.surface2 }}>
              {cover.kind === "photo" || cover.kind === "document" ? (
                <img src={photoSrc(cover)} className="w-full h-full object-cover" alt="" style={{ opacity: 0.85 }} />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(155deg, ${T.surface2}, ${T.surface})` }} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(15,13,16,0.85) 100%)" }} />
              <div className="absolute left-3 bottom-2.5 text-left">
                <p className="text-[13.5px] font-semibold" style={{ color: T.ink }}>{meta?.emoji} {meta?.label || name}</p>
                <p className="text-[11px]" style={{ color: T.inkDim }}>{list.length} photos</p>
              </div>
            </button>
          );
        })}
      </div>

      {(rediscoverPhoto || rediscoverScreenshot) && (
        <>
          <SectionHeader title="Rediscover" />
          <div className="flex gap-3 px-5 overflow-x-auto pl-scroll">
            {rediscoverPhoto && (
              <button onClick={() => onOpenPhoto(rediscoverPhoto)} className="pl-tap shrink-0 w-[210px] rounded-2xl overflow-hidden relative" style={{ background: T.surface }}>
                <img src={photoSrc(rediscoverPhoto)} className="w-full h-[130px] object-cover" alt="" />
                <div className="p-3 text-left">
                  <p className="text-[11px] mb-1" style={{ color: T.gold }}>You might remember this</p>
                  <p className="text-[12.5px]" style={{ color: T.ink }}>{shortDate(rediscoverPhoto.date)}</p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: T.inkFaint }}>{rediscoverPhoto.context}</p>
                </div>
              </button>
            )}
            {rediscoverScreenshot && (
              <button onClick={() => onOpenPhoto(rediscoverScreenshot)} className="pl-tap shrink-0 w-[210px] rounded-2xl overflow-hidden relative" style={{ background: T.surface }}>
                <div className="w-full h-[130px]"><ScreenshotThumb /></div>
                <div className="p-3 text-left">
                  <p className="text-[11px] mb-1" style={{ color: T.gold }}>You saved this</p>
                  <p className="text-[12.5px]" style={{ color: T.ink }}>{daysAgo(rediscoverScreenshot.date)} days ago</p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: T.inkFaint }}>{rediscoverScreenshot.why} · saved to Wishlist</p>
                </div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------- search ------------------------------------ */
function SearchScreen({ photos, onOpenPhoto }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const results = useMemo(() => runSearch(photos, submitted), [photos, submitted]);

  function submit(q) {
    setQuery(q);
    setSubmitted(q);
  }

  return (
    <div className="pl-fade-in pb-6 h-full flex flex-col">
      <div className="px-5 pt-3 pb-4">
        <h1 className="pl-serif text-[24px] mb-4" style={{ color: T.ink }}>Search</h1>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: T.surface }}>
          <Search size={16} color={T.inkFaint} />
          <input
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
              {results.map((p) => <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />)}
            </div>
          ) : (
            <div className="px-8 pt-6 text-center">
              <p className="text-[13px]" style={{ color: T.inkDim }}>Try describing the place, people, or what it looked like.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- library ------------------------------------ */
function LibraryScreen({ photos, onOpenPhoto, onRequestImport }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Photos", "Screenshots", "Documents"];
  const filtered = photos
    .filter((p) => filter === "All" || (filter === "Photos" && p.kind === "photo") || (filter === "Screenshots" && p.kind === "screenshot") || (filter === "Documents" && p.kind === "document"))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="pl-fade-in pb-6">
      <div className="px-5 pt-3 pb-4 flex items-start justify-between">
        <div>
          <h1 className="pl-serif text-[24px] mb-1" style={{ color: T.ink }}>Library</h1>
          <p className="text-[12.5px]" style={{ color: T.inkDim }}>{filtered.length} items</p>
        </div>
        <button onClick={onRequestImport} className="pl-tap w-9 h-9 rounded-full flex items-center justify-center" style={{ background: T.surface }}>
          <Plus size={17} color={T.ink} />
        </button>
      </div>
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto pl-scroll">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="pl-tap shrink-0 px-4 py-1.5 rounded-full text-[12.5px]" style={{ background: filter === f ? T.gold : T.surface, color: filter === f ? "#1B1710" : T.inkDim, fontWeight: filter === f ? 700 : 500 }}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 px-5">
        {filtered.map((p) => <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />)}
      </div>
    </div>
  );
}

/* ------------------------------- collections ------------------------------------ */
function CollectionsScreen({ photos, onOpenCollection }) {
  const groups = ["My Photos", "Trips", "People", "Places", "Things", "Memories", "Screenshots"];
  return (
    <div className="pl-fade-in pb-6">
      <div className="px-5 pt-3 pb-5">
        <h1 className="pl-serif text-[24px]" style={{ color: T.ink }}>Collections</h1>
        <p className="text-[12.5px] mt-1" style={{ color: T.inkDim }}>Built automatically. A photo can live in more than one.</p>
      </div>
      {groups.map((g) => {
        const items = COLLECTION_META.filter((c) => c.group === g);
        if (items.every((c) => photosFor(photos, c.name).length === 0)) return null;
        return (
          <div key={g} className="mb-7">
            <p className="px-5 mb-2.5 text-[12px] uppercase" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>{g}</p>
            <div className="flex gap-3 px-5 overflow-x-auto pl-scroll">
              {items.map((c) => {
                const list = photosFor(photos, c.name);
                if (list.length === 0) return null;
                const cover = list[0];
                return (
                  <button key={c.name} onClick={() => onOpenCollection(c.name)} className="pl-tap shrink-0 w-[128px] text-left">
                    <div className="w-[128px] h-[128px] rounded-2xl overflow-hidden mb-2" style={{ background: T.surface2 }}>
                      {cover.kind === "photo" || cover.kind === "document" ? (
                        <img src={photoSrc(cover)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <ScreenshotThumb />
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

function CollectionDetail({ name, photos, onBack, onOpenPhoto }) {
  const meta = COLLECTION_META.find((c) => c.name === name);
  const list = photosFor(photos, name).sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="absolute inset-0 pl-fade-in overflow-y-auto pl-scroll" style={{ background: T.bg }}>
      <div style={{ height: "env(safe-area-inset-top)" }} />
      <div className="flex items-center gap-3 px-4 pt-2 pb-4">
        <button onClick={onBack} className="pl-tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.surface }}>
          <ArrowLeft size={16} color={T.ink} />
        </button>
      </div>
      <div className="px-5 pb-5">
        <h1 className="pl-serif text-[26px]" style={{ color: T.ink }}>{meta?.emoji} {meta?.label || name}</h1>
        <p className="text-[12.5px] mt-1" style={{ color: T.inkDim }}>{list.length} photos</p>
      </div>
      <div className="grid grid-cols-3 gap-1 px-5 pb-8">
        {list.map((p) => <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />)}
      </div>
    </div>
  );
}

/* --------------------------------- photo detail ------------------------------------ */
function PhotoDetail({ photo, photos, onBack, onOpenPhoto, onOpenCollection }) {
  const related = photos.filter((p) => p.id !== photo.id && p.collections.some((c) => photo.collections.includes(c))).slice(0, 6);
  const [saved, setSaved] = useState(false);
  const isImported = photo.collections.includes("Imported");

  return (
    <div className="absolute inset-0 pl-fade-in overflow-y-auto pl-scroll" style={{ background: T.bg }}>
      <div className="relative">
        <div className="w-full aspect-square">
          {photo.kind === "photo" || photo.kind === "document" ? (
            <img src={photoSrc(photo)} className="w-full h-full object-cover" alt="" />
          ) : (
            <div style={{ height: "100%" }}><ScreenshotThumb /></div>
          )}
        </div>
        <div className="absolute inset-x-0 top-0" style={{ background: "linear-gradient(180deg, rgba(10,9,11,0.55), transparent 55%)" }}>
          <div style={{ height: "env(safe-area-inset-top)" }} />
          <div className="flex items-center justify-between px-4 pt-2">
            <button onClick={onBack} className="pl-tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(20,18,22,0.55)", backdropFilter: "blur(6px)" }}>
              <ArrowLeft size={16} color="#fff" />
            </button>
            <div className="flex items-center gap-2">
              <KindBadge kind={photo.kind} />
              <button onClick={() => setSaved((s) => !s)} className="pl-tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(20,18,22,0.55)", backdropFilter: "blur(6px)" }}>
                <Heart size={15} color={saved ? T.rose : "#fff"} fill={saved ? T.rose : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-10">
        {isImported ? (
          <div className="mb-6 px-4 py-3 rounded-2xl" style={{ background: T.surface }}>
            <p className="text-[13px]" style={{ color: T.inkDim }}>내 폰에서 직접 가져온 사진이에요. 이 프로토타입에는 실제 AI 이미지 분석이 연결되어 있지 않아서, 자동 태그는 아직 붙지 않아요.</p>
          </div>
        ) : (
          <>
            <p className="text-[11.5px] uppercase mb-2.5" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>AI understands this as</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {photo.tags.map((t) => <span key={t} className="px-3 py-1.5 rounded-full text-[12px]" style={{ background: T.surface, color: T.ink }}>{t}</span>)}
              {photo.location && (
                <span className="px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1" style={{ background: T.surface, color: T.ink }}>
                  <MapPin size={11} /> {photo.location}
                </span>
              )}
            </div>
          </>
        )}

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
          {photo.collections.map((c) => {
            const meta = COLLECTION_META.find((m) => m.name === c);
            return (
              <button key={c} onClick={() => onOpenCollection(c)} className="pl-tap px-3 py-1.5 rounded-full text-[12px]" style={{ background: "rgba(201,166,113,0.12)", color: T.gold }}>
                {meta?.label || c}
              </button>
            );
          })}
        </div>

        {related.length > 0 && (
          <>
            <p className="text-[11.5px] uppercase mb-2.5" style={{ color: T.inkFaint, letterSpacing: "0.06em" }}>Related photos</p>
            <div className="grid grid-cols-3 gap-1.5">
              {related.map((p) => <PhotoThumb key={p.id} photo={p} onClick={() => onOpenPhoto(p)} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- settings ------------------------------------ */
function SettingsScreen({ photos, onRequestImport }) {
  const imported = photosFor(photos, "Imported").length;
  const rows = [
    { label: "가져온 사진", value: `${imported}장` },
    { label: "샘플 데이터", value: `${photos.length - imported}장` },
    { label: "사진 접근 방식", value: "선택할 때마다 직접 고르기" },
    { label: "알림", value: "On", toggle: true },
  ];
  const [toggles, setToggles] = useState({ 알림: true });
  return (
    <div className="pl-fade-in pb-8">
      <div className="px-5 pt-3 pb-6 flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: T.surface2 }}>
          <User size={22} color={T.inkDim} />
        </div>
        <div>
          <h1 className="pl-serif text-[20px]" style={{ color: T.ink }}>Your library</h1>
          <p className="text-[12px]" style={{ color: T.inkFaint }}>{photos.length} photos total</p>
        </div>
      </div>

      <div className="px-5 mb-6">
        <button onClick={onRequestImport} className="pl-tap w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13.5px] font-semibold" style={{ background: T.gold, color: "#1B1710" }}>
          <Upload size={15} /> 내 사진 더 가져오기
        </button>
      </div>

      <div className="px-5 mb-6 px-4 py-3.5 rounded-2xl" style={{ background: T.surface, marginInline: 20 }}>
        <p className="text-[12.5px] leading-relaxed" style={{ color: T.inkDim }}>
          웹 앱은 브라우저 보안 정책상 갤러리에 상시 접근할 수 없어서, 사진을 가져올 때마다 직접 선택창에서 골라야 해요.
          자동 동기화와 실시간 AI 분석을 쓰려면 iOS/Android 네이티브 앱으로 만들어야 합니다.
        </p>
      </div>

      <div className="px-5">
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center justify-between py-3.5" style={{ borderBottom: i < rows.length - 1 ? `1px solid ${T.line}` : "none" }}>
            <span className="text-[13.5px]" style={{ color: T.ink }}>{r.label}</span>
            {r.toggle ? (
              <button onClick={() => setToggles((t) => ({ ...t, [r.label]: !t[r.label] }))} className="pl-tap w-10 h-6 rounded-full relative" style={{ background: toggles[r.label] ? T.gold : T.surface2 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: T.bg, position: "absolute", top: 3, left: toggles[r.label] ? 20 : 3, transition: "left .15s" }} />
              </button>
            ) : (
              <span className="text-[12.5px]" style={{ color: T.inkFaint }}>{r.value}</span>
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
    <div className="flex items-center justify-around px-2 pt-2.5 shrink-0" style={{ background: T.bg, borderTop: `1px solid ${T.line}`, paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}>
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
  const [importBusy, setImportBusy] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importedPhotos, setImportedPhotos] = useState([]);
  const [tab, setTab] = useState("home");
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [detailCollection, setDetailCollection] = useState(null);
  const [photoHistory, setPhotoHistory] = useState([]);
  const libraryFileInputRef = useRef(null);

  const photos = [...importedPhotos, ...SAMPLE_PHOTOS];

  function handleFiles(fileList) {
    const files = Array.from(fileList);
    setImportBusy(true);
    setImportCount(files.length);
    // Real work: build in-memory photo objects from the files the user picked.
    const newPhotos = files.map((file, i) => ({
      id: `u-${Date.now()}-${i}`,
      kind: "photo",
      url: URL.createObjectURL(file),
      date: new Date(file.lastModified || Date.now()).toISOString(),
      location: null,
      collections: ["Imported"],
      tags: ["가져온 사진"],
      context: "내 갤러리에서 가져옴",
      keywords: [(file.name || "").toLowerCase()],
    }));
    setTimeout(() => {
      setImportedPhotos((prev) => [...newPhotos, ...prev]);
      setImportBusy(false);
      setBooted(true);
    }, 400);
  }

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
    setDetailCollection(name || "Imported");
    if (!name) setTab("collections");
  }
  function requestImport() {
    libraryFileInputRef.current?.click();
  }

  const screens = {
    home: <HomeScreen photos={photos} onOpenPhoto={openPhoto} onOpenCollection={openCollection} goSearch={() => setTab("search")} />,
    search: <SearchScreen photos={photos} onOpenPhoto={openPhoto} />,
    library: <LibraryScreen photos={photos} onOpenPhoto={openPhoto} onRequestImport={requestImport} />,
    collections: <CollectionsScreen photos={photos} onOpenCollection={openCollection} />,
    settings: <SettingsScreen photos={photos} onRequestImport={requestImport} />,
  };

  return (
    <div className="pl-app w-full" style={{ background: T.bg, height: "100dvh" }}>
      <style>{FONTS}</style>
      <input
        ref={libraryFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {!booted ? (
        <Onboarding onImportFiles={handleFiles} onSkip={() => setBooted(true)} importBusy={importBusy} importCount={importCount} />
      ) : (
        <div className="relative w-full flex flex-col" style={{ height: "100dvh" }}>
          <div style={{ height: "env(safe-area-inset-top)" }} className="shrink-0" />
          <div className="flex-1 overflow-y-auto pl-scroll relative">
            {screens[tab]}
          </div>
          <TabBar active={tab} setActive={setTab} />

          {detailCollection && !detailPhoto && (
            <CollectionDetail name={detailCollection} photos={photos} onBack={() => setDetailCollection(null)} onOpenPhoto={openPhoto} />
          )}
          {detailPhoto && (
            <PhotoDetail photo={detailPhoto} photos={photos} onBack={backFromPhoto} onOpenPhoto={openPhoto} onOpenCollection={openCollection} />
          )}
        </div>
      )}
    </div>
  );
}
