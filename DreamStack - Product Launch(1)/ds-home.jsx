/* DreamStudio — Homepage (Projects dashboard)
 *
 * Engineer-only. Lands here after logging in. Each card is a DreamCatcher
 * session that's been captured and is ready for architecture work.
 *
 * The FIRST card ("Claims Intake & Triage") is the demo's primary target —
 * that's the one the engineer clicks into.
 */

function HomeSidebar() {
  const items = [
    { id: "new",     icon: DSIcons.Plus,   label: "New Project" },
    { id: "ext",     icon: DSIcons.Home,   label: "External", active: true },
    { id: "all",     icon: DSIcons.Branch, label: "All Projects" },
    { id: "arch",    icon: DSIcons.Sidebar, label: "Archive" },
  ];
  const bottom = [
    { id: "cloud",   icon: DSIcons.Link,   label: "Cloud Support" },
    { id: "help",    icon: DSIcons.Help,   label: "Support" },
    { id: "gear",    icon: DSIcons.Gear,   label: "Settings" },
  ];
  return (
    <div className="home-side">
      <div className="home-brand">
        <span className="home-brand-mark"><DSIcons.StackLogo size={16}/></span>
        <span>DreamStudio</span>
      </div>

      <div className="home-nav">
        {items.map(it => (
          <button key={it.id} className={`home-nav-row ${it.active ? "on" : ""}`}>
            <it.icon size={15}/>
            <span>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="home-side-sp"/>

      <div className="home-nav">
        {bottom.map(it => (
          <button key={it.id} className="home-nav-row">
            <it.icon size={15}/>
            <span>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="home-user">
        <div className="home-user-av" style={{ backgroundImage: "url(assets/thomas.jpg)" }}/>
        <div className="home-user-meta">
          <div className="nm">Jack Smith</div>
          <div className="role">Staff Architect</div>
        </div>
        <DSIcons.ChevDown/>
      </div>
    </div>
  );
}

function HomeTopBar() {
  return (
    <div className="home-top">
      <h1>Projects</h1>
      <div className="home-search">
        <DSIcons.Search size={13}/>
        <input placeholder="Search projects, clients, sessions…" readOnly/>
        <span className="kbd">⌘ S</span>
      </div>
      <div className="home-top-actions">
        <button className="home-icon-btn" title="Notifications"><DSIcons.Narr size={15}/></button>
        <button className="home-icon-btn" title="More"><DSIcons.Dots size={15}/></button>
      </div>
    </div>
  );
}

function HomeTabs({ active, setActive }) {
  const tabs = ["Recent", "Completed", "In-Progress", "Under Review"];
  return (
    <div className="home-tabs">
      {tabs.map(t => (
        <button
          key={t}
          className={`home-tab ${active === t ? "on" : ""}`}
          onClick={() => setActive(t)}
        >{t}</button>
      ))}
    </div>
  );
}

function ProjectCard({ p, onOpen, primary }) {
  const statusColor = {
    yellow: "var(--amber)",
    blue:   "var(--accent)",
    green:  "var(--green)",
    gray:   "var(--ink-4)",
  }[p.statusColor] || "var(--ink-4)";

  return (
    <div
      className={`proj-card ${primary ? "primary" : ""}`}
      onClick={() => onOpen && onOpen(p)}
      data-project-id={p.id}
    >
      <div className="proj-hd">
        <span className="proj-status" style={{ background: statusColor }}/>
        <button className="proj-dots" onClick={e => e.stopPropagation()}>
          <DSIcons.Dots size={14}/>
        </button>
      </div>

      <div className="proj-title">{p.title}</div>
      <div className="proj-client">{p.client}</div>

      <div className="proj-metrics">
        <div className="proj-metric">
          <span className="ring" style={{
            background: `conic-gradient(var(--accent) ${p.captureCoverage * 3.6}deg, var(--bg-3) 0)`
          }}><span className="hole"/></span>
          <span>{p.captureCoverage}% Capture</span>
        </div>
        <div className="proj-metric">
          <span className="ring" style={{
            background: `conic-gradient(var(--green) ${p.archCoverage * 3.6}deg, var(--bg-3) 0)`
          }}><span className="hole"/></span>
          <span>{p.archCoverage}% Architecture</span>
        </div>
      </div>

      <div className="proj-foot">
        <span>{p.editedLabel}</span>
        {primary && (
          <span className="proj-badge">
            <span className="dot"/> New
          </span>
        )}
      </div>
    </div>
  );
}

function HomeView({ onOpenProject }) {
  const [tab, setTab] = React.useState("Recent");

  const projects = DSDATA.projects;

  return (
    <div className="home-shell">
      <HomeSidebar/>
      <div className="home-main">
        <HomeTopBar/>

        <div className="home-body">
          <div className="home-section-hd">
            <HomeTabs active={tab} setActive={setTab}/>
            <div className="home-section-sub">
              <span className="hs-key">Session captured</span>
              <span className="hs-val">Today · 2:18 PM</span>
            </div>
          </div>

          <div className="proj-grid">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                p={p}
                primary={i === 0}
                onOpen={onOpenProject}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomeView = HomeView;
