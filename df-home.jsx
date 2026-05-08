/* DreamFactory — Projects homepage (landing before a project is opened).
 *
 * Matches the screenshot:
 *   - "Projects" title in top bar, search, bell, overflow
 *   - Summary ribbon (Active Builds / Active Agents / Tasks in Progress / Build Speed)
 *   - Tab strip (Recent / Completed / In-Progress / Under Review)
 *   - 3-col grid of project tiles
 *
 * One of the tiles is "Insurance Claims Processing" — the tour's animated
 * cursor lands on it in stop 01 and clicks through to the kanban view.
 */

const PROJECTS = [
  // Row 1
  { id: "claims-intake",    title: "Insurance Claims Processing", source: "claims-core",          dot: "yellow",  hrs: 6, total: 47, inProg: 12, completed: 28, review: 5, agents: 8, highlight: "review" },
  { id: "policy-admin",     title: "Policy Admin Platform",       source: "policy-admin",         dot: "purple",  hrs: 6, total: 52, inProg: 14, completed: 31, review: 1, agents: 6, highlight: "review" },
  { id: "broker-portal",    title: "Broker Self-Serve Portal",    source: "broker-portal",        dot: "white",   hrs: 6, total: 38, inProg: 8,  completed: 28, review: 0, agents: 5 },
  // Row 2
  { id: "quote-engine",     title: "Auto Quote Engine v2",        source: "quote-engine",         dot: "purple",  hrs: 6, total: 44, inProg: 10, completed: 28, review: 0, agents: 7 },
  { id: "claims-mobile",    title: "Claims Mobile App",           source: "claims-mobile-ios",    dot: "gray",    hrs: 6, total: 61, inProg: 15, completed: 28, review: 0, agents: 9 },
  { id: "underwriting",     title: "Underwriting Workbench",      source: "uw-workbench",         dot: "orange",  hrs: 6, total: 39, inProg: 9,  completed: 28, review: 0, agents: 6 },
  // Row 3
  { id: "billing-svc",      title: "Billing & Payments Service",  source: "billing-core",         dot: "green",   hrs: 6, total: 42, inProg: 11, completed: 28, review: 0, agents: 7 },
  { id: "fnol-capture",     title: "FNOL Capture Service",        source: "fnol-capture",         dot: "red",     hrs: 6, total: 33, inProg: 7,  completed: 28, review: 0, agents: 5 },
  { id: "data-lake",        title: "Claims Data Lake",            source: "claims-warehouse",     dot: "purple",  hrs: 6, total: 48, inProg: 13, completed: 28, review: 0, agents: 8 },
];

function HomeTopBar() {
  return (
    <div className="df-top home">
      <div className="df-bc">
        <span className="seg cur">
          <span className="lbl">Projects</span>
        </span>
      </div>
      <div className="home-search">
        <i className="ph ph-magnifying-glass"/>
        <input placeholder="Search here" readOnly/>
        <span className="kb">⌘ S</span>
      </div>
      <div className="df-top-right">
        <button className="home-iconbtn" title="Notifications"><i className="ph ph-bell"/></button>
        <button className="home-iconbtn" title="More"><i className="ph ph-dots-three"/></button>
      </div>
    </div>
  );
}

function HomeSummaryRibbon() {
  return (
    <div className="home-ribbon">
      <div className="rb-item">
        <i className="ph ph-chart-bar"/>
        <span className="n">3</span>
        <span className="l">Active Builds</span>
      </div>
      <span className="rb-sep"/>
      <div className="rb-item">
        <i className="ph ph-users-three"/>
        <span className="n">17</span>
        <span className="l">Active Agents</span>
      </div>
      <span className="rb-sep"/>
      <div className="rb-item">
        <i className="ph ph-clock"/>
        <span className="n">22</span>
        <span className="l">Tasks in Progress</span>
      </div>
      <span className="rb-sep"/>
      <div className="rb-item">
        <i className="ph ph-play"/>
        <span className="n">5.2h</span>
        <span className="l">Average Build Speed</span>
      </div>
    </div>
  );
}

function HomeTabs({ tab, setTab }) {
  const tabs = ["Recent", "Completed", "In-Progress", "Under Review"];
  return (
    <div className="home-tabs">
      {tabs.map(t => (
        <button key={t}
                className={`home-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

function ProjectCard({ p, onOpen }) {
  // Progress bar split: [ inProg (blue filled) | completed dim | remaining empty ]
  const pct = Math.round(((p.inProg + p.completed) / p.total) * 100);
  return (
    <div className="proj-card" data-project-id={p.id} onClick={onOpen}>
      <div className="pc-hd">
        <span className={`pc-dot ${p.dot}`}/>
        <button className="pc-more" onClick={(e) => e.stopPropagation()}>
          <i className="ph ph-dots-three"/>
        </button>
      </div>
      <div className="pc-body">
        <div className="pc-title">{p.title}</div>
        <div className="pc-source">
          <span className="k">Source:</span>
          <a className="v" onClick={(e) => e.stopPropagation()}>
            {p.source}<i className="ph ph-arrow-up-right"/>
          </a>
        </div>
      </div>
      <div className="pc-eta">
        <span className="k">Est. Completion</span>
        <span className="v">{p.hrs} hrs</span>
      </div>
      <div className="pc-bar">
        <i className="pc-bar-fill" style={{ width: `${pct}%` }}/>
      </div>
      <div className="pc-stats">
        <div className="pc-stat"><span className="n">{p.total}</span><span className="l">Total Tasks</span></div>
        <div className="pc-stat"><span className="n">{p.inProg}</span><span className="l">In Progress</span></div>
        <div className="pc-stat"><span className="n">{p.completed}</span><span className="l">Completed</span></div>
        <div className={`pc-stat ${p.highlight === "review" && p.review > 0 ? "hi" : ""}`}>
          <span className="n">{p.review}</span><span className="l">Review</span>
        </div>
        <div className="pc-stat"><span className="n">{p.agents}</span><span className="l">Agents</span></div>
      </div>
    </div>
  );
}

function HomeView({ onOpenProject }) {
  const [tab, setTab] = React.useState("Recent");
  return (
    <>
      <HomeSummaryRibbon/>
      <HomeTabs tab={tab} setTab={setTab}/>
      <div className="home-grid-wrap">
        <div className="home-grid">
          {PROJECTS.map(p => (
            <ProjectCard key={p.id} p={p}
                         onOpen={() => onOpenProject(p.id)}/>
          ))}
        </div>
      </div>
    </>
  );
}

// Home-variant rail: only the "Home" button is active (was "Dashboard" in project view).
function HomeRail({ onGoHome, onGoProject }) {
  return (
    <div className="df-rail">
      <div className="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="var(--paper)" strokeWidth="1.2"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 4 7.5 12 12l8-4.5Z"/>
          <path d="m4 12 8 4.5L20 12"/>
          <path d="m4 16.5 8 4.5 8-4.5"/>
        </svg>
      </div>
      <button className="r-btn newproj" title="New Project">
        <i className="ph ph-plus"/>
        <span className="lbl">New Project</span>
      </button>
      <button className="r-btn wide active" title="Home" onClick={onGoHome}>
        <i className="ph ph-house"/>
        <span className="lbl">External</span>
      </button>
      <button className="r-btn wide" title="All Projects" onClick={onGoProject}>
        <i className="ph ph-folders"/>
        <span className="lbl">All Projects</span>
      </button>
      <button className="r-btn wide" title="Panels">
        <i className="ph ph-sidebar-simple"/>
        <span className="lbl">External</span>
      </button>
      <div className="spacer"/>
      <button className="r-btn wide" title="Cloud Support">
        <i className="ph ph-cloud"/>
        <span className="lbl">Cloud Support</span>
      </button>
      <button className="r-btn wide" title="Support">
        <i className="ph ph-question"/>
        <span className="lbl">Support</span>
      </button>
      <button className="r-btn wide" title="Settings">
        <i className="ph ph-gear"/>
        <span className="lbl">Settings</span>
      </button>
      <div className="home-user">
        <div className="home-user-avatar">
          <img src="assets/james.jpg" alt="John Smith"
               style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", display: "block" }}/>
        </div>
        <span className="nm">John Smith</span>
        <i className="ph ph-caret-down"/>
      </div>
    </div>
  );
}

Object.assign(window, { HomeView, HomeRail, HomeTopBar, PROJECTS });
