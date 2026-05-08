// ============================================================
// Canvas + nodes + edges
// ============================================================

function Node({ node, isActive, isPending, onClick, onAccept, onReject, qbadge, outstanding, allAnswered, askCounts, expanded, onToggleExpand, readOnly, hasHistory }) {
  const clickable = isPending || hasHistory;
  const style = {
    left: `${node.x}px`,
    top: `${node.y}px`,
    transform: "translate(-50%, -50%)",
    cursor: clickable ? "pointer" : "default",
  };
  return (
    <div
      className={`node ${isActive ? "active" : ""} ${isPending ? "pending" : ""} ${clickable ? "clickable" : "not-clickable"}`}
      data-type={node.type}
      data-node-id={node.id}
      data-expanded={expanded ? "true" : undefined}
      style={style}
      onClick={(e) => { e.stopPropagation(); if (clickable) onClick?.(node.id); }}
    >
      <div className="hdr">
        <span className="label">
          {NODE_TYPE_LABEL[node.type]}
        </span>
        <span className="type-ico" aria-hidden="true">
          <TypeIcon type={node.type} size={14} />
        </span>
      </div>
      <div className="body">{node.title}</div>
      {/* Architect-only question-status badge. Hidden for company users
          (readOnly) so their canvas stays clean — they just see the nodes
          forming as the architect accepts them. Three states:
            • all answered  → green circle with white check
            • partial       → pill showing "N/M answered" in accent color
            • no asks       → nothing (node just sits there)
          The pill is clickable to open the question panel. */}
      {!readOnly && askCounts && askCounts.total > 0 && (() => {
        const { total, resolved } = askCounts;
        const done = resolved >= total;
        return (
          <div
            className={`ask-badge ${done ? "done" : "partial"}`}
            onClick={(e) => { e.stopPropagation(); if (hasHistory || outstanding) onToggleExpand?.(node.id); }}
            title={done ? "All questions answered" : `${resolved} of ${total} answered`}
            role="button"
            aria-label={done ? "All questions answered" : `${resolved} of ${total} questions answered`}
          >
            {done ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span className="ask-badge-txt">{resolved}/{total} answered</span>
            )}
          </div>
        );
      })()}

      {isPending && !readOnly && (
        <>
          {/* "Only You" chip — dark pill above the node, signals to the
              architect that this proposed node is only visible to them
              until they accept it. Disappears on accept. */}
          <div className="only-you-chip" aria-label="Only you can see this">
            <span className="oy-icon">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2.5 8s2-4 5.5-4 5.5 4 5.5 4-2 4-5.5 4-5.5-4-5.5-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <circle cx="8" cy="8" r="1.6" fill="currentColor"/>
              </svg>
            </span>
            <span>ONLY YOU</span>
          </div>
          <div className="node-actions" style={{ left: "50%", bottom: "-38px", transform: "translateX(-50%)" }}>
            <button className="na-btn" title="Reject" onClick={(e)=>{e.stopPropagation(); onReject?.(node.id);}}>
              <Icons.Trash />
            </button>
            <button className="na-btn accept" title="Accept" onClick={(e)=>{e.stopPropagation(); onAccept?.(node.id);}}>
              <Icons.Check />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NodeQuestionsPanel({ node, questions, mode = "live", collapsed, onToggle, onDelete }) {
  // positioned to the right of the node — node center + half-width (85px) + 12px gap
  const style = {
    left: `calc(${node.x}px + 97px)`,
    top: `${node.y}px`,
    transform: "translate(0, -50%)",
    minWidth: 240,
  };
  const pendingCount = questions.filter(q => q.status === "pending").length;
  const totalNow = questions.length;
  // Header text: "3 QUESTIONS" when multiple pending (matches Figma),
  // "1 OUTSTANDING QUESTION" when one, "N ANSWERED" when all resolved.
  let headerText;
  if (mode === "history") {
    headerText = `${totalNow} ANSWERED`;
  } else if (pendingCount === 0) {
    headerText = `${totalNow} ANSWERED`;
  } else if (pendingCount >= 2) {
    headerText = `${pendingCount} QUESTIONS`;
  } else {
    headerText = `1 OUTSTANDING QUESTION`;
  }
  return (
    <div className={`qpanel ${collapsed ? "collapsed" : ""} mode-${mode}`} style={style}>
      <div className="qpanel-hdr" onClick={() => onToggle(node.id)} style={{ cursor: "pointer" }}>
        <span>{headerText}</span>
        <span className="chev" style={{display:"flex"}}><Icons.ChevUp size={12} stroke="#6B7280"/></span>
      </div>
      {!collapsed && (
        <div className="qpanel-items">
          {questions.map((q, i) => {
            const status = q.status || "pending";
            const text = q.question;
            const historical = q.historical;
            return (
              <div className={`qpanel-item ${status === "pending" ? "pending" : "resolved"} ${historical ? "historical" : ""}`} key={q.id ?? i}>
                {status === "pending" && (
                  <button className="trash" onClick={() => onDelete?.(node.id, i)} title="Dismiss question">
                    <Icons.Trash/>
                  </button>
                )}
                {status === "resolved" && (
                  <div className="check-chip" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="qpanel-card">
                  <div className="k">
                    {status === "pending"
                      ? <>QUESTION</>
                      : <>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          ANSWERED
                        </>}
                  </div>
                  <div className="v">{text}</div>
                  {status === "resolved" && q.answer && (
                    <div className="a">{q.answer}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Edges — curved connector between two node centers, trimmed to node edges.
const NODE_HALF_W = 85;
const NODE_HALF_H = 36;

function edgePath(a, b) {
  // Smooth bezier connector. Picks side-exit vs top/bottom-exit based on which
  // axis dominates, then uses tangent-aligned cubic bezier for a soft curve.
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const horizontal = Math.abs(dx) >= Math.abs(dy);

  let ax, ay, bx, by, c1x, c1y, c2x, c2y;
  if (horizontal) {
    // exit left/right, enter opposite
    const exitDir = dx >= 0 ? 1 : -1;
    ax = a.x + exitDir * NODE_HALF_W;
    ay = a.y;
    bx = b.x - exitDir * NODE_HALF_W;
    by = b.y;
    const gap = Math.max(Math.abs(bx - ax), 0);
    // Control-point reach, clamped hard so c1 and c2 can never cross each
    // other (that was the "broken loopy line" bug).
    const cp = Math.min(110, Math.max(0, gap * 0.45));
    c1x = ax + exitDir * cp;  c1y = ay;
    c2x = bx - exitDir * cp;  c2y = by;
  } else {
    // exit top/bottom, enter opposite
    const exitDir = dy >= 0 ? 1 : -1; // +1 = exit bottom, -1 = exit top
    ax = a.x;
    ay = a.y + exitDir * NODE_HALF_H;
    bx = b.x;
    by = b.y - exitDir * NODE_HALF_H;
    const gap = Math.max(Math.abs(by - ay), 0);
    const cp = Math.min(110, Math.max(0, gap * 0.45));
    c1x = ax;  c1y = ay + exitDir * cp;
    c2x = bx;  c2y = by - exitDir * cp;
  }

  // Straight line for exact alignment
  if (Math.abs(ax - bx) < 1 && Math.abs(ay - by) < 1) return "";
  if (horizontal && Math.abs(ay - by) < 1) return `M ${ax} ${ay} L ${bx} ${by}`;
  if (!horizontal && Math.abs(ax - bx) < 1) return `M ${ax} ${ay} L ${bx} ${by}`;

  return `M ${ax} ${ay} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${bx} ${by}`;
}

function RemoteCursor({ nodes, edges, name = "Thomas Buckley", color = "#3B82F6" }) {
  // Lifecycle, in order:
  //   1) On first mount: enters from off-screen (fades in, slides onto canvas)
  //   2) Walks the ontology naturally (Bezier-curved hops, varied dwells)
  //   3) On any later remount: resumes from the last known position so it
  //      never re-enters from off-screen mid-session
  //
  // Lucy's last position is persisted on `window.__lucyCursorPos` so it
  // survives canvas remounts (e.g. when the role-compare overlay mounts).
  const persisted = (typeof window !== "undefined" && window.__lucyCursorPos) || null;
  const initialPos = persisted ? { ...persisted } : { x: -60, y: 340 };
  const initialOpacity = persisted ? 1 : 0;

  const [pos, setPos] = React.useState(initialPos);
  const [opacity, setOpacity] = React.useState(initialOpacity);
  const posRef = React.useRef(initialPos);
  const rafRef = React.useRef(0);
  const startedRef = React.useRef(false);

  // Latest nodes/edges, read from refs so we don't restart on changes.
  const nodesRef = React.useRef(nodes || []);
  const edgesRef = React.useRef(edges || []);
  React.useEffect(() => { nodesRef.current = nodes || []; }, [nodes]);
  React.useEffect(() => { edgesRef.current = edges || []; }, [edges]);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // ===================================================================
    // Lucy's cursor — minimum-jerk trajectories.
    //
    // Human reaching motions follow a well-known velocity profile: zero
    // velocity at start, zero velocity at end, single smooth bell-curve
    // peak in the middle. The minimum-jerk polynomial captures this with
    // no overshoot, no spring jitter, no tween-boundary discontinuities.
    //
    //   s(t) = 10t³ - 15t⁴ + 6t⁵     (t in [0,1])
    //
    // Each hop is a single trajectory from A to B. Between hops Lucy
    // dwells at B with no movement at all (real cursors stop being moved
    // when the operator stops pushing the trackpad — they don't breathe).
    // ===================================================================
    const state = {
      // Hop endpoints
      from: { x: posRef.current.x, y: posRef.current.y },
      to:   { x: posRef.current.x, y: posRef.current.y, nodeId: null },
      tgtNodeId: null,
      tgtOffset: null,
      hopStart: 0,
      hopDur: 0,
      // Phase: "dwell" = sitting still, "fly" = mid-trajectory
      phase: "dwell",
      nextHopAt: performance.now() + 500,
      lastNodeId: null,
      visited: new Map(),
      frozen: false,
    };

    const nodeWaypoint = (n) => {
      // Aim a little below + offset from the node center so Lucy looks like
      // she's reading the label, not stabbing the dot.
      const seed = ((n.id || "").charCodeAt(0) || 1) * 7 + (n.x | 0);
      const dx = ((seed * 13) % 70) - 35;
      const dy = 30 + ((seed * 11) % 24);
      return { x: n.x + dx, y: n.y + dy, nodeId: n.id };
    };

    const pickNextNode = () => {
      const ns = nodesRef.current;
      const es = edgesRef.current;
      if (!ns.length) return null;
      const now = performance.now();
      const staleAge = 12000;
      const isFresh = (id) => {
        const t = state.visited.get(id);
        return t != null && (now - t) < staleAge;
      };

      // 70% chance: follow an outgoing edge
      if (state.lastNodeId && Math.random() < 0.7) {
        const outs = es.filter(e => e.from === state.lastNodeId)
          .map(e => ns.find(n => n.id === e.to))
          .filter(Boolean)
          .filter(n => !isFresh(n.id));
        if (outs.length) return nodeWaypoint(outs[Math.floor(Math.random() * outs.length)]);
      }

      // Otherwise: distance-weighted pick from non-stale pool
      const cur = posRef.current;
      const pool = ns.filter(n => n.id !== state.lastNodeId && !isFresh(n.id));
      if (pool.length) {
        const weights = pool.map(n => {
          const d = Math.hypot(n.x - cur.x, n.y - cur.y) + 80;
          return 1 / d;
        });
        const total = weights.reduce((s, w) => s + w, 0);
        let r = Math.random() * total;
        for (let i = 0; i < pool.length; i++) {
          r -= weights[i];
          if (r <= 0) return nodeWaypoint(pool[i]);
        }
        return nodeWaypoint(pool[pool.length - 1]);
      }

      // Everything fresh: drift back to oldest visited
      const sorted = [...ns]
        .filter(n => n.id !== state.lastNodeId)
        .sort((a, b) => (state.visited.get(a.id) || 0) - (state.visited.get(b.id) || 0));
      if (sorted.length) return nodeWaypoint(sorted[0]);
      return null;
    };

    const pickDwell = () => {
      const r = Math.random();
      if (r < 0.25) return 900 + Math.random() * 800;    // glance
      if (r < 0.75) return 2400 + Math.random() * 2600;  // read
      return 5000 + Math.random() * 4000;                // linger
    };

    const launchHop = (target, now) => {
      state.from = { x: posRef.current.x, y: posRef.current.y };
      state.to = target;
      state.tgtNodeId = target.nodeId || null;
      const node = state.tgtNodeId ? nodesRef.current.find(n => n.id === state.tgtNodeId) : null;
      state.tgtOffset = node ? { dx: target.x - node.x, dy: target.y - node.y } : null;
      const dx = target.x - state.from.x;
      const dy = target.y - state.from.y;
      const dist = Math.hypot(dx, dy);
      // Hop duration: Fitts-ish — log scaling so longer reaches don't take
      // proportionally longer. Real cursor reaches across a screen are
      // surprisingly fast (~500-900ms regardless of distance).
      // 250+250*log2(d/40 + 1) gives:
      //   d=40px → ~500ms,  d=200px → ~830ms,  d=600px → ~1130ms
      state.hopDur = Math.max(420, 250 + 250 * Math.log2(dist / 40 + 1));
      state.hopStart = now;
      state.phase = "fly";
      if (target.nodeId) state.lastNodeId = target.nodeId;
    };

    // ----- wait for nodes, then plan the tour --------------------------
    const planTour = () => {
      const ns = nodesRef.current;
      if (!ns.length) { setTimeout(planTour, 250); return; }
      const first = pickNextNode();
      if (!first) { setTimeout(planTour, 250); return; }
      if (!persisted) {
        posRef.current = { x: -60, y: first.y };
        setPos(posRef.current);
        setOpacity(1);
      }
      launchHop(first, performance.now());
    };

    // ----- min-jerk main loop ------------------------------------------
    // Min-jerk position interpolant: starts and ends at zero velocity AND
    // zero acceleration, so concatenating hops never produces a kink.
    const minJerk = (t) => {
      const u = Math.max(0, Math.min(1, t));
      return u * u * u * (10 + u * (-15 + 6 * u));
    };

    const step = (now) => {
      // Final-stop freeze
      if (typeof window !== "undefined" && window.__dcTourActiveStopId === "handoff-studio") {
        state.frozen = true;
      }
      if (state.frozen) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // Re-resolve node-anchored target if its node moved.
      if (state.tgtNodeId && state.tgtOffset) {
        const node = nodesRef.current.find(n => n.id === state.tgtNodeId);
        if (node) {
          state.to = {
            x: node.x + state.tgtOffset.dx,
            y: node.y + state.tgtOffset.dy,
            nodeId: node.id,
          };
        }
      }

      let x = posRef.current.x, y = posRef.current.y;

      if (state.phase === "fly") {
        const t = (now - state.hopStart) / state.hopDur;
        if (t >= 1) {
          // Arrived
          x = state.to.x; y = state.to.y;
          if (state.to.nodeId) state.visited.set(state.to.nodeId, now);
          state.phase = "dwell";
          state.nextHopAt = now + pickDwell();
        } else {
          const s = minJerk(t);
          x = state.from.x + (state.to.x - state.from.x) * s;
          y = state.from.y + (state.to.y - state.from.y) * s;
        }
      } else {
        // Dwell: sit still. Real cursors don't move when not being moved.
        // (No micro-jitter — that's what made the previous version look
        // alive but also nervous. A still cursor is normal.)
        if (now >= state.nextHopAt) {
          const nxt = pickNextNode();
          if (nxt) launchHop(nxt, now);
          else state.nextHopAt = now + 1500;
        }
      }

      posRef.current = { x, y };
      setPos({ x, y });
      if (typeof window !== "undefined") window.__lucyCursorPos = { x, y };

      rafRef.current = requestAnimationFrame(step);
    };

    setTimeout(planTour, persisted ? 0 : 1200);
    rafRef.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(rafRef.current); startedRef.current = false; };
  }, []);

  if (!nodes || nodes.length === 0) return null;
  return (
    <div className="remote-cursor" style={{ left: pos.x, top: pos.y, opacity, transition: "opacity .8s ease" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5.5 3.5 L5.5 18.5 L9.2 14.8 L11.6 20.5 L14 19.5 L11.6 14 L16.5 13.5 Z"
              fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      <span className="remote-cursor-label" style={{ background: color }}>{name}</span>
    </div>
  );
}

// ConfirmCursor — user's cursor. Slides to the most recently added
// (confirmed) node whenever one appears, then breathes gently in place.
// Unlike RemoteCursor it's reactive: the target comes from props, not a
// self-managed tour.
function ConfirmCursor({ nodes, name = "You", color = "#EF4444" }) {
  const [pos, setPos] = React.useState({ x: 1100, y: 180 });
  const [opacity, setOpacity] = React.useState(0);
  const posRef = React.useRef({ x: 1100, y: 180 });
  const rafRef = React.useRef(0);
  const targetRef = React.useRef(null);
  const lastNodeCountRef = React.useRef(0);

  // Pick target: the newest confirmed node. Offset to sit just to the
  // bottom-right of the node so the label doesn't cover the title.
  React.useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    const latest = nodes[nodes.length - 1];
    // Only retarget when node count actually increases — stops the cursor
    // from snapping back every time the list is re-filtered.
    if (nodes.length > lastNodeCountRef.current) {
      // Offset to sit below-left of the node so the cursor label doesn't
      // cover the title, the now-bottom-right ask-badge, or the tour tooltip
      // that opens to the right of the node.
      targetRef.current = { x: latest.x + 14, y: latest.y + 88 };
      lastNodeCountRef.current = nodes.length;
      // Fade in on first node
      if (opacity === 0) setOpacity(1);
    }
  }, [nodes]);

  React.useEffect(() => {
    const EASE = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    let start = performance.now();
    let from = { ...posRef.current };
    let dur = 900;
    let lastTarget = null;

    const step = (now) => {
      const t = targetRef.current;
      if (t) {
        // New target? reset tween.
        if (!lastTarget || lastTarget.x !== t.x || lastTarget.y !== t.y) {
          from = { ...posRef.current };
          start = now;
          // Distance-scaled duration — snappy for short hops, slower for long ones.
          const dx = t.x - from.x, dy = t.y - from.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          dur = Math.max(500, Math.min(1400, 400 + dist * 1.4));
          lastTarget = t;
        }
        const raw = Math.min(1, (now - start) / dur);
        const e = EASE(raw);
        // Tiny breathing jitter once parked
        const parked = raw >= 1;
        const jx = parked ? Math.sin(now / 900) * 1.2 : 0;
        const jy = parked ? Math.cos(now / 1100) * 0.8 : 0;
        const x = from.x + (t.x - from.x) * e + jx;
        const y = from.y + (t.y - from.y) * e + jy;
        posRef.current = { x, y };
        setPos({ x, y });
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!nodes || nodes.length === 0) return null;
  return (
    <div className="remote-cursor" style={{ left: pos.x, top: pos.y, opacity, transition: "opacity .5s ease" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5.5 3.5 L5.5 18.5 L9.2 14.8 L11.6 20.5 L14 19.5 L11.6 14 L16.5 13.5 Z"
              fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      <span className="remote-cursor-label" style={{ background: color }}>{name}</span>
    </div>
  );
}

function Edges({ nodes, edges, activeId }) {
  const W = 2000, H = 1000;
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <svg className="edges" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {edges.map((e, i) => {
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b) return null;
        const ax = a.x, ay = a.y;
        const bx = b.x, by = b.y;
        const hi = activeId && (activeId === a.id || activeId === b.id);
        return (
          <path key={`${e.from}-${e.to}`}
                pathLength="1"
                className={`edge-path edge-draw ${hi ? "hi" : ""}`}
                d={edgePath({x:ax,y:ay},{x:bx,y:by})} />
        );
      })}
    </svg>
  );
}

function Canvas({
  nodes, pending, edges, badges, outstanding = {}, allAnswered = {}, askCounts = {}, activeNodeId, expandedNode, expandedMode = "live",
  onNodeClick, onAcceptNode, onRejectNode, onToggleExpand, questionsForExpanded,
  nodeHasHistory = {},
  liveNarration, onToggleNarration, showLegend, onToggleLegend, visibleTypes, onToggleType,
  readOnly = false,
}) {
  // Company user (readOnly) never sees pending nodes — architect gates them via accept.
  const effectivePending = readOnly ? [] : pending;
  const allNodes = [...nodes, ...effectivePending];

  // Pan/zoom state (Figma-style). Use a ref for the current transform so wheel/drag
  // can update the DOM imperatively (smooth) without React re-renders; React state
  // is kept in sync for the zoom HUD.
  const canvasRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const [view, setView] = React.useState({ x: 0, y: 0, s: 1, init: false });
  const viewRef = React.useRef({ x: 0, y: 0, s: 1, init: false });

  const applyTransform = React.useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const v = viewRef.current;
    inner.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.s})`;
  }, []);

  // Smooth pan animation — centers a given {x,y} canvas-space point in the
  // visible viewport. Used when the question panel opens: we want the node
  // + its panel squarely in view so the tour highlight lands cleanly.
  const animatePanRaf = React.useRef(0);
  const animatePanTo = React.useCallback((cx, cy, { duration = 520 } = {}) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const leftReserve = r.width > 900 ? 230 : (r.width > 640 ? 200 : (r.width > 480 ? 170 : 0));
    const availW = r.width - leftReserve;
    // Target view so (cx, cy) lands at the center of the visible area.
    // The qpanel extends ~220px below the node; bias the target up so
    // the node sits in the upper third and the panel has room below.
    const s = viewRef.current.s;
    const targetX = leftReserve + availW / 2 - cx * s;
    const targetY = r.height / 2 - (cy + 160) * s;
    const startX = viewRef.current.x;
    const startY = viewRef.current.y;
    const dx = targetX - startX;
    const dy = targetY - startY;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    const t0 = performance.now();
    cancelAnimationFrame(animatePanRaf.current);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      // easeOutCubic
      const e = 1 - Math.pow(1 - t, 3);
      viewRef.current = {
        ...viewRef.current,
        x: startX + dx * e,
        y: startY + dy * e,
      };
      applyTransform();
      if (t < 1) animatePanRaf.current = requestAnimationFrame(step);
      else setView({ ...viewRef.current });
    };
    animatePanRaf.current = requestAnimationFrame(step);
  }, [applyTransform]);

  // When the expandedNode changes (user or tour opens a panel), smoothly
  // center that node in the visible area so the panel below it is on screen.
  React.useEffect(() => {
    if (!expandedNode) return;
    const node = allNodes.find(n => n.id === expandedNode);
    if (!node) return;
    // Camera pan disabled — keep the canvas stationary when a question
    // panel opens. (Was: animatePanTo(node.x, node.y) after 80ms.)
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedNode]);

  // Throttle React state updates (for HUD percent) — DOM is already updated.
  const syncStateRaf = React.useRef(0);
  const scheduleSyncState = React.useCallback(() => {
    if (syncStateRaf.current) return;
    syncStateRaf.current = requestAnimationFrame(() => {
      syncStateRaf.current = 0;
      setView({ ...viewRef.current });
    });
  }, []);

  const setViewImperative = React.useCallback((updater) => {
    const next = updater(viewRef.current);
    viewRef.current = next;
    applyTransform();
    scheduleSyncState();
  }, [applyTransform, scheduleSyncState]);

  // Fit content on first mount + when viewport resizes significantly.
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const fit = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const leftReserve = r.width > 900 ? 230 : (r.width > 640 ? 200 : (r.width > 480 ? 170 : 0));
      const s = 1.0;
      // Center the canvas viewport on FNOL's world position (col 0, row 2)
      // so the very first node lands in the middle of the visible column.
      // FNOL world coords come from dc-data: x = 110, y = 450 (GY(2)=90+2*180).
      const FNOL_X = 600;
      const FNOL_Y = 600;
      const cxView = leftReserve + (r.width - leftReserve) / 2;
      const cyView = r.height / 2;
      const x = cxView - FNOL_X * s;
      const y = cyView - FNOL_Y * s;
      viewRef.current = { x, y, s, init: true };
      applyTransform();
      setView(viewRef.current);
    };
    if (!viewRef.current.init) fit();
    const ro = new ResizeObserver(() => {
      if (!viewRef.current.init) fit();
    });
    ro.observe(cv);
    return () => ro.disconnect();
  }, [applyTransform]);

  // No separate transform-sync effect needed — applyTransform is called imperatively.

  // Wheel: ctrl/meta = zoom to cursor, otherwise pan.
  const onWheel = React.useCallback((e) => {
    e.preventDefault();
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setViewImperative(v => {
      if (e.ctrlKey || e.metaKey) {
        // Faster zoom response (was 0.0018 — slow/sluggish)
        const factor = Math.exp(-e.deltaY * 0.01);
        const ns = Math.max(0.2, Math.min(4, v.s * factor));
        const wx = (px - v.x) / v.s;
        const wy = (py - v.y) / v.s;
        return { ...v, s: ns, x: px - wx * ns, y: py - wy * ns };
      }
      return { ...v, x: v.x - e.deltaX, y: v.y - e.deltaY };
    });
  }, [setViewImperative]);

  // Drag to pan (middle mouse, or left mouse on empty background, or space+drag).
  const [spaceDown, setSpaceDown] = React.useState(false);
  React.useEffect(() => {
    const kd = (e) => { if (e.code === "Space" && !e.repeat) { setSpaceDown(true); } };
    const ku = (e) => { if (e.code === "Space") setSpaceDown(false); };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  const dragRef = React.useRef(null);
  const onPointerDown = (e) => {
    const target = e.target;
    // Only start a pan when clicking empty canvas (not a node), or middle mouse, or space held.
    const onEmpty = target && (target.closest && (target.classList?.contains("canvas") || target.classList?.contains("canvas-inner") || target.classList?.contains("nodes-layer") || target.tagName === "svg" || target.tagName === "SVG"));
    if (e.button === 1 || spaceDown || (e.button === 0 && onEmpty)) {
      e.preventDefault();
      dragRef.current = { x: e.clientX, y: e.clientY, vx: viewRef.current.x, vy: viewRef.current.y };
      const cv = canvasRef.current;
      if (cv) cv.setPointerCapture?.(e.pointerId);
    }
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    setViewImperative(v => ({ ...v, x: d.vx + (e.clientX - d.x), y: d.vy + (e.clientY - d.y) }));
  };
  const onPointerUp = (e) => {
    dragRef.current = null;
    const cv = canvasRef.current;
    if (cv) cv.releasePointerCapture?.(e.pointerId);
  };

  // Zoom controls (+, -, fit).
  const zoomBy = (factor) => setViewImperative(v => {
    const cv = canvasRef.current;
    const r = cv?.getBoundingClientRect();
    const cx = r ? r.width / 2 : 400;
    const cy = r ? r.height / 2 : 300;
    const ns = Math.max(0.2, Math.min(4, v.s * factor));
    const wx = (cx - v.x) / v.s;
    const wy = (cy - v.y) / v.s;
    return { ...v, s: ns, x: cx - wx * ns, y: cy - wy * ns };
  });
  const fitView = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const VW = 2000, VH = 1000;
    const leftReserve = r.width > 900 ? 230 : (r.width > 640 ? 200 : (r.width > 480 ? 170 : 0));
    const availW = Math.max(300, r.width - leftReserve);
    const pad = 40;
    const sx = (availW - pad * 2) / VW;
    const sy = (r.height - pad * 2) / VH;
    const s = Math.min(Math.min(sx, sy) * 1.02, 1.4);
    const x = leftReserve + (availW - VW * s) / 2;
    const y = (r.height - VH * s) / 2;
    viewRef.current = { x, y, s, init: true };
    applyTransform();
    setView(viewRef.current);
  };

  // Fit-to-all: frame every node currently on canvas (smoothly animated).
  // Used by the tour's closing stop to pull back and reveal the whole
  // ontology at once — the "look what we built together" beat.
  const fitAllNodesRef = React.useRef(null);
  fitAllNodesRef.current = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const pool = allNodes;
    if (pool.length === 0) return;
    // Bounding box of node centers, plus generous padding for chip size (~100x60).
    const chipHalfW = 60, chipHalfH = 28;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of pool) {
      minX = Math.min(minX, n.x - chipHalfW);
      maxX = Math.max(maxX, n.x + chipHalfW);
      minY = Math.min(minY, n.y - chipHalfH);
      maxY = Math.max(maxY, n.y + chipHalfH);
    }
    const bbW = maxX - minX;
    const bbH = maxY - minY;
    const cxW = (minX + maxX) / 2;
    const cyW = (minY + maxY) / 2;
    const leftReserve = r.width > 900 ? 230 : (r.width > 640 ? 200 : (r.width > 480 ? 170 : 0));
    const availW = Math.max(300, r.width - leftReserve);
    const pad = 80;
    const sx = (availW - pad * 2) / bbW;
    const sy = (r.height - pad * 2) / bbH;
    const targetS = Math.max(0.35, Math.min(Math.min(sx, sy), 1.0));
    const targetX = leftReserve + availW / 2 - cxW * targetS;
    const targetY = r.height / 2 - cyW * targetS;
    // Animate (reuse the pan-step shape but with zoom too)
    const startX = viewRef.current.x;
    const startY = viewRef.current.y;
    const startS = viewRef.current.s;
    const dur = 600;
    const t0 = performance.now();
    if (animatePanRaf.current) cancelAnimationFrame(animatePanRaf.current);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      viewRef.current = {
        ...viewRef.current,
        x: startX + (targetX - startX) * e,
        y: startY + (targetY - startY) * e,
        s: startS + (targetS - startS) * e,
      };
      applyTransform();
      if (t < 1) animatePanRaf.current = requestAnimationFrame(step);
      else setView({ ...viewRef.current });
    };
    animatePanRaf.current = requestAnimationFrame(step);
  };

  // Expose fitAllNodes globally so the Tour component can trigger the
  // closing "zoom out" beat without prop-drilling a ref through the shell.
  React.useEffect(() => {
    window.__dcFitAllNodes = () => fitAllNodesRef.current?.();
    return () => { if (window.__dcFitAllNodes === fitAllNodesRef.current) delete window.__dcFitAllNodes; };
  }, []);

  // Center a specific node (by id) in the canvas viewport at zoom 1.
  // Used by the tour to frame the "first node" stop so the spotlight +
  // tooltip composition sits mid-canvas instead of wherever the node's
  // grid coords happen to land. Leaves a gap on the right for the
  // tooltip card (~420px) so the tip doesn't land over canvas chrome.
  const centerOnNodeRef = React.useRef(null);
  centerOnNodeRef.current = (nodeId, opts = {}) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const n = allNodes.find(nn => nn.id === nodeId);
    if (!n) return;
    const leftReserve = r.width > 900 ? 230 : (r.width > 640 ? 200 : (r.width > 480 ? 170 : 0));
    const tipOffset = opts.tipOffset ?? 0; // shift node left by this much to reserve space for tooltip on right
    const targetS = 1.0;
    // Center of the visible canvas column (excluding legend on the left).
    const cxView = leftReserve + (r.width - leftReserve) / 2 - tipOffset;
    const cyView = r.height / 2;
    const targetX = cxView - n.x * targetS;
    const targetY = cyView - n.y * targetS;
    // Instant recenter — no animation. Earlier we eased the pan over 600ms,
    // but the camera moving under a stationary node read as the node itself
    // sliding into view, which was confusing for demo viewers.
    if (animatePanRaf.current) cancelAnimationFrame(animatePanRaf.current);
    viewRef.current = { ...viewRef.current, x: targetX, y: targetY, s: targetS };
    applyTransform();
    setView({ ...viewRef.current });
  };
  React.useEffect(() => {
    window.__dcCenterOnNode = (id, opts) => centerOnNodeRef.current?.(id, opts);
    // __dcCenterAt(x, y, s?) — pan/zoom so world point (x, y) lands at the
    // DEAD CENTER of the canvas viewport (ignores leftReserve/tipOffset).
    // Use this when you want full manual control over the zoom landing
    // point. x/y are in canvas-world coords (same space as node n.x/n.y).
    window.__dcCenterAt = (x, y, s = 1.0) => {
      const cv = canvasRef.current;
      if (!cv) return;
      // Use the canvas WORLD dimensions (2000 x 1000) for centering, not
      // the client rect — the rect is in CSS pixels (post-frame-scale),
      // while world coords (x, y) are in design space. Centering in
      // world space lines up regardless of how the outer #dc-frame is
      // CSS-scaled to fit the viewport.
      const VW = 2000, VH = 1000;
      const targetX = VW / 2 - x * s;
      const targetY = VH / 2 - y * s;
      if (animatePanRaf.current) cancelAnimationFrame(animatePanRaf.current);
      viewRef.current = { ...viewRef.current, x: targetX, y: targetY, s };
      applyTransform();
      setView({ ...viewRef.current });
    };
    return () => {
      delete window.__dcCenterOnNode;
      delete window.__dcCenterAt;
      delete window.__dcZoomToNode;
    };
  }, []);

  // Animated zoom-to-node — like __dcCenterOnNode but with a smooth tween
  // and arbitrary scale. Used by the tour to glide the camera in/out.
  const zoomToNodeRef = React.useRef(null);
  zoomToNodeRef.current = (nodeId, targetScale = 1.5) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const allNodes = [...nodes, ...effectivePending];
    const n = allNodes.find(nn => nn.id === nodeId);
    if (!n) return;
    const VW = 2000, VH = 1000;
    const targetX = VW / 2 - n.x * targetScale;
    const targetY = VH / 2 - n.y * targetScale;
    const startX = viewRef.current.x;
    const startY = viewRef.current.y;
    const startS = viewRef.current.s;
    const dur = 600;
    const t0 = performance.now();
    if (animatePanRaf.current) cancelAnimationFrame(animatePanRaf.current);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      viewRef.current = {
        ...viewRef.current,
        x: startX + (targetX - startX) * e,
        y: startY + (targetY - startY) * e,
        s: startS + (targetScale - startS) * e,
      };
      applyTransform();
      if (t < 1) animatePanRaf.current = requestAnimationFrame(step);
      else {
        setView({ ...viewRef.current });
        // Nudge tour to re-measure now that the camera has settled.
        window.dispatchEvent(new Event("resize"));
      }
    };
    animatePanRaf.current = requestAnimationFrame(step);
  };
  React.useEffect(() => {
    window.__dcZoomToNode = (id, s) => zoomToNodeRef.current?.(id, s);
    return () => { delete window.__dcZoomToNode; };
  }, []);

  // Wheel listener — must be non-passive to preventDefault.
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const handler = (e) => onWheel(e);
    cv.addEventListener("wheel", handler, { passive: false });
    return () => cv.removeEventListener("wheel", handler);
  }, [onWheel]);

  return (
    <div className="canvas-card">
      {/* Canvas top toolbar — two floating pills (left = brand/name/LIVE/file,
          right = undo/redo). Floats over the dot grid; doesn't span. */}
      <div className="canvas-topbar">
        <div className="tb-pill">
          <button className="ontology-chip ontology-chip-btn" aria-label="Change ontology">
            <span className="glyph brand-glyph">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M14.7833 5.1365C19.096 5.52339 22.4737 9.07333 22.4737 13.3955C22.4737 15.5574 21.6285 17.5259 20.2441 19.0022C20.6427 19.1406 21.0556 19.2774 21.4841 19.4134L21.3076 20.8966C20.4892 20.637 19.7205 20.3727 18.9929 20.0973C17.7907 20.9568 16.3487 21.5138 14.7833 21.6543V25H13.3592V21.6658C11.7523 21.5482 10.2704 20.9921 9.03792 20.1192C8.32757 20.3867 7.57807 20.6439 6.78154 20.8966L6.60519 19.4134C7.00961 19.285 7.40007 19.1559 7.77788 19.0255C6.38045 17.5467 5.52637 15.5687 5.52637 13.3955C5.52637 9.02586 8.97867 5.44554 13.3592 5.12493V2H14.7833V5.1365ZM13.3592 18.0577C12.5112 18.5753 11.6148 19.0375 10.6448 19.4652C11.4651 19.9005 12.3835 20.1811 13.3592 20.2671V18.0577ZM14.7833 20.2531C15.7218 20.1516 16.6046 19.8695 17.3951 19.4434C16.4643 19.0308 15.6011 18.5859 14.7833 18.0901V20.2531ZM7.41642 10.9248C7.11574 11.6919 6.95052 12.5247 6.95052 13.3955C6.95052 15.4116 7.83414 17.2256 9.24278 18.4871C10.585 17.9601 11.7593 17.395 12.8349 16.7449C10.9526 15.2726 9.26659 13.4147 7.41642 10.9248ZM20.6141 11.0036C18.7869 13.454 17.1165 15.288 15.2541 16.7447C16.3131 17.3848 17.4678 17.9425 18.7842 18.4625C20.177 17.202 21.0496 15.3986 21.0496 13.3955C21.0496 12.5545 20.8955 11.7488 20.6141 11.0036ZM13.3592 6.52363C11.1411 6.71928 9.21932 7.92056 8.07328 9.65809C9.94184 12.2077 11.5724 14.0226 13.3592 15.4326V6.52363ZM14.7833 15.3907C16.5342 13.9986 18.1383 12.2132 19.9685 9.72261C18.852 7.98799 16.9683 6.77407 14.7833 6.53765V15.3907Z" fill="#237FFF"/>
              </svg>
            </span>
            <span className="ontology-chip-txt">Process Ontology</span>
            <Icons.ChevDown/>
          </button>
          <span className="live-chip"><span className="dot"/>LIVE</span>
          <span className="tb-divider" aria-hidden="true"/>
          <button className="cv-iconbtn" aria-label="File"><Icons.File/></button>
        </div>
        <div className="tb-pill undo-group">
          <button className="cv-iconbtn" aria-label="Undo"><Icons.Undo/></button>
          <span className="tb-divider" aria-hidden="true"/>
          <button className="cv-iconbtn" aria-label="Redo"><Icons.Redo/></button>
        </div>
      </div>

      {/* Canvas viewport */}
      <div
        className={`canvas ${spaceDown ? "grab" : ""} ${dragRef.current ? "grabbing" : ""}`}
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={`canvas-inner${expandedNode ? ' focus-mode' : ''}`} ref={innerRef}>
        <Edges nodes={allNodes.filter(n => visibleTypes[n.type])} edges={edges.filter(e => {
          const a = allNodes.find(n=>n.id===e.from), b = allNodes.find(n=>n.id===e.to);
          return a && b && visibleTypes[a.type] && visibleTypes[b.type];;
        })} activeId={activeNodeId} />

        <div className="nodes-layer">
          {[
            ...nodes.map(n => ({ ...n, _pending: false })),
            ...effectivePending.map(n => ({ ...n, _pending: true })),
          ].filter(n => visibleTypes[n.type]).map(n => (
            <Node key={n.id}
                  node={n}
                  isPending={n._pending}
                  isActive={!n._pending && activeNodeId === n.id}
                  expanded={expandedNode === n.id}
                  qbadge={!n._pending ? badges[n.id] : undefined}
                  outstanding={outstanding[n.id]}
                  allAnswered={!n._pending && allAnswered && allAnswered[n.id]}
                  askCounts={!n._pending ? askCounts[n.id] : undefined}
                  hasHistory={!!nodeHasHistory[n.id]}
                  onClick={onNodeClick}
                  onToggleExpand={onToggleExpand}
                  onAccept={n._pending ? onAcceptNode : undefined}
                  onReject={n._pending ? onRejectNode : undefined}
                  readOnly={readOnly}
            />
          ))}

          {!readOnly && expandedNode && questionsForExpanded.length > 0 && (() => {
            const n = allNodes.find(nn => nn.id === expandedNode);
            if (!n) return null;
            // Only reveal the question panel once the node has been accepted
            // (green tick pressed). While the node is still pending we keep
            // DreamCatcher's asks quiet so they don't hijack the acceptance
            // moment — the user wants the question to land on a committed node.
            if (n._pending) return null;
            return (
              <React.Fragment>
                <div
                  className="qpanel-overlay"
                  onClick={() => onToggleExpand(expandedNode)}
                  aria-hidden="true"
                />
                <NodeQuestionsPanel
                  node={n}
                  questions={questionsForExpanded}
                  mode={expandedMode}
                  collapsed={false}
                  onToggle={onToggleExpand}
                  onDelete={() => {}}
                />
              </React.Fragment>
            );
          })()}
        </div>
        <RemoteCursor
          nodes={nodes.filter(n => visibleTypes[n.type])}
          edges={edges}
          name={readOnly ? "John Smith" : "Lucy Martin"}
          color={readOnly ? "#6BAE44" : "#3B82F6"}/>
        <ConfirmCursor
          nodes={nodes.filter(n => visibleTypes[n.type])}
          name="You"
          color="#EF4444"/>
        </div>{/* /canvas-inner */}

        {/* left floating panel */}
        <div className="left-panel">
          <div className="captured-card">
            <span className="k">CAPTURED NODES</span>
            <span className="v mono">{nodes.length.toString().padStart(2, "0")}</span>
          </div>
          {showLegend !== false && (
            <div className="legend-card">
              <div className="legend-hdr">
                <span>NODE TYPES</span>
                <button onClick={onToggleLegend} aria-label="Close legend">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
                  </svg>
                </button>
              </div>
              <div className="legend-items">
                {[
                  { type: "process",    label: "Process"    },
                  { type: "subprocess", label: "Subprocess" },
                  { type: "role",       label: "Role"       },
                  { type: "system",     label: "System"     },
                ].map(({ type, label }) => (
                  <div
                    key={type}
                    data-type={type}
                    className={`legend-item ${visibleTypes?.[type] === false ? "dim" : ""}`}
                    onClick={() => onToggleType?.(type)}
                  >
                    <span className="dot" aria-hidden="true"/>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approve All — bulk-accept CTA shown when ≥2 pendings exist.
            Sits just above the Live Narration toggle so it shares the
            same horizontal axis as other canvas-level controls. */}
        {!readOnly && effectivePending.length >= 2 && (
          <button
            className="approve-all-btn"
            onClick={() => effectivePending.forEach(p => onAcceptNode?.(p.id))}
            title="Accept all proposed nodes"
          >
            <span className="aa-check" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Approve All
            <span className="aa-count">{effectivePending.length}</span>
          </button>
        )}

        {/* live narration */}
        <div className={`live-narration ${liveNarration ? "on" : ""}`}>
          <span className="ln-ico"><Icons.Narration size={16} stroke="currentColor"/></span>
          Live Narration
          <span className={`sw ${liveNarration ? "on" : ""}`} onClick={onToggleNarration}/>
        </div>

        {/* zoom HUD */}
        <div className="zoom-hud">
          <button className="zh-btn" onClick={() => zoomBy(1/1.2)} title="Zoom out">−</button>
          <button className="zh-pct mono" onClick={fitView} title="Fit to view">{Math.round(view.s * 100)}%</button>
          <button className="zh-btn" onClick={() => zoomBy(1.2)} title="Zoom in">+</button>
        </div>
      </div>
    </div>
  );
}

window.Canvas = Canvas;
