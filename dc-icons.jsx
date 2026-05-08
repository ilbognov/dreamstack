// Icon components — stroke-based, Lucide-style
const Icon = ({ d, size = 16, fill, stroke = "currentColor", sw = 2, children, ...rest }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill || "none"} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  Info: (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></Icon>,
  Link: (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Icon>,
  Undo: (p) => <Icon {...p}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></Icon>,
  Redo: (p) => <Icon {...p}><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></Icon>,
  File: (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></Icon>,
  ChevDown: (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  ChevUp: (p) => <Icon {...p}><path d="m18 15-6-6-6 6"/></Icon>,
  X: (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Check: (p) => <Icon {...p} sw={3}><path d="M20 6 9 17l-5-5"/></Icon>,
  Trash: (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/></Icon>,
  MicOff: (p) => <Icon {...p}><path d="M2 2l20 20"/><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.7"/><path d="M19 12a7 7 0 0 1-.4 2.4M12 19v3"/><path d="M5 10v2a7 7 0 0 0 9.2 6.6"/></Icon>,
  Camera: (p) => <Icon {...p}><path d="m23 7-7 5 7 5V7Z"/><rect x="1" y="5" width="15" height="14" rx="2"/></Icon>,
  CameraOff: (p) => <Icon {...p}><path d="M2 2l20 20"/><path d="m10.7 5.3 1.3-1.3A2 2 0 0 1 14 5h6a2 2 0 0 1 2 2v10c0 .4-.1.8-.3 1.2"/><path d="M14.1 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h.5"/></Icon>,
  Share: (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 3v13M7 8l5-5 5 5"/></Icon>,
  StopRec: (p) => <Icon {...p} fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="1.5"/></Icon>,
  Chat: (p) => <Icon {...p}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></Icon>,
  More: (p) => <Icon {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Icon>,
  Phone: (p) => <Icon {...p} fill="currentColor" stroke="none"><path d="M20.5 14.3c-1.3 0-2.5-.2-3.7-.6a1 1 0 0 0-1 .2l-2.3 2.3a15 15 0 0 1-6.6-6.6L9.2 7.3a1 1 0 0 0 .3-1C9 5 8.8 3.8 8.8 2.5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1A18.5 18.5 0 0 0 20.5 21a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z"/></Icon>,
  Sparkle: (p) => <Icon {...p} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.7969 15.7529L21.3584 17.9473C21.4683 18.3764 21.7646 18.7274 22.1562 18.918L24.2119 19.918L21.9668 20.4551C21.5451 20.5559 21.1804 20.8319 20.9766 21.2227L19.9219 23.2461L19.9209 23.2471C19.9198 23.2474 19.9181 23.2487 19.916 23.249C19.9112 23.2498 19.9051 23.2507 19.8984 23.25C19.8929 23.2494 19.8884 23.2473 19.8848 23.2461L19.3242 21.0527L19.2744 20.8955C19.1389 20.538 18.8691 20.2478 18.5264 20.0811L16.4688 19.0801L18.7158 18.5449C19.1377 18.4441 19.5022 18.1673 19.7061 17.7764L20.7607 15.7529V15.751C20.7619 15.7506 20.7641 15.7504 20.7666 15.75C20.7714 15.7492 20.7775 15.7493 20.7842 15.75C20.7892 15.7505 20.7934 15.7518 20.7969 15.7529ZM10.1445 4.75195L11.8887 9.30469C12.0469 9.71739 12.3799 10.0325 12.7891 10.1787L17.4648 11.8506L12.7891 13.5234C12.3799 13.6697 12.0469 13.9847 11.8887 14.3975L10.1445 18.9492V18.9502C10.1401 18.9514 10.1338 18.9521 10.127 18.9521C10.1204 18.9521 10.1146 18.9513 10.1104 18.9502L10.1084 18.9492L8.36621 14.3975L8.29883 14.248C8.12368 13.9089 7.82394 13.6515 7.46582 13.5234L2.78809 11.8506L7.46582 10.1787C7.87486 10.0324 8.20806 9.71735 8.36621 9.30469L10.1084 4.75195H10.1104C10.1146 4.75079 10.1204 4.75003 10.127 4.75C10.1338 4.75 10.1401 4.75074 10.1445 4.75195Z"/></Icon>,
  PipExpand: (p) => <Icon {...p}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></Icon>,
  Narration: (p) => <Icon {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><path d="M12 19v3"/><path d="M19 5h2M19 8h2"/><path d="M20 5v3"/></Icon>,
  Question: (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></Icon>,
  Transcript: (p) => <Icon {...p}><path d="M4 6h16M4 10h16M4 14h10M4 18h7"/></Icon>,
  UsersTab: (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15 20c0-2.6 2-4.8 4.5-5"/></Icon>,
  Arrow: (p) => <Icon {...p}><path d="M7 17 17 7M9 7h8v8"/></Icon>,
  User: (p) => <Icon {...p}><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></Icon>,
  Server: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M7 7h.01M7 18h.01"/></Icon>,
  Branch: (p) => <Icon {...p}><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8M12 16v-2"/></Icon>,
  Sliders: (p) => <Icon {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></Icon>,
  Play: (p) => <Icon {...p} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></Icon>,
  Pause: (p) => <Icon {...p} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></Icon>,
  Refresh: (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
};

// Per-node-type header icons — pixel-perfect from brand SVGs (16x16 viewBox)
const TypeIcon = ({ type, size = 14 }) => {
  const common = {
    width: size, height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (type === "subprocess") {
    return (
      <svg {...common}>
        <path d="M12 10.5L12 9C12 8.73478 11.8946 8.48043 11.7071 8.29289C11.5196 8.10536 11.2652 8 11 8L5 8C4.73478 8 4.48043 8.10536 4.29289 8.29289C4.10536 8.48043 4 8.73478 4 9L4 10.5"/>
        <path d="M8 8L8 5.5"/>
        <path d="M12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5Z"/>
        <path d="M8 2.5C7.17157 2.5 6.5 3.17157 6.5 4C6.5 4.82843 7.17157 5.5 8 5.5C8.82843 5.5 9.5 4.82843 9.5 4C9.5 3.17157 8.82843 2.5 8 2.5Z"/>
        <path d="M4 10.5C3.17157 10.5 2.5 11.1716 2.5 12C2.5 12.8284 3.17157 13.5 4 13.5C4.82843 13.5 5.5 12.8284 5.5 12C5.5 11.1716 4.82843 10.5 4 10.5Z"/>
      </svg>
    );
  }
  if (type === "role") {
    return (
      <svg {...common}>
        <path d="M8 10C9.38071 10 10.5 8.88071 10.5 7.5C10.5 6.11929 9.38071 5 8 5C6.61929 5 5.5 6.11929 5.5 7.5C5.5 8.88071 6.61929 10 8 10Z"/>
        <path d="M13 2.5H3C2.72386 2.5 2.5 2.72386 2.5 3V13C2.5 13.2761 2.72386 13.5 3 13.5H13C13.2761 13.5 13.5 13.2761 13.5 13V3C13.5 2.72386 13.2761 2.5 13 2.5Z"/>
        <path d="M3.61133 13.5C3.83688 12.5045 4.39412 11.6154 5.1916 10.9784C5.98908 10.3414 6.97942 9.99438 8.00008 9.99438C9.02074 9.99438 10.0111 10.3414 10.8086 10.9784C11.606 11.6154 12.1633 12.5045 12.3888 13.5"/>
      </svg>
    );
  }
  if (type === "system") {
    return (
      <svg {...common}>
        <path d="M9.5 6.5H6.5V9.5H9.5V6.5Z"/>
        <path d="M12.5 3H3.5C3.22386 3 3 3.22386 3 3.5V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V3.5C13 3.22386 12.7761 3 12.5 3Z"/>
        <path d="M13 6.5H14.5"/>
        <path d="M13 9.5H14.5"/>
        <path d="M1.5 6.5H3"/>
        <path d="M1.5 9.5H3"/>
        <path d="M9.5 13V14.5"/>
        <path d="M6.5 13V14.5"/>
        <path d="M9.5 1.5V3"/>
        <path d="M6.5 1.5V3"/>
      </svg>
    );
  }
  if (type === "process") {
    // Process: right-arrow-in-square glyph, same family as others (1px stroke, 16x16)
    return (
      <svg {...common}>
        <path d="M12.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H12.5C13.0523 13.5 13.5 13.0523 13.5 12.5V3.5C13.5 2.94772 13.0523 2.5 12.5 2.5Z"/>
        <path d="M6 8H10.5"/>
        <path d="M9 6.5L10.5 8L9 9.5"/>
      </svg>
    );
  }
  return null;
};

window.Icons = Icons;
window.TypeIcon = TypeIcon;
