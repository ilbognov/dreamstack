// DreamStudio icons — reuse + additions for the studio chrome
const DSIcon = ({ children, size = 16, stroke = "currentColor", sw = 1.6, fill = "none", ...rest }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

const DSIcons = {
  Plus:     (p) => <DSIcon {...p}><path d="M12 5v14M5 12h14"/></DSIcon>,
  Search:   (p) => <DSIcon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></DSIcon>,
  Sidebar:  (p) => <DSIcon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></DSIcon>,
  Home:     (p) => <DSIcon {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></DSIcon>,
  Branch:   (p) => <DSIcon {...p}><circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M12 17v-4"/></DSIcon>,
  Gear:     (p) => <DSIcon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.4 7.4 0 0 0 .1-1 7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.3.9a7 7 0 0 0-1.7-1L15 5h-6l-.4 2.9a7 7 0 0 0-1.7 1L4.6 8 2.6 11.4l2 1.6a7.4 7.4 0 0 0-.1 1c0 .3 0 .7.1 1l-2 1.6 2 3.4 2.3-.9a7 7 0 0 0 1.7 1L9 22h6l.4-2.9a7 7 0 0 0 1.7-1l2.3.9 2-3.4Z"/></DSIcon>,
  Link:     (p) => <DSIcon {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1L12 5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1L12 19"/></DSIcon>,
  Help:     (p) => <DSIcon {...p}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></DSIcon>,
  StackLogo:(p) => <DSIcon {...p} sw={1.2}><path d="M12 3 4 7.5 12 12l8-4.5Z"/><path d="m4 12 8 4.5L20 12"/><path d="m4 16.5 8 4.5 8-4.5"/></DSIcon>,

  // Chrome
  FolderSm: (p) => <DSIcon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></DSIcon>,
  Dots:     (p) => <DSIcon {...p}><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></DSIcon>,
  ChevDown: (p) => <DSIcon {...p}><path d="m6 9 6 6 6-6"/></DSIcon>,
  ChevRight:(p) => <DSIcon {...p}><path d="m9 6 6 6-6 6"/></DSIcon>,
  Undo:     (p) => <DSIcon {...p}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></DSIcon>,
  Redo:     (p) => <DSIcon {...p}><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></DSIcon>,
  Share:    (p) => <DSIcon {...p}><path d="M12 3v13M7 8l5-5 5 5M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></DSIcon>,
  X:        (p) => <DSIcon {...p}><path d="M18 6 6 18M6 6l12 12"/></DSIcon>,
  Check:    (p) => <DSIcon {...p} sw={2.4}><path d="M20 6 9 17l-5-5"/></DSIcon>,
  Download: (p) => <DSIcon {...p}><path d="M12 3v12M6 11l6 6 6-6M5 21h14"/></DSIcon>,
  Copy:     (p) => <DSIcon {...p}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h10"/></DSIcon>,
  External: (p) => <DSIcon {...p}><path d="M7 17 17 7M9 7h8v8"/></DSIcon>,
  Pencil:   (p) => <DSIcon {...p}><path d="M17 3a2.8 2.8 0 0 1 4 4L8 20l-5 1 1-5z"/></DSIcon>,
  Trash:    (p) => <DSIcon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></DSIcon>,
  Sparkle:  (p) => <DSIcon {...p} fill="currentColor" stroke="none"><path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1z"/></DSIcon>,

  // Toolbar
  CursorArrow: (p) => <DSIcon {...p} fill="currentColor" stroke="none"><path d="M5 3l14 6.5-6.1 1.9-2 6.1z"/></DSIcon>,
  Hand:     (p) => <DSIcon {...p}><path d="M18 11V7a2 2 0 0 0-4 0v4"/><path d="M14 11V5a2 2 0 0 0-4 0v6"/><path d="M10 11V7a2 2 0 0 0-4 0v10a5 5 0 0 0 5 5h3a5 5 0 0 0 5-5v-4"/><path d="M18 11a2 2 0 1 1 4 0v1a5 5 0 0 1-2 4"/></DSIcon>,
  Connector:(p) => <DSIcon {...p}><path d="M4 19C10 19 14 5 20 5"/><circle cx="20" cy="5" r="2" fill="currentColor" stroke="none"/></DSIcon>,
  Comment:  (p) => <DSIcon {...p}><path d="M21 11a8 8 0 0 1-12 7l-5 2 1-5a8 8 0 1 1 16-4Z"/></DSIcon>,
  Sticky:   (p) => <DSIcon {...p}><path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l6-6V5a2 2 0 0 0-2-2Z"/><path d="M15 21v-6h6"/></DSIcon>,
  Mic:      (p) => <DSIcon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/></DSIcon>,
  MicOff:   (p) => <DSIcon {...p}><path d="M2 2l20 20"/><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.9-.7"/><path d="M19 12a7 7 0 0 1-.4 2.4M12 19v3"/><path d="M5 10v2a7 7 0 0 0 9.2 6.6"/></DSIcon>,
  Narr:     (p) => <DSIcon {...p}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="m18 3 3 3M15 3l6 6M3 21l6-6M3 18l3 3"/></DSIcon>,
  Huddle:   (p) => <DSIcon {...p}><path d="M3 18a4 4 0 0 1 4-4M21 18a4 4 0 0 0-4-4M9 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/><path d="M12 14a4 4 0 0 0-4 4"/></DSIcon>,

  // Node title icons
  DBIcon:   (p) => <DSIcon {...p} fill="currentColor" stroke="none"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></DSIcon>,
  CloudIcon:(p) => <DSIcon {...p} fill="currentColor" stroke="none"><path d="M7 18a5 5 0 0 1 .6-9.95A6 6 0 0 1 19.4 10 4.5 4.5 0 0 1 18 18Z"/></DSIcon>,
  CubeIcon: (p) => <DSIcon {...p} fill="currentColor" stroke="none"><path d="M12 2 3 7v10l9 5 9-5V7Z"/></DSIcon>,
  GridIcon: (p) => <DSIcon {...p} fill="currentColor" stroke="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></DSIcon>,
  ReactLogo:(p) => (
    <DSIcon {...p} sw={1.4}>
      <circle cx="12" cy="12" r="2"/>
      <ellipse cx="12" cy="12" rx="10" ry="4"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>
    </DSIcon>
  ),
  FigmaLogo: (p) => (
    <svg width={p.size || 14} height={(p.size || 14) * (24/16)} viewBox="0 0 16 24" fill="none">
      <path d="M5 0h6a4 4 0 0 1 0 8H5a4 4 0 0 1 0-8Z" fill="#F24E1E"/>
      <path d="M1 12a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H5a4 4 0 0 1-4-4Z" fill="#A259FF"/>
      <path d="M5 16a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" fill="#0ACF83"/>
      <path d="M1 4a4 4 0 0 1 4-4h6v8H5a4 4 0 0 1-4-4Z" fill="#FF7262"/>
      <path d="M9 8h2a4 4 0 0 1 0 8H9V8Z" fill="#1ABCFE"/>
    </svg>
  ),

  // Transcript panel
  Mic2: (p) => <DSIcon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/></DSIcon>,
};

// Avatars (small generated: gradient + initials)
function DSAvatar({ name, color = "#a78bfa", size = 24 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.42, fontWeight: 600,
      fontFamily: 'Inter, sans-serif'
    }}>{initials}</div>
  );
}

window.DSIcons = DSIcons;
window.DSAvatar = DSAvatar;
