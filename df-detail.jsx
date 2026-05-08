/* DreamFactory — task detail view with code tab + inline chat */

function DetailView({ task, onBack, onOpenChat, onPublish }) {
  const agent = AGENTS.find(a => a.id === task.agent);
  const [tab, setTab] = React.useState("code");
  const pct = Math.round((task.done / task.total) * 100);

  return (
    <>
      {/* Header row: back + title + 3 summary chips on the right */}
      <div className="detail-hdr">
        <button className="back" onClick={onBack}><i className="ph ph-arrow-left"/></button>
        <div className="title-wrap">
          <h1>{task.title}</h1>
          <div className="sub">{task.tag}</div>
        </div>
        <div className="stats">
          <div className="detail-stat agent">
            <AgentGlyph agent={agent} size={26} cellSize={2}/>
            <div className="text">
              <span className="k">Agent</span>
              <span className="v">{agent.name}</span>
            </div>
            <i className="ph ph-caret-down chev"/>
          </div>
          <div className="detail-stat">
            <div className="ico"><i className="ph ph-check-circle"/></div>
            <div className="text">
              <span className="k">Tests passing</span>
              <span className="v">{task.done}/{task.total}</span>
            </div>
          </div>
          <div className="detail-stat">
            <TotalProgressBars percent={pct} bars={14}/>
            <div className="text">
              <span className="k">Progress</span>
              <span className="v">{pct}%</span>
            </div>
          </div>
          <button className="publish-btn" data-tour="publish" onClick={onPublish}>
            <i className="ph ph-rocket-launch"/>
            <span>Publish</span>
          </button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          <div className="detail-tabs">
            <div className={`detail-tab ${tab === "code" ? "active" : ""}`} onClick={() => setTab("code")}>
              <i className="ph ph-code icoblue"/><span>Code</span>
            </div>
            <div className={`detail-tab ${tab === "tests" ? "active" : ""}`} onClick={() => setTab("tests")}>
              <i className="ph ph-terminal-window"/><span>Tests</span>
            </div>
            <div className={`detail-tab ${tab === "spec" ? "active" : ""}`} onClick={() => setTab("spec")}>
              <i className="ph ph-file-text"/><span>Architecture Spec</span>
            </div>
          </div>

          {tab === "code" && <CodePane/>}
          {tab === "tests" && <TestsPane task={task}/>}
          {tab === "spec" && <SpecPane task={task}/>}

          <LatestChanges/>
        </div>

        <ChatDrawerInline onExpand={onOpenChat} agent={{ id: "opus-4-7", name: "Opus 4.7", role: "Model", glyph: "ui" }} task={task}/>
      </div>
    </>
  );
}

function CodePane() {
  return (
    <div className="detail-code">
      <div className="filename">
        <i className="ph ph-file-text"/>
        <span>adjuster-dashboard.tsx</span>
        <span className="fn-sep">·</span>
        <span className="fn-meta">src/components</span>
        <i className="ph ph-arrow-up-right fn-open"/>
      </div>

      <pre className="code-block">
<span className="ln"> 1</span>  <span className="kw">import</span> {"{"} <span className="at">useState</span>, <span className="at">useMemo</span> {"}"} <span className="kw">from</span> <span className="st">"react"</span>;{"\n"}
<span className="ln"> 2</span>  <span className="kw">import</span> {"{"} <span className="at">ClaimQueue</span>, <span className="at">ClaimDetail</span>, <span className="at">ActionRail</span> {"}"} <span className="kw">from</span> <span className="st">"./panes"</span>;{"\n"}
<span className="ln"> 3</span>  <span className="kw">import</span> {"{"} <span className="at">useFraudScore</span> {"}"} <span className="kw">from</span> <span className="st">"@/hooks/fraud"</span>;{"\n"}
<span className="ln"> 4</span>  <span className="kw">import</span> {"{"} <span className="at">lookupPolicy</span> {"}"} <span className="kw">from</span> <span className="st">"@/services/policy"</span>;{"\n"}
<span className="ln"> 5</span>{"\n"}
<span className="ln"> 6</span>  <span className="cm">/** Adjuster triage view — queue / detail / action rail. */</span>{"\n"}
<span className="ln"> 7</span>  <span className="kw">export function</span> <span className="at">AdjusterDashboard</span>() {"{"}{"\n"}
<span className="ln"> 8</span>    <span className="kw">const</span> [<span className="at">adjusterId</span>, <span className="at">setAdjusterId</span>] = <span className="at">useState</span>&lt;<span className="tag">string</span>&gt;(<span className="st">""</span>);{"\n"}
<span className="ln"> 9</span>    <span className="kw">const</span> <span className="at">score</span> = <span className="at">useFraudScore</span>({"{"} <span className="at">adjuster_id</span>: <span className="at">adjusterId</span> {"}"});{"\n"}
<span className="ln">10</span>    <span className="kw">const</span> <span className="at">policy</span> = <span className="at">useMemo</span>(() =&gt; <span className="at">lookupPolicy</span>(<span className="at">adjusterId</span>), [<span className="at">adjusterId</span>]);{"\n"}
<span className="ln">11</span>{"\n"}
<span className="ln">12</span>    <span className="kw">return</span> ({"\n"}
<span className="ln">13</span>      &lt;<span className="tag">section</span> <span className="at">className</span>=<span className="st">"grid grid-cols-[320px_1fr_360px] h-screen"</span>&gt;{"\n"}
<span className="ln">14</span>        &lt;<span className="tag">ClaimQueue</span> <span className="at">onSelect</span>={"{"}<span className="at">setAdjusterId</span>{"}"} /&gt;{"\n"}
<span className="ln">15</span>        &lt;<span className="tag">ClaimDetail</span> <span className="at">id</span>={"{"}<span className="at">adjusterId</span>{"}"} <span className="at">policy</span>={"{"}<span className="at">policy</span>{"}"} /&gt;{"\n"}
<span className="ln">16</span>        &lt;<span className="tag">ActionRail</span> <span className="at">fraudScore</span>={"{"}<span className="at">score</span>{"}"} /&gt;{"\n"}
<span className="ln">17</span>      &lt;/<span className="tag">section</span>&gt;{"\n"}
<span className="ln">18</span>    );{"\n"}
<span className="ln">19</span>  {"}"}{"\n"}
      </pre>
    </div>
  );
}

function TestsPane({ task }) {
  // Mocked test list matching the tests-progress count.
  const tests = [
    "renders MetricCard with correct title",
    "formats currency values with prefix",
    "handles missing value gracefully",
    "applies grid-cols-3 class at desktop",
    "collapses to grid-cols-1 on mobile",
    "displays loading skeleton on mount",
    "updates values on prop change",
    "memoizes expensive calc for users",
    "fires analytics event on render",
    "respects theme tokens for dark mode",
    "focuses first card on tab press",
    "keeps aria-label on each metric",
  ];
  return (
    <div className="detail-code" style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: "20px" }}>
      {tests.slice(0, Math.min(tests.length, task.total)).map((t, i) => {
        const pass = i < task.done;
        return (
          <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", color: pass ? "var(--paper)" : "var(--ink-700)" }}>
            <i className={pass ? "ph ph-check-circle" : "ph ph-circle-dashed"}
               style={{ color: pass ? "var(--green-300)" : "var(--ink-700)", fontSize: 16 }}/>
            <span>{t}</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: pass ? "var(--green-300)" : "var(--ink-700)" }}>
              {pass ? "PASS" : "QUEUED"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SpecPane({ task }) {
  return (
    <div className="detail-code" style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: "22px", color: "var(--ink-975)" }}>
      <div style={{ maxWidth: 640 }}>
        <h3 style={{ margin: "0 0 6px", font: "500 16px/22px var(--font-sans)", color: "var(--paper)" }}>
          {task.title}
        </h3>
        <p style={{ margin: "0 0 18px", color: "var(--ink-800)", fontSize: 12 }}>
          Component spec · {task.tag} · owned by Nova-3
        </p>
        <p>This component renders the user dashboard grid layout with three
           responsive metric cards. It is the single source of truth for the
           customer-facing top-of-page view.</p>
        <p style={{ marginTop: 14 }}><b style={{ color: "var(--paper)" }}>Props</b> · none (reads from store)</p>
        <p><b style={{ color: "var(--paper)" }}>Children</b> · MetricCard × 3</p>
        <p><b style={{ color: "var(--paper)" }}>Side effects</b> · fires analytics event on first paint</p>
      </div>
    </div>
  );
}

function LatestChanges() {
  return (
    <div className="latest-card">
      <div className="lc-hd">
        <span className="dot"/>
        <span className="lbl">Latest Changes</span>
        <i className="ph ph-x x"/>
      </div>
      <div className="lc-item done"><i className="ph ph-check"/><span>Added JWT token generation</span></div>
      <div className="lc-item done"><i className="ph ph-check"/><span>Implemented OAuth2 providers</span></div>
      <div className="lc-item done"><i className="ph ph-check"/><span>Added refresh token logic</span></div>
    </div>
  );
}

// Embedded chat rail on the detail view.
//
// Default state: empty welcome screen (agent greeting + perspective floor).
// When the tour fires `df-tour-play-chat`, we animate a real back-and-forth:
//   - user types in the composer, then "sends"
//   - agent shows a typing indicator, then reveals a reply (fade/slide in)
//   - repeat a couple of turns
//   - when finished, dispatch `df-tour-chat-done`
function ChatDrawerInline({ onExpand, agent, task }) {
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState([]); // [{who,text,typing?}]
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    function onPlay() { startConvo(); }
    window.addEventListener("df-tour-play-chat", onPlay);
    return () => window.removeEventListener("df-tour-play-chat", onPlay);
  }, []);

  async function startConvo() {
    const script = [
      { who: "u", text: "Nova-3 — why did you pick snake_case for the adjuster id?" },
      { who: "a", text: "To match the FNOL schema Atlas-7 ships. Renaming would mean a translation layer at every service boundary. Want me to add one anyway?" },
      { who: "u", text: "No, keep it. What's blocking merge?" },
      { who: "a", text: "Just your approval. Lint, typecheck, unit, and integration are all green. Publish opens the PR and tags Orion-5 for the payout test." },
    ];
    setPlaying(true);
    setMessages([]);
    setText("");
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    await sleep(400);
    for (let i = 0; i < script.length; i++) {
      const turn = script[i];
      if (turn.who === "u") {
        // Type into the composer character-by-character.
        const full = turn.text;
        for (let c = 0; c <= full.length; c++) {
          setText(full.slice(0, c));
          await sleep(16 + Math.random() * 16);
        }
        await sleep(700);
        // "Send": clear composer, push user bubble.
        setText("");
        setMessages(m => [...m, { who: "u", text: full }]);
        await sleep(900);
      } else {
        // Agent typing dots, then reply.
        setMessages(m => [...m, { who: "a", typing: true }]);
        await sleep(1700);
        setMessages(m => {
          const copy = m.slice(0, -1);
          return [...copy, { who: "a", text: turn.text }];
        });
        await sleep(1400);
      }
    }
    setPlaying(false);
    window.dispatchEvent(new CustomEvent("df-tour-chat-done"));
  }

  // Keep the welcome visible until the user's first bubble appears
  // (i.e. they've "sent" their first message). While they're typing
  // in the composer, the welcome still shows above — it only collapses
  // once their turn lands in the thread.
  const showWelcome = messages.length === 0;

  return (
    <div className="detail-chat">
      <div className="chat-body">
        <div className="chat-header-select">
          <span className="nm">Opus 4.7</span>
          <i className="ph ph-caret-down chev"/>
          <i className="ph ph-dots-three dots"/>
        </div>
        {showWelcome ? (
          <ChatWelcome
            agentName="Opus 4.7"
            greeting={`Hey John, nice to meet you!`}
            line2={`I'm Opus 4.7, what are we doing today?`}
          />
        ) : (
          <ChatThread messages={messages}/>
        )}
      </div>
      <Composer text={text} setText={setText} readOnly={playing}/>
    </div>
  );
}

// Rendered thread of messages produced by the scripted demo convo.
// Animated 3-dot typing indicator — inline styled so it renders reliably.
function TypingDots() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setT(x => x + 1), 200);
    return () => clearInterval(id);
  }, []);
  const dot = (i) => ({
    width: 6, height: 6, borderRadius: "50%",
    background: "var(--ink-800)",
    opacity: ((t + i) % 3) === 0 ? 1 : 0.3,
    transition: "opacity .2s",
    display: "inline-block",
  });
  return (
    <>
      <span style={dot(0)}/>
      <span style={dot(1)}/>
      <span style={dot(2)}/>
    </>
  );
}

function ChatThread({ messages }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  const bubU = {
    maxWidth: "86%",
    background: "var(--blue-500)",
    color: "#fff",
    borderRadius: "14px 14px 4px 14px",
    padding: "9px 13px",
    font: "400 13px/1.5 var(--font-sans)",
    letterSpacing: "-0.005em",
  };
  const bubA = {
    flex: 1,
    background: "var(--ink-200)",
    border: "1px solid var(--ink-400)",
    borderRadius: "4px 14px 14px 14px",
    padding: "10px 13px 11px",
    font: "400 13px/1.55 var(--font-sans)",
    color: "var(--paper)",
    letterSpacing: "-0.005em",
  };
  const avA = {
    flex: "none",
    width: 26,
    height: 26,
    borderRadius: 6,
    background: "var(--ink-200)",
    border: "1px solid var(--ink-400)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const rowBase = { display: "flex", gap: 8 };
  return (
    <div className="cv-thread" ref={ref} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0 8px" }}>
      {messages.map((m, i) => (
        <div
          key={i}
          className={`cv-msg ${m.who} enter`}
          style={{ ...rowBase, justifyContent: m.who === "u" ? "flex-end" : "flex-start" }}
        >
          {m.who === "a" && (
            <div className="cv-avatar" style={avA}>
              <AgentGlyph agent={{ glyph: "ui" }} size={18} cellSize={1.8} color="var(--paper)"/>
            </div>
          )}
          {m.typing ? (
            <div className="cv-bub typing" style={{ ...bubA, display: "inline-flex", gap: 5, alignItems: "center", padding: "12px 14px", minHeight: 32, flex: "none" }}>
              <TypingDots/>
            </div>
          ) : (
            <div className="cv-bub" style={m.who === "u" ? bubU : bubA}>{m.text}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChatWelcome({ agentName, greeting, line2, agentGlyph }) {
  const a = AGENTS.find(x => x.name === agentName) || { glyph: "ui", name: agentName };
  return (
    <div className="chat-welcome">
      <div className="chat-bubble">
        {greeting}<br/>{line2}
      </div>
      <div className="chat-grid">
        <div className="g-icon"><AgentGlyphLive agent={a} cellSize={4}/></div>
        <ChatFloor/>
      </div>
    </div>
  );
}

function Composer({ text, setText, placeholder = "Ask me anything", readOnly = false }) {
  const on = text.trim().length > 0;
  return (
    <>
      <div className="chat-composer">
        <div className="chat-composer-box">
          <textarea rows={1} placeholder={placeholder}
                    value={text}
                    readOnly={readOnly}
                    onChange={e => setText(e.target.value)}/>
          <div className="chat-composer-row">
            <button className="cc-btn" title="Attach"><i className="ph ph-plus"/></button>
            <button className="cc-btn" title="Tool"><i className="ph ph-cursor-click"/></button>
            <span className="sp"/>
            <button className="cc-btn" title="Voice"><i className="ph ph-microphone"/></button>
            <button className={`send ${on ? "on" : ""}`} title="Send">
              <i className="ph ph-arrow-up"/>
            </button>
          </div>
        </div>
      </div>
      <div className="chat-foot">Conquer AI can make mistakes. Please double-check responses</div>
    </>
  );
}

function DeployOverlay({ task, onDone }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    { t: "Build passed", sha: "CI · #1247", d: 300 },
    { t: "PR #182 merged to main", sha: "2f8c91a", d: 900 },
    { t: "Deployed to staging", sha: "staging · us-east", d: 1500 },
    { t: "Shipped to production", sha: "prod · v2.4.0", d: 2300 },
  ];
  React.useEffect(() => {
    const timers = steps.map((s, i) =>
      setTimeout(() => setStep(i + 1), s.d)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="df-deploy-overlay">
      <div className="df-deploy-card">
        <div className="df-deploy-mark"><i className="ph-fill ph-rocket-launch"/></div>
        <h2 className="df-deploy-title">{task?.title || "Adjuster Dashboard View"} shipped.</h2>
        <p className="df-deploy-sub">
          Approved by you, merged by Nova-3. Orion-5 is running the payout-service
          integration test against main.
        </p>
        <div className="df-deploy-meta">
          <span className="ok"><span className="dot"/>LIVE</span>
          <span>commit 2f8c91a</span>
          <span>v2.4.0</span>
        </div>
        <div className="df-deploy-steps">
          {steps.map((s, i) => (
            <div key={i} className="df-deploy-step"
                 style={{ opacity: i < step ? 1 : 0.35, transition: "opacity .3s" }}>
              <i className={i < step ? "ph ph-check-circle" : "ph ph-circle-dashed"}/>
              <span>{s.t}</span>
              <span className="sha">{s.sha}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DeployOverlay, DetailView, CodePane, LatestChanges, ChatDrawerInline, ChatWelcome, Composer });
