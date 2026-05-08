// DreamStudio — content data (insurance claims architecture)

const DSDATA = {
  project: {
    folder: "External",
    name: "Insurance Claims Intake",
  },
  ontology: { label: "Process Ontology", sub: "Insurance Claims Intake" },

  // Engineer-only app. The engineer lands on this project AFTER the
  // DreamCatcher session has wrapped up — the client (Sarah, James) are gone.
  // This is where the architecture gets locked in before agents build it.
  sessionMeta: {
    clientLogo: "TechCorp",                 // placeholder; not currently rendered
    clientName: "Midwest Mutual",
    sessionTitle: "Claims Intake & Triage",
    sessionSubtitle: "Captured from DreamCatcher • Session 03",
    capturedAt: "Mar 14, 2026 · 2:18 PM",
    duration: "47 min",
    attendees: ["Sarah Chen — Claims Ops Lead", "John Smith — Claims Manager"],
    captureCoverage: 72,
    architectureCoverage: 0,
    id: "claims-intake",
  },

  tabs: ["Overview", "Backend", "Service", "Database"],

  // Canvas nodes — architecture for a claims intake & triage system.
  // These start hidden and Jack fills them in during the build-up animation.
  nodes: [
    {
      id: "postgres", kind: "db", title: "Claims DB", accent: "pg",
      x: 70, y: 150, w: 220,
      items: [
        "Claim Records",
        "Policyholder Profile",
        "Incident Documents",
        "Adjuster Notes",
      ],
    },
    {
      id: "auth", kind: "cloud", title: "Identity Service", accent: "auth",
      x: 330, y: 158, w: 210,
      items: [
        "Policyholder Login",
        "Adjuster SSO",
        "MFA for Payouts",
      ],
    },
    {
      id: "spa", kind: "cube", title: "Claims Portal (SPA)", accent: "spa",
      x: 590, y: 245, w: 210, selected: true,
      items: [
        "File a Claim",
        "Upload Evidence",
        "Triage Questionnaire",
        "Claim Status Tracker",
        "Adjuster Messaging",
        "Payout Confirmation",
      ],
      // Alt list used in "transcript mode" (after AI restructures the SPA).
      itemsAlt: [
        "Start Claim",
        "Evidence Upload",
        "Triage Intro",
        "Status Tracker",
        "Messages",
        "Resolution",
      ],
    },
    {
      id: "api", kind: "grid", title: "Triage Engine", accent: "api",
      x: 840, y: 245, w: 290,
      items: [
        "Classify Claim Type",
        "Route to Adjuster Queue",
        "Flag Fraud Signals",
        "Estimate Payout Range",
        "Auto-Approve Under $500",
      ],
    },
  ],

  // connections (from→to, optional anchor sides)
  links: [
    { from: "postgres", to: "auth",  fromSide: "r", toSide: "l" },
    { from: "auth",     to: "api",   fromSide: "r", toSide: "t", curve: "l-shape" },
    { from: "auth",     to: "spa",   fromSide: "b", toSide: "l" },
    { from: "spa",      to: "api",   fromSide: "r", toSide: "l", highlight: true },
  ],

  // React SPA inspector detail — requirements captured from the DC session.
  reactSpa: {
    eyebrow: "Frontend",
    title: "Claims Portal (SPA)",
    about: "Policyholder-facing claim filing and tracking.",
    requirements: [
      "Plain-language claim filing (no jargon)",
      "Drag-and-drop evidence upload",
      "Mobile-first layouts (60% of filings are on phone)",
      "Status updates without calling a rep",
      "Adjuster chat in-thread with the claim",
      "Accessible to screen readers (WCAG AA)",
      "Spanish + English at launch",
      "Offline draft mode for spotty connections",
      "Fraud prompts hidden from claimant UI",
      "One-click payout method update",
    ],
  },

  // AI transcript — AI guides the architect as they work.
  // This is the AI coaching, not a company user.
  transcript: {
    you: 'In Claims Portal I\'d like to reshape the intake flow so the triage questionnaire happens BEFORE evidence upload — Sarah said adjusters waste time on claims that should have been auto-approved.',
    ai: {
      hello: "Got it.",
      intro: "Here's what I'll lock in:",
      items: [
        "Move Triage Questionnaire above Evidence Upload",
        "Collapse Start/Triage into a single onboarding step",
        "Auto-route claims under $500 to instant-approval path",
        "Flag incomplete evidence back to claimant async",
      ],
      outro: "Confirm and I'll update the architecture graph.",
    },
  },

  // Single cursor — engineer working alone.
  cursors: [
    { id: "jack",  name: "You",   color: "#EF4444", x: 215,  y: 475 },
  ],

  avatars: [
    { id: "u1", color: "#F59E0B", name: "Ada" },
    { id: "u2", color: "#10B981", name: "Ben" },
  ],

  // Frontend tab content
  frontend: {
    sidebar: {
      top: [
        { id: "design-prefs", label: "Design Preferences" },
        { id: "sitemap",      label: "Site Map" },
      ],
      pages: [
        { id: "home",     label: "Start a Claim" },
        { id: "triage",   label: "Triage Questionnaire" },
        { id: "upload",   label: "Evidence Upload" },
        { id: "status",   label: "Claim Status" },
        { id: "messages", label: "Adjuster Messages" },
        { id: "payout",   label: "Payout & Resolution" },
      ],
    },

    designPreferences: {
      title: "Design Preferences",
      font: { family: "Geist", label: "Primary Font" },
      logo: { brand: "Midwest" },
      colors: [
        { hex: "FFFFFF", color: "#FFFFFF" },
        { hex: "D9D9D9", color: "#D9D9D9" },
        { hex: "2B7FFF", color: "#2B7FFF" },
      ],
      competitors: [
        "lemonade.com",
        "progressive.com",
        "statefarm.com",
        "geico.com",
        "rootinsurance.com",
        "hippo.com",
        "metromile.com",
      ],
    },

    homePage: {
      title: "Start a Claim",
      requirements: [
        "Single-question entry (\"What happened?\")",
        "Auto-detect claim type from free-text",
        "Offer resume-draft if previous session",
        "No login required to START",
        "Show realistic payout expectations upfront",
        "Photo capture via phone camera",
        "Route high-complexity claims to human",
      ],
      goal: "Get a claim started in under 90 seconds.",
      figmaPrefix: "https://www.figma.com/design/",
      figmaKey: "1DcRe9xUJsgCq4NVt6bK9e",
    },
  },

  // Projects dashboard (homepage). The Insurance Claims Intake project
  // is the most recent and the only one actually built out.
  projects: [
    {
      id: "claims-intake",
      title: "Claims Intake & Triage",
      client: "Midwest Mutual",
      status: "In Progress",
      statusColor: "yellow",
      captureCoverage: 72,
      archCoverage: 0,
      editedLabel: "Session captured 12 min ago",
      date: "Mar 14, 2026",
      isPrimary: true,
    },
    {
      id: "broker-portal",
      title: "Broker Portal Revamp",
      client: "Atlas Life",
      status: "Under Review",
      statusColor: "blue",
      captureCoverage: 88,
      archCoverage: 64,
      editedLabel: "Last edited 2 hours ago",
      date: "Mar 13, 2026",
    },
    {
      id: "underwriting",
      title: "Underwriting Workbench",
      client: "Atlas Life",
      status: "Completed",
      statusColor: "green",
      captureCoverage: 100,
      archCoverage: 100,
      editedLabel: "Pushed to DreamFactory · 1d ago",
      date: "Mar 12, 2026",
    },
    {
      id: "policy-admin",
      title: "Policy Admin Modernization",
      client: "Sterling Re",
      status: "Draft",
      statusColor: "gray",
      captureCoverage: 40,
      archCoverage: 0,
      editedLabel: "Last edited 3 days ago",
      date: "Mar 11, 2026",
    },
    {
      id: "fraud-triage",
      title: "Fraud Triage Rules Engine",
      client: "Midwest Mutual",
      status: "Completed",
      statusColor: "green",
      captureCoverage: 96,
      archCoverage: 100,
      editedLabel: "Pushed to DreamFactory · 4d ago",
      date: "Mar 08, 2026",
    },
    {
      id: "quote-flow",
      title: "Quote Flow Redesign",
      client: "Midwest Mutual",
      status: "In Progress",
      statusColor: "blue",
      captureCoverage: 70,
      archCoverage: 45,
      editedLabel: "Last edited 4 days ago",
      date: "Mar 07, 2026",
    },
    {
      id: "renewal-nudge",
      title: "Renewal Nudge Engine",
      client: "Atlas Life",
      status: "Draft",
      statusColor: "gray",
      captureCoverage: 28,
      archCoverage: 0,
      editedLabel: "Captured 6 days ago",
      date: "Mar 06, 2026",
    },
    {
      id: "call-summaries",
      title: "Call-Center Summaries",
      client: "Sterling Re",
      status: "In Progress",
      statusColor: "yellow",
      captureCoverage: 84,
      archCoverage: 30,
      editedLabel: "Last edited 1 week ago",
      date: "Mar 04, 2026",
    },
    {
      id: "agent-console",
      title: "Agent Console Unification",
      client: "Atlas Life",
      status: "Completed",
      statusColor: "green",
      captureCoverage: 100,
      archCoverage: 100,
      editedLabel: "Pushed to DreamFactory · 2w ago",
      date: "Feb 22, 2026",
    },
  ],
};

window.DSDATA = DSDATA;
