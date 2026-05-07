/* DreamFactory — Kanban board view + task cards */

// One task card. The variant changes slightly between columns:
//   queued   → title + tag only (no progress)
//   working  → title + tag + progress bar + RUNNING pill
//   review   → title + tag + full progress bar + (no pill; green bar)
//   approved → title + tag + full progress bar
function TaskCard({ task, onOpen }) {
  const agent = AGENTS.find(a => a.id === task.agent);
  const pct = task.total > 0 ? Math.round((task.done / task.total) * 100) : 0;
  const col = task.col;
  const showProgress = col !== "queued";
  const isRunning = col === "working";
  const isDone = col === "review" || col === "approved";

  return (
    <div className={`task-card ${isDone ? "completed" : ""}`} data-task-id={task.id} onClick={onOpen}>
      <div className="tc-hd">
        {col !== "queued" && (
          <div className="tc-agent" title={agent.name}>
            <AgentGlyph agent={agent} size={22} cellSize={2}/>
            <span className="nm">{agent.name.length > 6 ? agent.name.slice(0, 5) + "…" : agent.name}</span>
          </div>
        )}
        <div className="tc-body">
          <div className="tc-title">{task.title}</div>
          <span className="tc-tag">{task.tag}</span>
        </div>
      </div>
      {showProgress && (
        <>
          <div className="tc-prog-row">
            <span className="tc-prog-lbl">Tests Progress:<b>{task.done}/{task.total}</b></span>
            {isRunning && (
              <span className="tc-pill running">
                <span className="pd"/>RUNNING
              </span>
            )}
            {col === "review" && (
              <span className="tc-pill completed">
                <span className="pd"/>COMPLETED
              </span>
            )}
            {col === "approved" && null}
          </div>
          <div className="tc-bar"><i style={{ width: `${pct}%` }}/></div>
        </>
      )}
    </div>
  );
}

function KanbanView({ tasks, onOpenTask, onSelectAgent, selectedAgent, setSelectedAgent }) {
  // Stacked header — title + total progress bar graph + agent chip row
  return (
    <>
      <div className="kb-hero">
        <div className="title">
          <h1>Insurance Claims Processing</h1>
          <div className="sub">8 agents working in parallel</div>
        </div>
        <div className="kb-progress">
          <div className="pg-lbl">Total Progress:<b>58%</b></div>
          <TotalProgressBars percent={58} bars={34}/>
        </div>
      </div>

      <div className="kb-chiprow">
        {AGENTS.slice(0, 4).map(a => (
          <div key={a.id}
               className={`kb-chip ${selectedAgent === a.id ? "active" : ""}`}
               onClick={() => {
                 setSelectedAgent(selectedAgent === a.id ? null : a.id);
                 onSelectAgent?.(a);
               }}>
            <AgentGlyph agent={a} size={34} cellSize={3}/>
            <div className="meta">
              <span className="nm">{a.name}</span>
              <span className="role">{a.role}</span>
            </div>
            {selectedAgent === a.id && <span className="dot"/>}
          </div>
        ))}
        <button className="kb-seeall">
          <span>See All 8 Agents</span>
          <i className="ph ph-arrow-right"/>
        </button>
        <div className="kb-viewtoggle">
          <button className="kb-vt-btn active" title="Kanban"><i className="ph ph-columns"/></button>
          <button className="kb-vt-btn" title="Grid" onClick={() => window.__setView?.("grid")}>
            <i className="ph ph-squares-four"/>
          </button>
        </div>
      </div>

      <div className="kb-columns">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.col === col.id);
          return (
            <div key={col.id} className="kb-col" data-col={col.id}>
              <div className="kb-col-hdr">
                <span className="name">{col.name}</span>
                <span className="bar">|</span>
                <span className="n">{colTasks.length} task{colTasks.length === 1 ? "" : "s"}</span>
                <span className="plus"><i className="ph ph-plus"/></span>
              </div>
              <div className="kb-col-body">
                {colTasks.map(t => (
                  <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t)}/>
                ))}
                <div className="task-new">
                  <i className="ph ph-plus"/><span>New Task</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

Object.assign(window, { TaskCard, KanbanView });
