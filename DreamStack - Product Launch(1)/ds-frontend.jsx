/* DreamStudio — Frontend tab (Design Preferences, Site Map, Home Page) */

function FrontendSidebar({ active, setActive, activePage, setActivePage }) {
  const s = DSDATA.frontend.sidebar;
  return (
    <div className="front-side">
      {s.top.map(t => (
        <div key={t.id}
             className={`front-link ${active === t.id ? "active" : ""}`}
             onClick={() => { setActive(t.id); setActivePage(null); }}>
          <span>{t.label}</span>
          {active === t.id && <span className="chev-r"><DSIcons.ChevRight size={13}/></span>}
        </div>
      ))}

      <div className="front-group-hd" style={{ marginTop: 12 }}>
        <span>Pages</span>
        <button className="plus"><DSIcons.Plus size={12}/></button>
      </div>

      {s.pages.map(p => (
        <div key={p.id}
             className={`front-link ${activePage === p.id ? "active" : ""}`}
             onClick={() => { setActivePage(p.id); setActive("page"); }}>
          <span>{p.label}</span>
          {activePage === p.id && <span className="chev-r"><DSIcons.ChevRight size={13}/></span>}
        </div>
      ))}
    </div>
  );
}

function DesignPreferences() {
  const dp = DSDATA.frontend.designPreferences;
  return (
    <div className="front-main">
      <h1 className="front-h1">{dp.title}</h1>

      <div className="pref-grid">
        {/* Font Preferences */}
        <div className="pref-card">
          <div className="pc-hd">
            <h3>Font Preferences</h3>
            <button className="dl"><DSIcons.Download/></button>
          </div>
          <div className="pc-label">{dp.font.label}</div>
          <div className="font-block">
            <div className="font-sample">Aa</div>
            <div className="font-select">
              <label>Font Family</label>
              <div className="sel">
                <span>{dp.font.family}</span>
                <DSIcons.ChevDown/>
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="pref-card">
          <div className="pc-hd">
            <h3>Logo</h3>
            <button className="dl"><DSIcons.Download/></button>
          </div>
          <div className="logo-pair">
            <div>
              <div className="pc-label">Icon</div>
              <div className="logo-cell icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
            </div>
            <div>
              <div className="pc-label">Logotype</div>
              <div className="logo-cell">{dp.logo.brand}</div>
            </div>
          </div>
        </div>

        {/* Color Preferences */}
        <div className="pref-card">
          <div className="pc-hd">
            <h3>Color Preferences</h3>
            <button className="dl"><DSIcons.Download/></button>
          </div>
          <div className="color-list">
            {dp.colors.map((c, i) => (
              <div className="color-row" key={i}>
                <div className="sw" style={{ background: c.color }}/>
                <div className="hex">{c.hex}</div>
                <button className="copy"><DSIcons.Copy/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="competitors">
        <h3>Competitors</h3>
        <div className="competitor-grid">
          {dp.competitors.map((url, i) => (
            <a key={i} href="#" className="comp-pill" onClick={(e) => e.preventDefault()}>
              <span>{url}</span>
              <span className="ext"><DSIcons.External/></span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteMapView() {
  const pages = DSDATA.frontend.sidebar.pages;
  const nodesById = Object.fromEntries(pages.map(p => [p.id, p]));

  /* Grid-positioned nodes (col 0-3, row 0-1). Supports branching + convergence. */
  const POS = {
    home:     { col: 0, row: 0, group: "Entry"     },
    triage:   { col: 1, row: 0, group: "Intake"    },
    upload:   { col: 2, row: 1, group: "Evidence"  },
    status:   { col: 2, row: 0, group: "Tracking"  },
    messages: { col: 3, row: 1, group: "Tracking"  },
    payout:   { col: 3, row: 0, group: "Resolution"},
  };

  /* Edges express the actual claims flow, including branches. */
  const EDGES = [
    { from: "home",     to: "triage"   },
    { from: "triage",   to: "status",   label: "auto-approve < $500" },
    { from: "triage",   to: "upload",   label: "needs evidence" },
    { from: "upload",   to: "status"   },
    { from: "status",   to: "payout"   },
    { from: "status",   to: "messages", label: "adjuster ping" },
    { from: "messages", to: "status"   },
  ];

  const COLS = 4;
  const ROWS = 2;
  const GROUP_LABELS = ["Entry", "Intake", "Tracking", "Resolution"];

  /* Layout math — card geometry for edge endpoints */
  const CARD_W = 176;
  const CARD_H = 98;
  const GAP_X  = 64;
  const GAP_Y  = 28;
  const PAD_L  = 40;
  const PAD_T  = 112; // header + column labels
  const colX = (c) => PAD_L + c * (CARD_W + GAP_X);
  const rowY = (r) => PAD_T + r * (CARD_H + GAP_Y);

  /* For each edge, compute an SVG path from right edge of source to left edge of target.
     When target is in a different row, curve; otherwise straight with elbow. */
  function edgePath(from, to) {
    const f = POS[from]; const t = POS[to];
    const sx = colX(f.col) + CARD_W;
    const sy = rowY(f.row) + CARD_H / 2;
    const ex = colX(t.col);
    const ey = rowY(t.row) + CARD_H / 2;
    const dx = ex - sx;
    /* Bezier with horizontal control handles */
    const c1x = sx + Math.max(32, dx * 0.55);
    const c2x = ex - Math.max(32, dx * 0.55);
    return `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ey}, ${ex} ${ey}`;
  }
  function edgeLabelPos(from, to) {
    const f = POS[from]; const t = POS[to];
    const sx = colX(f.col) + CARD_W;
    const ex = colX(t.col);
    const sy = rowY(f.row) + CARD_H / 2;
    const ey = rowY(t.row) + CARD_H / 2;
    return { x: (sx + ex) / 2, y: (sy + ey) / 2 - 6 };
  }

  const canvasW = PAD_L + COLS * CARD_W + (COLS - 1) * GAP_X + 40;
  const canvasH = PAD_T + ROWS * CARD_H + (ROWS - 1) * GAP_Y + 40;

  return (
    <div className="front-main" style={{ padding: 0 }}>
      <div className="sitemap-canvas sitemap-tree">
        <div className="sm-head">
          <h2 className="sm-title">Site Map</h2>
          <div className="sm-sub">Claims Intake &amp; Triage · v1.0 · {pages.length} pages · {EDGES.length} routes</div>
        </div>

        <div className="sm-graph-wrap">
          <div className="sm-graph" style={{ width: canvasW, height: canvasH, position: "relative" }}>

            {/* Column labels */}
            {GROUP_LABELS.map((g, i) => (
              <div key={g} className="sm-col-lbl" style={{
                position: "absolute",
                left: colX(i),
                top: 72,
                width: CARD_W,
              }}>{g}</div>
            ))}

            {/* SVG edges (behind cards) */}
            <svg
              className="sm-edges"
              viewBox={`0 0 ${canvasW} ${canvasH}`}
              width={canvasW} height={canvasH}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              <defs>
                <marker id="sm-arrow" viewBox="0 0 10 10" refX="8" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-2)"/>
                </marker>
              </defs>
              {EDGES.map((e, i) => (
                <g key={i}>
                  <path
                    d={edgePath(e.from, e.to)}
                    fill="none"
                    stroke="var(--border-2)"
                    strokeWidth="1.5"
                    markerEnd="url(#sm-arrow)"
                  />
                  {e.label && (
                    <foreignObject
                      x={edgeLabelPos(e.from, e.to).x - 70}
                      y={edgeLabelPos(e.from, e.to).y - 10}
                      width="140" height="20"
                    >
                      <div className="sm-edge-lbl">{e.label}</div>
                    </foreignObject>
                  )}
                </g>
              ))}
            </svg>

            {/* Nodes */}
            {pages.map(p => {
              const pos = POS[p.id];
              if (!pos) return null;
              return (
                <div
                  key={p.id}
                  className="sm-card"
                  style={{
                    position: "absolute",
                    left: colX(pos.col),
                    top: rowY(pos.row),
                    width: CARD_W,
                    height: CARD_H,
                  }}
                >
                  <div className="sm-card-thumb">
                    <div className="sm-thumb-bar"/>
                    <div className="sm-thumb-bar sm-thumb-bar-2"/>
                    <div className="sm-thumb-bar sm-thumb-bar-3"/>
                    <div className="sm-thumb-block"/>
                  </div>
                  <div className="sm-card-body">
                    <div className="sm-card-title">{p.label}</div>
                    <div className="sm-card-id">/{p.id}</div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}

function PageDetail({ pageId }) {
  const hp = DSDATA.frontend.homePage;
  const pageName = (DSDATA.frontend.sidebar.pages.find(p => p.id === pageId) || {}).label || "Page";
  const figmaUrl = hp.figmaKey;

  return (
    <div className="page-detail" style={{ height: "100%" }}>
      <div className="pd-left">
        <div className="pd-hd">
          <h2>{pageName}</h2>
          <span className="ai-chip"><DSIcons.Sparkle/> AI Generated</span>
        </div>

        <div className="pd-card">
          <div className="pdc-hd">
            <h3>Details</h3>
            <button className="dl"><DSIcons.Download/></button>
          </div>
          <div className="pd-section-label">Requirements</div>
          <div className="req-items">
            {hp.requirements.map((r, i) => (
              <div className="req-row" key={i}>
                <span className="ck"/>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pd-card" style={{ padding: "14px" }}>
          <div className="pd-section-label">Goal</div>
          <div style={{ color: "var(--ink)", fontSize: 13 }}>{hp.goal}</div>
        </div>
      </div>

      <div className="pd-right">
        <div className="fig-topbar">
          <span className="prefix">{hp.figmaPrefix}</span>
          <input defaultValue={figmaUrl}/>
          <button className="copy-link">Copy link</button>
        </div>
        <div className="fig-frame">
          <FigmaPreview/>
        </div>
      </div>
    </div>
  );
}

/* Mock Figma preview — mimics the dark "We Build Enterprise AI-Native Companies" design */
function FigmaPreview() {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "#000", color: "#fff",
      overflow: "auto", fontFamily: "Inter, system-ui"
    }}>
      {/* Top nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        fontSize: 11,
      }}>
        <div style={{ fontWeight: 600 }}>ConquerAI</div>
        <div style={{ display: "flex", gap: 16, color: "rgba(255,255,255,.7)" }}>
          <span>Home</span><span>What We Do</span><span>The Team</span><span>Our Work</span>
        </div>
        <div style={{
          padding: "5px 12px", borderRadius: 999,
          border: "1px solid rgba(255,255,255,.2)", fontSize: 10
        }}>Contact Us</div>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", padding: "28px 28px 80px", minHeight: 300 }}>
        <div style={{
          display: "inline-flex", gap: 6, alignItems: "center",
          fontSize: 9, color: "#bbb", letterSpacing: ".15em", textTransform: "uppercase",
        }}>
          <span style={{ color: "#c084fc" }}>◆</span> RANKING LIVE DESIGN FOR FORTUNE 500 COMPANIES
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 500, margin: "10px 0 10px",
          lineHeight: 1.15, letterSpacing: "-0.01em",
        }}>
          We Build <span style={{
            background: "linear-gradient(90deg, #a855f7, #f472b6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Enterprise AI-Native</span><br/>Companies
        </h1>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,.6)", lineHeight: 1.5, maxWidth: 260 }}>
          We work inside the world's largest organizations to transform their operations with AI
          agents and turn what we deliver into products that scale.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button style={{
            padding: "6px 14px", borderRadius: 999, background: "#fff", color: "#000",
            fontSize: 10, fontWeight: 600, border: 0,
          }}>Our Solutions</button>
          <button style={{
            padding: "6px 14px", borderRadius: 999, background: "transparent",
            color: "#fff", border: "1px solid rgba(255,255,255,.3)",
            fontSize: 10, fontWeight: 500,
          }}>Talk to Us</button>
        </div>

        {/* Big violet orb */}
        <div style={{
          position: "absolute", right: -20, top: 20, width: 320, height: 320,
          background: "radial-gradient(circle, #1a1a2e 0%, #000 70%)",
          borderRadius: "50%",
          boxShadow: "inset 40px -20px 120px #6d28d9, inset -20px 20px 60px #7c3aed",
        }}/>
        <div style={{
          position: "absolute", right: 120, bottom: 40, width: 120, height: 40,
          background: "radial-gradient(ellipse at center, #a855f7, transparent 70%)",
          filter: "blur(18px)",
        }}/>
      </div>

      {/* "How we deliver value" section */}
      <div style={{
        padding: "32px 28px",
        borderTop: "1px solid rgba(255,255,255,.06)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
      }}>
        <div>
          <div style={{
            fontSize: 8, letterSpacing: ".15em", color: "#c084fc",
            textTransform: "uppercase", marginBottom: 8,
          }}>◆ VALUE</div>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
            How we deliver value
          </h2>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>
            Are you looking to reimagine your enterprise processes using AI?
            <br/>The value we can deliver is transformational.
          </p>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {["AI INTELLIGENT OPERATIONS","100% REVENUE STREAMS","AI COMPOUNDING INTELLIGENCE"].map((t, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 8 }}>
                <div style={{ fontSize: 9, color: "#c084fc", letterSpacing: ".1em" }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          background: "#0a0a0f", borderRadius: 6, height: 180,
          position: "relative", overflow: "hidden",
        }}>
          {/* grid lines */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}/>
          {/* little bar chart */}
          <div style={{
            position: "absolute", bottom: 20, left: 20, right: 20,
            display: "flex", alignItems: "flex-end", gap: 8, height: 80,
          }}>
            {[32, 55, 42, 78, 60, 90, 45, 68].map((h, i) => (
              <div key={i} style={{
                flex: 1, height: h + "%",
                background: i === 5 ? "#a855f7" : "rgba(255,255,255,.2)",
                borderRadius: 2,
              }}/>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 28px", fontSize: 9, color: "rgba(255,255,255,.4)" }}>
        ◆ SPEED
      </div>
    </div>
  );
}

window.FrontendSidebar = FrontendSidebar;
window.DesignPreferences = DesignPreferences;
window.SiteMapView = SiteMapView;
window.PageDetail = PageDetail;
