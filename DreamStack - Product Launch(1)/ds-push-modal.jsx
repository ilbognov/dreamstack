/* DreamStudio — Push to DreamFactory modal
 *
 * Three-state journey:
 *   confirm → pushing → success
 *
 * "This is where the engineer hands the locked-in architecture off to
 * agents in DreamFactory. The architecture IS the handoff contract —
 * agents get unambiguous scope, so their weakest surface (inventing
 * structure) is already solved."
 */

function PushToDFModal({ open, onClose, onDone }) {
  const [stage, setStage] = React.useState("confirm"); // confirm | pushing | success

  // Reset every time the modal opens.
  React.useEffect(() => {
    if (open) setStage("confirm");
  }, [open]);

  React.useEffect(() => {
    if (stage !== "pushing") return;
    const t = setTimeout(() => setStage("success"), 2100);
    return () => clearTimeout(t);
  }, [stage]);

  if (!open) return null;

  const meta = DSDATA.sessionMeta;
  const totalTasks = 47; // matches the mock
  const versionLabel = "Claims Intake v1.0";

  return (
    <div className="push-scrim" onClick={stage === "confirm" ? onClose : null}>
      <div className="push-modal" onClick={e => e.stopPropagation()}>

        {stage === "confirm" && (
          <>
            <div className="push-eyebrow">Ready to get agents working on it?</div>
            <h2 className="push-h">Push your project to DreamFactory?</h2>

            <div className="push-flow">
              <span className="push-flow-dot dc">
                <DSIcons.StackLogo size={16}/>
              </span>
              <span className="push-flow-arrow">⇢</span>
              <span className="push-flow-dot df">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7l9-4 9 4-9 4z"/>
                  <path d="M3 11l9 4 9-4"/>
                  <path d="M3 15l9 4 9-4"/>
                </svg>
              </span>
            </div>

            <div className="push-proj-card">
              <div className="push-proj-hd">
                <span className="push-proj-dot"/>
                <button className="push-proj-more">
                  <DSIcons.Dots size={14}/>
                </button>
              </div>
              <div className="push-proj-title">{versionLabel}</div>
              <div className="push-proj-src">
                Source: <span className="src-link">{meta.id} ↗</span>
              </div>

              <div className="push-est">
                <span>Est. Completion</span>
                <span className="push-est-val">—</span>
              </div>
              <div className="push-bar">
                <span style={{ width: "0%" }}/>
              </div>

              <div className="push-stats">
                <div><b>{totalTasks}</b><span>Total Tasks</span></div>
                <div><b>—</b><span>In Progress</span></div>
                <div><b>—</b><span>Completed</span></div>
                <div><b>—</b><span>Review</span></div>
                <div><b>—</b><span>Agents</span></div>
              </div>
            </div>

            <button className="push-primary" onClick={() => setStage("pushing")}>
              Push to DreamFactory
            </button>
            <button className="push-secondary" onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {stage === "pushing" && (
          <>
            <div className="push-eyebrow">Hold on</div>
            <h2 className="push-h">Pushing to DreamFactory…</h2>

            <div className="push-pushing-well">
              <div className="push-dither"/>
              <div className="push-pushing-label">Pushing...</div>
            </div>

            <div className="push-loading">
              <span className="push-spinner"/>
              <span>Loading</span>
            </div>
          </>
        )}

        {stage === "success" && (
          <>
            <div className="push-flow top-single">
              <span className="push-flow-dot df big">
                <DSIcons.StackLogo size={20}/>
              </span>
            </div>
            <div className="push-eyebrow push-ok">Successfully pushed</div>
            <h2 className="push-h">Your project is in DreamFactory</h2>

            <div className="push-proj-card success">
              <div className="push-proj-hd">
                <span className="push-proj-dot success"/>
                <button className="push-proj-more"><DSIcons.Dots size={14}/></button>
              </div>
              <div className="push-proj-title">{versionLabel}</div>
              <div className="push-proj-src">
                Source: <span className="src-link">{meta.id} ↗</span>
              </div>
              <div className="push-est">
                <span>Est. Completion</span>
                <span className="push-est-val">—</span>
              </div>
              <div className="push-bar"><span style={{ width: "0%" }}/></div>
              <div className="push-stats-divider"/>
              <div className="push-stats">
                <div><b>{totalTasks}</b><span>Total Tasks</span></div>
                <div><b>—</b><span>In Progress</span></div>
                <div><b>—</b><span>Completed</span></div>
                <div><b>—</b><span>Review</span></div>
                <div><b>—</b><span>Agents</span></div>
              </div>
            </div>

            <button className="push-primary" onClick={onDone}>
              Open in DreamFactory
            </button>
            <button className="push-secondary" onClick={onClose}>
              Back to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}

window.PushToDFModal = PushToDFModal;
