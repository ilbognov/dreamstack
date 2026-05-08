// ============================================================
// Main DreamCatcher app
// ============================================================

const { useState, useEffect, useRef, useMemo, useCallback } = React;

function useTweaks() {
  const [values, setValues] = useState(() => ({ ...window.TWEAK_DEFAULTS }));
  // apply css vars + attrs live
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", values.accent);
    // simple derived:
    document.documentElement.style.setProperty("--accent-50", values.accent + "22");
    document.documentElement.style.setProperty("--accent-600", values.accent);
    document.documentElement.dataset.theme = values.dark ? "dark" : "light";
    document.documentElement.dataset.density = values.density;
  }, [values]);
  return [values, setValues];
}

function App() {
  const [tweaks, setTweaks] = useTweaks();
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // --- Route & role ---
  const _devRouteOverride = (() => {
    try {
      const h = (location.hash || '') + ' ' + (location.search || '');
      const m = h.match(/route=([\w-]+)/);
      return m ? m[1] : null;
    } catch(e){ return null; }
  })();
  const _devCursorOverride = (() => {
    try {
      const h = (location.hash || '') + ' ' + (location.search || '');
      const m = h.match(/cursor=(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : null;
    } catch(e){ return null; }
  })();
  const [route, setRoute] = useState(() => _devRouteOverride || "device-check");
  const [role,  setRole]  = useState(() => window.__dcRole || "architect");

  // Smooth fade transition when the architect taps Start Dreaming. The
  // overlay is mounted while we briefly fade through black between the
  // prelude call view and the session canvas; ease-in-out for both halves.
  const [startFade, setStartFade] = useState(false);
  const [startFadeMounted, setStartFadeMounted] = useState(false);
  const [sessionEntering, setSessionEntering] = useState(false);
  const [sessionAutoZoom, setSessionAutoZoom] = useState(false);
  const [sessionZoomOut, setSessionZoomOut] = useState(false);
  const [sessionZoomTarget, setSessionZoomTarget] = useState({ x: -22, y: 40 });
  useEffect(() => {
    let last = null;
    const check = setInterval(() => {
      const id = window.__dcTourActiveStopId;
      if (id !== last) {
        last = id;
        if (id === "transcript" || id === "questions-tab") {
          setSessionZoomOut(false);
          setSessionZoomTarget({ x: -22, y: 40 }); // sidebar top-right
          setTimeout(() => setSessionAutoZoom(true), 2000);
        } else if (id === "first-node") {
          // Auto-zoom disabled for stop 02 — keep the canvas at native scale.
          setSessionZoomOut(false);
          setSessionAutoZoom(false);
        } else if (sessionAutoZoom) {
          // Tour moved to a different stop — zoom back out
          setSessionAutoZoom(false);
          setSessionZoomOut(true);
          setTimeout(() => setSessionZoomOut(false), 900);
        }
      }
    }, 200);
    return () => clearInterval(check);
  }, [sessionAutoZoom]);

  // playback
  const [cursor, setCursor] = useState(_devCursorOverride ?? 0); // timeline time in seconds
  const [started, setStarted] = useState(() => _devRouteOverride === "session");
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (started) setPlaying(tweaks.autoplay);
  }, [tweaks.autoplay, started]);

  // Welcome → device-check wiring
  useEffect(() => {
    const onPick = (e) => {
      const r = e.detail?.role || "architect";
      setRole(r);
      setRoute("device-check");
    };
    window.addEventListener('dc:welcome-pick', onPick);
    return () => window.removeEventListener('dc:welcome-pick', onPick);
  }, []);

  // Route side effects
  const onJoinDevice = () => {
    setRoute("joining");
    setTimeout(() => {
      // Land on the call prelude first — both participants are on the call,
      // but the tour / canvas-driven session doesn't begin until the
      // architect taps Start Dreaming.
      setRoute("prelude");
    }, 1000);
  };
  const onStartDreaming = () => {
    // Smooth fade + slide-up transition into the session canvas.
    setStartFadeMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setStartFade(true));
    });
    setTimeout(() => {
      setRoute("session");
      setStarted(true);
      // Mark session as just-mounted so it slides up from below; release
      // on the next frame so the transform animates from bottom to rest.
      setSessionEntering(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStartFade(false);
          setSessionEntering(false);
        });
      });
      setTimeout(() => setStartFadeMounted(false), 700);
    }, 550);
  };
  const onHangup = () => {
    if (route === "session") {
      // In-session: trigger the handoff morph animation
      window.__dcStartHandoff?.();
    } else {
      setRoute("done");
    }
  };
  const onExitWithoutSaving = () => {
    // reset to welcome
    setRoute("device-check");
    setStarted(false);
    setCursor(0);
    setMessages([]); setAsks([]); setNodes([]); setPending([]); setEdges([]);
    setBadges({}); appliedIdxRef.current = 0;
    const w = document.getElementById('welcome');
    if (w) { w.style.display = ''; w.classList.remove('dc-hide'); }
  };
  const onPushToStudio = () => { window.location.href = "DreamStudio.html"; };

  // State derived from timeline events up to cursor
  const [messages, setMessages] = useState([]); // {id, who, text, shownText, time, streaming}
  const [asks, setAsks] = useState([]);          // {id, nodeId, question}
  const [nodes, setNodes] = useState([]);        // accepted nodes
  const [pending, setPending] = useState([]);    // pending ghost nodes
  const [edges, setEdges] = useState([]);        // {from, to}
  const [badges, setBadges] = useState({});      // nodeId -> count

  // UI state
  const [tab, setTab] = useState("transcript");
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [expandedNode, setExpandedNode] = useState(null);
  const [liveNarration, setLiveNarration] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [recording, setRecording] = useState(true);
  // The conversation rail (Questions / Transcript / Attendees) docks over the
  // top-right of the canvas as a floating panel. The call-bar chat icon
  // toggles it open/closed so the architect can reclaim full canvas width
  // mid-session and bring the rail back without losing transcript state.
  const [chatOpen, setChatOpen] = useState(true);
  const [aiOn, setAiOn] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [visibleTypes, setVisibleTypes] = useState({ process: true, subprocess: true, role: true, system: true });
  // Handoff animation state (DreamCatcher → DreamStudio morph)
  const [handoffPhase, setHandoffPhase] = useState(null);
  // null | "strip-ui" | "morph-nodes" | "new-env" | "project-card" | "done"

  // Playback loop — ref-based so effect runs only once
  const playingRef = useRef(playing);
  const speedRef = useRef(tweaks.speed);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = tweaks.speed; }, [tweaks.speed]);

  useEffect(() => {
    let raf, last = null, stopped = false;
    const step = (now) => {
      if (stopped) return;
      if (last == null) last = now;
      const dt = (now - last) / 1000;
      last = now;
      if (playingRef.current) {
        setCursor(c => {
          const end = window.TIMELINE[window.TIMELINE.length - 1].t + 3;
          return Math.min(c + dt * speedRef.current, end);
        });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }, []);

  const appliedIdxRef = useRef(0);

  // Stream text out character-by-character within the active message
  const [streamProgress, setStreamProgress] = useState({}); // msgId -> chars shown

  // Apply events up to current cursor
  useEffect(() => {
    // If cursor moved backward (replay), reset state from scratch
    const currentMaxT = messages.length ? Math.max(
      ...messages.map(m => m._t ?? 0),
      ...asks.map(a => a._t ?? 0),
      ...nodes.map(n => n._t ?? 0),
      ...pending.map(n => n._t ?? 0),
    ) : 0;

    if (cursor < currentMaxT - 0.5) {
      // Full reset
      setMessages([]); setAsks([]); setNodes([]); setPending([]); setEdges([]);
      setBadges({}); setStreamProgress({});
      appliedIdxRef.current = 0;
      return;
    }

    // Apply new events beyond appliedIdxRef
    let i = appliedIdxRef.current;
    while (i < TIMELINE.length && TIMELINE[i].t <= cursor) {
      const ev = TIMELINE[i];
      applyEvent(ev);
      i++;
    }
    appliedIdxRef.current = i;
  }, [cursor]);

  // Stream-in progress updater for the latest streaming message
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(ms => {
        if (!ms.length) return ms;
        const last = ms[ms.length - 1];
        if (!last.streaming) return ms;
        const full = last.text;
        const shown = last.shownText ?? "";
        if (shown.length >= full.length) {
          const copy = [...ms];
          copy[copy.length - 1] = { ...last, shownText: full, streaming: false };
          return copy;
        }
        const nextLen = Math.min(full.length, shown.length + Math.max(1, Math.floor(3 * tweaks.speed)));
        const copy = [...ms];
        copy[copy.length - 1] = { ...last, shownText: full.slice(0, nextLen) };
        return copy;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [tweaks.speed]);

  function applyEvent(ev) {
    if (ev.kind === "msg") {
      const id = `m-${ev.t}-${Math.random().toString(36).slice(2,6)}`;
      // If we're applying a message whose timestamp is well behind the
      // current playback cursor (e.g. after a jump / replay / dev route),
      // materialize it fully instead of streaming — otherwise every queued
      // message except the last sits at empty shownText forever (the stream
      // interval only fills the most recent streaming message).
      const cursorNow = (typeof cursor === "number") ? cursor : 0;
      const isBacklog = (ev.t ?? 0) < cursorNow - 1.5;
      setMessages(ms => [...ms, {
        id, who: ev.who, text: ev.text,
        shownText: isBacklog ? ev.text : "",
        time: timestampFor(ev.t), streaming: !isBacklog, _t: ev.t
      }]);
    }
    else if (ev.kind === "ask") {
      const askId = ev.askId || `a-${ev.t}-${Math.random().toString(36).slice(2,5)}`;
      setAsks(a => [...a, { id: askId, nodeId: ev.nodeId, question: ev.question, status: "pending", _t: ev.t }]);
    }
    else if (ev.kind === "ask-resolve") {
      setAsks(a => a.map(x => x.id === ev.askId ? { ...x, status: "resolved", resolvedAt: Date.now() } : x));
      // increment badge on that ask's node
      setAsks(curr => {
        const ask = curr.find(x => x.id === ev.askId);
        if (ask) {
          setBadges(b => ({ ...b, [ask.nodeId]: (b[ask.nodeId] || 0) + 1 }));
        }
        return curr;
      });
    }
    else if (ev.kind === "node-pending") {
      const n = { id: ev.id, type: ev.type, title: ev.title, x: ev.x, y: ev.y, parents: ev.parents || [], _t: ev.t };
      setPending(p => [...p, n]);
    }
    else if (ev.kind === "node-accept") {
      setPending(p => {
        const match = p.find(n => n.id === ev.id);
        if (!match) return p;
        setNodes(nds => [...nds, match]);
        // create edges to parents
        if (match.parents?.length) {
          setEdges(es => [...es, ...match.parents.map(pid => ({ from: pid, to: match.id }))]);
        }
        return p.filter(n => n.id !== ev.id);
      });
    }
    else if (ev.kind === "qbadge") {
      setBadges(b => ({ ...b, [ev.id]: ev.count }));
    }
  }

  // Accept / reject pending from the canvas — when user clicks
  const acceptNode = (id) => {
    applyEvent({ kind: "node-accept", id });
    // Resume playback immediately so the session continues without
    // the presenter having to manually unpause after accepting a node.
    setPlaying(true);
  };
  const rejectNode = (id) => {
    setPending(p => p.filter(n => n.id !== id));
  };

  // Company user: auto-accept pending nodes after a short "architect reviewing"
  // beat. The company user never sees pending/ghost state — the architect has
  // already gated nodes server-side in this demo. We do it via a watcher effect
  // so timing is independent of the main playback loop.
  useEffect(() => {
    if (role !== "company" || !pending.length) return;
    const timers = pending.map(n =>
      setTimeout(() => applyEvent({ kind: "node-accept", id: n.id }), 900)
    );
    return () => timers.forEach(clearTimeout);
  }, [pending, role]);

  // --- Click-to-trigger scripted Q&A ---------------------------------------
  // When the user clicks a node with outstanding asks, we want the demo to
  // *run* the answering conversation for those asks: architect forwards the
  // question, James replies, ask resolves, pause, next. We reuse the scripted
  // answers already in TIMELINE so behavior matches the auto-playback path.
  const qaRunningRef = useRef(false);
  const qaTimersRef = useRef([]);
  const clearQATimers = () => { qaTimersRef.current.forEach(clearTimeout); qaTimersRef.current = []; };
  useEffect(() => () => clearQATimers(), []);

  function runNodeQA(nodeId) {
    if (qaRunningRef.current) return; // one at a time
    const pendingAsks = asks.filter(a => a.nodeId === nodeId && a.status === "pending");
    if (!pendingAsks.length) return;

    // Pause the main timeline so our injected conversation is undisturbed.
    setPlaying(false);
    qaRunningRef.current = true;
    setExpandedNode(nodeId);
    setExpandedOpenedAt(Date.now());
    setExpandedMode("live");

    // For each pending ask, look up its scripted msgs/resolve in TIMELINE.
    // Pattern: ask(t=A) → msg[you](A+x) → msg[james](A+y) → ask-resolve(A+z)
    // We fire them as immediate events with human-readable pauses.
    let delay = 0;
    const MSG_GAP = 900;      // architect message → james message
    const ANSWER_READ = 2600; // james message → ask-resolve (time to read)
    const BETWEEN_ASKS = 1400;

    const push = (fn, ms) => {
      delay += ms;
      qaTimersRef.current.push(setTimeout(fn, delay));
    };

    pendingAsks.forEach((ask, i) => {
      // Find the scripted architect question + james answer in the raw TIMELINE
      // for this askId. They appear between the ask and the matching ask-resolve.
      const tl = window.TIMELINE || TIMELINE;
      const askIdx = tl.findIndex(e => e.kind === "ask" && e.askId === ask.id);
      const resolveIdx = tl.findIndex(e => e.kind === "ask-resolve" && e.askId === ask.id);
      let youMsg = null, jamesMsg = null;
      if (askIdx >= 0 && resolveIdx > askIdx) {
        for (let j = askIdx + 1; j < resolveIdx; j++) {
          const ev = tl[j];
          if (ev.kind !== "msg") continue;
          if (ev.who === "you" && !youMsg) youMsg = ev;
          else if (ev.who === "james" && !jamesMsg) jamesMsg = ev;
        }
      }
      // Fallback copy if the scripted messages aren't found.
      if (!youMsg)   youMsg   = { who: "you",   text: ask.question };
      if (!jamesMsg) jamesMsg = { who: "james", text: "Let me walk you through that." };

      if (i > 0) delay += BETWEEN_ASKS;

      // Architect forwards the question
      push(() => {
        applyEvent({ kind: "msg", who: "you", text: youMsg.text, t: 0 });
      }, 0);
      // James answers
      push(() => {
        applyEvent({ kind: "msg", who: "james", text: jamesMsg.text, t: 0 });
      }, MSG_GAP);
      // Mark the ask resolved
      push(() => {
        applyEvent({ kind: "ask-resolve", askId: ask.id });
      }, ANSWER_READ);
    });

    // After all asks answered, if the node is still pending, accept it.
    push(() => {
      setPending(p => {
        if (p.find(n => n.id === nodeId)) {
          applyEvent({ kind: "node-accept", id: nodeId });
        }
        return p;
      });
      qaRunningRef.current = false;
      // Fast-forward the main cursor past the scripted block for this node so
      // the timeline resume doesn't re-fire the same messages.
      const tl = window.TIMELINE || TIMELINE;
      const lastResolveT = Math.max(
        ...pendingAsks.map(a => {
          const ev = tl.find(e => e.kind === "ask-resolve" && e.askId === a.id);
          return ev ? ev.t : 0;
        })
      );
      if (lastResolveT > 0) {
        setCursor(c => Math.max(c, lastResolveT + 0.5));
        // Advance appliedIdx so events we just manually fired aren't reapplied.
        appliedIdxRef.current = Math.max(
          appliedIdxRef.current,
          tl.findIndex(e => e.t > lastResolveT + 0.4)
        );
      }
    }, ANSWER_READ);
  }

  // Click a node -> if it has pending asks, run the scripted Q&A.
  // If it has only resolved asks, toggle the history panel.
  // If it has no asks at all, do nothing (node is non-interactive).
  const onNodeClick = (id) => {
    const nodeAsks = asks.filter(a => a.nodeId === id);
    if (nodeAsks.length === 0) return;
    const hasPending = nodeAsks.some(a => a.status === "pending");
    setActiveNodeId(prev => prev === id ? null : id);
    setTab("questions");
    if (hasPending) {
      runNodeQA(id);
    } else {
      // History mode toggle
      setExpandedNode(prev => {
        if (prev === id) return null;
        setExpandedMode("history");
        setExpandedOpenedAt(Date.now());
        return id;
      });
    }
  };
  // Click a chip in the sidebar -> highlight node
  const onChipClick = (nodeId) => {
    setActiveNodeId(nodeId);
    // scroll node into view by briefly flashing
  };

  const [expandedOpenedAt, setExpandedOpenedAt] = useState(0);
  const [expandedMode, setExpandedMode] = useState("live"); // "live" | "history"
  // Expand / collapse a node's question panel.
  // If node has outstanding asks → live mode (only pending + just-answered).
  // If node has only resolved asks → history mode (show all answered).
  // If node has no asks at all → do nothing.
  const onToggleExpand = (id) => {
    setExpandedNode(prev => {
      if (prev === id) return null;
      const nodeAsks = asks.filter(a => a.nodeId === id);
      if (nodeAsks.length === 0) return prev;
      const hasPending = nodeAsks.some(a => a.status === "pending");
      setExpandedMode(hasPending ? "live" : "history");
      setExpandedOpenedAt(Date.now());
      return id;
    });
  };

  // Tour helpers: force a node's question panel open (used by the
  // "It knows what it doesn't know" stop to surface the specific asks).
  const openNodeQuestions = (id) => {
    const nodeAsks = asks.filter(a => a.nodeId === id);
    if (nodeAsks.length === 0) return;
    const hasPending = nodeAsks.some(a => a.status === "pending");
    setExpandedMode(hasPending ? "live" : "history");
    setExpandedOpenedAt(Date.now());
    setExpandedNode(id);
  };
  const closeNodeQuestions = () => setExpandedNode(null);

  // --- Panel auto-open ------------------------------------------------------
  // Driven by the tour (stop 3) rather than on the first
  // pending ask, so the audience can watch several nodes appear on canvas
  // before the questions UI gets introduced.

  // toggle legend
  const toggleType = (t) => setVisibleTypes(v => ({ ...v, [t]: !v[t] }));

  // Node index
  const nodesById = useMemo(() => {
    const all = [...nodes, ...pending];
    return Object.fromEntries(all.map(n => [n.id, n]));
  }, [nodes, pending]);

  // Questions for expanded node — outstanding asks + a brief "just-answered"
  // celebration window (1800ms) so users see the check-off animation before
  // the card disappears. Answered asks older than that are hidden from the
  // panel entirely (they live on the node itself via the q-badge).
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    const anyRecent = asks.some(a => a.status === "resolved" && a.resolvedAt && Date.now() - a.resolvedAt < 2000);
    if (!anyRecent) return;
    const t = setInterval(() => setNowTick(n => n + 1), 200);
    return () => clearInterval(t);
  }, [asks]);

  const questionsForExpanded = useMemo(() => {
    if (!expandedNode) return [];
    const now = Date.now();
    const nodeAsks = asks.filter(a => a.nodeId === expandedNode);
    if (expandedMode === "history") {
      // Show all resolved asks for this node as a read-only history.
      return nodeAsks
        .filter(a => a.status === "resolved")
        .map(a => ({ id: a.id, question: a.question, status: "resolved", answer: a.answer, historical: true }));
    }
    // LIVE mode (demo): show ALL asks for this node — pending and resolved.
    // When an answer arrives, the item stays visible and flips to a "ticked off"
    // state in place. This gives the audience a clear moment of "question
    // answered" without the question disappearing.
    return nodeAsks
      .filter(a => {
        // Include every pending ask, and every resolved ask that was opened
        // during this panel session (so history panels still look clean
        // but the live panel keeps answered questions in view).
        if (a.status === "pending") return true;
        if (a.status === "resolved") return true;
        return false;
      })
      .sort((a, b) => {
        // Pending first, then resolved (most-recent resolved at the bottom).
        if (a.status === b.status) {
          if (a.status === "resolved") return (a.resolvedAt || 0) - (b.resolvedAt || 0);
          return 0;
        }
        return a.status === "pending" ? -1 : 1;
      })
      .map(a => ({ id: a.id, question: a.question, status: a.status, answer: a.answer }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedNode, expandedOpenedAt, expandedMode, asks, nowTick]);

  // Auto-close the panel if the node has no asks at all (shouldn't happen
  // once we've opened it). History panels stay until the user dismisses.
  useEffect(() => {
    if (!expandedNode) return;
    if (expandedMode === "history") return;
    if (questionsForExpanded.length === 0) {
      const t = setTimeout(() => setExpandedNode(null), 600);
      return () => clearTimeout(t);
    }
  }, [expandedNode, expandedMode, questionsForExpanded.length]);

  // nodeId -> count of outstanding (unanswered) asks.
  // Shown on nodes in architect view so they can spot which nodes need more detail.
  const outstanding = useMemo(() => {
    const m = {};
    for (const a of asks) {
      if (a.status === "pending") m[a.nodeId] = (m[a.nodeId] || 0) + 1;
    }
    return m;
  }, [asks]);

  // nodeId -> {total, resolved}. Drives the architect-only "N/M answered"
  // badge and the green-check-when-done state. Kept as one memo so the
  // badge always renders consistent numbers (e.g. total can't lag resolved).
  const askCounts = useMemo(() => {
    const byNode = {};
    for (const a of asks) {
      if (!byNode[a.nodeId]) byNode[a.nodeId] = { total: 0, resolved: 0 };
      byNode[a.nodeId].total++;
      if (a.status === "resolved") byNode[a.nodeId].resolved++;
    }
    return byNode;
  }, [asks]);

  // Convenience: nodeId -> true if every ask on this node is resolved.
  const allAnswered = useMemo(() => {
    const out = {};
    for (const [id, c] of Object.entries(askCounts)) {
      if (c.total > 0 && c.resolved === c.total) out[id] = true;
    }
    return out;
  }, [askCounts]);

  // nodeId -> true if node has (or had) any asks. Used to decide if the node
  // is clickable — nodes that never had questions aren't interactive.
  const nodeHasAsks = useMemo(() => {
    const out = {};
    for (const a of asks) out[a.nodeId] = true;
    return out;
  }, [asks]);

  // Recording seconds: real wall-clock timer that starts as soon as the
  // architect lands on the call (joining/prelude/session) and ticks
  // continuously regardless of canvas playback state. Persists across
  // route transitions within the call.
  const [recSec, setRecSec] = React.useState(0);
  const recStartRef = React.useRef(null);
  React.useEffect(() => {
    const inCall = route === "joining" || route === "prelude" || route === "session";
    if (!inCall) {
      recStartRef.current = null;
      setRecSec(0);
      return;
    }
    if (recStartRef.current == null) {
      recStartRef.current = Date.now();
    }
    const tick = () => {
      setRecSec(Math.max(0, Math.floor((Date.now() - recStartRef.current) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [route]);

  // Replay
  const replay = () => {
    setCursor(0);
    setMessages([]); setAsks([]); setNodes([]); setPending([]); setEdges([]);
    setBadges({}); setStreamProgress({});
    setExpandedNode(null); setActiveNodeId(null);
    appliedIdxRef.current = 0;
    setPlaying(true);
  };

  // Handoff animation — triggered by hangup button.
  // Phases: strip-ui → morph-nodes → fall-out → (navigate w/ ease-in)
  useEffect(() => {
    window.__dcStartHandoff = () => {
      setPlaying(false);
      // Phase 1: strip UI (fade out everything except canvas nodes)
      setHandoffPhase("strip-ui");
      // Phase 2: morph nodes into solid colored squares
      setTimeout(() => setHandoffPhase("morph-nodes"), 1400);
      // Phase 3: nodes fall off the bottom of the screen (staggered)
      setTimeout(() => setHandoffPhase("fall-out"), 3200);
      // Phase 4: navigate to handoff-preview which fades itself in.
      // Append ?from=handoff so the destination knows to play its
      // ease-in entry animation.
      setTimeout(() => {
        window.location.href = "handoff-preview.html?from=handoff";
      }, 5400);
    };

    // Quick-test shortcut: ?handoff=1 jumps straight into the morph
    // animation as soon as the canvas mounts.  Use ?handoff=skip to
    // bypass the animation entirely and land on handoff-preview.html.
    try {
      const qs = new URLSearchParams(window.location.search);
      const mode = qs.get("handoff");
      if (mode === "skip") {
        window.location.replace("handoff-preview.html");
      } else if (mode === "1" || mode === "true") {
        // Wait for the canvas/tour to finish mounting, then fire.
        setTimeout(() => window.__dcStartHandoff?.(), 600);
      }
      // Quick-test shortcut: ?step=N jumps straight into tour stop N
      // (1-indexed) once the tour has mounted.
      const stepRaw = qs.get("step");
      if (stepRaw) {
        const stepN = parseInt(stepRaw, 10);
        if (Number.isFinite(stepN) && stepN > 0) {
          setTimeout(() => window.__dcTourJumpToStep?.(stepN), 800);
        }
      }
    } catch (e) { /* no-op */ }

    return () => { delete window.__dcStartHandoff; };
  }, []);

  // Edit-mode announce
  useEffect(() => {
    const onMsg = (e) => {      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setTweaksOpen(true);
      if (d.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch(e) {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const sessionEnded = cursor >= TIMELINE[TIMELINE.length - 1].t + 2;

  // Reusable tweaks launcher used across overlay routes
  const tweaksUI = (
    <>
      {!tweaksOpen && (
        <button className="tweaks-fab" onClick={() => setTweaksOpen(true)} aria-label="Tweaks" title="Tweaks">
          <Icons.Sliders/>
        </button>
      )}
      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)}
                   values={tweaks} onChange={setTweaks}
                   role={role} onRoleChange={setRole}/>
    </>
  );

  // Smooth fade overlay used during the Start Dreaming transition.
  // Eases through black between the prelude call view and the session canvas.
  const startFadeUI = startFadeMounted ? (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#000",
        opacity: startFade ? 1 : 0,
        transition: "opacity 550ms cubic-bezier(.4,0,.2,1)",
        pointerEvents: startFade ? "auto" : "none",
        zIndex: 99999,
      }}
      aria-hidden="true"
    />
  ) : null;

  // Session-done overlay — different per role
  if (route === "done") {
    return (
      <>
        {role === "company"
          ? <CompanyCallEnded onExit={onExitWithoutSaving}/>
          : <SessionDone onPush={onPushToStudio} onExit={onExitWithoutSaving}/>}
        {tweaksUI}
      </>
    );
  }

  // Device-check (before session starts)
  if (route === "device-check") {
    return (
      <>
        <DeviceCheck role={role} onJoin={onJoinDevice}/>
        {tweaksUI}
      </>
    );
  }

  // Joining transition (overlays device-check)
  if (route === "joining") {
    return (
      <>
        <DeviceCheck role={role} onJoin={()=>{}}/>
        <JoiningOverlay/>
        {tweaksUI}
      </>
    );
  }

  // Prelude — both participants are on the call, but the tour /
  // canvas-driven session doesn't begin until Start Dreaming is tapped.
  if (route === "prelude") {
    return (
      <div className="app">
        <PreludeCall
          onStartDreaming={onStartDreaming}
          onHangup={onHangup}
          recordingSeconds={recSec}
        />
        {tweaksUI}
        {startFadeUI}
      </div>
    );
  }

  // In-session (route === "session")
  // Both architect and company user see the canvas; company view hides
  // architect-only affordances (AI Ask coaching cards, accept/reject on
  // pending nodes) so James can watch the ontology form in real time.
  const isCompany = role === "company";
  return (
    <div
      className={`app${sessionAutoZoom ? " session-autozoom" : ""}${sessionZoomOut ? " session-zoomout" : ""}`}
      data-handoff-phase={handoffPhase || undefined}
      style={{
        transform: sessionEntering ? "translateY(40px)" : "translateY(0)",
        opacity: sessionEntering ? 0 : 1,
        transition: "transform 600ms cubic-bezier(.22,.9,.32,1), opacity 500ms cubic-bezier(.4,0,.2,1)",
        '--zoom-tx': `${sessionZoomTarget.x}%`,
        '--zoom-ty': `${sessionZoomTarget.y}%`,
      }}
    >
      <TopBar sessionName="Order Fulfilment Discovery" recordingSeconds={recSec}/>

      <div className="main">
        <div style={{position: "relative", minWidth: 0, height: "100%", display: "flex", flexDirection: "column"}}>
          <Canvas
            nodes={nodes}
            pending={pending}
            edges={edges}
            badges={badges}
            outstanding={outstanding}
            allAnswered={allAnswered}
            askCounts={askCounts}
            activeNodeId={activeNodeId}
            expandedNode={expandedNode}
            expandedMode={expandedMode}
            nodeHasHistory={nodeHasAsks}
            onNodeClick={onNodeClick}
            onAcceptNode={acceptNode}
            onRejectNode={rejectNode}
            onToggleExpand={onToggleExpand}
            questionsForExpanded={questionsForExpanded}
            liveNarration={liveNarration}
            onToggleNarration={() => setLiveNarration(v => !v)}
            showLegend={tweaks.showLegend}
            onToggleLegend={() => setTweaks({...tweaks, showLegend: false})}
            visibleTypes={visibleTypes}
            onToggleType={toggleType}
            readOnly={isCompany}
          />

          {/* Playback controls — top-right of canvas area */}
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 6, zIndex: 6 }}>
            <button className="replay-btn" onClick={() => setPlaying(p => !p)} aria-label="Play/Pause">
              {playing ? <Icons.Pause size={13}/> : <Icons.Play size={13}/>}
              {playing ? "Pause" : "Play"}
            </button>
            <button className="replay-btn" onClick={replay} aria-label="Replay">
              <Icons.Refresh size={13}/>Replay
            </button>
          </div>
        </div>

        {/* Floating conversation panel — overlays the canvas (top-right).
            The call-bar chat button + the panel's own X share one piece of
            state so they always stay in lockstep. When closed, a small
            "open conversation" pill floats in the same corner so the
            architect can bring the rail back without hunting in the call
            bar. */}
        {!chatOpen && (
          <button className="conv-reopen" onClick={() => setChatOpen(true)}
                  aria-label="Open conversation">
            <Icons.Chat/>
            <span>{isCompany ? "Transcript" : "Conversation"}</span>
            {!isCompany && asks.length > 0 && (
              <span className="conv-reopen-pill">{asks.length}</span>
            )}
          </button>
        )}
        {chatOpen && (isCompany ? (
          <DCVideoPanel
            onClose={() => setChatOpen(false)}
            liveNarration={liveNarration}
            micOn={micOn}
            onToggleMic={() => setMicOn(v => !v)}
            speakingWho={(() => {
              const last = messages[messages.length - 1];
              if (!last || !last.streaming) return null;
              return last.who === "you" ? "you" : "james";
            })()}
          />
        ) : (
          <Sidebar
            tab={tab} setTab={setTab}
            messages={messages}
            asks={asks}
            nodesById={nodesById}
            activeNodeId={activeNodeId}
            onChipClick={onChipClick}
            onClose={() => setChatOpen(false)}
            liveNarration={liveNarration}
            micOn={micOn}
            onToggleMic={() => setMicOn(v => !v)}
            onSearch={setSearchText}
            searchText={searchText}
            readOnly={isCompany}
            speakingWho={(() => {
              const last = messages[messages.length - 1];
              if (!last || !last.streaming) return null;
              return last.who === "you" ? "you" : "james";
            })()}
            pending={pending}
            onAcceptNode={acceptNode}
            onRejectNode={rejectNode}
          />
        ))}
      </div>

      <CallBar
        aiOn={aiOn} onToggleAi={() => setAiOn(v => !v)}
        micOn={micOn} onToggleMic={() => setMicOn(v => !v)}
        camOn={camOn} onToggleCam={() => setCamOn(v => !v)}
        shareOn={shareOn} onToggleShare={() => setShareOn(v => !v)}
        recording={recording} onToggleRec={() => setRecording(v => !v)}
        chatOpen={chatOpen} onToggleChat={() => setChatOpen(v => !v)}
        onTweaks={() => setTweaksOpen(v => !v)}
        onHangup={onHangup}
      />

      {tweaksUI}
      {startFadeUI}
      <Tour
        cursor={cursor} playing={playing} setPlaying={setPlaying}
        messages={messages} nodes={nodes} pending={pending} asks={asks}
        setTab={setTab}
        openNodeQuestions={openNodeQuestions}
        closeNodeQuestions={closeNodeQuestions}
        enabled={!isCompany}
      />

      {/* DreamCatcher → DreamStudio handoff animation overlay */}
      {handoffPhase && (
        <HandoffOverlay phase={handoffPhase} nodes={nodes} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
