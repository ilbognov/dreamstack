// ============================================================
// dc-role-compare.jsx
// Full-frame split-screen comparison shown as a tour stop:
// how the same call looks to the ARCHITECT (gating + asks +
// coaching + transcript) vs to the in-meeting USER (clean
// evolving canvas + the video feeds they're actually watching).
//
// Both snapshots use the REAL .node / .edges / .qpanel markup
// so styling stays in lockstep with the live canvas.
//
// Layout (both panes):
//   - LEFT ~60% : the mini canvas (horizontal L→R pipeline)
//   - RIGHT ~40%: role-specific chrome
//                   architect → scripted transcript strip
//                   user      → stacked video tiles
// ============================================================

// Shared node spec. Single-row left→right pipeline with CSR branching
// up into Intake (CSRs are an input channel into claim intake, alongside
// PAS):
//
//   FNOL ─── PAS ─── Intake ─── Adjuster
//                     ↑
//                    CSR
//
// Positions target a 480×300 inner surface sized to fit inside the
// ~240-300px wide canvas column (60% of pane). Node x spans 80..440.
const RC_NODES = [
  { id: "fnol",     type: "process",    title: "First Notice of Loss",  x: 120, y:  80 },
  { id: "pas",      type: "system",     title: "Policy Admin System",   x: 315, y:  80 },
  { id: "csr",      type: "role",       title: "Customer Service Rep",  x: 160, y: 200 },
  { id: "intake",   type: "subprocess", title: "Claim Intake",          x: 510, y:  80 },
  { id: "adjuster", type: "role",       title: "Claims Adjuster",       x: 700, y:  80 },
];
const RC_EDGES = [
  { from: "fnol",   to: "pas" },
  { from: "pas",    to: "intake" },
  { from: "csr",    to: "intake" },
  { from: "intake", to: "adjuster" },
];

// Architect-only state for each node (mirrors what the live canvas
// shows at the moment the role-compare stop fires).
const RC_ARCH_STATE = {
  fnol:     { status: "accepted", asks: { total: 2, resolved: 2 } },
  pas:      { status: "accepted", asks: { total: 2, resolved: 2 } },
  csr:      { status: "accepted" },
  intake:   { status: "accepted", asks: { total: 3, resolved: 2 } },
  adjuster: { status: "pending" },
};

// Straight-ish cubic mirroring the real edgePath() from dc-canvas.jsx.
function rcEdgePath(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const cx1 = horizontal ? a.x + dx * 0.4 : a.x;
  const cy1 = horizontal ? a.y              : a.y + dy * 0.4;
  const cx2 = horizontal ? b.x - dx * 0.4 : b.x;
  const cy2 = horizontal ? b.y              : b.y - dy * 0.4;
  return `M ${a.x} ${a.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${b.x} ${b.y}`;
}

// Real-looking .node (inherits type color, header strip, shadow).
function RCNode({ node, archMode }) {
  const state = archMode ? RC_ARCH_STATE[node.id] : null;
  const isPending = archMode && state?.status === "pending";
  const asks = archMode ? state?.asks : null;
  const style = {
    left: `${node.x}px`,
    top: `${node.y}px`,
    transform: "translate(-50%, -50%)",
  };
  const Icon = window.TypeIcon;
  const TYPE_LABEL = window.NODE_TYPE_LABEL || {};
  return (
    <div
      className={`node ${isPending ? "pending" : ""} not-clickable`}
      data-type={node.type}
      style={style}
    >
      <div className="hdr">
        <span className="label">{TYPE_LABEL[node.type] || node.type.toUpperCase()}</span>
        {Icon && (
          <span className="type-ico" aria-hidden="true">
            <Icon type={node.type} size={14} />
          </span>
        )}
      </div>
      <div className="body">{node.title}</div>

      {archMode && !isPending && asks && asks.total > 0 && (
        <div className={`ask-badge ${asks.resolved >= asks.total ? "done" : "partial"}`} aria-hidden="true">
          {asks.resolved >= asks.total ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <span className="ask-badge-txt">{asks.resolved}/{asks.total} answered</span>
          )}
        </div>
      )}

      {archMode && isPending && (
        <div className="only-you-chip" aria-hidden="true">
          <span className="oy-icon">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M2.5 8s2-4 5.5-4 5.5 4 5.5 4-2 4-5.5 4-5.5-4-5.5-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="1.6" fill="currentColor"/>
            </svg>
          </span>
          <span>Only you</span>
        </div>
      )}
    </div>
  );
}

function RCEdges({ nodes, edges }) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <svg
      className="edges"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
      viewBox="0 0 820 400"
      preserveAspectRatio="none"
    >
      {edges.map(e => {
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b) return null;
        return (
          <path key={`${e.from}-${e.to}`}
                className="edge-path"
                d={rcEdgePath(a, b)} />
        );
      })}
    </svg>
  );
}

// Architect transcript strip — uses the same .msg / .avatar / av-james
// classes as the real Sidebar so avatars & copy styling match 1:1.
// Content is lifted from TIMELINE — the Claim Intake SLA exchange,
// which is also what the coaching card / Intake qpanel reference.
const RC_TRANSCRIPT = [
  { who: "you",   text: "And what's the turnaround time on intake?" },
  { who: "james", text: "Two business hours for standard claims, thirty minutes for catastrophe events." },
  { who: "you",   text: "How do you handle duplicates when they come up?" },
];

function RCTranscript() {
  return (
    <div className="rc-transcript" aria-hidden="true">
      <div className="rc-transcript-hdr">
        <span className="rc-transcript-dot"/>
        Transcript
      </div>
      <div className="rc-transcript-body">
        {RC_TRANSCRIPT.map((m, i) => {
          const isYou = m.who === "you";
          return (
            <div className="rc-msg" key={i}>
              <div className="rc-msg-hdr">
                <div
                  className={`avatar ${isYou ? "av-thomas" : "av-james"}`}
                  style={{
                    background: isYou
                      ? "url(assets/james.jpg) center/cover no-repeat, #2a2f37"
                      : "url(assets/lucy.jpg) center/cover no-repeat, #2a2f37",
                  }}
                />
                <div className="rc-msg-name">{isYou ? "You" : "Lucy Martin"}</div>
              </div>
              <div className="rc-msg-body">{m.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// qpanel rendered in-place — floats beneath the Intake node, using the
// REAL .qpanel / .qpanel-hdr / .qpanel-item / .qpanel-card classes so
// it's visually identical to what the architect sees during the session.
// Hand-written so we don't have to synthesise the QuestionPanel component
// without its full state machine.
function RCQPanel() {
  return (
    <div className="rc-qpanel qpanel mode-accepted" aria-hidden="true">
      <div className="qpanel-hdr">
        <span>3 QUESTIONS</span>
        <span className="chev" style={{ display: "flex" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 10l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      <div className="qpanel-items">
        {/* Answered #1 */}
        <div className="qpanel-item resolved">
          <div className="check-chip" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="qpanel-card">
            <div className="k">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              ANSWERED
            </div>
            <div className="v">What SLA applies to claim intake?</div>
            <div className="a">Two business hours for standard claims, thirty minutes for catastrophe events.</div>
          </div>
        </div>
        {/* Pending #3 — the live one being answered right now */}
        <div className="qpanel-item pending">
          <button className="trash" title="Dismiss question">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4l.6 8a1 1 0 001 .9h2.8a1 1 0 001-.9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="qpanel-card">
            <div className="k">
              <span className="q-dot"/>DREAMCATCHER ASKS
            </div>
            <div className="v">How are duplicate claims handled?</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Company-user chrome: the video tiles they're actually watching. Mirrors
// the Sidebar's <VideoTile> markup so pixel DNA matches.
function RCVideoTile({ name, role, photo, speaking }) {
  return (
    <div className={`vtile camoff ${speaking ? "speaking" : ""}`}>
      <div className="vtile-stage">
        <div className="vtile-avatar-photo">
          <img src={photo} alt={name}/>
        </div>
      </div>
      <div className="vtile-nametag">
        <span className="vtile-name">{name}</span>
      </div>
    </div>
  );
}

function RCVideoStack() {
  return (
    <div className="rc-videostack" aria-hidden="true">
      <div className="rc-videostack-hdr">
        <span className="rc-videostack-rec"><span className="rc-videostack-recdot"/>Rec 01:40</span>
        In-meeting
      </div>
      <div className="rc-videostack-body">
        <RCVideoTile
          name="Lucy Martin"
          role="Claims Ops"
          photo="assets/lucy.jpg"
          speaking={true}
        />
        <RCVideoTile
          name="John Smith"
          role="Solutions Architect"
          photo="assets/james.jpg"
          speaking={false}
        />
      </div>
    </div>
  );
}

function RoleCompare() {
  // User-side: filter out pending nodes and edges touching them.
  const userNodes = RC_NODES.filter(n => RC_ARCH_STATE[n.id]?.status !== "pending");
  const userIds = new Set(userNodes.map(n => n.id));
  const userEdges = RC_EDGES.filter(e => userIds.has(e.from) && userIds.has(e.to));

  return (
    <div className="role-compare" aria-hidden="true">
      <div className="rc-pane rc-architect">
        <div className="rc-pane-hdr">
          <span className="rc-pane-kicker">Host</span>
          <span className="rc-pane-title">Your view <em className="rc-pane-sub">— running the session</em></span>
        </div>
        <div className="rc-stage">
          <div className="rc-body">
            <div className="rc-canvas">
              <div className="rc-canvas-inner">
                <RCEdges nodes={RC_NODES} edges={RC_EDGES} />
                {RC_NODES.map(n => <RCNode key={n.id} node={n} archMode={true} />)}
                <RCQPanel />
              </div>
            </div>
            <RCTranscript />
          </div>

          <ul className="rc-caps">
            <li><span className="rc-cap-dot rc-cap-dot-accent"/>You're driving &mdash; approving, clarifying, steering</li>
          </ul>
          <div className="rc-profile-strip">
            <img className="rc-profile-avatar" src="assets/james.jpg" alt="James"/>
            <div className="rc-profile-info">
              <span className="rc-profile-name">James Thornton</span>
              <span className="rc-profile-role">Solutions Architect · Host</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rc-pane rc-user">
        <div className="rc-pane-hdr">
          <span className="rc-pane-kicker">Guest</span>
          <span className="rc-pane-title">Lucy's view <em className="rc-pane-sub">— on the call with you</em></span>
        </div>
        <div className="rc-stage">
          <div className="rc-body">
            <div className="rc-canvas">
              <div className="rc-canvas-inner">
                <RCEdges nodes={userNodes} edges={userEdges} />
                {userNodes.map(n => <RCNode key={n.id} node={n} archMode={false} />)}
              </div>
            </div>
            <RCVideoStack />
          </div>

          <ul className="rc-caps">
            <li><span className="rc-cap-dot rc-cap-dot-muted"/>Lucy just talks &mdash; no admin UI, no controls</li>
          </ul>
          <div className="rc-profile-strip">
            <img className="rc-profile-avatar" src="assets/lucy.jpg" alt="Lucy"/>
            <div className="rc-profile-info">
              <span className="rc-profile-name">Lucy Martin</span>
              <span className="rc-profile-role">Claims Ops · Guest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RoleCompare = RoleCompare;
