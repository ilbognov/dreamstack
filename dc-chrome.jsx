// ============================================================
// Top bar + bottom call bar
// ============================================================

function TopBar({ sessionName, recordingSeconds }) {
  const m = Math.floor(recordingSeconds / 60);
  const s = recordingSeconds % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span
          className="info"
          role="button"
          tabIndex={0}
          title="Quick test: jump to tour step 6"
          style={{ cursor: "pointer" }}
          onClick={() => { window.location.href = "DreamCatcher.html?step=6"; }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.location.href = "DreamCatcher.html?step=6"; } }}
        >
          <Icons.Info size={14} stroke="currentColor" />
        </span>
        {sessionName}
      </div>
      <div className="topbar-right">
        <span className="signal"><i /><i /><i /><i /></span>
        <button className="tb-btn"><Icons.Link />Copy Link</button>
        <button className="tb-btn icon-only" aria-label="Calendar"><Icons.Calendar /></button>
        <span className="rec-pill"><span className="rec-dot" />Recording: <span className="mono">{display}</span></span>
      </div>
    </div>);

}

function CallBar({
  aiOn, onToggleAi,
  micOn, onToggleMic,
  camOn, onToggleCam,
  shareOn, onToggleShare,
  recording, onToggleRec,
  chatOpen, onToggleChat,
  onTweaks,
  onHangup
}) {
  return (
    <div className="callbar">
      <div className="cb-left">
        <div className="ai-toggle">
          <span className="spark"><Icons.Sparkle /></span>
          <span className={`sw ${aiOn ? "on" : ""}`} onClick={onToggleAi} />
        </div>
      </div>

      <div className="cb-center">
        <button className={`call-btn ${micOn ? "" : "off"}`} onClick={onToggleMic} aria-label="Mic">
          {micOn ? <Icons.Mic /> : <Icons.MicOff />}
          <span className="sub-chev"><Icons.ChevUp /></span>
        </button>
        <button className={`call-btn ${camOn ? "" : "off"}`} onClick={onToggleCam} aria-label="Camera">
          {camOn ? <Icons.Camera /> : <Icons.CameraOff />}
          <span className="sub-chev"><Icons.ChevUp /></span>
        </button>
        <button className={`call-btn ${shareOn ? "recording" : ""}`} onClick={onToggleShare} aria-label="Share screen">
          <Icons.Share />
        </button>
        <button className={`call-btn ${recording ? "recording" : ""}`} onClick={onToggleRec} aria-label="Stop recording">
          <Icons.StopRec />
        </button>
        <button className={`call-btn ${chatOpen ? "active" : ""}`} onClick={onToggleChat} aria-label="Chat">
          <Icons.Chat />
        </button>
        <button className="call-btn" aria-label="More" onClick={onTweaks}>
          <Icons.More />
        </button>
        <button className="call-btn hangup-pill" aria-label="Hang up"
        onClick={onHangup || (() => {window.location.href = "DreamStudio.html";})}>
          <svg width="52" height="32" viewBox="0 0 52 32" fill="none">
            <rect width="52" height="32" rx="16" fill="#D93025"/>
            <path d="M21 18.5c.3.3.6.3.9.1l1.1-1c.2-.2.5-.2.7-.1l2.4 1.1c.3.1.4.4.4.7v1.9c0 .4-.3.7-.7.6C19.6 21 15 15.7 15 9.8c0-.4.3-.7.7-.7h1.9c.3 0 .6.2.7.5l1.1 2.4c.1.3 0 .5-.1.7l-1 1.1c-.2.3-.2.6.1.9 1.4 1.5 2.3 2.8 2.6 3.8z"
                  fill="white" transform="translate(10,2) rotate(135, 19, 14)"/>
          </svg>
        </button>
      </div>

      <div className="cb-right">
        <button className="call-btn" aria-label="Pip"><Icons.PipExpand /></button>
        <div className="pip-group">
          <div className="pip pip-james" title="John Smith" />
          <div className="pip pip-lucy" title="Lucy Martin (You)" />
        </div>
      </div>
    </div>);

}

window.TopBar = TopBar;
window.CallBar = CallBar;