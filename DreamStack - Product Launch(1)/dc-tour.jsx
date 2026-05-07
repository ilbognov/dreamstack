// ============================================================
// DreamCatcher Presenter Tour
// ------------------------------------------------------------
// A scripted series of "stops" that pause auto-playback, dim the
// UI, spotlight a target element, and show a caption. Designed
// for a presenter to walk an audience through the product live.
//
// Usage: mount <Tour cursor={cursor} setPlaying={...} playing={...}
//                    nodes={nodes} asks={asks} setTab={setTab} />
// inside App's session route. The component listens to timeline
// state and fires stops at well-known moments.

// Shared helper: 1s after a stop fires, scale the whole .app 1.5×
// with the zoom origin set to the spotlight target's center (read from
// the live tour-mask cut-out rect). Falls back to page-center if the
// rect isn't measured yet.
function applyTourZoom(stopId, override) {
  setTimeout(() => {
    const root = document.querySelector(".app");
    if (!root || root.getAttribute("data-tour-stop") !== stopId) return;
    if (override && override.x !== undefined && override.y !== undefined) {
      root.style.setProperty("--zoom-x", `${override.x}%`);
      root.style.setProperty("--zoom-y", `${override.y}%`);
    } else {
      // Auto-compute from spotlight rect, with optional xOffset (in %).
      const cutout = document.querySelector('.tour-layer svg mask rect:nth-of-type(2)');
      if (cutout) {
        const cx = (parseFloat(cutout.getAttribute("x")) + parseFloat(cutout.getAttribute("width")) / 2) / 1440 * 100 + (override?.xOffset || 0);
        const cy = (parseFloat(cutout.getAttribute("y")) + parseFloat(cutout.getAttribute("height")) / 2) / 872 * 100 + (override?.yOffset || 0);
        root.style.setProperty("--zoom-x", `${cx}%`);
        root.style.setProperty("--zoom-y", `${cy}%`);
      }
    }
    root.classList.add("tour-zoomed");
  }, 1000);
}
function clearTourZoom() {
  const root = document.querySelector(".app");
  if (!root) return;
  root.classList.remove("tour-zoomed");
  root.style.removeProperty("--zoom-x");
  root.style.removeProperty("--zoom-y");
}
// ============================================================

const TOUR_STOPS = [
  {
    id: "transcript",
    trigger: ({ messages }) => messages.length >= 2,
    selector: ".sidebar",
    // Keep tooltip on the left of the sidebar so it doesn't cover content
    placement: "left",
    badge: "01/06",
    title: "Your meeting, captured live",
  },
  {
    id: "first-node",
    trigger: ({ nodes, pending = [] }) => (nodes.length + pending.length) >= 1,
    selector: ".node", // first node on canvas
    placement: "right",
    badge: "02/06",
    title: "The ontology builds itself",
    sideEffect: () => {
      // Zoom toward the spotlight (FNOL node) — auto-compute origin from
      // the live ring rect so it always centers on the highlighted element.
      applyTourZoom("first-node");
    },
    onDismiss: () => clearTourZoom(),
  },
  {
    id: "outstanding-q",
    // Wait until we're deep enough in the demo that several nodes are on
    // canvas — the audience has had time to absorb "conversation → graph"
    // before we layer on "graph ← questions". Fires once Claim Intake (the
    // 4th node) has raised its first ask. We accept either a live pending
    // ask or an already-resolved one, so if the presenter lingers on earlier
    // stops past intake's Q&A window the tour still reaches this stop —
    // openNodeQuestions will open the panel in history mode.
    // Require intake to be ACCEPTED (in `nodes`, not just `pending`) —
    // the qpanel only renders for non-pending nodes, so firing this stop
    // while intake is still awaiting the green tick would spotlight
    // empty canvas.
    trigger: ({ asks, nodes, pending = [] }) => (
      (nodes.length + pending.length) >= 4 &&
      nodes.some(n => n.id === "intake") &&
      asks.some(a => a.nodeId === "intake")
    ),
    // The question panel is opened by the sideEffect; target it directly so the
    // audience sees the specific questions DreamCatcher wants answered.
    // Highlight both the pending node and its question panel as one unit
    // so the audience's eye connects them: "this node ← these questions".
    selector: ".qpanel",
    // Target the intake node by id directly — not by data-expanded, which
    // can race with the panel-open animation and leave the union covering
    // only the qpanel (dimming the node above it).
    unionSelectors: [".node[data-node-id='intake']", ".qpanel"],
    placement: "left",
    badge: "03/06",
    title: "It knows what it doesn't know",
    sideEffect: ({ asks, openNodeQuestions }) => {
      // Always open the intake panel — stop 3 is specifically about intake's
      // first ask. If we fell back to whatever else is pending we'd spotlight
      // a different node (e.g. adjuster) that may still be awaiting acceptance,
      // breaking the "green tick → panel appears" promise.
      const intakeAsk = asks.find(a => a.nodeId === "intake");
      if (intakeAsk && openNodeQuestions) openNodeQuestions(intakeAsk.nodeId);
      // Re-enable: pan the canvas so the intake node + qpanel are framed
      // inside the visible canvas column, with room reserved on the right
      // for the tooltip card. Without this the qpanel renders far off to
      // the right and the spotlight + tip both fall off the design frame.
      window.__dcCenterOnNode?.("intake", { tipOffset: 210 });
      applyTourZoom("outstanding-q", { xOffset: 10 });
    },
    onDismiss: () => clearTourZoom(),
    // IMPORTANT: do NOT close the panel on dismiss — the next stop
    // ("conversation resolves the question") needs the panel still
    // open so the audience can watch items tick off.
  },
  {
    id: "conversation-resolves",
    // Fire once the intake node has at least one resolved ask — we need
    // something that's actually been ticked off for the audience to see.
    // The previous stop leaves the qpanel open; keep it open here too.
    trigger: ({ asks }) => asks.some(a => a.nodeId === "intake" && a.status === "resolved"),
    // Highlight ONLY the sidebar — the qpanel on canvas stays open from the
    // prior stop, and the eye naturally bounces between transcript and the
    // ticking qpanel. A union spotlight of both would cover ~85% of the frame
    // and lose the focal point.
    // Target the specific "DreamCatcher asks" card in the transcript
    // instead of the whole sidebar — the audience's eye should land on
    // the resolved Q&A exchange, not on the entire panel.
    selector: ".ask-card",
    placement: "left",
    badge: "04/06",
    title: "Answered in the conversation",
    sideEffect: ({ asks, openNodeQuestions, setTab }) => {
      // Keep the intake panel open (it should still be, from stop 3 — but
      // re-open defensively in case the user dismissed it).
      const intakeAsk = asks.find(a => a.nodeId === "intake");
      if (intakeAsk && openNodeQuestions) openNodeQuestions(intakeAsk.nodeId);
      if (setTab) setTab("transcript");
      // Stop 04 targets the sidebar ask-card (right side). Use a fixed
      // origin at 82% x so the 1.5× scale keeps the card on-screen.
      applyTourZoom("conversation-resolves", { x: 95, y: 65 });
    },
    onDismiss: ({ closeNodeQuestions }) => {
      clearTourZoom();
      if (closeNodeQuestions) closeNodeQuestions();
    },
  },
  {
    id: "questions-tab",
    // Fire once the intake node's Q&A loop has produced visible structure —
    // the audience has now seen the full pattern several times over.
    trigger: ({ asks, nodes, pending = [] }) => (
      (nodes.length + pending.length) >= 5 &&
      asks.filter(a => a.status === "resolved").length >= 3
    ),
    selector: '.sb-tab',   // Questions tab (first tab)
    placement: "left",
    badge: "05/06",
    title: "Answers become structure",
    sideEffect: ({ setTab }) => {
      if (setTab) setTab("questions");
      applyTourZoom("questions-tab");
    },
    onDismiss: () => clearTourZoom(),
  },
  {
    // Split-screen comparison: architect vs in-meeting user view.
    // Fires once enough of the ontology is on canvas that both sides of
    // the comparison have something to show. The overlay is rendered by
    // <Tour> when the active stop has mode:"role-compare" — it covers the
    // whole .canvas-card so the audience sees both views at once, with
    // the tooltip parked centre-right alongside.
    id: "role-compare",
    trigger: ({ nodes, pending = [], asks }) => (
      (nodes.length + pending.length) >= 6 &&
      asks.filter(a => a.status === "resolved").length >= 5
    ),
    mode: "role-compare",
    selector: ".canvas-card",
    placement: "center",
    badge: "06/06",
    title: "Two people, two views",
    sideEffect: ({ setTab }) => {
      if (setTab) setTab("transcript");
    },
    onDismiss: () => clearTourZoom(),
    // Continue fires the DreamCatcher→DreamStudio morph animation.
    // TODO: handoff animation — paused for now, will polish later.
    onContinue: () => {
      clearTourZoom();
      // window.__dcStartHandoff?.(); // disabled until handoff is polished
    },
    continueLabel: "Continue",
    hideSkip: true,
  },
  // Step 07 removed — handoff animation fires from step 06 Continue above.
];

function Tour({ cursor, playing, setPlaying, messages, nodes, pending = [], asks, setTab, openNodeQuestions, closeNodeQuestions, enabled = true }) {
  const [firedIds, setFiredIds] = React.useState(() => new Set());
  const [activeStop, setActiveStop] = React.useState(null);
  // Ordered history of stop ids that have been shown — drives the back chevron.
  // We push on every "fire" and on every "go back" so back walks linearly through
  // the tour stops in the order they happened, without undoing playback state.
  const [stopHistory, setStopHistory] = React.useState([]);
  const [rect, setRect] = React.useState(null);
  const [skipped, setSkipped] = React.useState(false);
  // Tour paused via the close button — different from `skipped`. While
  // paused, no new stops auto-arm, but the user can resume from the same
  // stop they exited at via a floating "Resume tour" pill.
  const [pausedStopId, setPausedStopId] = React.useState(null);
  const savedPlayingRef = React.useRef(false);

  // Detect trigger conditions each render
  React.useEffect(() => {
    if (!enabled || skipped || activeStop || pausedStopId) return;
    for (let i = 0; i < TOUR_STOPS.length; i++) {
      const stop = TOUR_STOPS[i];
      if (firedIds.has(stop.id)) continue;
      // Enforce sequential ordering: only fire stop i if all earlier stops
      // have already fired. Prevents a later stop's condition (e.g. a pending
      // ask arriving before the first node is accepted) from jumping the queue.
      const priorAllFired = TOUR_STOPS.slice(0, i).every(s => firedIds.has(s.id));
      if (!priorAllFired) break;
      let ok = false;
      try { ok = stop.trigger({ messages, nodes, pending, asks }); } catch(e) {}
      if (ok) {
        // Fire this stop
        savedPlayingRef.current = playing;
        setPlaying(false);
        stop.sideEffect?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
        setActiveStop(stop);
        setStopHistory(prev => [...prev, stop.id]);
        setFiredIds(prev => { const n = new Set(prev); n.add(stop.id); return n; });
        break;
      } else {
        // If the earliest unfired stop isn't ready, don't consider later ones.
        break;
      }
    }
  }, [messages.length, nodes.length, pending.length, asks.length, enabled, skipped, activeStop, pausedStopId]);

  // Measure target rect when activeStop changes / on resize
  React.useEffect(() => {
    if (!activeStop) { setRect(null); return; }
    let raf;
    const measure = () => {
      // If the stop defines a union of selectors, compute the bounding box
      // of ALL matched elements. Used for stop 3 to highlight node + panel
      // together. Otherwise, use the single-selector fallback behavior.
      const frame = document.getElementById("dc-frame");
      if (activeStop.unionSelectors && activeStop.unionSelectors.length) {
        const rects = [];
        for (const sel of activeStop.unionSelectors) {
          document.querySelectorAll(sel).forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 1 && r.height > 1) rects.push(r);
            // Include any "Only You" chip / action buttons on a pending
            // node so the chip + buttons aren't clipped from the spotlight.
            for (const sel2 of [".only-you-chip", ".node-actions"]) {
              const extra = el.querySelector?.(sel2);
              if (!extra) continue;
              const cr = extra.getBoundingClientRect();
              if (cr.width > 1 && cr.height > 1) rects.push(cr);
            }
          });
        }
        if (!rects.length) { return; }
        const bb = rects.reduce((acc, r) => ({
          top:    Math.min(acc.top, r.top),
          left:   Math.min(acc.left, r.left),
          right:  Math.max(acc.right, r.right),
          bottom: Math.max(acc.bottom, r.bottom),
        }), { top: Infinity, left: Infinity, right: -Infinity, bottom: -Infinity });
        const r = { top: bb.top, left: bb.left, width: bb.right - bb.left, height: bb.bottom - bb.top };
        if (!frame) { setRect(r); return; }
        const fr = frame.getBoundingClientRect();
        const scale = fr.width / 1440;
        setRect({
          top: (r.top - fr.top) / scale,
          left: (r.left - fr.left) / scale,
          width: r.width / scale,
          height: r.height / scale,
        });
        return;
      }
      // Support multi-selector fallbacks: try each in order, preferring the
      // first that matches. Comma-split the selector string ourselves so a
      // later-in-DOM but higher-priority selector (e.g. .qpanel) wins.
      const selectors = activeStop.selector.split(',').map(s => s.trim()).filter(Boolean);
      let el = null;
      for (const sel of selectors) {
        el = document.querySelector(sel);
        if (el) break;
      }
      if (!el) { setRect(null); return; }
      let r = el.getBoundingClientRect();
      // If the target is a pending node, also include its "Only You"
      // chip (which sits ABOVE the node) and accept/dismiss buttons
      // (which sit BELOW) so the spotlight covers the whole composition.
      const extras = [
        el.querySelector?.(".only-you-chip"),
        el.querySelector?.(".node-actions"),
      ].filter(Boolean);
      for (const extra of extras) {
        const cr = extra.getBoundingClientRect();
        if (cr.width > 1 && cr.height > 1) {
          const top = Math.min(r.top, cr.top);
          const left = Math.min(r.left, cr.left);
          const right = Math.max(r.right, cr.right);
          const bottom = Math.max(r.bottom, cr.bottom);
          r = { top, left, width: right - left, height: bottom - top, right, bottom };
        }
      }
      // If the measured element has zero size (e.g. mid-enter animation),
      // treat as not-yet-ready so the interval can retry.
      if (r.width < 2 || r.height < 2) { return; }
      // Convert viewport rect into the design-frame coordinate space.
      // The frame is scaled via transform; we need the rect relative to
      // the frame's top-left, in design pixels (1440x872).
      if (!frame) { setRect({ top: r.top, left: r.left, width: r.width, height: r.height }); return; }
      const fr = frame.getBoundingClientRect();
      const scale = fr.width / 1440;
      setRect({
        top: (r.top - fr.top) / scale,
        left: (r.left - fr.left) / scale,
        width: r.width / scale,
        height: r.height / scale,
      });
    };
    // Measure once synchronously, then once more after layout settles.
    // The old 3s / 100ms sampling loop was the real source of the "node
    // sliding in" — each setRect moved the ring cutout, and on the stops
    // that also open a qpanel (which DOES animate the canvas pan), the
    // ring tracked the node as it moved, reading as a slide. One settle
    // pass after a frame is enough; further stops that mutate layout
    // (qpanel open) get one more pass after 520ms to catch the pan end.
    measure();
    raf = requestAnimationFrame(measure);
    const settleT = setTimeout(measure, 560);
    // Extra late pass for stops that open a qpanel (unionSelectors) —
    // the panel animates open over ~400ms so one more measure at 900ms
    // ensures the ring covers the fully-expanded content.
    const lateT = activeStop.unionSelectors ? setTimeout(measure, 900) : null;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(settleT);
      if (lateT) clearTimeout(lateT);
      cancelAnimationFrame(raf);
    };
  }, [activeStop]);

  // Keyboard: Space / Enter / → = continue; Esc = skip
  React.useEffect(() => {
    if (!activeStop) return;
    const onKey = (e) => {
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        onContinue();
      } else if (e.key === "Escape") {
        if (!activeStop.hideSkip) onPause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeStop]);

  const onContinue = () => {
    // If this stop has a custom onContinue callback, call it instead.
    if (activeStop.onContinue) {
      activeStop.onDismiss?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
      setActiveStop(null);
      setRect(null);
      activeStop.onContinue();
      return;
    }
    // If this stop has an onContinueHref, navigate instead of dismissing.
    const href = activeStop.onContinueHref;
    activeStop.onDismiss?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
    setActiveStop(null);
    setRect(null);
    if (href) {
      window.location.href = href;
      return;
    }
    // Resume playback
    setPlaying(true);
  };

  const onBack = () => {
    // Re-show the prior stop in history. Doesn't rewind playback state —
    // it just lets the presenter re-read previous copy.
    //
    // We also un-fire the stop we're leaving so that when the user
    // presses Continue (or exits + resumes) the tour can re-arm it
    // naturally instead of silently skipping it. Without this, the
    // sequence Back → exit → resume → Continue would jump straight
    // to the stop AFTER the one we left, leaving a hole.
    if (stopHistory.length < 2) return;
    const leavingId = activeStop?.id;
    const prevId = stopHistory[stopHistory.length - 2];
    const prevStop = TOUR_STOPS.find(s => s.id === prevId);
    if (!prevStop) return;
    activeStop?.onDismiss?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
    setStopHistory(h => h.slice(0, -1));
    if (leavingId) {
      setFiredIds(prev => {
        const n = new Set(prev);
        n.delete(leavingId);
        return n;
      });
    }
    // Re-run the prior stop's sideEffect so any UI it opens is restored.
    prevStop.sideEffect?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
    setActiveStop(prevStop);
    setRect(null);
    setPlaying(false);
  };

  const onSkip = () => {
    activeStop?.onDismiss?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
    setSkipped(true);
    setActiveStop(null);
    setRect(null);
    setPlaying(true);
  };

  // Exit-but-remember: closes the overlay AND prevents new stops from
  // arming, but stashes the current stop id so a "Resume tour" pill can
  // bring the user back exactly where they left off.
  const onPause = () => {
    if (!activeStop) return;
    activeStop.onDismiss?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
    setPausedStopId(activeStop.id);
    setActiveStop(null);
    setRect(null);
    setPlaying(true);
  };

  const onResume = () => {
    if (!pausedStopId) return;
    const stop = TOUR_STOPS.find(s => s.id === pausedStopId);
    if (!stop) { setPausedStopId(null); return; }
    savedPlayingRef.current = playing;
    setPlaying(false);
    stop.sideEffect?.({ setTab, asks, nodes, openNodeQuestions, closeNodeQuestions });
    setActiveStop(stop);
    setPausedStopId(null);
  };

  // Stamp a data attribute on the app root while a stop is active so CSS can
  // hide stop-specific UI (e.g. dim the left legend during the "asks" stop).
  React.useEffect(() => {
    const root = document.querySelector(".app");
    if (!root) return;
    if (activeStop) root.setAttribute("data-tour-stop", activeStop.id);
    else root.removeAttribute("data-tour-stop");
    // Mirror to window so other components (e.g. Lucy's cursor loop) can
    // read the current stop without props drilling.
    if (typeof window !== "undefined") window.__dcTourActiveStopId = activeStop?.id || null;
    return () => { root.removeAttribute("data-tour-stop"); };
  }, [activeStop]);

  if (!activeStop) {
    if (pausedStopId) {
      const pausedStop = TOUR_STOPS.find(s => s.id === pausedStopId);
      const idx = TOUR_STOPS.findIndex(s => s.id === pausedStopId) + 1;
      return (
        <button className="tour-resume-pill"
                onClick={onResume}
                aria-label={`Resume tour at: ${pausedStop?.title || "next stop"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 4 20 12 6 20 6 4"/>
          </svg>
          <span className="tour-resume-label">Resume tour</span>
          <span className="tour-resume-step">{idx}/{TOUR_STOPS.length}</span>
        </button>
      );
    }
    return null;
  }

  // Tooltip positioning: clamp within frame
  const PAD = 12;
  const TOOLTIP_W = 393;
  const TOOLTIP_H_EST = 220;

  // When .tour-zoomed is active the ring (inside .app) has moved on screen.
  // Read the ring's live getBoundingClientRect and convert back to
  // #dc-frame design coords so the portalled tip stays next to it.
  const _frameEl = document.getElementById('dc-frame');
  const _frameRect = _frameEl?.getBoundingClientRect();
  const _frameScale = _frameRect ? _frameRect.width / 1440 : 1;
  const _ringEl = document.querySelector('.tour-ring');
  const _liveRect = (_ringEl && _frameRect) ? {
    top:    (_ringEl.getBoundingClientRect().top  - _frameRect.top)  / _frameScale,
    left:   (_ringEl.getBoundingClientRect().left - _frameRect.left) / _frameScale,
    width:  _ringEl.getBoundingClientRect().width  / _frameScale,
    height: _ringEl.getBoundingClientRect().height / _frameScale,
  } : null;
  // Use live ring coords when available (accounts for zoom), fall back to rect.
  const tipRect = _liveRect || rect;

  let tipLeft = 0, tipTop = 0;
  if (tipRect) {
    if (activeStop.placement === "left") {
      tipLeft = tipRect.left - TOOLTIP_W - 20;
      tipTop = tipRect.top + 40;
    } else if (activeStop.placement === "right") {
      tipLeft = tipRect.left + tipRect.width + 20;
      tipTop = tipRect.top + Math.max(0, (tipRect.height - TOOLTIP_H_EST) / 2);
    } else if (activeStop.placement === "bottom") {
      tipLeft = tipRect.left + tipRect.width / 2 - TOOLTIP_W / 2;
      tipTop = tipRect.top + tipRect.height + 20;
    } else if (activeStop.placement === "center") {
      if (activeStop.mode === "role-compare") {
        tipLeft = (rect?.left ?? 0) + (rect?.width ?? 1440) / 2 - TOOLTIP_W / 2;
        tipTop = (rect?.top ?? 0) + (rect?.height ?? 872) - 320 + 16;
      } else {
        tipLeft = (rect?.left ?? 0) + (rect?.width ?? 1440) / 2 - TOOLTIP_W / 2;
        tipTop = (rect?.top ?? 0) + (rect?.height ?? 872) / 2 - TOOLTIP_H_EST / 2 - 30;
      }
    } else {
      tipLeft = tipRect.left + tipRect.width / 2 - TOOLTIP_W / 2;
      tipTop = tipRect.top - TOOLTIP_H_EST - 20;
    }
    // clamp within 1440x872 design frame
    tipLeft = Math.max(PAD, Math.min(1440 - TOOLTIP_W - PAD, tipLeft));
    tipTop  = Math.max(PAD, Math.min(872 - TOOLTIP_H_EST - PAD, tipTop));
  } else {
    // Fallback: centered
    tipLeft = 1440 / 2 - TOOLTIP_W / 2;
    tipTop  = 872 / 2 - TOOLTIP_H_EST / 2;
  }

  // Highlight ring — slightly inflated. Suppressed for the finale
  // ("center" placement) so the canvas reads as one open stage instead
  // of having the entire .canvas-card rect outlined.
  const INFLATE = 20;
  const ring = (rect && activeStop.placement !== "center") ? {
    top: rect.top - INFLATE,
    left: rect.left - INFLATE,
    width: rect.width + INFLATE * 2,
    height: rect.height + INFLATE * 2,
  } : null;

  // For the finale, soften the scrim so the ontology is clearly visible
  // through it. Normal stops use a darker dim to make the spotlight pop.
  const scrimFill = activeStop.placement === "center"
    ? "rgba(7,9,14,0.34)"
    : "rgba(7,9,14,0.62)";

  // Index for "N of M"
  const stepIdx = TOUR_STOPS.findIndex(s => s.id === activeStop.id) + 1;

  const frame = document.getElementById("dc-frame");
  const portalTarget = frame || document.body;

  // The scrim + ring render INSIDE .app so they scale with the zoom-in
  // transform (they should cover the zoomed content). The tooltip card
  // portals OUTSIDE .app so it always stays at 1:1, never zoomed.
  return (
    <>
      {/* Scrim + ring — inside .app, scales with tour-zoomed transform */}
      <div className="tour-layer" role="dialog" aria-label={activeStop.title}
           style={{ position: "absolute", inset: 0, zIndex: 9000, pointerEvents: "none" }}>
        {/* Dim overlay with a cut-out (use SVG mask for a proper hole) */}
        <svg className="tour-mask" width="1440" height="872" viewBox="0 0 1440 872" preserveAspectRatio="none">
          <defs>
            <mask id="tour-cutout">
              <rect x="0" y="0" width="1440" height="872" fill="white"/>
              {ring && (
                <rect x={ring.left} y={ring.top}
                      width={ring.width} height={ring.height}
                      rx="14" ry="14" fill="black"/>
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="1440" height="872"
                fill={scrimFill} mask="url(#tour-cutout)"/>
        </svg>

        {/* Glow ring around the target */}
        {ring && (
          <div className="tour-ring" style={{
            top: ring.top, left: ring.left,
            width: ring.width, height: ring.height,
          }}/>
        )}

        {/* Role-compare overlay */}
        {activeStop.mode === "role-compare" && window.RoleCompare && (
          <window.RoleCompare />
        )}
      </div>

      {/* Tooltip card — portalled outside .app so it's never zoomed */}
      {ReactDOM.createPortal(
        <div className="tour-tip" style={{ position: "absolute", left: tipLeft, top: tipTop, width: TOOLTIP_W, zIndex: 9100, pointerEvents: "auto" }}>
          <div className="tour-tip-hdr">
            <div className="tour-prog" aria-hidden="true">
              {TOUR_STOPS.map((s, i) => (
                <span key={s.id}
                      className={`tour-prog-seg ${i + 1 <= stepIdx ? "on" : ""}`}/>
              ))}
            </div>
            <span className="tour-badge">
              {(() => {
                const b = activeStop.badge || "";
                const m = b.match(/^(\d+)(\s*\/\s*\d+)$/);
                if (!m) return b;
                return (<><span className="tb-curr">{m[1]}</span><span className="tb-rest">{m[2]}</span></>);
              })()}
            </span>
            <button className="tour-close"
                    onClick={onPause}
                    aria-label="Exit tour (you can resume later)"
                    title="Exit tour">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18"/>
                <line x1="18" y1="6" x2="6" y2="18"/>
              </svg>
            </button>
          </div>
          <h3 className="tour-title">{activeStop.title}</h3>
          <p className="tour-body">{activeStop.body}</p>
          <div className="tour-actions">
            <button className="tour-back"
                    onClick={onBack}
                    disabled={stopHistory.length < 2}
                    aria-label="Back to previous tour stop">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className="tour-continue" onClick={onContinue}>
              {activeStop.continueLogo === "studio" && (
                <img className="tour-continue-logo"
                     src="assets/icon-studio.svg"
                     alt=""
                     aria-hidden="true"/>
              )}
              <span className="tour-continue-label">{activeStop.continueLabel || (stepIdx === TOUR_STOPS.length ? "Start demo" : "Continue")}</span>
            </button>
          </div>
          {/* PAUSE-EDIT-BTN: temporary edit helper — remove when done */}
          <button className="tour-pause-edit" onClick={onPause} title="Pause tour and edit UI">
            ⏸ Pause to edit UI
          </button>
        </div>
      , portalTarget)}
    </>
  );
}

window.Tour = Tour;
