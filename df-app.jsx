/* DreamFactory — root app */

function DreamFactoryApp() {
  // Route: 'home' (projects picker) | 'project' (kanban/grid) | 'detail' (task detail)
  const [route, setRoute] = React.useState(() => "home");
  const [view, setView] = React.useState(() => localStorage.getItem("df-view") || "kanban");
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);
  const [activeTask, setActiveTask] = React.useState(null);
  const [drawer, setDrawer] = React.useState(null); // { kind: 'overview'|'chat', agent }
  const [selectedAgent, setSelectedAgent] = React.useState(null);
  const [tweaks, setTweaks] = React.useState({ density: "regular", showLatest: true });
  const [tourRunning, setTourRunning] = React.useState(() => {
    // Demo mode — always start fresh. Tour restarts every page load so the
    // narrative plays top-to-bottom during a live demo. Users who finish
    // won't be nagged because we set df-tour-done, but on reload we reset.
    try { localStorage.removeItem("df-tour-done"); } catch {}
    // Also force route back to home so the tour opens from the project picker.
    try { localStorage.setItem("df-route", "home"); } catch {}
    return true;
  });

  // Expose view setter so Kanban toolbar can switch to Grid
  React.useEffect(() => { window.__setView = setView; return () => { delete window.__setView; }; }, []);

  // Persist route/view
  React.useEffect(() => { localStorage.setItem("df-route", route); }, [route]);
  React.useEffect(() => { localStorage.setItem("df-view", view); }, [view]);

  // Listen for tour back-step route changes.
  React.useEffect(() => {
    const onRoute = (e) => {
      const r = e.detail?.route;
      if (r === "home")    { setRoute("home"); setActiveTask(null); }
      if (r === "project") { setRoute("project"); setView("kanban"); setActiveTask(null); }
      if (r === "detail")  { setRoute("detail"); }
    };
    window.addEventListener("df-tour-set-route", onRoute);
    return () => window.removeEventListener("df-tour-set-route", onRoute);
  }, []);

  // Progress ticker — working tasks advance their test count slowly.
  React.useEffect(() => {
    const id = setInterval(() => {
      setTasks(ts => ts.map(t => {
        if (t.col !== "working") return t;
        if (t.done >= t.total) return t;
        if (Math.random() < 0.4) return { ...t, done: t.done + 1 };
        return t;
      }));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  function openTask(t) {
    setActiveTask(t);
    setView("detail");
    setRoute("detail");
  }

  function openAgentOverview(a) {
    setDrawer({ kind: "overview", agent: a });
  }

  function openAgentChat(a) {
    setDrawer({ kind: "chat", agent: a });
  }

  function closeDrawer() { setDrawer(null); }

  // ---- Tour helpers ----
  function openProject() {
    setRoute("project");
    setView("kanban");
    setActiveTask(null);
  }
  function openFirstReviewCard() {
    // Target the Adjuster Dashboard card (t6) — in Review.
    const t = tasks.find(x => x.id === "t6") || tasks.find(x => x.col === "review") || tasks[3];
    if (t) openTask(t);
  }
  function publishTask() {
    // Publish is the tour finale — stays on the detail view, no overlay.
    // The tour's cursor animation handles the actual "click" visualization.
  }
  function finishTour() {
    setTourRunning(false);
    try { localStorage.setItem("df-tour-done", "1"); } catch {}
  }

  // ---- View switching ----
  function switchView(v) {
    // If we're on the home route and the user switches to a project view
    // via the tweaks panel, route into the project too.
    if (v === "detail") setRoute("detail");
    else if (v === "kanban" || v === "grid") { setRoute("project"); setActiveTask(null); }
    setView(v);
  }

  // Render different shell for home route.
  if (route === "home") {
    return (
      <div className="df-app home">
        <HomeRail
          onGoHome={() => setRoute("home")}
          onGoProject={openProject}
        />
        <div className="df-main">
          <HomeTopBar/>
          <div className="df-content">
            <HomeView onOpenProject={openProject}/>
          </div>
        </div>
        {tourRunning && (
          <DFTour
            route={route}
            onOpenProject={openProject}
            onOpenFirstReviewCard={openFirstReviewCard}
            onFinish={finishTour}
          />
        )}
        {window.__tweaksOn && <TweaksPanel view={view} setView={switchView} setDrawer={setDrawer} route={route} setRoute={setRoute}/>}
      </div>
    );
  }

  return (
    <div className="df-app">
      <Rail view={view} setView={(v) => { setView(v); setActiveTask(null); }}/>
      <div className="df-main">
        <TopBar view={view} setView={setView} onGoHome={() => setRoute("home")}/>
        <div className="df-content">
          {view === "kanban" && (
            <KanbanView
              tasks={tasks}
              onOpenTask={openTask}
              onSelectAgent={openAgentOverview}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
            />
          )}
          {view === "grid" && (
            <GridView tasks={tasks} onOpenTask={openTask} onSelectAgent={openAgentChat}/>
          )}
          {view === "detail" && activeTask && (
            <DetailView
              task={activeTask}
              onBack={() => { setActiveTask(null); setView("kanban"); setRoute("project"); }}
              onOpenChat={() => openAgentChat(AGENTS.find(a => a.id === activeTask.agent))}
              onPublish={publishTask}
            />
          )}

          {drawer?.kind === "overview" && (
            <AgentOverviewDrawer
              agent={drawer.agent}
              task={tasks.find(t => t.agent === drawer.agent.id && t.col === "working") || tasks[2]}
              onClose={closeDrawer}
              onStartChat={() => setDrawer({ kind: "chat", agent: drawer.agent })}
            />
          )}
          {drawer?.kind === "chat" && (
            <ChatDrawer agent={drawer.agent} onClose={closeDrawer}/>
          )}
        </div>
      </div>

      {/* Tour overlay */}
      {tourRunning && (
        <DFTour
          route={route}
          onOpenProject={openProject}
          onOpenFirstReviewCard={openFirstReviewCard}
          onPublish={publishTask}
          onFinish={finishTour}
        />
      )}

      {/* Tweaks panel (shown when Tweaks mode is on) */}
      {window.__tweaksOn && <TweaksPanel view={view} setView={switchView} setDrawer={setDrawer} route={route} setRoute={setRoute}/>}
    </div>
  );
}

function TweaksPanel({ view, setView, setDrawer, route, setRoute }) {
  const restart = () => {
    try {
      localStorage.removeItem("df-tour-done");
      localStorage.removeItem("df-route");
    } catch {}
    location.reload();
  };
  return (
    <div className="tw-panel">
      <h4>Route</h4>
      <div className="grp">
        <div className="opts">
          <button className={`opt ${route === "home" ? "active" : ""}`} onClick={() => setRoute("home")}>Home</button>
          <button className={`opt ${route === "project" ? "active" : ""}`} onClick={() => { setRoute("project"); setView("kanban"); }}>Project</button>
        </div>
      </div>
      <h4>View</h4>
      <div className="grp">
        <div className="opts">
          <button className={`opt ${view === "kanban" ? "active" : ""}`} onClick={() => setView("kanban")}>Kanban</button>
          <button className={`opt ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>Grid</button>
          <button className={`opt ${view === "detail" ? "active" : ""}`} onClick={() => setView("detail")}>Detail</button>
        </div>
      </div>
      <h4>Tour</h4>
      <div className="grp">
        <div className="opts">
          <button className="opt" onClick={restart}>Restart tour</button>
        </div>
      </div>
    </div>
  );
}

// Scale-to-fit for the fixed 1440×872 frame.
function setupScale() {
  const stage = document.getElementById("df-stage");
  const frame = document.getElementById("df-frame");
  function fit() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const scale = Math.min(sw / 1440, sh / 872);
    frame.style.transform = `scale(${scale})`;
  }
  fit();
  window.addEventListener("resize", fit);
}

// ---------- Tweaks wiring (host toolbar) ----------
let tweaksOn = false;
function enableTweaks() {
  window.__tweaksOn = true;
  // Trigger a re-render by dispatching a custom event the root listens for.
  window.dispatchEvent(new Event("tweaks-change"));
}
function disableTweaks() {
  window.__tweaksOn = false;
  window.dispatchEvent(new Event("tweaks-change"));
}

// Mount — Babel runs after DOMContentLoaded, so don't gate on it.
setupScale();
const __dfRoot = ReactDOM.createRoot(document.getElementById("df-root"));
function __dfRender() { __dfRoot.render(<DreamFactoryApp/>); }
__dfRender();
window.addEventListener("tweaks-change", __dfRender);

window.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "__activate_edit_mode") enableTweaks();
  if (d.type === "__deactivate_edit_mode") disableTweaks();
});
window.parent.postMessage({ type: "__edit_mode_available" }, "*");

Object.assign(window, { DreamFactoryApp });
