/* DreamFactory — left rail and top bar */

function Rail({ view, setView, onGoHome }) {
  // The vertical rail on the left — project-level actions.
  // Icons: dreamfactory logo, +, search, home, board (dashboard), sidebar
  // Bottom: cloud, help, settings
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
      <button className="r-btn" title="New"><i className="ph ph-plus"/></button>
      <button className="r-btn" title="Search"><i className="ph ph-magnifying-glass"/></button>
      <button className="r-btn" title="Home" onClick={onGoHome}><i className="ph ph-house"/></button>
      <button className={`r-btn ${view === "kanban" || view === "grid" ? "active" : ""}`}
              title="Dashboard" onClick={() => setView("kanban")}>
        <i className="ph ph-kanban"/>
      </button>
      <button className="r-btn" title="Panels"><i className="ph ph-sidebar-simple"/></button>
      <div className="spacer"/>
      <button className="r-btn" title="Cloud"><i className="ph ph-cloud"/></button>
      <button className="r-btn" title="Help"><i className="ph ph-question"/></button>
      <button className="r-btn" title="Settings"><i className="ph ph-gear"/></button>
    </div>
  );
}

function TopBar({ view, setView, onApprove, onGoHome }) {
  // Breadcrumb — Dashboard / E-Commerce Platform v2.0 [/ detail]
  // For the detail view we also append "User Dashboard Component"
  // and show Pause + Approve on the right.
  const isDetail = view === "detail";
  return (
    <div className="df-top">
      <div className="df-bc">
        <span className="seg" onClick={onGoHome} style={{ cursor: onGoHome ? "pointer" : "default" }}>
          <i className="ph ph-sidebar-simple"/>
          <span className="lbl">Dashboard</span>
        </span>
        <span className="sl">/</span>
        <span className="seg">
          <i className="ph ph-folder-simple"/>
          <span className="lbl" onClick={() => setView("kanban")} style={{cursor: "pointer"}}>
            Insurance Claims Processing
          </span>
        </span>
        {isDetail && (
          <>
            <span className="sl">/</span>
            <span className="seg cur"><span className="lbl">User Dashboard Component</span></span>
          </>
        )}
      </div>
      <div className="df-top-right">
        {isDetail ? (
          <>
            <button className="df-pause"><span>Pause</span><i className="ph ph-pause-circle"/></button>
          </>
        ) : (
          <div className="df-live" title="Build signal">
            {[4,7,5,9,6,8,11,6,8,5,7,10,6].map((h, i) => (
              <i key={i} style={{ height: `${h}px` }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Rail, TopBar });
