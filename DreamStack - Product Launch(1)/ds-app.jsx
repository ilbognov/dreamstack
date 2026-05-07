/* DreamStudio — main app */

const { useState, useEffect, useMemo, useRef } = React;

function Rail({ tweaksOpen, setTweaksOpen }) {
  const items = [
    { id: "plus",    icon: DSIcons.Plus },
    { id: "search",  icon: DSIcons.Search },
    { id: "sidebar", icon: DSIcons.Sidebar },
    { id: "home",    icon: DSIcons.Home, active: true },
    { id: "branch",  icon: DSIcons.Branch },
  ];
  const bottom = [
    { id: "link",  icon: DSIcons.Link },
    { id: "help",  icon: DSIcons.Help },
    { id: "gear",  icon: DSIcons.Gear, onClick: () => setTweaksOpen(!tweaksOpen) },
  ];
  return (
    <div className="rail">
      <div className="rail-logo"><DSIcons.StackLogo/></div>
      {items.map(it => (
        <button key={it.id} className={`rail-btn ${it.active ? "active" : ""}`}>
          <it.icon/>
        </button>
      ))}
      <div className="rail-spacer"/>
      {bottom.map(it => (
        <button key={it.id} className="rail-btn" onClick={it.onClick}>
          <it.icon/>
        </button>
      ))}
    </div>
  );
}

function TopBar({ tab, setTab, ontoOpen, setOntoOpen, onBack, onPush }) {
  const [muted] = useState(false);
  return (
    <div className="topbar">
      <div className="tb-left">
        {onBack && (
          <button className="ds-home-back" onClick={onBack} title="Back to projects">
            <DSIcons.ChevDown size={12} style={{ transform: "rotate(90deg)" }}/>
            <span>Projects</span>
          </button>
        )}
        <div className="onto-pill">
          <span>{DSDATA.sessionMeta.sessionTitle}</span>
          <DSIcons.ChevDown/>
        </div>
        <div className="ur-group">
          <button><DSIcons.Undo/></button>
          <button><DSIcons.Redo/></button>
        </div>
      </div>

      <div className="tb-center">
        <div className="tabs">
          {DSDATA.tabs.map(t => (
            <button key={t}
                    className={`tab ${tab === t ? "on" : ""}`}
                    onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="tb-right">
        <span className="signal-icon" style={{ marginRight: 4 }}>
          <i/><i/><i/><i/>
        </span>
        <div className="avatar-cluster">
          <div className="av" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}/>
          <div className="av" style={{ background: "linear-gradient(135deg,#10B981,#3B82F6)" }}/>
          <span className="chev"><DSIcons.ChevDown/></span>
        </div>
        <button className="share-btn">
          <DSIcons.Share/> Share
        </button>
        <button className="ds-push-btn" onClick={onPush}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 7l9-4 9 4-9 4z"/><path d="M3 11l9 4 9-4"/>
          </svg>
          Push to DreamFactory
        </button>
      </div>
    </div>
  );
}

function BreadcrumbBar({ name }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0,
      height: 44,
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 14px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg)",
      zIndex: 9, pointerEvents: "none",
    }}>
      <div className="crumb">
        <span className="folder"><DSIcons.FolderSm size={13}/>External</span>
        <span className="sep">/</span>
        <span className="now">{name}</span>
        <span className="ellipsis"><DSIcons.Dots size={14}/></span>
      </div>
    </div>
  );
}

function BottomToolbar({ tool, setTool, narration, setNarration, startHuddle }) {
  return (
    <>
      <button className="huddle-btn">
        <span className="huddle-icon"><DSIcons.Huddle size={13}/></span>
        Start Huddle
      </button>

      <div className="foot">
        <div className="toolbar">
          <button className={`tool ${tool === "cursor" ? "active" : ""}`} onClick={() => setTool("cursor")}>
            <DSIcons.CursorArrow size={15}/>
          </button>
          <button className={`tool ${tool === "hand" ? "active" : ""}`} onClick={() => setTool("hand")}>
            <DSIcons.Hand/>
          </button>
          <button className={`tool ${tool === "connector" ? "active" : ""}`} onClick={() => setTool("connector")}>
            <DSIcons.Connector/>
          </button>
          <button className={`tool ${tool === "comment" ? "active" : ""}`} onClick={() => setTool("comment")}>
            <DSIcons.Comment/>
          </button>
          <button className={`tool ${tool === "sticky" ? "active" : ""}`} onClick={() => setTool("sticky")}>
            <DSIcons.Sticky/>
          </button>

          <span className="vr"/>

          <div className="toolbar-narration">
            <DSIcons.Narr/>
            <span>AI Narration</span>
            <button className={`toggle ${narration ? "on" : ""}`} onClick={() => setNarration(!narration)}/>
          </div>

          <span className="vr"/>

          <button className="tool"><DSIcons.Search/></button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
 * useDSBuildAnimation — scripted build-up for the Overview tab.
 *
 * Produces, over time:
 *   revealed:    { nodeId -> number of items visible }
 *   jackPos:     { x, y }        animated cursor position for Jack
 *   jamesPos:    { x, y }        animated cursor position for James
 *   jackAction:  "moving" | "typing" | null
 *   pulseTargets:{ nodeId -> index of item that JUST appeared }  (transient)
 *
 * The timeline is a declarative list of steps:
 *   - move:   drive Jack's cursor from its current pos to a target over `ms`
 *   - reveal: pop the next item of `node` into place (and show a typing
 *             affordance while it lands)
 *   - pause:  idle
 *
 * When it finishes it sets window.__dsBuildDone so subsequent tab-hops back
 * to Overview don't replay the build.
 *
 * `phase` is one of:
 *   - "waiting" — pre-walkthrough; returns an empty snapshot (Jack in corner)
 *   - "run"     — animate the build
 *   - "done"    — post-build static snapshot (used on tab-hops / refresh)
 * ------------------------------------------------------------------ */
function useDSBuildAnimation(phase) {
  // phase: "waiting" (pre-walkthrough, empty) | "run" (animate) | "done" (static complete)
  const allRevealed = useMemo(() => {
    const o = {};
    DSDATA.nodes.forEach(n => o[n.id] = (n.items || []).length);
    return o;
  }, []);

  // Static "done" snapshot.
  const doneSnapshot = {
    revealed: allRevealed,
    jackPos:  { x: 215, y: 475 },
    jamesPos: { x: 800, y: 418 },
    jackAction: null,
    pulseTargets: {},
  };

  // Pre-walkthrough snapshot: empty graph, Jack parked off-canvas.
  // Used when enabled=false BUT the build hasn't been played yet —
  // so the welcome tour stop sits over a clean, empty canvas.
  const waitingSnapshot = {
    revealed: { postgres: 0, auth: 0, spa: 0, api: 0 },
    jackPos:  { x: 60,  y: 640 },
    jamesPos: { x: 800, y: 418 },
    jackAction: null,
    pulseTargets: {},
  };

  const [state, setState] = useState(() => {
    if (phase === "done")    return doneSnapshot;
    if (phase === "waiting") return waitingSnapshot;
    return {
      revealed: { postgres: 0, auth: 0, spa: 0, api: 0 },
      jackPos:  { x: 60,  y: 640 },  // starts off in the corner
      jamesPos: { x: 800, y: 418 },
      jackAction: "moving",
      pulseTargets: {},
    };
  });

  // If phase flips from "waiting" → "run" after mount, re-seed the animation
  // start state so the effect below (gated on phase==="run") has something to
  // transition from.
  const prevPhaseRef = React.useRef(phase);
  React.useEffect(() => {
    if (prevPhaseRef.current !== "run" && phase === "run") {
      setState({
        revealed: { postgres: 0, auth: 0, spa: 0, api: 0 },
        jackPos:  { x: 60,  y: 640 },
        jamesPos: { x: 800, y: 418 },
        jackAction: "moving",
        pulseTargets: {},
      });
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // Ref mirror of jackPos so the rAF loop can read current position
  // synchronously without going through setState(prev => ...).
  const jackRef = React.useRef(state.jackPos);
  React.useEffect(() => { jackRef.current = state.jackPos; }, [state.jackPos]);

  useEffect(() => {
    if (phase !== "run") return;

    // Per-node "where Jack stands while typing": anchor to the top-left of
    // the first item cell, offset a bit so the arrow sits inside the node.
    const anchorFor = (nodeId, itemIdx) => {
      const n = DSDATA.nodes.find(x => x.id === nodeId);
      if (!n) return { x: 0, y: 0 };
      const rowH = 28;
      const titleH = 42;
      return {
        x: n.x + 18,
        y: n.y + titleH + itemIdx * rowH + 12,
      };
    };

    // Script: visit each node, reveal its items one-by-one.
    // Tuned to feel brisk but legible (~12s total build).
    const order = ["postgres", "auth", "spa", "api"];
    const steps = [];

    // Initial travel to postgres.
    steps.push({ kind: "move", to: anchorFor("postgres", 0), ms: 520 });

    order.forEach((nodeId, ni) => {
      const n = DSDATA.nodes.find(x => x.id === nodeId);
      const itemCount = (n.items || []).length;
      for (let i = 0; i < itemCount; i++) {
        // Jack "types" the item in — tiny hover at the row.
        steps.push({ kind: "move", to: anchorFor(nodeId, i), ms: 140 });
        steps.push({ kind: "reveal", node: nodeId, idx: i, ms: 280 });
      }
      // After finishing this node, jump to the next node's first row.
      if (ni < order.length - 1) {
        steps.push({ kind: "move", to: anchorFor(order[ni + 1], 0), ms: 560 });
      }
    });

    // Final flourish: settle Jack below React SPA (his original resting spot).
    steps.push({ kind: "move", to: { x: 215, y: 475 }, ms: 620 });

    // Drive the timeline. We use rAF for smooth position interp.
    let cancelled = false;
    let raf = 0;
    let timer = 0;

    const runStep = (stepIdx) => {
      if (cancelled || stepIdx >= steps.length) {
        // Animation complete. Latch final state and flag.
        if (!cancelled) {
          window.__dsBuildDone = true;
          setState(s => ({
            ...s,
            revealed: allRevealed,
            jackAction: null,
            pulseTargets: {},
          }));
        }
        return;
      }
      const step = steps[stepIdx];

      if (step.kind === "move") {
        setState(prev => ({ ...prev, jackAction: "moving" }));
        const from = { ...jackRef.current };
        const start = performance.now();
        const tick = (now) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / step.ms);
          const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; // easeInOutQuad
          const nx = from.x + (step.to.x - from.x) * ease;
          const ny = from.y + (step.to.y - from.y) * ease;
          jackRef.current = { x: nx, y: ny };
          setState(prev => ({ ...prev, jackPos: { x: nx, y: ny } }));
          if (t < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            // Subtle James drift for ambient presence.
            setState(prev => {
              const jitter = () => (Math.random() - 0.5) * 14;
              return { ...prev, jamesPos: { x: 960 + jitter(), y: 410 + jitter() } };
            });
            timer = setTimeout(() => runStep(stepIdx + 1), 30);
          }
        };
        raf = requestAnimationFrame(tick);
      } else if (step.kind === "reveal") {
        setState(prev => ({
          ...prev,
          revealed: { ...prev.revealed, [step.node]: step.idx + 1 },
          jackAction: "typing",
          pulseTargets: { ...prev.pulseTargets, [step.node]: step.idx },
        }));
        timer = setTimeout(() => {
          // Clear the pulse marker shortly after.
          setState(prev => {
            const pt = { ...prev.pulseTargets };
            delete pt[step.node];
            return { ...prev, pulseTargets: pt, jackAction: null };
          });
          runStep(stepIdx + 1);
        }, step.ms);
      } else {
        timer = setTimeout(() => runStep(stepIdx + 1), step.ms || 200);
      }
    };

    // Kick off after a brief entry beat so the user registers the "empty"
    // state before items start populating.
    timer = setTimeout(() => runStep(0), 420);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return state;
}


/* The Overview tab — canvas + nodes */
function OverviewView({ mode, aiTab, showAI }) {
  const [selectedId, setSelectedId] = useState("spa");
  const [nodeMode, setNodeMode] = useState("items"); // items | design
  const [designState, setDesignState] = useState("empty"); // empty | filled | linked
  const [itemsVariant, setItemsVariant] = useState("itemsAlt"); // when mode=transcript, show altered list

  const nodesById = useMemo(() => {
    const obj = {};
    DSDATA.nodes.forEach(n => obj[n.id] = n);
    return obj;
  }, []);

  const displayItemsMode = itemsVariant;

  // --- Build-up animation -------------------------------------------------
  // On first mount of Overview in this session, animate Jack's cursor visiting
  // each node and progressively revealing its items — so the audience sees
  // the architect actively *building* the system, rather than landing on a
  // fully-populated canvas. James sits passively; he observes.
  //
  // Once complete, we stash a flag so tab-hops don't replay the build.
  // The animation only *starts* once the user presses "Start the walkthrough"
  // on the welcome tour stop — before then we show a clean, empty canvas
  // so the welcome tip reads on a calm backdrop.
  //
  // Persistence:
  //   ds_walkthrough_started=1  → user has been past the welcome stop in this
  //                                session. On reload we skip the welcome-gate
  //                                and the animation (too long to replay each
  //                                refresh) and land on the complete graph.
  //   ds_tour_done=1           → tour was completed/skipped. Same treatment:
  //                                no welcome CTA is coming, so don't wait.
  const LS_WALK = "ds_walkthrough_started";
  const buildDone = typeof window !== "undefined" && window.__dsBuildDone;

  // Was the walkthrough-start event observed in THIS page load?
  const [liveStart, setLiveStart] = useState(false);

  // Did the walkthrough start in a *previous* page load (persisted)?
  const persistedStart = (() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem(LS_WALK) === "1"; } catch { return false; }
  })();
  const tourComplete = (() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("ds_tour_done") === "1"; } catch { return false; }
  })();

  useEffect(() => {
    const onStart = () => {
      window.__dsWalkthroughStarted = true;
      try { localStorage.setItem(LS_WALK, "1"); } catch {}
      setLiveStart(true);
    };
    window.addEventListener("ds:walkthrough-start", onStart);
    return () => window.removeEventListener("ds:walkthrough-start", onStart);
  }, []);

  let buildPhase;
  if (buildDone) buildPhase = "done";
  else if (liveStart) buildPhase = "run";
  else if (persistedStart || tourComplete) buildPhase = "done";
  else buildPhase = "waiting";

  const build = useDSBuildAnimation(buildPhase);
  const revealed = build.revealed;
  const jackPos  = build.jackPos;
  const jamesPos = build.jamesPos;
  const jackAction = build.jackAction;   // "moving" | "typing" | null
  // Pulse when a new item pops in (for a brief highlight on the last row).
  const pulseTargets = build.pulseTargets;

  return (
    <div className="canvas-area" style={{ position: "relative" }}>
      <div className={`canvas ${showAI ? "with-panel-right" : ""}`}>
        <div className="canvas-pan">
          <StudioLinks nodesById={nodesById} links={DSDATA.links}/>

          {DSDATA.nodes.map(node => {
            const sel = node.id === selectedId;
            if (sel && nodeMode === "design") {
              return (
                <React.Fragment key={node.id}>
                  <StudioNodeDesign
                    node={node}
                    selected={sel}
                    state={designState}
                    setState={setDesignState}
                    onSelect={setSelectedId}
                  />
                  <div style={{ position: "absolute",
                    left: node.x + node.w / 2,
                    top: node.y + 260,
                  }}>
                    <NodeActionTray
                      kind={nodeMode}
                      setKind={setNodeMode}
                    />
                  </div>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={node.id}>
                <StudioNode
                  node={node}
                  selected={sel}
                  mode={sel ? displayItemsMode : "items"}
                  onSelect={setSelectedId}
                  revealCount={revealed[node.id] ?? (buildDone ? Infinity : 0)}
                  pulseIdx={pulseTargets[node.id]}
                />
                {sel && (
                  <div style={{ position: "absolute",
                    left: node.x + node.w / 2,
                    top: node.y + (22 + (node.items.length * 28) + 30),
                  }}>
                    <NodeActionTray
                      kind={nodeMode}
                      setKind={setNodeMode}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {DSDATA.cursors.map(c => {
            // During the build-up we override the data positions with
            // animated positions so the cursors actually move.
            let pos = { x: c.x, y: c.y };
            let action = null;
            if (c.id === "jack"  && jackPos)  { pos = jackPos;  action = jackAction; }
            if (c.id === "james" && jamesPos) { pos = jamesPos; }
            return <StudioCursor key={c.id} c={{ ...c, x: pos.x, y: pos.y }} action={action}/>;
          })}
        </div>
      </div>
    </div>
  );
}

/* The Frontend tab */
function FrontendView() {
  const [active, setActive] = useState("design-prefs"); // design-prefs | sitemap | page
  const [activePage, setActivePage] = useState(null);

  return (
    <div className="canvas-area">
      <div className="canvas"/>
      <div className="front-shell">
        <FrontendSidebar
          active={active}
          setActive={setActive}
          activePage={activePage}
          setActivePage={setActivePage}
        />
        {active === "design-prefs" && <DesignPreferences/>}
        {active === "sitemap"      && <SiteMapView/>}
        {active === "page"         && <PageDetail pageId={activePage || "home"}/>}
      </div>
    </div>
  );
}

/* Empty-state tab (Backend / Service / Database) */
function EmptyTabView({ name }) {
  return (
    <div className="canvas-area">
      <div className="canvas"/>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 10,
        color: "var(--ink-3)",
        fontSize: 13,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: "var(--bg-2)", border: "1px solid var(--border-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <DSIcons.StackLogo size={22}/>
        </div>
        <div style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 500 }}>{name} canvas</div>
        <div>Placeholder — this tab will render its own ontology.</div>
      </div>
    </div>
  );
}

/* Tweaks */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "ai_panel_visible": true,
  "ai_tab": "transcript",
  "muted": false,
  "tool": "cursor",
  "narration": true,
  "active_tab": "Overview"
}/*EDITMODE-END*/;

function DSTweaks({ state, setState, onClose }) {
  return (
    <div className="ds-tweaks">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h4>Tweaks</h4>
        <button style={{ color: "var(--ink-3)" }} onClick={onClose}><DSIcons.X size={14}/></button>
      </div>
      <div className="tw-row">
        <span>Active tab</span>
        <select value={state.active_tab} onChange={e => setState({ ...state, active_tab: e.target.value })}>
          {DSDATA.tabs.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="tw-row">
        <span>AI panel</span>
        <button className={`toggle ${state.ai_panel_visible ? "on" : ""}`}
                onClick={() => setState({ ...state, ai_panel_visible: !state.ai_panel_visible })}/>
      </div>
      <div className="tw-row">
        <span>AI tab</span>
        <select value={state.ai_tab} onChange={e => setState({ ...state, ai_tab: e.target.value })}>
          <option value="transcript">Transcript</option>
          <option value="react-spa">React SPA</option>
        </select>
      </div>
      <div className="tw-row">
        <span>Muted</span>
        <button className={`toggle ${state.muted ? "on" : ""}`}
                onClick={() => setState({ ...state, muted: !state.muted })}/>
      </div>
      <div className="tw-row">
        <span>AI Narration</span>
        <button className={`toggle ${state.narration ? "on" : ""}`}
                onClick={() => setState({ ...state, narration: !state.narration })}/>
      </div>
      <div className="tw-row">
        <span>Tool</span>
        <select value={state.tool} onChange={e => setState({ ...state, tool: e.target.value })}>
          <option value="cursor">Cursor</option>
          <option value="hand">Hand</option>
          <option value="connector">Connector</option>
          <option value="comment">Comment</option>
          <option value="sticky">Sticky</option>
        </select>
      </div>
    </div>
  );
}

/* ---- App root ---- */
function App() {
  // Route: "home" | "session". On first load, always land on home so the
  // engineer sees the captured DreamCatcher sessions before diving in.
  // Demo mode: intentionally ignore any saved route — every reload opens on
  // the Projects dashboard so the tour can run end-to-end from the top.
  const [route, setRoute] = useState("home");
  useEffect(() => { localStorage.setItem("ds_route", route); }, [route]);

  // Tour can request a route change (e.g. Back from the welcome stop
  // returns to the homepage so the user can re-see the intro).
  useEffect(() => {
    const handler = (e) => {
      const r = e && e.detail && e.detail.route;
      if (r === "home" || r === "session") setRoute(r);
    };
    window.addEventListener("ds-tour-set-route", handler);
    return () => window.removeEventListener("ds-tour-set-route", handler);
  }, []);

  // Push modal open state.
  const [pushOpen, setPushOpen] = useState(false);

  // Tour: fire on every fresh load (demo mode). Skip/Finish still dismisses
  // it for the rest of the current session; only a reload replays it.
  const [tourOn, setTourOn] = useState(true);

  // Allow the tour to drive tab changes.
  useEffect(() => {
    const onSetTab = (e) => {
      const t = e.detail && e.detail.tab;
      if (t) setTweakState(s => ({ ...s, active_tab: t }));
    };
    window.addEventListener("ds-tour-set-tab", onSetTab);
    return () => window.removeEventListener("ds-tour-set-tab", onSetTab);
  }, []);

  const [tweakState, setTweakState] = useState(() => {
    const saved = localStorage.getItem("ds_tweaks");
    return saved ? { ...TWEAK_DEFAULTS, ...JSON.parse(saved) } : { ...TWEAK_DEFAULTS };
  });
  useEffect(() => {
    localStorage.setItem("ds_tweaks", JSON.stringify(tweakState));
  }, [tweakState]);

  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const tab = tweakState.active_tab;
  const setTab = (t) => setTweakState(s => ({ ...s, active_tab: t }));

  // edit-mode plumbing
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setEditMode(true);
      if (d.type === "__deactivate_edit_mode") setEditMode(false);
      if (d.type === "__edit_mode_set_keys" && d.edits) setTweakState(s => ({ ...s, ...d.edits }));
    };
    window.addEventListener("message", onMsg);
    window.parent && window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const showAI = tweakState.ai_panel_visible;

  // --- HOME route ---
  if (route === "home") {
    return (
      <div className="ds-app ds-app-home" data-screen-label="00 Projects">
        <HomeView
          onOpenProject={(p) => {
            if (p.id === "claims-intake") {
              // Reset animation state so the welcome-CTA plays a fresh
              // build-up. The tour's breathe window (in ds-tour.jsx) holds
              // the overlay off briefly after arrival so the user gets a
              // beat to see the canvas before the tooltip pops in, then
              // "Start the walkthrough" fires the animation.
              window.__dsBuildDone = false;
              window.__dsWalkthroughStarted = false;
              try { localStorage.removeItem("ds_walkthrough_started"); } catch {}
              setRoute("session");
              setTweakState(s => ({ ...s, active_tab: "Overview" }));
              if (localStorage.getItem("ds_tour_done") !== "1") setTourOn(true);
            }
          }}
        />
        {tourOn && (
          <DSTour
            route="home"
            onFinish={() => {
              localStorage.setItem("ds_tour_done", "1");
              setTourOn(false);
            }}
            onPushStep={() => setPushOpen(true)}
          />
        )}
        {editMode && (
          <DSTweaks
            state={tweakState}
            setState={(s) => {
              setTweakState(s);
              window.parent && window.parent.postMessage({ type: "__edit_mode_set_keys", edits: s }, "*");
            }}
            onClose={() => setEditMode(false)}
          />
        )}
      </div>
    );
  }

  // --- SESSION route ---
  return (
    <div className="ds-app">
      <Rail tweaksOpen={tweaksOpen} setTweaksOpen={setTweaksOpen}/>

      <div className="main" data-screen-label={tab}>
        <TopBar
          tab={tab}
          setTab={setTab}
          ontoOpen={tab === "Overview" ? "full" : "short"}
          onBack={() => setRoute("home")}
          onPush={() => setPushOpen(true)}
        />

        {tab === "Overview" && (
          <OverviewView mode={"transcript"} showAI={showAI}/>
        )}
        {tab === "Backend"  && <EmptyTabView name="Backend"/>}
        {tab === "Service"  && <EmptyTabView name="Service"/>}
        {tab === "Database" && <EmptyTabView name="Database"/>}

        {tab === "Overview" && showAI && (
          <AIPanel
            muted={tweakState.muted}
            setMuted={(m) => setTweakState(s => ({ ...s, muted: m }))}
            activeTab={tweakState.ai_tab}
            setActiveTab={(t) => setTweakState(s => ({ ...s, ai_tab: t }))}
            onClose={() => setTweakState(s => ({ ...s, ai_panel_visible: false }))}
            showNodeDetail={true}
          />
        )}

        <BottomToolbar
          tool={tweakState.tool}
          setTool={(t) => setTweakState(s => ({ ...s, tool: t }))}
          narration={tweakState.narration}
          setNarration={(n) => setTweakState(s => ({ ...s, narration: n }))}
        />

        {editMode && (
          <DSTweaks
            state={tweakState}
            setState={(s) => {
              setTweakState(s);
              window.parent && window.parent.postMessage({
                type: "__edit_mode_set_keys",
                edits: s,
              }, "*");
            }}
            onClose={() => setEditMode(false)}
          />
        )}

        {tourOn && (
          <DSTour
            route="session"
            onFinish={() => {
              localStorage.setItem("ds_tour_done", "1");
              setTourOn(false);
            }}
            onPushStep={() => setPushOpen(true)}
          />
        )}

        <PushToDFModal
          open={pushOpen}
          onClose={() => setPushOpen(false)}
          onDone={() => {
            setPushOpen(false);
            // Hand off via the shared 3-stage interstitial so the
            // pipeline (Studio → ▷ Factory) is unmistakeable.
            window.location.href = "StageTransition.html?from=studio&to=factory";
          }}
        />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
