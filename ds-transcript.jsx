/* DreamStudio — AI transcript panel (right side)
   Uses inline styles for critical spacing so cache-busts can't break it. */

function Waveform({ muted }) {
  const bars = React.useMemo(() => {
    return Array.from({ length: 46 }, (_, i) => {
      const h = 3 + Math.round(Math.abs(Math.sin(i * 1.37) + Math.cos(i * 0.71)) * 11);
      const dur = 0.8 + (i % 5) * 0.15;
      const delay = (i % 11) * 0.07;
      return { h, dur, delay };
    });
  }, []);
  return (
    <div className={`waveform ${muted ? "muted" : ""}`}>
      {bars.map((b, i) => (
        <i key={i} style={{
          height: b.h + "px",
          animationDuration: b.dur + "s",
          animationDelay: b.delay + "s",
        }}/>
      ))}
    </div>
  );
}

/* Eyebrow row: "YOU · just now" style header */
function MsgHead({ who, when, isAI, align }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 9.5,
      letterSpacing: ".14em",
      textTransform: "uppercase",
      color: "var(--ink-5)",
      marginBottom: 6,
    }}>
      {isAI && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--green, #4ade80)",
          boxShadow: "0 0 0 3px color-mix(in oklab, var(--green, #4ade80) 22%, transparent)",
          animation: "ai-pulse 1.8s ease-in-out infinite",
          flexShrink: 0,
        }}/>
      )}
      <span style={{ color: isAI ? "var(--ink-2)" : "var(--ink-3)", fontWeight: 500 }}>{who}</span>
      <span style={{ color: "var(--ink-5)", opacity: .7 }}>·</span>
      <span style={{ color: "var(--ink-5)" }}>{when}</span>
    </div>
  );
}

function AIPanel({ muted, setMuted, activeTab, setActiveTab, onClose, showNodeDetail }) {
  const t = DSDATA.transcript;

  const youBubbleStyle = {
    maxWidth: "92%",
    padding: "10px 12px",
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "10px 10px 2px 10px",
    fontSize: 12.5,
    lineHeight: 1.55,
    color: "var(--ink-2)",
    alignSelf: "flex-end",
  };

  const replyCardStyle = {
    fontSize: 12.5,
    color: "var(--ink)",
    lineHeight: 1.55,
    background: "color-mix(in oklab, var(--bg-2) 55%, transparent)",
    border: "1px solid var(--border)",
    borderRadius: "10px 10px 10px 2px",
    padding: "12px 13px 11px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  return (
    <div className="ai-panel">
      <div className="ai-tabs">
        <button className={`ai-tab ${activeTab === "transcript" ? "on" : ""}`}
                onClick={() => setActiveTab("transcript")}>AI Transcript</button>
        {showNodeDetail && (
          <button className={`ai-tab ${activeTab === "react-spa" ? "on" : ""}`}
                  onClick={() => setActiveTab("react-spa")}>React SPA</button>
        )}
        <button className="ai-close" onClick={onClose}><DSIcons.X/></button>
      </div>

      <div className="ai-body">
        {activeTab === "transcript" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* YOU */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
              <MsgHead who="You" when="just now" align="right"/>
              <div style={youBubbleStyle}>{t.you}</div>
            </div>

            {/* AI */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
              <MsgHead who="DreamStudio" when="drafting" isAI align="left"/>
              <div style={replyCardStyle}>
                <div style={{ fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                  {t.ai.hello}
                </div>
                <div style={{ color: "var(--ink-2)", fontSize: 12 }}>{t.ai.intro}</div>

                <ol style={{
                  listStyle: "none",
                  padding: "6px 0 7px",
                  margin: "2px 0 2px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}>
                  {t.ai.items.map((it, i) => (
                    <li key={i} style={{
                      display: "grid",
                      gridTemplateColumns: "22px 1fr",
                      gap: 10,
                      alignItems: "baseline",
                      padding: "4px 0",
                      fontSize: 12.5,
                      color: "var(--ink)",
                    }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        fontSize: 10,
                        letterSpacing: ".08em",
                        color: "var(--ink-3)",
                        textAlign: "right",
                        paddingTop: 1,
                      }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>{it}</span>
                    </li>
                  ))}
                </ol>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11.5,
                  color: "var(--ink-3)",
                  paddingTop: 1,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "var(--ink-4)", flexShrink: 0,
                  }}/>
                  {t.ai.outro}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "react-spa" && (
          <div className="ai-node-detail" style={{ border: 0, padding: 0 }}>
            <div className="eyebrow">
              <span className="dot"><DSIcons.CubeIcon size={10}/></span>
              {DSDATA.reactSpa.eyebrow}
            </div>
            <h4>{DSDATA.reactSpa.title}</h4>

            <div>
              <div className="lbl">About</div>
              <div className="about" style={{ marginTop: 4 }}>{DSDATA.reactSpa.about}</div>
            </div>

            <div>
              <div className="lbl" style={{ marginBottom: 6 }}>Requirements</div>
              <ul className="req-list">
                {DSDATA.reactSpa.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="ai-mic-row">
        {muted ? (
          <>
            <div className="muted-label">You are muted</div>
            <button className="mic-btn on-red" onClick={() => setMuted(false)}>
              <DSIcons.MicOff/>
            </button>
          </>
        ) : (
          <>
            <Waveform muted={false}/>
            <button className="mic-btn" onClick={() => setMuted(true)}>
              <DSIcons.Mic2/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

window.AIPanel = AIPanel;
window.Waveform = Waveform;
