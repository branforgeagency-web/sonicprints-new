"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

type Media =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string }
  | { kind: "montage"; frames: string[] };

export interface Project {
  title: string;
  client: string;
  category: string;
  media: Media;
  /** Cut the whole gallery to the dark palette while this project is active. */
  dark?: boolean;
}

const pexels = (id: number, name = `pexels-photo-${id}`) =>
  `https://images.pexels.com/photos/${id}/${name}.jpeg?auto=compress&cs=tinysrgb&w=1400`;

const IMG = {
  portrait: pexels(7653844),
  tech: pexels(3656561),
  robot: pexels(8294551),
  glasses: pexels(8072299),
  glass: pexels(65210, "beer-a-pint-cup-alcohol-65210"),
};
const RED_VIDEO = "https://videos.pexels.com/video-files/35897922/15226325_1920_1080_24fps.mp4";

export const PROJECTS: Project[] = [
  {
    title: "Visual Metric",
    client: "Visual Metric",
    category: "Brand Montage",
    media: { kind: "montage", frames: [IMG.portrait, IMG.glasses, IMG.tech, IMG.robot, IMG.glass] },
  },
  { title: "JUNO Objects", client: "JUNO", category: "Studio Object", media: { kind: "image", src: IMG.tech } },
  { title: "Lumen Video", client: "Lumen", category: "AI Video", media: { kind: "video", src: RED_VIDEO }, dark: true },
  { title: "Orbit® Icons", client: "ORBIT®", category: "Icon Collection", media: { kind: "image", src: IMG.robot } },
  { title: "Rove® Supply", client: "Rove® Supply", category: "Interactive 06-02", media: { kind: "image", src: IMG.glass } },
];

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const N = PROJECTS.length;
const LAST = N - 1;
/** Page scroll (in vh) that moves the gallery by one project while it is pinned. */
const SCROLL_VH_PER_PROJECT = 70;
/** After scrolling stops inside the pinned range, settle onto the nearest project. */
const SNAP_IDLE_MS = 140;

const REF_W = 720;
const REF_H = 1280;
const REACH = 8; // rows rendered above and below the active row
const SLOTS = REACH * 2 + 1;
const MEDIA_REF = 400; // media width / max height at the 720px reference
const SPRING_K = 168;
const SPRING_C = 25;
const MONTAGE_FPS = 5.2;
const TITLE_LEAD = 0.22;

const PALETTE = {
  light: { bg: "#eeeeee", fg: "#001408" },
  dark: { bg: "#001408", fg: "#efefef" },
};

/* ------------------------------------------------------------------ */
/* Math                                                                */
/* ------------------------------------------------------------------ */

const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Curved shared track: rows compress toward the edges, expand at the centre. */
const trackY = (r: number) => 119 * r + 269 * Math.atan(1.2 * r);
const rowHeight = (d: number) => 112 + 340 / (1 + 1.45 * d * d);
const mediaWidthFactor = (d: number) => 0.915 + 0.085 / (1 + 0.7 * d * d);
/** Pixels of track per project at the centre (slope of trackY at 0). */
const TRACK_SLOPE = 119 + 269 * 1.2;

/** Which list index a DOM slot shows while `anchor` is the active row. */
const slotIndex = (slot: number, anchor: number) => {
  const lo = anchor - REACH;
  return lo + mod(slot - lo, SLOTS);
};

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

function Montage({ frames }: { frames: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = window.setInterval(() => {
      const kids = el.children;
      (kids[i] as HTMLElement).style.opacity = "0";
      i = (i + 1) % kids.length;
      (kids[i] as HTMLElement).style.opacity = "1";
    }, 1000 / MONTAGE_FPS);
    return () => window.clearInterval(id);
  }, [frames]);

  return (
    <div ref={ref} className="relative h-full w-full">
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

function MediaView({ media, videoRef }: { media: Media; videoRef: (el: HTMLVideoElement | null) => void }) {
  if (media.kind === "video") {
    return (
      <video
        ref={videoRef}
        src={media.src}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    );
  }
  if (media.kind === "montage") return <Montage frames={media.frames} />;
  return <img src={media.src} alt="" draggable={false} className="h-full w-full object-cover" />;
}

/* ------------------------------------------------------------------ */
/* Gallery — a scroll-driven pinned section                            */
/* ------------------------------------------------------------------ */

export default function InfiniteScroll() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [anchor, setAnchor] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const title = titleRef.current;
    if (!track || !stage || !title) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Preload every image so rows never flash blank as they enter.
    for (const p of PROJECTS) {
      const srcs = p.media.kind === "montage" ? p.media.frames : p.media.kind === "image" ? [p.media.src] : [];
      for (const src of srcs) new Image().src = src;
    }

    /* ---- viewport scale ---- */
    let W = 1;
    let H = 1;
    let s = 1;
    const measure = () => {
      W = stage.clientWidth || 1;
      H = stage.clientHeight || 1;
      s = clamp(Math.min(W / REF_W, H / REF_H), 0.5, 1.05);
      stage.style.setProperty("--s", String(s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(track);

    /* ---- page scroll <-> project position ---- */
    const travel = () => Math.max(1, track.offsetHeight - H);
    /** Project position (0..LAST) implied by the current page scroll. */
    const scrollPosition = () => clamp((-track.getBoundingClientRect().top / travel()) * LAST, 0, LAST);
    /** Page scrollY that puts project `i` in the centre. */
    const scrollYFor = (i: number) =>
      track.getBoundingClientRect().top + window.scrollY + (clamp(i, 0, LAST) / LAST) * travel();
    const pinned = () => {
      const r = track.getBoundingClientRect();
      return r.top <= 1 && r.bottom >= H - 1;
    };

    const st = { p: scrollPosition(), v: 0, vel: 0, prevP: 0 };
    st.prevP = st.p;

    /* ---- settle onto the nearest project when scrolling stops ---- */
    let snapTimer = 0;
    let dragging = false;
    const onScroll = () => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (dragging || !pinned()) return;
        const pos = scrollPosition();
        const nearest = Math.round(pos);
        if (Math.abs(nearest - pos) > 0.01) {
          window.scrollTo({ top: scrollYFor(nearest), behavior: reduced ? "auto" : "smooth" });
        }
      }, SNAP_IDLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---- mouse drag scrolls the page; tap/click centres a row ---- */
    const rowTops = new Array<number>(SLOTS).fill(0);
    const rowHs = new Array<number>(SLOTS).fill(0);
    const rowJs = new Array<number>(SLOTS).fill(0);
    let down: { id: number; x: number; y: number; lastY: number; moved: boolean; mouse: boolean } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, lastY: e.clientY, moved: false, mouse: e.pointerType === "mouse" };
      if (down.mouse) {
        dragging = true;
        stage.setPointerCapture(e.pointerId);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (Math.abs(e.clientY - down.y) > 5 || Math.abs(e.clientX - down.x) > 5) down.moved = true;
      if (down.mouse) {
        // Dragging one card's worth of track moves one project's worth of page.
        const pagePerTrackPx = travel() / LAST / (TRACK_SLOPE * s);
        window.scrollBy(0, -(e.clientY - down.lastY) * pagePerTrackPx);
      }
      down.lastY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const d = down;
      down = null;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      if (d.mouse) {
        dragging = false;
        onScroll();
      }
      if (d.moved) return;
      const y = e.clientY - stage.getBoundingClientRect().top;
      for (let k = 0; k < SLOTS; k++) {
        if (rowHs[k] > 0 && y >= rowTops[k] && y < rowTops[k] + rowHs[k]) {
          window.scrollTo({ top: scrollYFor(mod(rowJs[k], N)), behavior: reduced ? "auto" : "smooth" });
          return;
        }
      }
    };
    const onPointerCancel = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (down.mouse) dragging = false;
      down = null;
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerCancel);

    /* ---- title + light/dark cut ---- */
    let shownTitle = -1;
    const showTitle = (item: number) => {
      if (item === shownTitle) return;
      shownTitle = item;
      const project = PROJECTS[item];
      title.textContent = project.title;
      const pal = project.dark ? PALETTE.dark : PALETTE.light;
      stage.style.setProperty("--bg", pal.bg);
      stage.style.setProperty("--fg", pal.fg);
    };
    showTitle(Math.round(st.p));

    /* ---- loop ---- */
    let shownAnchor = -1;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!inView) {
        for (const v of videoRefs.current) if (v && !v.paused) v.pause();
        return;
      }

      // Follow the page scroll with a fast spring so wheel notches glide instead of jump.
      const target = scrollPosition();
      if (reduced) {
        st.p = target;
        st.v = 0;
      } else {
        st.v += ((target - st.p) * SPRING_K - st.v * SPRING_C) * dt;
        st.p += st.v * dt;
      }
      if (dt > 0) st.vel += ((st.p - st.prevP) / dt - st.vel) * Math.min(1, dt * 12);
      st.prevP = st.p;

      const a = Math.round(st.p);
      if (a !== shownAnchor) {
        shownAnchor = a;
        setAnchor(a);
      }

      const box = MEDIA_REF * s;
      for (let k = 0; k < SLOTS; k++) {
        const j = a - REACH + k;
        const slot = mod(j, SLOTS);
        const row = rowRefs.current[slot];
        const card = cardRefs.current[slot];
        const r = j - st.p;
        const d = Math.abs(r);
        const h = rowHeight(d) * s;
        const top = H / 2 + trackY(r) * s - h / 2;
        rowTops[k] = top;
        rowHs[k] = h;
        rowJs[k] = j;
        if (!row || !card) continue;

        // Scrolling stops at the first/last project, but the rows keep repeating
        // beyond them so there is never an empty band above or below.
        row.style.visibility = "visible";

        row.style.transform = `translate3d(0,${top}px,0)`;

        const mh = Math.max(44 * s, h - 52 * s);
        const insetY = Math.max(0, (box - mh) / 2);
        const insetX = (box * (1 - mediaWidthFactor(d))) / 2;
        card.style.clipPath = `inset(${insetY}px ${insetX}px)`;

        let tilt = "";
        if (!reduced) {
          const rx = clamp(-r * 1.3 - st.vel * 1.5, -4.5, 4.5);
          const ry = clamp(Math.sin(j * 2.1 + 1) * 0.45 + st.vel * 0.15 * Math.sin(j * 1.3 + 0.4), -1, 1);
          const rz = clamp(Math.cos(j * 1.7) * 0.15 * clamp(r, -1, 1) + st.vel * 0.06 * Math.cos(j * 0.9), -0.5, 0.5);
          tilt = ` perspective(950px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        }
        card.style.transform = `translate3d(-50%,${h / 2 - box / 2}px,0)${tilt}`;

        const video = videoRefs.current[slot];
        if (video) {
          if (d < 2.5 && video.paused) video.play().catch(() => {});
          else if (d >= 2.5 && !video.paused) video.pause();
        }
      }

      // The heading leads slightly in the direction of travel so it meets the incoming card.
      const lead = Math.abs(st.vel) > 0.05 ? TITLE_LEAD * Math.sign(st.vel) : 0;
      showTitle(clamp(Math.round(st.p + lead), 0, LAST));
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snapTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
    };
  }, []);

  const initial = PROJECTS[0].dark ? PALETTE.dark : PALETTE.light;

  return (
    // Tall track: its extra height is the scroll distance spent while the stage is pinned.
    <div ref={trackRef} className="relative" style={{ height: `calc(100dvh + ${LAST * SCROLL_VH_PER_PROJECT}vh)` }}>
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Project gallery"
        className="sticky top-0 h-dvh min-h-[520px] w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
        style={{ background: "var(--bg)", color: "var(--fg)", "--bg": initial.bg, "--fg": initial.fg, "--s": 1 } as CSSProperties}
      >
        {/* Layer 1: giant active title, behind everything */}
        <div
          ref={titleRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center whitespace-nowrap"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: "clamp(92px, min(23.5vw, 20.5vh), 220px)",
            lineHeight: 0.76,
            letterSpacing: "-0.065em",
          }}
        />

        {/* Layer 2: project rows */}
        <div className="absolute inset-0 z-10">
          {Array.from({ length: SLOTS }, (_, slot) => {
            const index = slotIndex(slot, anchor);
            const project = PROJECTS[mod(index, N)];
            return (
              <div
                key={slot}
                ref={(el) => {
                  rowRefs.current[slot] = el;
                }}
                className="invisible absolute inset-x-0 top-0 will-change-transform"
              >
                <div className="h-px w-full bg-current opacity-[0.38]" />

                {/* Layer 3: media */}
                <div
                  ref={(el) => {
                    cardRefs.current[slot] = el;
                  }}
                  className="absolute top-0 left-1/2 overflow-hidden will-change-transform"
                  style={{ width: "calc(400px * var(--s))", height: "calc(400px * var(--s))" }}
                >
                  <MediaView
                    key={mod(index, N)}
                    media={project.media}
                    videoRef={(el) => {
                      videoRefs.current[slot] = el;
                    }}
                  />
                </div>

                {/* Layer 4: metadata */}
                <span
                  className="absolute z-20 leading-none"
                  style={{
                    top: "calc(8px * var(--s))",
                    left: "calc(20px * var(--s))",
                    fontSize: "clamp(6.5px, calc(9px * var(--s)), 9.5px)",
                  }}
                >
                  {project.client}
                </span>
                <span
                  className="absolute z-20 font-mono leading-none"
                  style={{
                    top: "calc(8px * var(--s))",
                    right: "calc(20px * var(--s))",
                    fontSize: "clamp(6.5px, calc(9px * var(--s)), 9.5px)",
                  }}
                >
                  {project.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
