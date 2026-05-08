// ============================================================
// Sidebar: Questions + Transcript tabs
// ============================================================

function Avatar({ kind }) {
  if (kind === "james") {
    // The company SME being interviewed — Lucy Martin.
    return <div className="avatar av-james" style={{
      background: "url(assets/lucy.jpg) center/cover no-repeat, #2a2f37",
    }}/>;
  }
  if (kind === "you") {
    // The architect / current user — John Smith.
    return <div className="avatar av-thomas" style={{
      background: "url(assets/james.jpg) center/cover no-repeat, #2a2f37",
    }}/>;
  }
  return <div className={`avatar av-${kind}`}/>;
}

function TranscriptMessage({ msg, streaming }) {
  // Architect-side transcript: architect (Lucy Martin) is "you".
  // John Smith is the company SME answering.
  return (
    <div className="msg">
      <div className="msg-hdr">
        <Avatar kind={msg.who === "you" ? "you" : "james"}/>
        <div className={`msg-name ${msg.who === "you" ? "you" : ""}`}>
          {msg.who === "you" ? "You" : "Lucy Martin"}
        </div>
        <div className="msg-time mono">{msg.time}</div>
      </div>
      <div className={`msg-body ${streaming ? "streaming" : ""}`}>{msg.shownText ?? msg.text}</div>
    </div>
  );
}

function AskCard({ ask, nodeType, nodeTitle, highlighted, onChipClick, onDelete }) {
  const isPending = ask.status === "pending";
  return (
    <div className={`ask-card ${highlighted ? "hi" : ""} ${isPending ? "pending" : "resolved"}`}>
      <div className="ask-byline">
        {isPending ? (
          // Unanswered: show "QUESTION" label in purple, no icon
          <span className="ask-byline-name ask-byline-question-label">QUESTION</span>
        ) : (
          <>
            <span className="ask-byline-ico" aria-hidden="true"><Icons.Sparkle/></span>
            <span className="ask-byline-name">DreamCatcher asks</span>
            <span className="ask-byline-status" aria-label="Answered">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Answered
            </span>
          </>
        )}
      </div>
      <div className="q">
        {isPending && <span className="ask-status-dot" aria-hidden="true" />}
        {ask.question}
      </div>
      <div className="chips">
        <button className="node-chip" data-type={nodeType}
                onClick={() => onChipClick?.(ask.nodeId)}>
          <TypeIcon type={nodeType} size={12} />
          {nodeTitle}
        </button>
        <button className="trash" onClick={() => onDelete?.(ask.id)} aria-label="Delete"><Icons.Trash/></button>
      </div>
    </div>
  );
}

function Waveform({ active }) {
  const bars = 48;
  const [seed, setSeed] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeed(s => s + 1), 120);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div className="wave">
      {Array.from({length: bars}).map((_, i) => {
        // pseudo-random but stable-ish
        const base = active
          ? Math.abs(Math.sin((i + seed) * 0.45) * Math.cos((i + seed*0.7) * 0.3))
          : 0.08;
        const h = 4 + base * 22;
        const opacity = active ? 0.5 + base * 0.5 : 0.3;
        return <i key={i} style={{ height: `${h}px`, opacity }} />;
      })}
    </div>
  );
}

function Sidebar({
  tab, setTab, messages, asks, nodesById, activeNodeId,
  onChipClick, onClose, liveNarration, micOn, onToggleMic,
  onSearch, searchText, readOnly = false, speakingWho,
  pending = [], onAcceptNode, onRejectNode,
}) {
  const bodyRef = React.useRef(null);

  // Company user only ever sees the transcript; the Questions tab is
  // Read-only viewers (e.g. tour role-compare “other user” pane) only see
  // the live transcript — force their tab to "transcript" and hide the
  // architect-only Question cards. The architect can freely switch tabs.
  React.useEffect(() => {
    if (readOnly && tab !== "transcript") setTab("transcript");
  }, [readOnly, tab]);

  // autoscroll
  React.useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages.length, asks.length, tab]);

  const filteredAsks = asks.filter(a => {
    if (!searchText) return true;
    return a.question.toLowerCase().includes(searchText.toLowerCase());
  });
  const filteredMessages = messages.filter(m => {
    if (!searchText) return true;
    return (m.text || "").toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="sidebar">
      <div className="sb-tabs">
        <div className="tabs">
          {/* Architect: three tabs — Questions / Transcript / Attendees.
              Per design feedback the leading icons were dropped so the
              labels read as a clean text-only nav row. Read-only viewers
              still get a single static TRANSCRIPT tab. */}
          {!readOnly && (
            <>
              <button className={`sb-tab ${tab === "questions" ? "active" : ""}`}
                      onClick={() => setTab("questions")}>
                <Icons.Sparkle/>QUESTIONS
                {asks.length > 0 && <span className="pill">{asks.length}</span>}
              </button>
              <button className={`sb-tab ${tab === "transcript" ? "active" : ""}`}
                      onClick={() => setTab("transcript")}>
                TRANSCRIPT
              </button>
              <button className={`sb-tab ${tab === "attendees" ? "active" : ""}`}
                      onClick={() => setTab("attendees")}>
                ATTENDEES
              </button>
            </>
          )}
          {readOnly && (
            <button className="sb-tab active" style={{ cursor: "default" }}>
              TRANSCRIPT
            </button>
          )}
        </div>
        <button className="sb-close" onClick={onClose} aria-label="Close"><Icons.X/></button>
      </div>

      <div className="sb-body" ref={bodyRef}>
        {tab === "transcript" && (
          <>
            {filteredMessages.map((m, i) => {
              // is this the tail, still streaming?
              const isLast = i === messages.length - 1;
              const streaming = isLast && m.streaming;
              return <TranscriptMessage key={m.id} msg={m} streaming={streaming}/>;
            })}
            {/* Possible-nodes section — surfaces pending suggestions inline
                in the transcript so the architect can scan them in the
                reading order of the conversation rather than scrolling
                back to the canvas. Each card mirrors the canvas pending
                state (purple type chip + accept/dismiss buttons). */}
            {!readOnly && pending.length > 0 && (
              <div className="possible-nodes">
                <div className="possible-nodes-hdr">
                  {pending.length} POSSIBLE {pending.length === 1 ? "NODE" : "NODES"}
                </div>
                <div className="possible-nodes-list">
                  {pending.map(p => (
                    <div key={p.id} className="possible-node">
                      <div className="possible-node-main">
                        <div className="possible-node-title">{p.title}</div>
                        <span className="node-chip" data-type={p.type}>
                          <TypeIcon type={p.type} size={11} />
                          {(window.NODE_TYPE_LABEL || {})[p.type] || p.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="possible-node-actions">
                        <button
                          className="pn-btn pn-accept"
                          onClick={() => onAcceptNode?.(p.id)}
                          aria-label="Accept node"
                          title="Accept"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="pn-btn pn-reject"
                          onClick={() => onRejectNode?.(p.id)}
                          aria-label="Dismiss node"
                          title="Dismiss"
                        >
                          <Icons.Trash/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* inline ask cards in transcript also (as in the screenshots) — architect only */}
            {!readOnly && asks.slice(-3).map(a => {
              const n = nodesById[a.nodeId];
              if (!n) return null;
              return (
                <AskCard key={"inline-"+a.id}
                         ask={a}
                         nodeType={n.type}
                         nodeTitle={n.title}
                         highlighted={activeNodeId === a.nodeId}
                         onChipClick={onChipClick}/>
              );
            }).slice(0, 1)}
          </>
        )}
        {tab === "attendees" && (
          <div className="attendees-list">
            <VideoTile
              name="John Smith"
              role="Solutions Architect"
              gradient="linear-gradient(135deg,#6BAE44,#2F6A1F)"
              photo="assets/james.jpg"
              speaking={speakingWho === "you"}
              muted={!micOn}
              self={true}
            />
            <VideoTile
              name="Lucy Martin"
              role="Claims Ops Lead"
              gradient="linear-gradient(135deg,#3B82F6,#1E3A8A)"
              photo="assets/lucy.jpg"
              speaking={speakingWho === "james"}
              muted={false}
              self={false}
            />
          </div>
        )}
        {tab === "questions" && (
          <>
            {filteredAsks.length === 0 && (
              <div style={{padding: "40px 20px", textAlign: "center", color: "var(--ink-soft)", fontSize: 13}}>
                No questions yet. Questions appear here as the AI listens.
              </div>
            )}
            {filteredAsks.map(a => {
              const n = nodesById[a.nodeId];
              if (!n) return null;
              return (
                <AskCard key={a.id}
                         ask={a}
                         nodeType={n.type}
                         nodeTitle={n.title}
                         highlighted={activeNodeId === a.nodeId}
                         onChipClick={onChipClick}/>
              );
            })}
          </>
        )}
      </div>

      <div className="sb-footer">
        <div className="search-box">
          <Icons.Search/>
          <input placeholder="Search here" value={searchText} onChange={e => onSearch(e.target.value)}/>
        </div>
        <div className="wave-row">
          <Waveform active={liveNarration && micOn}/>
          <button className={`mic-btn ${micOn ? "on" : ""}`} onClick={onToggleMic} aria-label="Toggle mic">
            {micOn ? <Icons.Mic/> : <Icons.MicOff/>}
          </button>
        </div>
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;


// ============================================================
// DCVideoPanel — right-side panel for company user.
// Same outer shell as Sidebar (keeps column width consistent).
// Shows two stacked video tiles (James + Thomas) with a nametag,
// mic state, and a compact waveform at the bottom.
// ============================================================
function VideoTile({ name, gradient, speaking, muted, self, photo, role }) {
  const initials = name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
  const slug = name.toLowerCase().split(" ")[0];
  return (
    <div className={`vtile camoff for-${slug} ${speaking ? "speaking" : ""}`}>
      <div className="vtile-stage">
        <div className="vtile-avatar-photo">
          {photo
            ? <img src={photo} alt={name}/>
            : <div className="vtile-avatar-initials" style={{ background: gradient }}>{initials}</div>}
        </div>
        {self && <span className="vtile-self">You</span>}
      </div>
      <div className="vtile-footer">
        <div className="vtile-namewrap">
          <span className="vtile-name">{name}</span>
          {role && <span className="vtile-role">{role}</span>}
        </div>
        <span className={`vtile-mic ${muted ? "off" : "on"}`}>
          {muted ? <Icons.MicOff size={12}/> : <Icons.Mic size={12}/>}
        </span>
      </div>
    </div>
  );
}

function DCVideoPanel({ onClose, liveNarration, micOn, onToggleMic, speakingWho }) {
  return (
    <div className="sidebar vpanel">
      <div className="sb-tabs">
        <div className="tabs">
          <button className="sb-tab active" style={{cursor:"default"}}>
            <Icons.Transcript/>IN CALL
            <span className="pill">02</span>
          </button>
        </div>
        <button className="sb-close" onClick={onClose} aria-label="Close"><Icons.X/></button>
      </div>

      <div className="sb-body vpanel-body">
        <VideoTile
          name="John Smith"
          gradient="linear-gradient(135deg,#6BAE44,#2F6A1F)"
          photo="assets/james.jpg"
          speaking={speakingWho === "james"}
          muted={false}
          self={false}
        />
        <VideoTile
          name="Lucy Martin"
          gradient="linear-gradient(135deg,#3B82F6,#1E3A8A)"
          photo="assets/lucy.jpg"
          speaking={speakingWho === "you"}
          muted={!micOn}
          self={true}
        />
      </div>
    </div>
  );
}

window.DCVideoPanel = DCVideoPanel;
