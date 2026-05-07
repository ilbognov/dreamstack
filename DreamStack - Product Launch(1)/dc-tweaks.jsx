// ============================================================
// Tweaks panel
// ============================================================

function TweaksPanel({ open, onClose, values, onChange, role, onRoleChange }) {
  if (!open) return null;

  const setKey = (k, v) => {
    onChange({ ...values, [k]: v });
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
    } catch (e) {}
  };

  const ACCENTS = [
    "#8B5CF6", // purple (default)
    "#EC4899", // pink
    "#3B82F6", // blue
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
  ];

  return (
    <div className="tweaks">
      <div className="tweaks-hdr">
        <span>Tweaks</span>
        <button className="close" onClick={onClose}><Icons.X size={14}/></button>
      </div>
      <div className="tweaks-body">

        {onRoleChange && (
          <div className="tweak">
            <div className="tweak-label"><span>View as</span></div>
            <div className="seg">
              <button className={role === "architect" ? "sel" : ""} onClick={() => onRoleChange("architect")}>Architect</button>
              <button className={role === "company" ? "sel" : ""}   onClick={() => onRoleChange("company")}>Company user</button>
            </div>
          </div>
        )}

        <div className="tweak">
          <div className="tweak-label">
            <span>Playback speed</span>
            <span className="mono">{values.speed.toFixed(1)}×</span>
          </div>
          <input type="range" className="slider"
                 min="0.5" max="4" step="0.1" value={values.speed}
                 onChange={e => setKey("speed", +e.target.value)}/>
        </div>

        <div className="tweak">
          <div className="tweak-label"><span>Auto-play transcript</span></div>
          <div className="tweak-row">
            <span className={`sw ${values.autoplay ? "on" : ""}`} onClick={() => setKey("autoplay", !values.autoplay)}/>
            <span style={{fontSize: 12, color: "var(--chrome-muted)"}}>
              {values.autoplay ? "On — conversation streams" : "Off — paused"}
            </span>
          </div>
        </div>

        <div className="tweak">
          <div className="tweak-label"><span>Accent color</span></div>
          <div className="swatches">
            {ACCENTS.map(c => (
              <div key={c}
                   className={`swatch ${values.accent === c ? "sel" : ""}`}
                   style={{ background: c }}
                   onClick={() => setKey("accent", c)}/>
            ))}
          </div>
        </div>

        <div className="tweak">
          <div className="tweak-label"><span>Theme</span></div>
          <div className="seg">
            <button className={!values.dark ? "sel" : ""} onClick={() => setKey("dark", false)}>Light</button>
            <button className={values.dark ? "sel" : ""}  onClick={() => setKey("dark", true)}>Dark</button>
          </div>
        </div>

        <div className="tweak">
          <div className="tweak-label"><span>Density</span></div>
          <div className="seg">
            <button className={values.density === "compact" ? "sel" : ""} onClick={() => setKey("density", "compact")}>Compact</button>
            <button className={values.density === "comfortable" ? "sel" : ""} onClick={() => setKey("density", "comfortable")}>Comfortable</button>
          </div>
        </div>

        <div className="tweak">
          <div className="tweak-label"><span>Show node-types legend</span></div>
          <div className="tweak-row">
            <span className={`sw ${values.showLegend ? "on" : ""}`} onClick={() => setKey("showLegend", !values.showLegend)}/>
          </div>
        </div>

      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
