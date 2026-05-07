/* DreamFactory — data + agent glyphs + shared helpers */

// ---------- Agent roster ----------
// The 8 agents shown in the Figma screenshots.
const AGENTS = [
  { id: "atlas-7",   name: "Atlas-7",   role: "Claim Intake",             glyph: "service"   },
  { id: "nova-3",    name: "Nova-3",    role: "Adjuster Dashboard",       glyph: "ui"        },
  { id: "orion-5",   name: "Orion-5",   role: "Payout Disbursement",      glyph: "payment"   },
  { id: "quantum-9", name: "Quantum-9", role: "Fraud Analytics",          glyph: "analytics" },
  { id: "sirius-2",  name: "Sirius-2",  role: "Claimant Notifications",   glyph: "notify"    },
  { id: "vega-8",    name: "Vega-8",    role: "Policy Lookup",            glyph: "search"    },
  { id: "lyra-4",    name: "Lyra-4",    role: "Correspondence",           glyph: "mail"      },
  { id: "draco-6",   name: "Draco-6",   role: "Document Cache",           glyph: "cache"     },
];

// ---------- Tasks ----------
// Seeded state; tests progress ticks up on a timer.
const INITIAL_TASKS = [
  // Queued
  { id: "t1",  col: "queued",   agent: "lyra-4",    title: "Claimant Email Notifications", tag: "correspondence",   total: 20, done: 0  },
  { id: "t2",  col: "queued",   agent: "vega-8",    title: "Policy Lookup Service",        tag: "policy-lookup",    total: 18, done: 0  },
  // Working
  { id: "t3",  col: "working",  agent: "atlas-7",   title: "FNOL Intake Pipeline",         tag: "claim-intake",     total: 18, done: 12 },
  { id: "t4",  col: "working",  agent: "orion-5",   title: "Payout Disbursement Engine",   tag: "payout-service",   total: 15, done: 8  },
  { id: "t5",  col: "working",  agent: "quantum-9", title: "Fraud Signal Pipeline",        tag: "fraud-analytics",  total: 38, done: 32 },
  // Awaiting review
  { id: "t6",  col: "review",   agent: "nova-3",    title: "Adjuster Dashboard View",      tag: "adjuster-ui",      total: 24, done: 24 },
  // Approved
  { id: "t7",  col: "approved", agent: "nova-3",    title: "Claims API Documentation",     tag: "docs-site",        total: 24, done: 24 },
];

// ---------- Kanban columns ----------
const COLUMNS = [
  { id: "queued",   name: "Queued"          },
  { id: "working",  name: "Agent Working"   },
  { id: "review",   name: "Awaiting Review" },
  { id: "approved", name: "Approved"        },
];

// ---------- Agent glyph: 7×6 dot matrix (extracted from Figma) ----------
// Each agent gets a stable pattern. Real patterns from the source frames
// for the 4 primary agents; the rest are hand-authored variants in the
// same visual language (same symmetry + density).
const GLYPH_PATTERNS = {
  // Atlas-7 — Claim Intake (Frame 121)
  service:   "1111111,1011101,1011101,1111111,1010101,1010101",
  // Nova-3 — Adjuster Dashboard (Frame 129)
  ui:        "1111111,1011011,1001001,1111111,1111111,1010101",
  // Orion-5 — Payout Disbursement (Frame 123)
  payment:   "1111111,1000001,1111111,1111111,1111111,1010101",
  // Quantum-9 — Fraud Analytics (Frame 124)
  analytics: "1000001,1100011,1110111,1111111,1001001,1111111",
  // Sirius-2 — Notifications  (bell/radio pattern)
  notify:    "0011100,0111110,1111111,1111111,0011100,1010101",
  // Vega-8 — Policy Lookup (magnifier)
  search:    "1111110,1000010,1000010,1111110,0001001,0000111",
  // Lyra-4 — Correspondence (envelope)
  mail:      "1111111,1100011,1010101,1001001,1000001,1111111",
  // Draco-6 — Document Cache (stacked boxes)
  cache:     "1111111,1000001,1111111,1000001,1111111,1010101",
};

function GLYPH_GRID(key) {
  return (GLYPH_PATTERNS[key] || GLYPH_PATTERNS.service).split(",").map(r => r.split("").map(n => +n));
}

function AgentGlyph({ agent, size = 30, cellSize, color = "var(--ink-600)" }) {
  // 7 cols × 6 rows, square cells.
  const grid = GLYPH_GRID(agent?.glyph || "service");
  const cols = 7, rows = 6;
  // Figma spec: 2.2px cell, ~0.7px gap → cell+gap ≈ 2.91px, total ≈ 20×17px.
  // Scale by 'size' (width in px).
  const cell = cellSize || Math.max(1.5, (size - (cols - 1)) / cols);
  const gap = Math.max(0.5, cell * 0.32);
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", flex: "none" }}>
      {grid.map((row, r) => row.map((v, c) => {
        if (!v) return null;
        const x = c * (cell + gap);
        const y = r * (cell + gap);
        return <rect key={`${r}-${c}`} x={x} y={y} width={cell} height={cell} fill={color}/>;
      }))}
    </svg>
  );
}

// Variant with a few cells in green for "alive" feel — used on chat welcome.
function AgentGlyphLive({ agent, cellSize = 3 }) {
  const grid = GLYPH_GRID(agent?.glyph || "service");
  const cols = 7, rows = 6;
  const cell = cellSize;
  const gap = cell * 0.32;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  // Light up a small cluster near centre in green.
  const liveCells = new Set(["2-3", "3-3", "3-4"]);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {grid.map((row, r) => row.map((v, c) => {
        if (!v) return null;
        const x = c * (cell + gap);
        const y = r * (cell + gap);
        const live = liveCells.has(`${r}-${c}`);
        return <rect key={`${r}-${c}`} x={x} y={y} width={cell} height={cell}
                     fill={live ? "var(--green-alt)" : "var(--paper)"}/>;
      }))}
    </svg>
  );
}

// "Total progress" bar graph — vertical green bars in Geist Mono style.
function TotalProgressBars({ percent = 58, bars = 34 }) {
  const filled = Math.round((percent / 100) * bars);
  return (
    <div className="pg-bars">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 6 + ((i * 3) % 10); // varying heights, deterministic
        return <i key={i} className={i < filled ? "" : "off"} style={{ height: `${8 + ((i * 5) % 8)}px` }}/>;
      })}
    </div>
  );
}

// Perspective grid floor — used in chat welcome.
function ChatFloor() {
  return (
    <svg className="floor" viewBox="0 0 220 70" preserveAspectRatio="none">
      {/* horizontal lines receding */}
      {[0, 1, 2, 3, 4].map(i => {
        const t = i / 4;
        const y = 8 + t * 56;
        // fan-in perspective
        const inset = 20 + (1 - t) * 80;
        return <line key={`h${i}`} x1={inset} y1={y} x2={220 - inset} y2={y}
                     stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;
      })}
      {/* vanishing point lines */}
      {[-3, -2, -1, 0, 1, 2, 3].map(i => {
        const vx = 110;
        const spread = i * 40;
        return <line key={`v${i}`} x1={110 + spread * 0.3} y1={8} x2={vx + spread * 1.8} y2={64}
                     stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;
      })}
    </svg>
  );
}

Object.assign(window, {
  AGENTS, INITIAL_TASKS, COLUMNS, GLYPH_PATTERNS, GLYPH_GRID,
  AgentGlyph, AgentGlyphLive, TotalProgressBars, ChatFloor,
});
