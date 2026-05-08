/* DreamFactory — guided tour.
 *
 * Narrative:
 *   "You approved the architecture. DreamFactory is the factory floor —
 *    8 agents building in parallel, with you still in the loop."
 *
 * 6 stops, top to bottom:
 *   01 home      — cursor glides to Insurance Claims Processing tile, clicks
 *   02 welcome   — centered in kanban; set the frame ("factory floor")
 *   03 agents    — chip row: the specialists + their live status
 *   04 working   — "Working" column: real-time parallel build progress
 *   05 review    — "Review" column: you approve before it merges
 *   06 detail    — open a card; full context (code, tests, chat) in one place
 *
 * Mirrors the DreamStudio tour in structure and visual language.
 */

(function () {
  const { useState, useEffect } = React;

  const STOPS = [
    {
      id: "home",
      requireRoute: "home",
      centered: true,
      title: "Nine projects in flight. Let's open the insurance one.",
      cta: "Open Claims Processing →",
      homeAnim: true,
    },
    {
      id: "welcome",
      requireRoute: "project",
      centered: true,
      title: "This is the factory floor.",
      cta: "Show me the team",
    },
    {
      id: "agents",
      requireRoute: "project",
      highlight: ".kb-chiprow",
      highlightPad: 8,
      anchor: "bottom",
      title: "Each agent is a specialist. All eight run at once.",
    },
    {
      id: "working",
      requireRoute: "project",
      highlight: '.kb-col[data-col="working"]',
      highlightPad: 4,
      anchor: "right",
      title: "Working — write and test, live.",
    },
    {
      id: "review",
      requireRoute: "project",
      highlight: '.kb-col[data-col="review"]',
      highlightPad: 4,
      anchor: "left",
      title: "Review — nothing ships without you.",
    },
    {
      id: "detail",
      requireRoute: "project",
      centered: true,
      title: "Open a card — full context in one place.",
      cta: "Open a card →",
      openCardAnim: true,
    },
    {
      id: "review-card",
      requireRoute: "detail",
      centered: true,
      title: "Chat with the agent.",
      cta: "Show me →",
      chatAnim: true,
    },
    {
      id: "publish",
      requireRoute: "detail",
      highlight: '[data-tour="publish"]',
      highlightPad: 6,
      anchor: "bottom",
      title: "One button. You still hold the key.",
      cta: "Publish",
      publishAnim: true,
      finalStop: true,
    },
  ];

  function useRectOf(sel, activeStep) {
    const [rect, setRect] = useState(null);
    useEffect(() => {
      if (!sel) { setRect(null); return; }
      const measure = () => {
        const el = document.querySelector(sel);
        if (!el) { setRect(null); return; }
        const frame = document.getElementById("df-frame");
        if (!frame) { setRect(null); return; }
        const r = el.getBoundingClientRect();
        const fr = frame.getBoundingClientRect();
        const sc = fr.width / 1440 || 1;
        setRect({
          left:   (r.left   - fr.left) / sc,
          top:    (r.top    - fr.top)  / sc,
          width:  r.width   / sc,
          height: r.height  / sc,
        });
      };
      measure();
      let count = 0;
      const interval = setInterval(() => {
        measure();
        if (++count > 25) clearInterval(interval);
      }, 40);
      window.addEventListener("resize", measure);
      return () => { clearInterval(interval); window.removeEventListener("resize", measure); };
    }, [sel, activeStep]);
    return rect;
  }

  function TourCursor({ targetSelector, onArrive, onDone, startPoint }) {
    // Animates a fake cursor from startPoint to the target's center, pulses
    // a click, fires onArrive, then hands control back via onDone.
    const [pos, setPos] = useState({ x: startPoint?.x ?? 720, y: startPoint?.y ?? 780, click: false });
    useEffect(() => {
      const el = document.querySelector(targetSelector);
      if (!el) { onDone && onDone(); return; }
      const frame = document.getElementById("df-frame");
      if (!frame) { onDone && onDone(); return; }
      const tr = el.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();
      const sc = fr.width / 1440 || 1;
      const tx = (tr.left - fr.left) / sc + (tr.width / sc) * 0.35;
      const ty = (tr.top  - fr.top ) / sc + (tr.height / sc) * 0.42;

      setPos({ x: startPoint?.x ?? 720, y: startPoint?.y ?? 780, click: false });
      const t1 = setTimeout(() => setPos({ x: tx, y: ty, click: false }), 80);
      const t2 = setTimeout(() => setPos(p => ({ ...p, click: true })), 2500);
      const t3 = setTimeout(() => { onArrive && onArrive(); }, 2900);
      const t4 = setTimeout(() => { onDone && onDone(); }, 3400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [targetSelector]);
    return (
      <div
        className={`df-tour-cursor ${pos.click ? "clicking" : ""}`}
        style={{ left: pos.x, top: pos.y }}
      >
        <svg width="32" height="32" viewBox="0 0 28 28" aria-hidden="true">
          <path
            d="M6 4 L6 22 L11 18 L14 25 L17 24 L14 17 L21 17 Z"
            fill="#fff" stroke="#0a0a0a" strokeWidth="1.4" strokeLinejoin="round"
          />
        </svg>
        <span className="df-tour-cursor-ping"/>
      </div>
    );
  }

  function DFTour({ route, onOpenProject, onOpenFirstReviewCard, onPublish, onFinish }) {
    const [stopIdx, setStopIdx] = useState(0);
    // Persist nothing — demo mode, always start from stop 0.

    // When the route changes from under us (user clicked manually), keep
    // the tour in sync by jumping to the first stop whose requireRoute
    // matches. Only advance forward.
    useEffect(() => {
      const s = STOPS[stopIdx];
      if (!s) return;
      if (s.requireRoute && s.requireRoute !== route) {
        const next = STOPS.findIndex(x => x.requireRoute === route);
        if (next !== -1 && next > stopIdx) setStopIdx(next);
      }
    }, [route]);

    const [cursorRunning, setCursorRunning] = useState(false);
    const [cursorTarget, setCursorTarget] = useState(null);
    const [chatPlaying, setChatPlaying] = useState(false);
    const [showFinale, setShowFinale] = useState(false);

    // Breathe — after a route transition triggered by the cursor, hold the
    // overlay off for a beat so the user sees the new view land.
    const [breathe, setBreathe] = useState(false);
    useEffect(() => {
      if (breathe) {
        const t = setTimeout(() => setBreathe(false), 1200);
        return () => clearTimeout(t);
      }
    }, [breathe]);

    const stop = STOPS[stopIdx];
    const rect = useRectOf(stop?.highlight, stopIdx);
    const pad = stop?.highlightPad || 6;

    if (!stop) return null;
    if (stop.requireRoute && stop.requireRoute !== route) return null;
    if (breathe) return null;
    if (chatPlaying) return null;
    // Once finale is queued/up, hide all tour UI (tip, highlight).
    if (showFinale) {
      return (
        <div className="df-tour-root">
          <FinaleScreen
            onReplay={() => {
              setShowFinale(false);
              setStopIdx(0);
              window.dispatchEvent(new CustomEvent("df-tour-set-route", { detail: { route: "home" } }));
            }}
            onClose={() => {
              setShowFinale(false);
              onFinish();
            }}
          />
        </div>
      );
    }

    const next = () => {
      if (stop.id === "home") {
        // Animate cursor to the Claims tile, then click it.
        setCursorTarget({
          selector: '[data-project-id="claims-intake"]',
          onArrive: () => { onOpenProject(); },
          startPoint: { x: 720, y: 820 },
        });
        setCursorRunning(true);
        return;
      }
      if (stop.id === "detail") {
        // Animate cursor to a working card in the kanban, then open it.
        setCursorTarget({
          selector: '[data-task-id="t6"]',
          onArrive: () => { onOpenFirstReviewCard(); },
          startPoint: { x: 720, y: 820 },
        });
        setCursorRunning(true);
        return;
      }
      if (stop.chatAnim) {
        // Hide the tour UI, play the scripted convo in the right rail,
        // then advance once the convo finishes.
        setChatPlaying(true);
        window.dispatchEvent(new CustomEvent("df-tour-play-chat"));
        const handler = () => {
          window.removeEventListener("df-tour-chat-done", handler);
          setChatPlaying(false);
          setStopIdx(i => Math.min(i + 1, STOPS.length - 1));
        };
        window.addEventListener("df-tour-chat-done", handler);
        return;
      }
      if (stop.id === "publish") {
        // Skip the cursor animation — go straight to the finale. Clicking
        // Publish ends the demo cleanly; no extra flourish needed here.
        setShowFinale(true);
        return;
      }
      if (stop.finalStop) {
        onFinish();
        return;
      }
      setStopIdx(i => Math.min(i + 1, STOPS.length - 1));
    };

    const skip = () => { onFinish(); };

    // --- positioning ---
    const rootEl = document.querySelector(".df-tour-root");
    const frameEl = document.getElementById("df-frame");
    let rootW = 1440;
    let rootOffsetX = 0;
    let rootOffsetY = 0;
    if (rootEl && frameEl) {
      const rr = rootEl.getBoundingClientRect();
      const fr = frameEl.getBoundingClientRect();
      const sc = fr.width / 1440 || 1;
      rootW = rr.width / sc;
      rootOffsetX = (rr.left - fr.left) / sc;
      rootOffsetY = (rr.top - fr.top) / sc;
    }
    let tipStyle = { left: 720 - 196, top: 360 };
    const TIP_W = 393;
    const GUTTER = 18;

    if (stop.centered || !rect) {
      if (stop.anchorBottom) {
        tipStyle = { left: 720 - TIP_W / 2, top: 620 };
      } else {
        tipStyle = { left: 720 - TIP_W / 2, top: 360 };
      }
    } else if (stop.anchor === "bottom") {
      const centered = (rect.left + rect.width / 2) - TIP_W / 2;
      tipStyle = {
        left: Math.max(GUTTER, Math.min(1440 - TIP_W - GUTTER, centered)),
        top: rect.top + rect.height + 20,
      };
    } else if (stop.anchor === "top") {
      const centered = (rect.left + rect.width / 2) - TIP_W / 2;
      tipStyle = {
        left: Math.max(GUTTER, Math.min(1440 - TIP_W - GUTTER, centered)),
        top: Math.max(20, rect.top - 200),
      };
    } else if (stop.anchor === "right") {
      tipStyle = {
        left: Math.min(1440 - TIP_W - GUTTER, rect.left + rect.width + 20),
        top: Math.max(80, rect.top + 40),
      };
    } else if (stop.anchor === "left") {
      tipStyle = {
        left: Math.max(GUTTER, rect.left - TIP_W - 20),
        top: Math.max(80, rect.top + 40),
      };
    }

    // SVG coordinates must map 1:1 onto the 1440×872 frame.
    let svgStyle = { left: 0, top: 0, width: 1440, height: 872 };
    if (rootEl && frameEl) {
      const rr = rootEl.getBoundingClientRect();
      const fr = frameEl.getBoundingClientRect();
      const sc = fr.width / 1440 || 1;
      svgStyle = {        left:  (fr.left - rr.left) / sc,
        top:   (fr.top  - rr.top)  / sc,
        width:  1440,
        height: 872,
      };
    }

    // Clamp highlight so its bottom stroke isn't clipped off-canvas.
    let hiX = 0, hiY = 0, hiW = 0, hiH = 0;
    if (rect) {
      hiX = Math.max(4, rect.left - pad);
      hiY = Math.max(4, rect.top - pad);
      const maxBottom = 872 - 4;
      const rawH = rect.height + pad * 2;
      hiH = Math.min(rawH, maxBottom - hiY);
      const maxRight = 1440 - 4;
      const rawW = rect.width + pad * 2;
      hiW = Math.min(rawW, maxRight - hiX);
    }

    return (
      <div className="df-tour-root">
        {rect && !stop.centered ? (
          <svg
            className="df-tour-svg"
            viewBox="0 0 1440 872"
            preserveAspectRatio="none"
            style={{ position: "absolute", left: svgStyle.left, top: svgStyle.top, width: svgStyle.width, height: svgStyle.height }}
          >
            <defs>
              <mask id="df-tour-mask">
                <rect x="0" y="0" width="1440" height="872" fill="white"/>
                <rect
                  x={hiX}
                  y={hiY}
                  width={hiW}
                  height={hiH}
                  rx="10" ry="10"
                  fill="black"
                />
              </mask>
            </defs>
            <rect x="0" y="0" width="1440" height="872"
                  fill="rgba(2,4,8,.66)"
                  mask="url(#df-tour-mask)"/>
            <rect
              x={hiX}
              y={hiY}
              width={hiW}
              height={hiH}
              rx="10" ry="10"
              fill="none"
              stroke="rgba(43,127,255,1)"
              strokeWidth="3"
              style={{ filter: "drop-shadow(0 0 18px rgba(43,127,255,.9)) drop-shadow(0 0 4px rgba(43,127,255,.9))" }}
            />
          </svg>
        ) : (
          !cursorRunning && <div className="df-tour-dim"/>
        )}

        {!cursorRunning && (
          <div className="df-tour-tip" style={tipStyle}>
            <div className="df-tour-tip-hd">
              <div className="df-tour-dots" aria-hidden="true">
                {STOPS.map((_, i) => (
                  <span key={i}
                        className={`df-tour-dot ${i === stopIdx ? "on" : ""} ${i < stopIdx ? "done" : ""}`}/>
                ))}
              </div>
              <span className="df-tour-step">
                <span className="ts-curr">{String(stopIdx + 1).padStart(2, "0")}</span>
                <span className="ts-rest"> / {String(STOPS.length).padStart(2, "0")}</span>
              </span>
              {!stop.finalStop && (
                <button className="df-tour-skip" onClick={skip}></button>
              )}
            </div>
            <h3 className="df-tour-title">{stop.title}</h3>
            <p className="df-tour-body">{stop.body}</p>
            <div className="df-tour-actions">
              {stopIdx > 0 && (
                <button className="df-tour-back" aria-label="Back" onClick={() => {
                  const target = Math.max(0, stopIdx - 1);
                  const targetStop = STOPS[target];
                  if (targetStop.requireRoute && targetStop.requireRoute !== route) {
                    window.dispatchEvent(new CustomEvent("df-tour-set-route", {
                      detail: { route: targetStop.requireRoute }
                    }));
                  }
                  setStopIdx(target);
                }}/>
              )}
              <button className="df-tour-next" onClick={next}>
                {stop.cta || (stop.finalStop ? "Finish" : "Next")}
              </button>
            </div>
          </div>
        )}

        {cursorRunning && cursorTarget && (
          <TourCursor
            targetSelector={cursorTarget.selector}
            startPoint={cursorTarget.startPoint}
            onArrive={() => {
              setBreathe(true);
              cursorTarget.onArrive && cursorTarget.onArrive();
              if (!cursorTarget.onDoneExtra) {
                // Only auto-advance if the cursor click isn't the finale.
                setStopIdx(i => i + 1);
              }
            }}
            onDone={() => {
              setCursorRunning(false);
              const extra = cursorTarget.onDoneExtra;
              setCursorTarget(null);
              extra && extra();
            }}
          />
        )}
      </div>
    );
  }

  window.DFTour = DFTour;
  window.DF_TOUR_STOPS = STOPS;

  // ---------- Finale ----------
  // Shown when the user hits Publish at the end of the tour.
  // Message architecture:
  //   1) Success beat — something just shipped, real stakes felt
  //   2) Recap — three pills showing the loop Conquer enables
  //   3) The line — one sentence of what this means for the business
  //   4) Two CTAs — "Replay the tour", "Book a briefing"
  function FinaleScreen({ onReplay, onClose }) {
    const [phase, setPhase] = useState(0); // 0 = burst, 1 = card
    useEffect(() => {
      const t = setTimeout(() => setPhase(1), 900);
      return () => clearTimeout(t);
    }, []);

    return (
      <div className="df-finale" role="dialog" aria-label="Demo complete">
        {/* Animated gradient halo */}
        <div className="df-finale-halo"/>
        {/* Particle burst on first appear */}
        <svg className="df-finale-burst" viewBox="0 0 800 800" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => {
            const angle = (i / 28) * Math.PI * 2;
            const r = 320 + (i % 3) * 20;
            const x = 400 + Math.cos(angle) * r;
            const y = 400 + Math.sin(angle) * r;
            return (
              <circle
                key={i}
                cx={x} cy={y} r={3 + (i % 3)}
                fill={i % 2 === 0 ? "#2b7fff" : "#66d462"}
                style={{ animation: `df-finale-particle 1200ms ${i * 22}ms cubic-bezier(.2,.7,.25,1) both` }}
              />
            );
          })}
        </svg>

        {/* Hero line */}
        <h1 className={`df-finale-title ${phase >= 1 ? "show" : ""}`}>
          Demo complete.
        </h1>
        <p className={`df-finale-sub ${phase >= 1 ? "show" : ""}`}>
          That's the loop. You captured it in DreamCatcher. Locked the
          architecture in DreamStudio. A team of agents built it in DreamFactory.
          You approved. It's in production. All while you kept your hands on
          the wheel.
        </p>

        {/* Recap pills — the four phases the investor just watched */}
        <div className={`df-finale-recap ${phase >= 1 ? "show" : ""}`}>
          <div className="df-finale-phase">
            <div className="df-finale-phase-ico">
              <img src="assets/icon-catcher.svg?v3" alt="" width="22" height="22"/>
            </div>
            <div className="df-finale-phase-t">Discover</div>
            <div className="df-finale-phase-s">with DreamCatcher</div>
          </div>
          <div className="df-finale-arrow" aria-hidden="true">
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path d="M1 7h18M19 7l-4-4M19 7l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="df-finale-phase">
            <div className="df-finale-phase-ico">
              <img src="assets/icon-studio.svg?v3" alt="" width="22" height="22"/>
            </div>
            <div className="df-finale-phase-t">Architect</div>
            <div className="df-finale-phase-s">with DreamStudio</div>
          </div>
          <div className="df-finale-arrow" aria-hidden="true">
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path d="M1 7h18M19 7l-4-4M19 7l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="df-finale-phase">
            <div className="df-finale-phase-ico">
              <img src="assets/icon-factory.svg?v3" alt="" width="22" height="22"/>
            </div>
            <div className="df-finale-phase-t">Build</div>
            <div className="df-finale-phase-s">in DreamFactory</div>
          </div>
          <div className="df-finale-arrow" aria-hidden="true">
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path d="M1 7h18M19 7l-4-4M19 7l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="df-finale-phase shipped">
            <div className="df-finale-phase-ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14.5 3c2.5.5 5.5 3.5 6 6l-3 3c0 4-2 7-5.5 9.5-1-1.5-2-3-2.5-5l-3-3c-2-.5-3.5-1.5-5-2.5C4 7.5 7 5.5 11 5.5l3-2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="14.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 17l-2 4 4-2M8 19l-1 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="df-finale-phase-t">Ship to production</div>
            <div className="df-finale-phase-s">with one approval</div>
          </div>
        </div>

        {/* Closing signature — the DreamStack wordmark */}
        <div className={`df-finale-signoff ${phase >= 1 ? "show" : ""}`}>
          <div className="df-finale-rule"/>
          <div className="df-finale-wordmark">
            <span>Dream</span><span className="df-finale-wordmark-accent">Stack</span>
          </div>
          <div className="df-finale-tagline">Discuss it · Design it · Develop it</div>
        </div>
      </div>
    );
  }
})();
