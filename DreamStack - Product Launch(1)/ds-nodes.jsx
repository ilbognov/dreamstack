/* DreamStudio — nodes, links, inspector (Items/Design), cursors */

const { useState: useStateN, useEffect: useEffectN, useMemo: useMemoN } = React;

function NodeTitleIcon({ kind }) {
  // Figma reference uses outline icons in the node accent color
  // (no filled gradient pill). Color matches the rail/inspector palette.
  const color = {
    db:    "#A78BFA",
    cloud: "#38BDF8",
    cube:  "#60A5FA",
    grid:  "#E879F9",
  }[kind] || "#94A3B8";
  const src = {
    db:    "assets/icon-node-postgres.svg",
    cloud: "assets/icon-node-auth.svg",
    cube:  "assets/icon-node-spa.svg",
    grid:  "assets/icon-node-api.svg",
  }[kind];
  return (
    <span className="dot" style={{ color }}>
      {src ? <img src={src} alt="" width={16} height={16} style={{ filter: "none" }}/> : null}
    </span>
  );
}

function StudioNode({ node, selected, mode, onSelect, revealCount, pulseIdx }) {
  const items = mode === "itemsAlt" && node.itemsAlt ? node.itemsAlt : node.items;
  // revealCount: how many items are allowed to render right now.
  //   - Infinity (or undefined) -> show all (non-animated path)
  //   - 0..N                   -> show first N items
  const shown = (revealCount === undefined || revealCount === Infinity)
    ? items
    : items.slice(0, Math.max(0, revealCount));
  return (
    <div
      className={`dsn ${selected ? "sel" : ""}`}
      style={{ left: node.x, top: node.y, width: node.w }}
      onClick={() => onSelect && onSelect(node.id)}
    >
      <div className="dsn-title">
        <NodeTitleIcon kind={node.kind}/>
        <span>{node.title}</span>
      </div>
      <div className="dsn-items">
        {shown.map((it, i) => (
          <div
            className={`dsn-item ${pulseIdx === i ? "dsn-item-pop" : "dsn-item-in"}`}
            key={i}
          >{it}</div>
        ))}
      </div>
      <span className="dot-anchor l"/>
      <span className="dot-anchor r"/>
      <span className="dot-anchor t"/>
      <span className="dot-anchor b"/>
      {selected && <>
        <span className="dsn-handle-tr"/>
        <span className="dsn-handle-br"/>
        <span className="dsn-dim-badge">{node.w} × {Math.round(34 + (node.items?.length||0) * 28 + 10)}</span>
      </>}
    </div>
  );
}

function StudioNodeDesign({ node, selected, onSelect, state, setState }) {
  return (
    <div
      className={`dsn ${selected ? "sel" : ""}`}
      style={{ left: node.x, top: node.y, width: node.w }}
      onClick={() => onSelect && onSelect(node.id)}
    >
      <div className="dsn-title">
        <NodeTitleIcon kind={node.kind}/>
        <span>{node.title}</span>
      </div>

      {state === "linked" ? (
        <div className="dsn-design">
          <div className="assigned-row">
            <div className="l">
              <span className="fig-sm"><DSIcons.FigmaLogo size={11}/></span>
              <span className="check"><DSIcons.Check size={13} sw={3}/></span>
              <span>Figma linked</span>
            </div>
            <button
              className="edit"
              onClick={(e) => { e.stopPropagation(); setState("empty"); }}
            >Edit</button>
          </div>
          <div className="assigned-row">
            <div className="l">
              <span className="fig-sm"><DSIcons.Mic2 size={11}/></span>
              <span>Screens Approved:</span>
            </div>
            <span className="count"><b>8</b>/16</span>
          </div>
        </div>
      ) : (
        <div className="dsn-design">
          <div className="figma-well">
            <span className="fig-icon"><DSIcons.FigmaLogo size={18}/></span>
          </div>
          <label>Figma File Link</label>
          <input
            type="text"
            placeholder="https://www.figma.com/design/1DcR..."
            value={state === "filled" ? "https://www.figma.com/design/1DcR..." : ""}
            onChange={() => {}}
            onClick={(e) => { e.stopPropagation(); setState(state === "filled" ? "empty" : "filled"); }}
          />
          <button
            className={`assign-btn ${state === "filled" ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); if (state === "filled") setState("linked"); }}
          >Assign</button>
        </div>
      )}

      <span className="dot-anchor l"/>
      <span className="dot-anchor r"/>
      <span className="dot-anchor t"/>
      <span className="dot-anchor b"/>
      {selected && <>
        <span className="dsn-handle-tr"/>
        <span className="dsn-handle-br"/>
      </>}
    </div>
  );
}

/* Action tray shown below the selected node */
function NodeActionTray({ mode, setMode, kind, setKind }) {
  return (
    <div className="dsn-actions" onClick={(e) => e.stopPropagation()}>
      <div className="dsn-seg">
        <button className={`opt ${kind === "items" ? "on" : ""}`} onClick={() => setKind("items")}>Items</button>
        <button className={`opt ${kind === "design" ? "on" : ""}`} onClick={() => setKind("design")}>Design</button>
      </div>
      <span className="circ"/>
      <button className="ic-btn"><DSIcons.Pencil/></button>
      <button className="ic-btn"><DSIcons.Trash/></button>
    </div>
  );
}

/* SVG path between two nodes */
function nodeAnchor(node, side) {
  const w = node.w, h = estimateHeight(node);
  if (side === "l") return { x: node.x,         y: node.y + h / 2 };
  if (side === "r") return { x: node.x + w,     y: node.y + h / 2 };
  if (side === "t") return { x: node.x + w / 2, y: node.y };
  if (side === "b") return { x: node.x + w / 2, y: node.y + h };
  return { x: node.x + w / 2, y: node.y + h / 2 };
}
function estimateHeight(node) {
  // title (26) + items (count * 28) + padding
  const itemCount = (node.items || []).length;
  return 34 + itemCount * 28 + 10;
}

function StudioLinks({ nodesById, links }) {
  const paths = links.map((l, i) => {
    const a = nodesById[l.from];
    const b = nodesById[l.to];
    if (!a || !b) return null;
    const p1 = nodeAnchor(a, l.fromSide || "r");
    const p2 = nodeAnchor(b, l.toSide   || "l");
    const dx = p2.x - p1.x;
    // C curve, gentle
    const c1 = { x: p1.x + dx * 0.5, y: p1.y };
    const c2 = { x: p2.x - dx * 0.5, y: p2.y };
    const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
    return <path key={i} d={d} className={l.highlight ? "hl" : ""}/>;
  });
  return (
    <svg className="dsn-links" width="100%" height="100%" style={{ overflow: "visible" }}>
      {paths}
    </svg>
  );
}

/* Multiplayer cursors */
function StudioCursor({ c, action }) {
  // During rAF-driven animation we pass .cursor-animated so CSS doesn't
  // also try to tween position (which would fight the rAF updates and
  // look laggy).
  const animated = action != null;
  return (
    <div
      className={`cursor ${animated ? "cursor-animated" : ""}`}
      style={{ left: c.x, top: c.y, color: c.color }}
    >
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2l4 12 2.2-5.8L15 6z"/>
      </svg>
      <span className="nm" style={{ background: c.color }}>
        {c.name}
        {action === "typing" && <span className="cursor-typing"> · typing</span>}
      </span>
    </div>
  );
}

window.StudioNode = StudioNode;
window.StudioNodeDesign = StudioNodeDesign;
window.NodeActionTray = NodeActionTray;
window.StudioLinks = StudioLinks;
window.StudioCursor = StudioCursor;
