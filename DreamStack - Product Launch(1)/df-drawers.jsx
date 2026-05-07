/* DreamFactory — AI Bot Overview drawer, Agent Chat drawer, Grid view */

function AgentOverviewDrawer({ agent, task, onClose, onStartChat }) {
  return (
    <div className="drawer">
      <div className="drawer-hd">
        <span className="lbl">AI Bot Overview</span>
        <button className="x" onClick={onClose}><i className="ph ph-x"/></button>
      </div>
      <div className="obv-body">
        <div className="obv-agent-hd">
          <div className="glyph-wrap"><AgentGlyph agent={agent} size={32} cellSize={3}/></div>
          <div>
            <h2>{agent.name}</h2>
            <div className="role">{agent.role}</div>
          </div>
        </div>

        <div className="obv-section">
          <div className="k">About</div>
          <p>
            I'm {agent.name}, agent bot created to be taking care of {agent.role}s.
            All of the actions that come up in this field will be taken care of by me.
          </p>
        </div>

        <div className="obv-section">
          <div className="obv-status-row">
            <span className="k">Current Status:</span>
            <span className="tc-pill running">
              <span className="pd"/>RUNNING
            </span>
          </div>
          {task && (
            <div className="task-card" style={{ cursor: "default" }}>
              <div className="tc-body" style={{ gap: 6 }}>
                <div className="tc-title" style={{ fontSize: 14 }}>{task.title}</div>
                <span className="tc-tag">{task.tag}</span>
              </div>
              <div className="tc-prog-row">
                <span className="tc-prog-lbl">Tests Progress:<b>{task.done}/{task.total}</b></span>
              </div>
              <div className="tc-bar"><i style={{ width: `${(task.done / task.total) * 100}%` }}/></div>
            </div>
          )}
        </div>

        <div className="obv-done-row">
          <span className="k">Tasks Done:</span>
          <span className="v">9</span>
          <button className="see">See Full List <i className="ph ph-arrow-right"/></button>
        </div>
      </div>
      <button className="obv-cta" onClick={onStartChat}>
        <span>Start chat with {agent.name}</span>
        <i className="ph ph-arrow-right arr"/>
      </button>
    </div>
  );
}

function ChatDrawer({ agent, onClose }) {
  const [text, setText] = React.useState("");

  return (
    <div className="drawer">
      <div className="drawer-hd">
        <span className="lbl">Chat with {agent.name}</span>
        <button className="x" onClick={onClose}><i className="ph ph-x"/></button>
      </div>
      <div className="chat-body">
        <div className="chat-header-select">
          <span className="nm">Opus 4.7</span>
          <i className="ph ph-caret-down chev"/>
          <i className="ph ph-dots-three dots"/>
        </div>
        <ProgressConversation task={{ title: "Adjuster Dashboard View", tag: "adjuster-ui", done: 24, total: 24 }}/>
      </div>
      <Composer text={text} setText={setText}/>
    </div>
  );
}

function GridView({ tasks, onOpenTask, onSelectAgent }) {
  // Per-agent columns; each column shows agent header + their tasks.
  return (
    <>
      <div className="gr-hero">
        <div className="gr-search">
          <i className="ph ph-magnifying-glass"/>
          <input placeholder="Search here"/>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="kb-vt-btn" title="Kanban" onClick={() => window.__setView?.("kanban")}>
            <i className="ph ph-columns"/>
          </button>
          <button className="kb-vt-btn active" title="Grid">
            <i className="ph ph-squares-four"/>
          </button>
        </div>
      </div>

      <div className="gr-columns">
        {AGENTS.slice(0, 4).map(a => {
          // All tasks this agent is shown against — for demo, replicate.
          const agentTasks = tasks.filter(t => t.agent === a.id);
          // Pad to 4 cards each
          const padded = [...agentTasks];
          while (padded.length < 4) padded.push({
            ...(agentTasks[0] || tasks[2]),
            id: `${a.id}-pad-${padded.length}`,
            agent: a.id,
            title: a.role.replace("Service", "Component").replace("Engine", "Pipeline"),
            tag: a.id + "-" + (padded.length + 1),
          });
          return (
            <div key={a.id} className="gr-col">
              <div className="gr-col-hdr">
                <AgentGlyph agent={a} size={28} cellSize={2}/>
                <div className="meta">
                  <div className="nm">{a.name}</div>
                  <div className="role">{a.role}</div>
                </div>
                <button className="chat" onClick={() => onSelectAgent(a)}>
                  <i className="ph ph-chat-circle"/>
                </button>
              </div>
              {padded.slice(0, 4).map((t, i) => {
                const pct = Math.round((t.done / Math.max(t.total, 1)) * 100) || 60;
                const isDone = t.col === "approved" || t.col === "review";
                return (
                  <div key={t.id + i} className={`gr-task ${isDone ? "completed" : ""}`} onClick={() => onOpenTask(t)}>
                    <div className="tl">{t.title}</div>
                    <span className="tag">{t.tag}</span>
                    <div className="prog-row">
                      <span className="prog-lbl">Tests Progress:<b>{t.done || 12}/{t.total || 18}</b></span>
                      <span className={`tc-pill ${isDone ? "completed" : "running"}`}>
                        <span className="pd"/>{isDone ? "COMPLETED" : "RUNNING"}
                      </span>
                    </div>
                    <div className="tc-bar"><i style={{ width: `${pct}%` }}/></div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

Object.assign(window, { AgentOverviewDrawer, ChatDrawer, GridView });
