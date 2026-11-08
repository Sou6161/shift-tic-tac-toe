import React, { useEffect, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import { Moon, Sun, ArrowRight, ArrowDownRight } from "lucide-react";
import PlacementPhaseVideo from "../Videos/PlacementPhaseVideo1.mp4";
import ShiftingPhaseVideo from "../Videos/ShiftingPhaseVideo2 (2).mp4";
import WinTheGame from "../Videos/WinTheGameVideo3.mp4";
import GameLauncher from "./GameLauncher";
import LockedDiscussionChat from "./LockedDiscussionChat";
import LoginButton from "./LoginButton";
import { XPiece, OPiece } from "./Board";

const readTheme = () => {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
};

/* Little logo mark: a tiny board with one piece mid-shift */
const Mark = ({ className = "" }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" className="fill-ink" />
    <path d="M12 7v18M20 7v18M7 12h18M7 20h18" className="stroke-paper/30" strokeWidth="1.5" />
    <path d="M9.5 9.5l4 4M13.5 9.5l-4 4" className="stroke-xred" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="23.5" cy="23.5" r="2.4" className="fill-none stroke-oteal" strokeWidth="2.2" />
    <circle cx="16" cy="16" r="1.4" className="fill-mustard" />
  </svg>
);

/* Hero illustration: a mid-game board where one X slides into the centre */
const DemoBoard = () => {
  // positions on a 3x3: 0..8
  const pieces = { 1: "O", 2: "X", 3: "O", 5: "O", 6: "X" };
  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      <div className="absolute -right-3 -top-5 z-20 rotate-[4deg] rounded-xl border-2 border-ink bg-mustard px-3 py-1.5 font-mono text-[12px] font-medium text-[#1F1A14] shadow-press sm:-right-6">
        move 7 · X slides in
      </div>
      <div className="relative rotate-[-2deg] rounded-[34px] bg-card p-4 shadow-lift ring-1 ring-line">
        <div className="relative grid grid-cols-3 gap-3 rounded-[24px] bg-sunk p-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="relative aspect-square rounded-[16px] bg-card shadow-tile">
              {pieces[i] && (
                <span className="absolute inset-[18%]">
                  {pieces[i] === "X" ? (
                    <XPiece className="h-full w-full text-xred" animate={false} />
                  ) : (
                    <OPiece className="h-full w-full text-oteal" animate={false} />
                  )}
                </span>
              )}
              {i === 4 && (
                <span className="demo-ghost absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mustard" />
              )}
            </div>
          ))}

          {/* the moving X lives in its own 1/3-sized layer so translate(100%) == one cell */}
          <div className="pointer-events-none absolute inset-3">
            <div className="demo-shift relative h-[calc((100%-1.5rem)/3)] w-[calc((100%-1.5rem)/3)]">
              <div className="absolute inset-0 rounded-[16px] bg-card shadow-lift ring-[3px] ring-mustard">
                <span className="absolute inset-[18%]">
                  <XPiece className="h-full w-full text-xred" animate={false} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const steps = [
  {
    n: "01",
    title: "Place",
    body: "Take turns dropping pieces on empty squares, three each. Nothing new so far.",
    video: PlacementPhaseVideo,
  },
  {
    n: "02",
    title: "Shift",
    body: "Out of pieces? Now you pick one up and move it to any open square. Blocking gets a lot harder.",
    video: ShiftingPhaseVideo,
  },
  {
    n: "03",
    title: "Line them up",
    body: "Three in a row still wins, the old-fashioned way. You just have to get there while everything moves.",
    video: WinTheGame,
  },
];

const Header = () => {
  const [isDark, setIsDark] = useState(readTheme);
  const lenis = useLenis();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* storage blocked: theme just won't persist */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#14201B" : "#F4EEE2");
  }, [isDark]);

  const go = (id) => (e) => {
    e?.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -24 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    ["play", "Play"],
    ["how", "How it works"],
    ["talk", "Table talk"],
    ["about", "About"],
  ];

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* ------------------------------------------------ Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <a href="#top" onClick={go("top")} className="flex items-center gap-2.5">
            <Mark className="h-8 w-8" />
            <span className="font-display text-[22px] font-semibold tracking-tight">
              shift<span className="text-xred">.</span>
            </span>
          </a>

          <div className="ml-6 hidden items-center gap-1 md:flex">
            {navLinks.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={go(id)}
                className="rounded-full px-3 py-1.5 text-[14px] font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <LoginButton />
            <button
              onClick={() => setIsDark((d) => !d)}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-transform hover:rotate-12 active:scale-95"
              aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
              title={isDark ? "Day mode" : "Night mode"}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* ------------------------------------------------ Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-24">
          <div className="rise">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-oteal" />
              Two players · about 3 minutes a round
            </span>
            <h1 className="font-display mt-6 text-[44px] font-medium leading-[1.02] tracking-[-0.02em] sm:text-[64px]">
              Three in a row.
              <br />
              <em className="font-normal italic text-xred">Then</em> everything moves.
            </h1>
            <p className="mt-6 max-w-[34ch] text-[18px] leading-relaxed text-muted">
              You place three pieces each, and after that you slide them around the board.
              It's tic-tac-toe with one extra rule, and that rule means nobody gets a free draw.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#play" onClick={go("play")} className="btn-ink">
                Start a game <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#how" onClick={go("how")} className="btn-ghost">
                How it works <ArrowDownRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rise" style={{ animationDelay: "120ms" }}>
            <DemoBoard />
          </div>
        </section>

        {/* ------------------------------------------------ Play */}
        <section id="play" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The table</p>
              <h2 className="font-display mt-2 text-[34px] font-medium tracking-tight sm:text-[44px]">
                Pull up a chair.
              </h2>
            </div>
            <p className="max-w-sm text-[15px] text-muted">
              Play the computer at three difficulty levels, or open a room and send the code to a friend.
            </p>
          </div>
          <div className="rounded-[32px] border border-line bg-card p-4 shadow-lift sm:p-8">
            <GameLauncher isDark={isDark} />
          </div>
        </section>

        {/* ------------------------------------------------ How */}
        <section id="how" className="scroll-mt-20 border-y border-line bg-sunk/50">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="eyebrow">How it works</p>
            <h2 className="font-display mt-2 max-w-xl text-[34px] font-medium tracking-tight sm:text-[44px]">
              One new rule, <em className="italic text-oteal">plenty</em> of new trouble.
            </h2>

            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, i) => (
                <li key={s.n} className="group">
                  <div
                    className={`overflow-hidden rounded-[22px] border border-line bg-[#111] shadow-lift transition-transform duration-300 group-hover:-translate-y-1 ${
                      i === 1 ? "md:rotate-[1deg]" : i === 0 ? "md:rotate-[-1deg]" : ""
                    }`}
                  >
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="aspect-[4/3] w-full object-contain"
                      src={s.video}
                    />
                  </div>
                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="font-mono text-[13px] text-xred">{s.n}</span>
                    <h3 className="font-display text-[24px] font-medium">{s.title}</h3>
                  </div>
                  <p className="mt-2 max-w-[32ch] text-[15px] leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------ Discussion */}
        <section id="talk" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="eyebrow">Table talk</p>
              <h2 className="font-display mt-2 text-[34px] font-medium tracking-tight sm:text-[44px]">
                Gloat, groan, or ask for a rematch.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
                Share an opening that works, report a bug, or tell everyone how you came back from two pieces down.
              </p>
            </div>
            <LockedDiscussionChat />
          </div>
        </section>

        {/* ------------------------------------------------ About */}
        <section id="about" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.6fr]">
            <p className="eyebrow">Who made this</p>
            <div>
              <p className="font-display text-[24px] font-light leading-snug sm:text-[30px]">
                Hi, I'm Sourabh, a frontend developer who likes building things people can play with. For Shift I
                learned WebSockets from scratch so two people could play the same board in real time.
              </p>
              <p className="font-display mt-6 text-[20px] italic text-muted">— Sourabh</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-[14px] text-muted sm:px-6">
          <div className="flex items-center gap-2">
            <Mark className="h-6 w-6" />
            <span>Made for the Appwrite Hackathon.</span>
          </div>
          <a href="#top" onClick={go("top")} className="hover:text-ink">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Header;
