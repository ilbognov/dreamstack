/* DreamStudio — Guided tour
 *
 * Narrative:
 *   "AI is weak at architecture. This is where engineers lock it in before
 *    delegating build work to agents in DreamFactory."
 *
 * Fires on first arrival. Stops are absolute-positioned over the scaled
 * 1440×872 frame — the same approach as the DreamCatcher tour.
 *
 * Steps (5):
 *   01  home — "your DreamCatcher sessions live here" (with animated click)
 *   02  welcome + why this exists (centered, inside session)
 *   03  architecture graph — "you're mapping the system, not writing code"
 *   04  AI coach panel — "AI coaches; you commit"
 *   05  Push to DreamFactory — hand off
 */

(function () {
  const { useState, useEffect, useRef } = React;

  // Stops — positioned against the 1440×872 frame.
  // `requireTab` switches the app to the named tab before showing the tip.
  // `requireRoute` matches the ds-app route ("home" | "session").
  // `highlight` is an element selector whose rect we'll use for the ring.
  // `anchor` is the tooltip's position relative to the highlight rect.
  const STOPS = [
    {
      id: "home",
      requireRoute: "home",
      centered: true,
      title: "Every Dream session lands here.",
      cta: "Open Claims Intake →",
      homeAnim: true,  // run the cursor animation when user hits CTA
    },
    {
      id: "welcome",
      requireRoute: "session",
      requireTab: "Overview",
      centered: true,
      title: "Lock it in before you hand it off.",
      cta: "Start the walkthrough",
    },
    {
      id: "graph",
      requireRoute: "session",
      requireTab: "Overview",
      highlight: ".canvas-pan",
      highlightPad: 18,
      // .canvas-pan is the full content area (44,44 → 1082×828). Crop it
      // down to just the graph region: keep clear of the rail/header on
      // the top-left, the AI panel on the right, and the toolbar/tip below.
      highlightCropTop:    44,
      highlightCropLeft:   80,
      highlightCropRight:  60,   // stop short of the AI panel (~1126)
      highlightCropBottom: 300,  // dim toolbar + tip area
      anchor: "bottom-inside-cropped",
      title: "The architecture graph is the contract.",
    },
    {
      id: "ai-coach",
      requireRoute: "session",
      requireTab: "Overview",
      highlight: ".ai-panel",
      highlightPad: 16,
      anchor: "left",
      title: "The AI coaches, you commit.",
    },
    {
      id: "push",
      requireRoute: "session",
      requireTab: "Overview",
      highlight: ".ds-push-btn",
      highlightPad: 14,
      anchor: "bottom",
      title: "Ship the spec, not the code.",
      cta: "Push to DreamFactory",
      finalStop: true,
    },
  ];

  function getEl(sel) {
    if (!sel) return null;
    return document.querySelector(sel);
  }

  function useRectOf(sel, activeStep) {
    const [rect, setRect] = useState(null);
    useEffect(() => {
      if (!sel) { setRect(null); return; }
      let raf = 0;
      const measure = () => {
        const el = getEl(sel);
        if (!el) { setRect(null); return; }
        const r = el.getBoundingClientRect();
        // Measure relative to .ds-app (whose bounding rect already includes
        // its own zoom transform). This keeps spotlight coords correct
        // regardless of any tour zoom on .ds-app. Falls back to #ds-frame.
        const app = document.querySelector(".ds-app");
        const frame = document.getElementById("ds-frame");
        const ref = app || frame;
        if (!ref) { setRect(null); return; }
        const refR = ref.getBoundingClientRect();
        // Local 1440-unit scale: ref's rendered width / 1440 design width.
        // For ds-app this includes the tour zoom; the rect coords below
        // therefore live in the SAME post-zoom space as the SVG mask
        // (which is rendered inside ds-app and scales with it).
        const scale = refR.width / 1440;
        setRect({
          left:   (r.left   - refR.left) / scale,
          top:    (r.top    - refR.top)  / scale,
          width:  r.width   / scale,
          height: r.height  / scale,
        });
      };
      measure();
      const tick = () => { measure(); raf = requestAnimationFrame(tick); };
      // Poll for ~800ms to catch layout settling.
      let count = 0;
      const interval = setInterval(() => {
        measure();
        if (++count > 20) clearInterval(interval);
      }, 40);
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
        cancelAnimationFrame(raf);
        clearInterval(interval);
      };
    }, [sel, activeStep]);
    return rect;
  }

  function TourCursor({ targetSelector, onArrive, onDone }) {
    // Animates a fake cursor from mid-screen to the target element's center,
    // pulses a click, then fires onDone. Tuned slow on purpose — this is
    // narrative glue, not a throwaway UI flourish.
    const [pos, setPos] = useState({ x: 720, y: 780, click: false });
    useEffect(() => {
      const el = document.querySelector(targetSelector);
      if (!el) { onDone && onDone(); return; }
      const frame = document.getElementById("ds-frame");
      if (!frame) { onDone && onDone(); return; }
      const tr = el.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();
      const sc = fr.width / 1440 || 1;
      // Target point: ~35% into the card from left, 42% from top (over the title).
      const tx = (tr.left - fr.left) / sc + (tr.width / sc) * 0.35;
      const ty = (tr.top  - fr.top ) / sc + (tr.height / sc) * 0.42;
      // Start from bottom-center of the frame (below the tooltip).
      setPos({ x: 720, y: 780, click: false });
      // Timings (slow, deliberate):
      //   80ms   kick off travel (CSS transition handles the ~2.6s glide)
      //   2700ms show click pulse
      //   3100ms fire the actual card click
      //   3600ms hand control back to the tour
      const t1 = setTimeout(() => setPos({ x: tx, y: ty, click: false }), 80);
      const t2 = setTimeout(() => setPos(p => ({ ...p, click: true })), 2700);
      const t3 = setTimeout(() => { onArrive && onArrive(); }, 3100);
      const t4 = setTimeout(() => { onDone && onDone(); }, 3600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [targetSelector]);
    return (
      <div
        className={`ds-tour-cursor ${pos.click ? "clicking" : ""}`}
        style={{ left: pos.x, top: pos.y }}
      >
        <svg width="34" height="34" viewBox="0 0 28 28" aria-hidden="true">
          <path
            d="M6 4 L6 22 L11 18 L14 25 L17 24 L14 17 L21 17 Z"
            fill="#fff" stroke="#0a0a0a" strokeWidth="1.4" strokeLinejoin="round"
          />
        </svg>
        <span className="ds-tour-cursor-ping"/>
      </div>
    );
  }

  function TourOverlay({ onFinish, onPushStep, route }) {
    // Persist progress. Bump the key when STOPS changes so old state gets dropped.
    const TOUR_KEY = "ds_tour_stop_v4";
    const [stopIdx, setStopIdx] = useState(() => {
      // Clear old keys from previous tour shapes.
      try {
        localStorage.removeItem("ds_tour_stop");
        localStorage.removeItem("ds_tour_stop_v2");
        localStorage.removeItem("ds_tour_stop_v3");
      } catch {}
      // Demo mode: always boot the tour at stop 0 (the homepage intro) so
      // every fresh page load leads into the same narrative. Mid-tour
      // refresh intentionally restarts so the story flows top-to-bottom.
      return 0;
    });
    useEffect(() => {
      localStorage.setItem(TOUR_KEY, String(stopIdx));
    }, [stopIdx]);

    // Cursor animation state (used by home stop).
    const [cursorRunning, setCursorRunning] = useState(false);
    // Paused state (header pause button -> resume pill).
    const [paused, setPaused] = useState(false);

    // Brief pause when first arriving in session via the tour — lets the
    // user see the full architecture dashboard before the welcome tooltip
    // pops back in.
    const [breatheOnEnter, setBreatheOnEnter] = useState(() => {
      // If the cursor animation from the home route asked for a breathe,
      // start the new session-route tour instance with breathe ON.
      return typeof window !== "undefined" && window.__dsTourBreathe === true;
    });
    useEffect(() => {
      if (breatheOnEnter) {
        try { window.__dsTourBreathe = false; } catch {}
        const t = setTimeout(() => setBreatheOnEnter(false), 1800);
        return () => clearTimeout(t);
      }
    }, []);

    const stop = STOPS[stopIdx];
    const rect = useRectOf(stop.highlight, stopIdx);
    const pad = stop.highlightPad ?? 18;
    const cropBottom = stop.highlightCropBottom || 0;
    const cropTop    = stop.highlightCropTop    || 0;
    const cropRight  = stop.highlightCropRight  || 0;
    const cropLeft   = stop.highlightCropLeft   || 0;
    const offsetX = stop.highlightOffsetX || 0;
    const offsetY = stop.highlightOffsetY || 0;
    // Effective spotlight rect (after cropping + optional offset).
    const effRect = rect ? {
      left:   rect.left + offsetX + cropLeft,
      top:    rect.top  + offsetY + cropTop,
      width:  Math.max(60, rect.width  - cropLeft - cropRight),
      height: Math.max(60, rect.height - cropTop  - cropBottom),
    } : null;

    // When a stop requires a specific tab, switch to it.
    useEffect(() => {
      if (!stop) return;
      if (stop.requireTab) {
        const ev = new CustomEvent("ds-tour-set-tab", { detail: { tab: stop.requireTab } });
        window.dispatchEvent(ev);
      }
    }, [stopIdx]);

    // Auto-advance when the user enters the "session" route ahead of where
    // the tour is. Covers the case where the user clicks the project card
    // themselves (bypassing the tour's cursor animation) — we still want to
    // pick up at the welcome stop inside the session.
    //
    // Important: this only runs in the forward direction. When the user hits
    // Back on the welcome stop, we deliberately send the app back to the
    // home route and the tour back to stop 0 — auto-advance must NOT kick in
    // and yank them forward again while that transition settles.
    useEffect(() => {
      if (!stop) return;
      if (route !== "session") return;
      if (stop.requireRoute !== "session" && stopIdx < STOPS.findIndex(s => s.requireRoute === "session")) {
        const next = STOPS.findIndex(s => s.requireRoute === "session");
        if (next !== -1 && next > stopIdx) setStopIdx(next);
      }
    }, [route]);

    // Zoom mechanics removed — all stops display at 1:1.
    // (Was triggering React hook-order errors when combined with the
    //  pause/resume state added later. Keep simple.)
    useEffect(() => {
      const app = document.querySelector(".ds-app");
      if (!app) return;
      app.style.removeProperty("--ds-tour-zoom");
      app.style.removeProperty("--ds-tour-zoom-x");
      app.style.removeProperty("--ds-tour-zoom-y");
      app.classList.remove("ds-tour-zoomed");
    }, [stop?.id]);

    if (!stop) return null;
    if (stop.requireRoute && route && stop.requireRoute !== route) return null;
    if (breatheOnEnter) return null;

    const finishAndMark = () => {
      try { localStorage.setItem("ds_tour_done", "1"); } catch {}
      onFinish();
    };
    const next = () => {
      // Home stop: run the cursor animation, then click the card — which
      // transitions us to session. We advance the tour before the click so
      // the session lands on the welcome stop.
      if (stop.id === "home") {
        setCursorRunning(true);
        return;
      }
      // When the welcome CTA is pressed, fire the signal that unlocks
      // the Overview build-up animation.
      if (stop.id === "welcome") {
        try {
          window.dispatchEvent(new CustomEvent("ds:walkthrough-start"));
        } catch {}
      }
      if (stop.finalStop) {
        // Trigger the push modal + complete.
        if (onPushStep) onPushStep();
        finishAndMark();
        return;
      }
      setStopIdx(i => Math.min(i + 1, STOPS.length - 1));
    };
    const skip = () => { finishAndMark(); };
    const pause = () => { setPaused(true); };
    const resume = () => { setPaused(false); };

    // NOTE: tipStyle coordinates are relative to .ds-tour-root, whose
    // offsetParent is <main> (inset-shifted ~44px from the 1440 frame).
    // So to keep the tip inside the frame we clamp against the tour-root's
    // measured width, not the raw 1440.
    const rootEl = document.querySelector(".ds-tour-root");
    const frameEl = document.getElementById("ds-frame");
    let rootW = 1440;
    let rootOffsetX = 0;
    if (rootEl && frameEl) {
      const rr = rootEl.getBoundingClientRect();
      const fr = frameEl.getBoundingClientRect();
      const sc = fr.width / 1440 || 1;
      rootW = rr.width / sc;
      rootOffsetX = (rr.left - fr.left) / sc;
    }
    let tipStyle = { left: 720 - 196, top: 360 };
    if (stop.centered || !rect) {
      tipStyle = { left: 720 - 196, top: 340 };
    } else if (stop.anchor === "bottom-inside") {
      // Tip sits INSIDE the highlighted rect, near the bottom-right corner.
      const TIP_W = 393;
      const GUTTER = 24;
      const rightEdge = rect.left + rect.width - rootOffsetX;
      tipStyle = {
        left: Math.max(GUTTER, Math.min(rootW - TIP_W - GUTTER, rightEdge - TIP_W - GUTTER)),
        top: rect.top + rect.height - 220 - GUTTER,
      };
    } else if (stop.anchor === "bottom-inside-cropped") {
      // Tip sits OUTSIDE (below) the cropped spotlight — centered horizontally
      // on the highlight, in the dimmed strip at the bottom.
      const TIP_W = 393;
      const TIP_H = 240;        // approx tip height for vertical clamping
      const GUTTER = 24;
      const FRAME_H = 872;
      const centered = (effRect.left + effRect.width / 2 - rootOffsetX) - TIP_W / 2;
      const maxLeft  = rootW - TIP_W - GUTTER;
      // Clamp top so the tip fits inside the 872px frame with a bottom gutter
      // so it never collides with the toolbar / clips past the screen.
      const proposed = effRect.top + effRect.height + 24;
      const maxTop   = FRAME_H - TIP_H - 32;
      tipStyle = {
        left: Math.max(GUTTER, Math.min(maxLeft, centered)),
        top:  Math.min(maxTop, proposed),
      };
    } else if (stop.anchor === "bottom") {
      // Clamp both edges: tip must fit fully within the 1440 frame with an
      // 18px gutter, and prefer centering on the target but slide left when
      // the target is near the right edge.
      const TIP_W = 393;
      const GUTTER = 18;
      // Convert rect (frame coords) to tour-root-local coords.
      const centered = (rect.left + rect.width / 2 - rootOffsetX) - TIP_W / 2;
      const maxLeft = rootW - TIP_W - GUTTER;
      tipStyle = {
        left: Math.max(GUTTER, Math.min(maxLeft, centered)),
        top: rect.top + rect.height + 28,
      };
    } else if (stop.anchor === "right") {
      tipStyle = {
        left: Math.min(1440 - 393 - 18, rect.left + rect.width + 18),
        top: Math.max(18, rect.top + rect.height / 2 - 70),
      };
    } else if (stop.anchor === "left") {
      tipStyle = {
        left: Math.max(18, rect.left - 393 - 18),
        top: Math.max(18, rect.top + rect.height / 2 - 80),
      };
    } else if (stop.anchor === "top") {
      tipStyle = {
        left: Math.max(18, Math.min(1440 - 393 - 18, rect.left + rect.width / 2 - 220)),
        top: Math.max(18, rect.top - 180),
      };
    }

    // SVG needs to span the entire 1440x872 frame so frame-coords line up
    // with SVG coords exactly. tour-root is inset within <main> so we compute
    // the frame's rect relative to tour-root and offset the SVG accordingly.
    let svgStyle = { left: 0, top: 0, width: 1440, height: 872 };
    if (rootEl && frameEl) {
      const rr = rootEl.getBoundingClientRect();
      const fr = frameEl.getBoundingClientRect();
      const sc = fr.width / 1440 || 1;
      svgStyle = {
        left:   (fr.left - rr.left) / sc,
        top:    (fr.top  - rr.top)  / sc,
        width:  1440,
        height: 872,
      };
    }

    return (
      <div className="ds-tour-root">
        {paused && (
          <button className="ds-tour-resume-pill" onClick={resume} aria-label="Resume tour">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>
            <span>Resume tour</span>
            <span className="ds-tour-resume-step">{stopIdx + 1}/{STOPS.length}</span>
          </button>
        )}
        {/* spotlight — on the home stop, dim disappears once the cursor
            animation starts so the user sees the dashboard clearly. */}
        {!paused && rect && !stop.centered ? (
          <svg
            className="ds-tour-svg"
            viewBox="0 0 1440 872"
            preserveAspectRatio="none"
            style={{ position: "absolute", left: svgStyle.left, top: svgStyle.top, width: svgStyle.width, height: svgStyle.height }}
          >
            <defs>
              <mask id="ds-tour-mask">
                <rect x="0" y="0" width="1440" height="872" fill="white"/>
                <rect
                  x={effRect.left - pad}
                  y={effRect.top - pad}
                  width={effRect.width + pad * 2}
                  height={effRect.height + pad * 2}
                  rx="10" ry="10"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0" y="0" width="1440" height="872"
              fill="rgba(2,4,8,.64)"
              mask="url(#ds-tour-mask)"
            />
            {/* Ring */}
            <rect
              x={effRect.left - pad}
              y={effRect.top - pad}
              width={effRect.width + pad * 2}
              height={effRect.height + pad * 2}
              rx="10" ry="10"
              fill="none"
              stroke="rgba(43,127,255,1)"
              strokeWidth="3"
              style={{ filter: "drop-shadow(0 0 18px rgba(43,127,255,.9)) drop-shadow(0 0 4px rgba(43,127,255,.9))" }}
            />
          </svg>
        ) : (
          // On the home stop, drop the dim the moment the cursor starts
          // moving — the user wants to see the dashboard cleanly as the
          // animated cursor glides over to the Claims Intake card.
          !cursorRunning && !paused && <div className="ds-tour-dim"/>
        )}

        {/* tooltip — hidden during cursor animation on home stop */}
        {!cursorRunning && !paused && (
          <div className="ds-tour-tip" style={tipStyle}>
            <div className="ds-tour-tip-hd">
              <div className="ds-tour-dots" aria-hidden="true">
                {STOPS.map((_, i) => (
                  <span key={i} className={`ds-tour-dot ${i === stopIdx ? "on" : ""} ${i < stopIdx ? "done" : ""}`}/>
                ))}
              </div>
              <span className="ds-tour-step"><span className="ts-curr">{String(stopIdx + 1).padStart(2, "0")}</span><span className="ts-rest"> / {String(STOPS.length).padStart(2, "0")}</span></span>
              {(
                <button className="ds-tour-pause" onClick={pause} aria-label="Pause to edit" title="Pause to edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>
                </button>
              )}
              {!stop.finalStop && (
                <button className="ds-tour-skip" onClick={skip}></button>
              )}
            </div>
            <h3 className="ds-tour-title">{stop.title}</h3>
            <p className="ds-tour-body">{stop.body}</p>

            <div className="ds-tour-actions">
              {stopIdx > 0 && (
                <button
                  className="ds-tour-back"
                  aria-label="Back"
                  onClick={() => {
                    const target = Math.max(0, stopIdx - 1);
                    const targetStop = STOPS[target];
                    // If we're stepping back into a stop that lives on a
                    // different route, ask the app to switch routes first.
                    if (targetStop.requireRoute && targetStop.requireRoute !== route) {
                      try {
                        window.dispatchEvent(new CustomEvent("ds-tour-set-route", {
                          detail: { route: targetStop.requireRoute }
                        }));
                      } catch {}
                    }
                    setStopIdx(target);
                  }}
                />
              )}
              <button className="ds-tour-next" onClick={next}>
                {stop.cta || (stopIdx === STOPS.length - 1 ? "Finish" : "Next")}
              </button>
            </div>
          </div>
        )}

        {/* Animated cursor for the home stop — moves to the Claims Intake
            card, pulses a click, and triggers a real click on the card so
            the app routes into the session. */}
        {cursorRunning && stop.homeAnim && (
          <TourCursor
            targetSelector={'[data-project-id="claims-intake"]'}
            onArrive={() => {
              // Stash the breathe flag BEFORE the card click — the click
              // transitions us to the session route, which unmounts this
              // DSTour instance. The new instance reads this flag on mount.
              try { window.__dsTourBreathe = true; } catch {}
              const el = document.querySelector('[data-project-id="claims-intake"]');
              if (el) el.click();
            }}
            onDone={() => {
              // No-op in practice (we're already unmounted by the click).
              // Keeping it for the case where the target is missing.
            }}
          />
        )}
      </div>
    );
  }

  window.DSTour = TourOverlay;
  window.DS_TOUR_STOPS = STOPS;
})();
