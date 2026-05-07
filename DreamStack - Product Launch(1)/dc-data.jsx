// ============================================================
// Timeline data — realistic insurance claims process
// ============================================================
//
// Flow pattern per node:
//   james explains → AI proposes pending node → AI raises clarifying ask
//   → architect forwards question to james → james answers
//   → AI marks ask resolved (attaches to node) → node accepts → next node
//
// Not every node has an ask. Nodes WITHOUT asks go straight to accept.
// Nodes WITH asks hold in pending state until asks resolve, demonstrating
// how questions get answered before the graph moves on.

// Pixel-based grid. Generous spacing so nodes never touch — pan/zoom handles the rest.
// Node is 170×70; extra vertical gap lets an expanded question panel breathe.
const COL_W = 260;
const ROW_H = 180;
const COL_OFFSET = 110;
const ROW_OFFSET = 90;
const GX = (c) => COL_OFFSET + c * COL_W;
const GY = (r) => ROW_OFFSET + r * ROW_H;

const TIMELINE = [
  // ---------- Greetings ----------
  { t:  0.0, kind: "msg", who: "james", text: "Hey mate, how are we doing?" },
  { t:  2.0, kind: "msg", who: "you",   text: "Hey hey, doing very well — shall we walk through the claims flow?" },
  { t:  4.5, kind: "msg", who: "james", text: "Sure. A policyholder files a First Notice of Loss through our portal — that kicks everything off." },

  // ---------- FNOL (col 0, row 2) — demonstrates full Q&A loop ----------
  { t:  8.0, kind: "node-pending", id: "fnol", type: "process", title: "First Notice of Loss", x: GX(0), y: GY(2) },
  { t:  9.5, kind: "ask", askId: "fnol-q1", nodeId: "fnol", question: "What data is captured at First Notice of Loss?" },
  { t: 11.5, kind: "msg", who: "you",   text: "What data do you capture when the claim first comes in?" },
  { t: 14.5, kind: "msg", who: "james", text: "Claim type, date of loss, policy number, contact details, and a free-text description of what happened." },
  { t: 17.5, kind: "ask-resolve", askId: "fnol-q1" },
  { t: 18.5, kind: "ask", askId: "fnol-q2", nodeId: "fnol", question: "Who verifies policy validity at FNOL?" },
  { t: 20.0, kind: "msg", who: "you",   text: "And who handles identity and policy validation at that point?" },
  { t: 23.0, kind: "msg", who: "james", text: "Customer service reps do the first pass — the policy admin system does the lookup behind the scenes." },
  { t: 26.0, kind: "ask-resolve", askId: "fnol-q2" },
  { t: 27.5, kind: "node-accept", id: "fnol" },

  // ---------- Policy Admin System (col 1, row 1) — single Q&A ----------
  { t: 29.5, kind: "node-pending", id: "pas", type: "system", title: "Policy Admin System", x: GX(1), y: GY(1), parents: ["fnol"] },
  { t: 31.0, kind: "ask", askId: "pas-q1", nodeId: "pas", question: "Which policy fields gate claim creation?" },
  { t: 32.5, kind: "msg", who: "you",   text: "What does the admin system check before letting a claim through?" },
  { t: 35.5, kind: "msg", who: "james", text: "Active status, paid-to date, and coverage for the reported peril." },
  { t: 38.5, kind: "ask-resolve", askId: "pas-q1" },
  { t: 39.5, kind: "ask", askId: "pas-q2", nodeId: "pas", question: "What happens if the policy check fails?" },
  { t: 40.5, kind: "msg", who: "you",   text: "What happens when validation fails?" },
  { t: 43.5, kind: "msg", who: "james", text: "The rep is shown the reason and has to escalate to underwriting before we can proceed." },
  { t: 46.5, kind: "ask-resolve", askId: "pas-q2" },
  { t: 47.5, kind: "node-accept", id: "pas" },

  // ---------- Customer Service Rep (col 1, row 3) — no asks, quick accept ----------
  { t: 49.0, kind: "node-pending", id: "csr", type: "role", title: "Customer Service Rep", x: GX(1), y: GY(3), parents: ["fnol"] },
  { t: 50.5, kind: "node-accept", id: "csr" },

  { t: 52.0, kind: "msg", who: "james", text: "Once validated, it flows to claim intake where we open the claim record and assign a claim number." },

  // ---------- Claim Intake (col 2, row 2) — full 3-question loop (matches reference screenshot) ----------
  { t: 55.0, kind: "node-pending", id: "intake", type: "subprocess", title: "Claim Intake", x: GX(2), y: GY(2), parents: ["pas", "csr"] },
  { t: 56.5, kind: "ask", askId: "intake-q1", nodeId: "intake", question: "What validation checks happen at submission?" },
  { t: 58.0, kind: "msg", who: "you",   text: "What validation checks happen when they submit?" },
  { t: 61.0, kind: "msg", who: "james", text: "Duplicate-claim detection, required field checks, and a policy-coverage match." },
  { t: 64.0, kind: "ask-resolve", askId: "intake-q1" },
  { t: 65.0, kind: "ask", askId: "intake-q2", nodeId: "intake", question: "What SLA applies to claim intake?" },
  { t: 66.5, kind: "msg", who: "you",   text: "And what's the turnaround time on intake?" },
  { t: 69.5, kind: "msg", who: "james", text: "Two business hours for standard claims, thirty minutes for catastrophe events." },
  { t: 72.5, kind: "ask-resolve", askId: "intake-q2" },
  // Raise q3 BEFORE intake is accepted, then accept intake with q3 still
  // pending. The qpanel opens on accept showing 2 ANSWERED + 1 PENDING —
  // which is exactly what tour stop 3 ("It knows what it doesn't know")
  // needs the audience to see: the state contrast between resolved and
  // outstanding gaps. Q3 then resolves in-frame during stop 4.
  { t: 73.5, kind: "ask", askId: "intake-q3", nodeId: "intake", question: "How are duplicate claims handled?" },
  { t: 74.5, kind: "node-accept", id: "intake" },
  { t: 75.5, kind: "msg", who: "you",   text: "How do you handle duplicates when they come up?" },
  { t: 78.5, kind: "msg", who: "james", text: "We flag and merge — the adjuster reviews both records before choosing the canonical claim." },
  { t: 81.5, kind: "ask-resolve", askId: "intake-q3" },

  { t: 83.0, kind: "msg", who: "james", text: "Right, and from there a claims adjuster is auto-assigned based on claim type and severity." },

  // ---------- Claims Adjuster (col 3, row 2) — one ask ----------
  { t: 86.0, kind: "node-pending", id: "adjuster", type: "role", title: "Claims Adjuster", x: GX(3), y: GY(2), parents: ["intake"] },
  { t: 87.5, kind: "ask", askId: "adj-q1", nodeId: "adjuster", question: "What routing rules assign adjusters?" },
  { t: 89.0, kind: "msg", who: "you",   text: "What's the routing logic for assigning adjusters?" },
  { t: 92.0, kind: "msg", who: "james", text: "Territory and line of business first, then workload balancing across available adjusters." },
  { t: 95.0, kind: "ask-resolve", askId: "adj-q1" },
  { t: 96.0, kind: "node-accept", id: "adjuster" },

  { t: 97.5, kind: "msg", who: "james", text: "They run damage assessment — desk review, field inspection, or a vendor appraisal." },

  // ---------- Damage Assessment (col 4, row 1) — two asks ----------
  { t:100.5, kind: "node-pending", id: "assess", type: "subprocess", title: "Damage Assessment", x: GX(4), y: GY(1), parents: ["adjuster"] },
  { t:102.0, kind: "ask", askId: "assess-q1", nodeId: "assess", question: "What triggers a field inspection vs desk review?" },
  { t:103.5, kind: "msg", who: "you",   text: "When does it go to field vs desk?" },
  { t:106.5, kind: "msg", who: "james", text: "Anything above twenty-five thousand, or where photos are insufficient, goes to field." },
  { t:109.5, kind: "ask-resolve", askId: "assess-q1" },
  { t:110.5, kind: "ask", askId: "assess-q2", nodeId: "assess", question: "Who approves vendor appraisals?" },
  { t:111.5, kind: "msg", who: "you",   text: "And vendor appraisals — who signs those off?" },
  { t:114.5, kind: "msg", who: "james", text: "The assigned adjuster reviews, senior adjuster co-signs anything over fifty thousand." },
  { t:117.5, kind: "ask-resolve", askId: "assess-q2" },
  { t:118.5, kind: "node-accept", id: "assess" },

  // ---------- Field Inspector (col 5, row 0) — no asks ----------
  { t:120.0, kind: "msg", who: "james", text: "Field inspectors handle anything above the threshold — homes, autos, commercial." },
  { t:123.0, kind: "node-pending", id: "inspector", type: "role", title: "Field Inspector", x: GX(5), y: GY(0), parents: ["assess"] },
  { t:124.5, kind: "node-accept", id: "inspector" },

  { t:126.0, kind: "msg", who: "you",   text: "And you mentioned fraud checks earlier — where do those live?" },
  { t:129.0, kind: "msg", who: "james", text: "Fraud screening runs in parallel with assessment, hitting our fraud engine." },

  // ---------- Fraud Screening (col 4, row 3) — two asks ----------
  { t:132.0, kind: "node-pending", id: "fraud", type: "subprocess", title: "Fraud Screening", x: GX(4), y: GY(3), parents: ["adjuster"] },
  { t:133.5, kind: "ask", askId: "fraud-q1", nodeId: "fraud", question: "Which scenarios trigger a SIU referral?" },
  { t:135.0, kind: "msg", who: "you",   text: "What bumps a claim to the SIU team?" },
  { t:138.0, kind: "msg", who: "james", text: "High fraud score, prior loss history, or inconsistencies flagged by the adjuster." },
  { t:141.0, kind: "ask-resolve", askId: "fraud-q1" },
  { t:142.0, kind: "ask", askId: "fraud-q2", nodeId: "fraud", question: "What data feeds the fraud engine?" },
  { t:143.0, kind: "msg", who: "you",   text: "What signals feed into the fraud engine?" },
  { t:146.0, kind: "msg", who: "james", text: "Claim history, external data providers, device fingerprinting, and free-text NLP on the description." },
  { t:149.0, kind: "ask-resolve", askId: "fraud-q2" },
  { t:150.0, kind: "node-accept", id: "fraud" },

  // ---------- Fraud Detection Engine (col 5, row 4) — no asks ----------
  { t:151.5, kind: "node-pending", id: "frauddb", type: "system", title: "Fraud Detection Engine", x: GX(5), y: GY(4), parents: ["fraud"] },
  { t:153.0, kind: "node-accept", id: "frauddb" },

  { t:154.5, kind: "msg", who: "james", text: "Then the adjuster calculates settlement against the policy and submits it for approval." },

  // ---------- Settlement Calculation (col 4, row 2) — three asks ----------
  { t:157.5, kind: "node-pending", id: "settle", type: "process", title: "Settlement Calculation", x: GX(4), y: GY(2), parents: ["assess", "fraud"] },
  { t:159.0, kind: "ask", askId: "settle-q1", nodeId: "settle", question: "What approval limits apply by claim amount?" },
  { t:160.5, kind: "msg", who: "you",   text: "What are the approval tiers by dollar amount?" },
  { t:163.5, kind: "msg", who: "james", text: "Adjuster up to twenty-five thousand, senior adjuster up to two hundred thousand, manager beyond that." },
  { t:166.5, kind: "ask-resolve", askId: "settle-q1" },
  { t:167.5, kind: "ask", askId: "settle-q2", nodeId: "settle", question: "How are deductibles applied?" },
  { t:168.5, kind: "msg", who: "you",   text: "How are deductibles applied in the calc?" },
  { t:171.5, kind: "msg", who: "james", text: "Subtracted from gross loss before policy limits — and we apply waiver rules for CAT events." },
  { t:174.5, kind: "ask-resolve", askId: "settle-q2" },
  { t:175.5, kind: "ask", askId: "settle-q3", nodeId: "settle", question: "What happens when the calculation is disputed?" },
  { t:176.5, kind: "msg", who: "you",   text: "And disputes — what's the path there?" },
  { t:179.5, kind: "msg", who: "james", text: "Reopened as a supplement, re-routed to a senior adjuster for review with a fresh estimate." },
  { t:182.5, kind: "ask-resolve", askId: "settle-q3" },
  { t:183.5, kind: "node-accept", id: "settle" },

  // ---------- Senior Adjuster (col 5, row 2) — no asks ----------
  { t:185.0, kind: "msg", who: "james", text: "Anything above fifty thousand needs a senior adjuster sign-off." },
  { t:188.0, kind: "node-pending", id: "senior", type: "role", title: "Senior Adjuster", x: GX(5), y: GY(2), parents: ["settle"] },
  { t:189.5, kind: "node-accept", id: "senior" },

  // ---------- Payment System (col 6, row 2) — two asks ----------
  { t:191.0, kind: "msg", who: "james", text: "Once approved, payment goes out via our payment system — ACH or check." },
  { t:194.0, kind: "node-pending", id: "pay", type: "system", title: "Payment System", x: GX(6), y: GY(2), parents: ["senior"] },
  { t:195.5, kind: "ask", askId: "pay-q1", nodeId: "pay", question: "How are payment failures reconciled?" },
  { t:197.0, kind: "msg", who: "you",   text: "What happens when a payment fails?" },
  { t:200.0, kind: "msg", who: "james", text: "Auto-retry twice, then the finance team gets a reconciliation task and the customer is contacted." },
  { t:203.0, kind: "ask-resolve", askId: "pay-q1" },
  { t:204.0, kind: "ask", askId: "pay-q2", nodeId: "pay", question: "What payment methods are supported?" },
  { t:205.0, kind: "msg", who: "you",   text: "And what payment methods do you support?" },
  { t:207.5, kind: "msg", who: "james", text: "ACH is default, check as fallback, and virtual cards for preferred vendors." },
  { t:210.5, kind: "ask-resolve", askId: "pay-q2" },
  { t:211.5, kind: "node-accept", id: "pay" },

  // ---------- Reinsurance Notice (col 6, row 0) — no asks ----------
  { t:213.0, kind: "msg", who: "james", text: "For large losses we also notify reinsurance within 48 hours." },
  { t:216.0, kind: "node-pending", id: "reins", type: "process", title: "Reinsurance Notice", x: GX(6), y: GY(0), parents: ["senior"] },
  { t:217.5, kind: "node-accept", id: "reins" },

  // ---------- Claim Closure (col 3, row 4) — two asks ----------
  { t:219.0, kind: "msg", who: "james", text: "After payment, we close the claim, update the policy record, and send a satisfaction survey." },
  { t:222.0, kind: "node-pending", id: "close", type: "subprocess", title: "Claim Closure", x: GX(7), y: GY(2), parents: ["pay"] },
  { t:223.5, kind: "ask", askId: "close-q1", nodeId: "close", question: "What survey triggers fire on closure?" },
  { t:225.0, kind: "msg", who: "you",   text: "What's the follow-up look like after closure?" },
  { t:228.0, kind: "msg", who: "james", text: "CSAT survey at day 3, NPS follow-up at day 30, and the record flows to our CRM for retention." },
  { t:231.0, kind: "ask-resolve", askId: "close-q1" },
  { t:232.0, kind: "ask", askId: "close-q2", nodeId: "close", question: "Can a closed claim be reopened?" },
  { t:233.0, kind: "msg", who: "you",   text: "Can claims get reopened after closure?" },
  { t:236.0, kind: "msg", who: "james", text: "Yes — within 60 days as a supplement, or anytime with manager override." },
  { t:239.0, kind: "ask-resolve", askId: "close-q2" },
  { t:240.0, kind: "node-accept", id: "close" },

  // ---------- Customer CRM (col 2, row 4) — one ask ----------
  { t:241.5, kind: "node-pending", id: "crm", type: "system", title: "Customer CRM", x: GX(8), y: GY(2), parents: ["close"] },
  { t:243.0, kind: "ask", askId: "crm-q1", nodeId: "crm", question: "What closure data syncs to the CRM?" },
  { t:244.5, kind: "msg", who: "you",   text: "What data gets pushed to the CRM from closure?" },
  { t:247.5, kind: "msg", who: "james", text: "Claim summary, payout amount, CSAT score, and any special handling notes for the next touchpoint." },
  { t:250.5, kind: "ask-resolve", askId: "crm-q1" },
  { t:251.5, kind: "node-accept", id: "crm" },
];

const BASE_TIME = new Date(2026, 3, 17, 14, 21, 50).getTime();
function timestampFor(t) {
  const d = new Date(BASE_TIME + t * 1000);
  let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")} ${ampm}`;
}

const NODE_TYPE_LABEL = {
  process:    "PROCESS",
  subprocess: "SUBPROCESS",
  role:       "ROLE",
  system:     "SYSTEM",
};

window.TIMELINE = TIMELINE;
window.timestampFor = timestampFor;
window.NODE_TYPE_LABEL = NODE_TYPE_LABEL;
