# Beacon — The Integrated Student Operating System

> **Adaptive AI Tutor • Personal Progress Graph • Career Experiments • Evidence-Backed Opportunities**

Beacon transforms the scattered student experience into a single, disciplined feedback loop. Built strictly to the working product specification (formerly PathOS, renamed **Beacon**), it implements full data provenance, a LinkedIn-caliber student Passport with certificate file storage, an Internshala-grade Opportunity Radar with 1-click application workflows, interactive 3D sculptures and progress graphs, and a candid, protective "Big Brother" AI companion.

---

## 🚀 Quick Start

### 1. Install & Build
```bash
cd beacon-app
npm install
npm run build
```

### 2. Run the Application
```bash
npm run dev
# or for production performance:
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 What You Need To Put (API Keys & Environment)

1. **Groq API Key (Optional but Recommended)**:
   - Create a free account at [console.groq.com](https://console.groq.com) and generate an API key (starts with `gsk_...`).
   - You can supply it in two easy ways:
     - **Option A (In App UI)**: Click the **"AI Engine (Groq)"** button in the top navigation bar of Beacon OS or visit the **Settings & Privacy** page, paste your key, and click Save.
     - **Option B (`.env.local`)**: Create a `.env.local` file in `beacon-app/`:
       ```env
       GROQ_API_KEY=gsk_your_groq_api_key_here
       ```
   - **Note:** If you don't provide a Groq key right away, Beacon automatically runs its built-in **Local Big Brother Reasoning Engine**, which is fully contextualized with your student profile, CGPA, exam schedules, and active tasks.

---

## 🎨 Visual Identity & Architecture (Strict PRD Compliance)

- **Color Tokens**:
  - `Ice Silver` (`#E7ECEF`): Main page canvas (never pure white).
  - `Ice Silver Deep` (`#D1D9DF`): Structural surfaces and cards.
  - `Deep Aubergine` (`#43223B`): Brand anchor, headings, primary actions.
  - `Marigold` (`#F2B734`): High-contrast progress markers, decision nodes, and accents.
  - `Graphite Plum` (`#2F2932`): High-contrast text in place of pure black.
  - `Steel Line` (`#B6C0C8`): Architectural borders.
- **3D Interactive Visuals**:
  - **Beacon Atlas (WebGL)**: Asymmetrical architectural sculpture of interlocking brushed-silver planes, deep aubergine monoliths, and marigold decision nodes with mouse parallax and prefers-reduced-motion fallback.
  - **3D Student Progress Graph**: Orbital node visualizer linking goals, skills, prerequisites, and opportunities.
  - **3D Holographic Certificate Cards**: Interactive tilt cards with dynamic sheen.
- **Iconography**: Bespoke, original SVG inline geometry (no Lucide, no emoji, no starbursts).

---

## 📂 Complete Platform Sitemap

### Public Marketing Experience
| Route | Description |
|---|---|
| `/` | **Homepage**: Hero with 3D Beacon Atlas, editorial workflow, trust proof, single clear CTA. |
| `/product` | **Architecture Deep-Dive**: Student Progress Graph, Provenance Engine, Big Brother Agent. |
| `/academy` | **Beacon Academy**: Hint-first pedagogy, diagnostic testing, and misconception mapping. |
| `/career-and-projects` | **Career Sandbox**: Realistic job mini-tasks, rubrics, and artifact evidence. |
| `/opportunities` | **Opportunity Radar**: Source verification protocol, freshness timestamps, no pay-to-rank. |
| `/about` | **Principles & Mission**: Zero-fabrication pledge, founder-ready specification. |
| `/help` | **Help & Student Safety**: Minor safeguards, reporting channels, crisis hotline redirects. |
| `/privacy` | **Privacy Policy**: Full DPDP 2025 compliance, purpose notice, data rights. |
| `/terms` | **Terms of Service**: Acceptable use, intellectual property, outcome disclaimers. |

### Authenticated Student OS (`/app/*`)
| Route | Description |
|---|---|
| `/app` | **Today / Overview**: Weekly Meaningful Progress (WMPU) tracker, 3D progress graph, radar alerts. |
| `/app/passport` | **My Passport**: LinkedIn-style student profile, education, verified skills with provenance tags (`Self-reported`, `Source-backed`, `Artifact-backed`, `Human-reviewed`), Certificate Locker with file upload/preview, and Master Resume manager. |
| `/app/guide` | **Beacon Guide (AI)**: "Big Brother" AI companion powered by Groq Llama 3.3 70B or local engine. Generates tasks, audits courses, critiques code. |
| `/app/opportunities` | **Opportunity Radar**: Internshala-grade portal with verified internships (ISRO, Razorpay, GSoC, Flipkart), eligibility match scoring, and 1-click apply. |
| `/app/roadmap` | **My Roadmap**: Milestone planning, task boards, dependency chains, auto-rescheduling. |
| `/app/academy` | **Adaptive Tutor**: Interactive baseline diagnostics, hint-by-hint step explanations. |
| `/app/career-lab` | **Career Sandbox**: Live job simulations (SRE Redis Failover, Frontend Combobox, RAG evals) with rubric grading. |
| `/app/projects` | **Projects & Proof**: Deliverables, repository verification, benchmark scores. |
| `/app/mentors` | **Mentors & Circles**: Verified practitioners, student-controlled Mentor Brief generator. |
| `/app/decision-studio` | **Decision Studio**: Side-by-side career comparison matrix with counterfactuals. |
| `/app/reviews` | **Activity & Reviews**: Weekly meaningful progress reviews and student reflections. |
| `/app/settings` | **Settings & Privacy**: Context Ledger memory inspector/deletion, Groq key manager, DPDP JSON export. |
