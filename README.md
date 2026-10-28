# CaseLens – AICTE Integrated Case Monitoring & Overlap Detection Dashboard

> **Institutional Complaint Case Monitoring & Hybrid Overlap Detection System**  
> Developed as a demonstration prototype for the **Smart India Hackathon (SIH)**.

---

## 📌 Executive Summary

**CaseLens** is an integrated institutional case monitoring and algorithmic overlap detection platform designed for technical education regulatory oversight under the **All India Council for Technical Education (AICTE)** framework.

The platform provides a dual-portal architecture sharing a unified, persistent relational database:
1. **Public Student Grievance Portal** (`/submit-complaint` & `/track`): Allows students and parents to lodge institutional complaints without login or registration. Every submission generates an encrypted, tamper-evident unique **Case ID** (e.g., `AICTE-2026-XXXXX`). Students track their grievance lifecycle through two-factor email verification without exposing confidential officer remarks or other students' complaints.
2. **Private Officer & Admin Portal** (`/dashboard`, `/cases`, `/institutions`, `/overlaps`, `/reports`, `/settings`): Authorized bureau administrators and regional directors manage complaints, enforce jurisdictional scoping, coordinate investigations, conduct audit inquiries, and review automated grievance overlap suggestions.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **UI & Styling**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **Database & ORM**: SQLite (`dev.db`) managed via [Prisma ORM 5](https://www.prisma.io/)
- **Authentication & Security**: Server-side JWT sessions (`jose`), `bcryptjs` password hashing, HTTPOnly SameSite cookies, in-memory rate limiting, and server-side RBAC
- **Validation**: Server-side and client-side [Zod](https://zod.dev/) schemas
- **Testing**: Automated end-to-end unit and integration test runner with Node / `tsx`

---

## 🔑 Demo Seed Accounts & Credentials

> ⚠️ **Demo Notice:** These pre-configured credentials are provided strictly for demonstration and hackathon evaluation. The login interface includes one-click quick-fill buttons for convenience.

| Role | Name | Official Email | Demo Password | Scope & Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Alok Verma | `admin@caselens.aicte.gov.in` | `Admin@CaseLens2026!` | Full clearance: all cases, institutions, audit logs, user provisioning, settings |
| **Bureau Officer** | Smt. Sunita Rao | `bureau.officer@caselens.aicte.gov.in` | `Bureau@CaseLens2026!` | Nationwide cases: internal remarks, case assignment, status transitions, overlap reviews |
| **Regional Officer (North)** | Shri Rajesh Sharma | `ro.north@caselens.aicte.gov.in` | `Regional@CaseLens2026!` | **Strictly scoped to North Region**: Delhi, UP, Punjab, Haryana, HP, J&K |
| **Regional Officer (South)** | Dr. K. S. Ramanathan | `ro.south@caselens.aicte.gov.in` | `Regional@CaseLens2026!` | **Strictly scoped to South Region**: Karnataka, Kerala, Lakshadweep |

---

## 🧮 4-Factor Hybrid Overlap Detection Engine

The `/overlaps` module detects potentially related grievances (such as mass student protests against illegal capitation fees, unaccredited courses, or defunct lab equipment) using a transparent 4-factor scoring formulation:

$$\text{Weighted Score} = (0.40 \times \text{Text}) + (0.30 \times \text{Institution}) + (0.20 \times \text{Category}) + (0.10 \times \text{Date Window})$$

### Scoring Breakdown
1. **Semantic & Lexical Text Similarity (40% Weight)**:
   - Tokenization with grievance-specific stopword filtering.
   - Term Frequency (TF) cosine vector similarity across subject and description.
   - Bigram and Trigram Jaccard coefficient for catching verbatim phrase repetitions (e.g. *"charging 65,000 without receipt"*).
2. **Institution Identity (30% Weight)**:
   - 100% score for matching AICTE Permanent Institute ID (PID) or exact database ID.
   - Fuzzy string matching for partial campus names.
3. **Grievance Category (20% Weight)**:
   - 100% score for identical AICTE grievance classification.
   - 50% score for related domains (e.g. Capitation Fee vs. Admission Refund).
4. **Temporal Incident Window (10% Weight)**:
   - 100% if complaints are filed within 7 days.
   - 80% if within 30 days; 50% within 90 days.

### Classification Thresholds
- **High Confidence Match**: Weighted score $\ge 70\%$
- **Potential Match**: Weighted score $50\% - 69\%$
- **Needs Review**: Weighted score $35\% - 49\%$

### Regulatory Safeguards
- **Advisory Only**: The engine **never** automatically merges, closes, or deletes complaints.
- **Human In the Loop**: An authorized officer must review the suggested match, enter a justification note, and formally confirm or dismiss the suggestion.
- **Audit Logging**: Every confirmation or rejection is permanently logged in the system audit trail.

### Algorithm Limitations & Production Roadmap
- *Prototype Baseline*: In this hackathon build, text similarity is computed deterministically using TF-IDF cosine similarity, n-gram token overlap, and Levenshtein metrics.
- *Production Enhancement*: When deployed with dedicated GPU/CPU microservices, Sentence-BERT (`all-MiniLM-L6-v2`) or OpenAI/Vertex text embeddings can be plugged into `src/lib/overlap-detector.ts` without changing database schemas or frontend contracts.

---

## 🧭 Application Routes

### Public Portal (No Authentication Required)
- `/`: Welcome home page with portal switcher and institutional disclaimer.
- `/submit-complaint`: Student complaint registration form with live institution selector and PID auto-fill.
- `/track`: Two-factor status inquiry requiring matching **Case ID** + **Registered Student Email**.

### Private Officer Portal (Protected by Server-Side JWT Cookie)
- `/login`: Secure officer authentication with demo quick-fill profiles.
- `/dashboard`: Real-time KPI cards, Recharts visualizations, monthly influx trend, and recent cases.
- `/cases`: Paginated registry with multi-criteria filtering (status, priority, bureau, category, search).
- `/cases/[id]`: Detailed case inspection, status transitions, internal notes, and bidirectional overlap alerts.
- `/institutions`: AICTE institutions directory with aggregated complaint counts.
- `/institutions/[id]`: Campus profile detailing historical and open grievance records.
- `/overlaps`: Side-by-side grievance comparison and review adjudication.
- `/reports`: Statistical summaries, CSV export with injection sanitization, and browser Print-to-PDF.
- `/settings`: Super-Admin user provisioning and immutable audit log viewer.

---

## ⚡ Setup & Installation

### 1. Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `10+`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="caselens-aicte-hackathon-2026-super-secure-token-key-32chars"
NEXT_PUBLIC_APP_NAME="CaseLens"
NEXT_PUBLIC_APP_SUBTITLE="AICTE Case Monitoring System"
NODE_ENV="development"
```

### 4. Initialize Database & Seed Demo Data
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed 4 demo officers, 10 institutions, 37 complaints, 3 overlap clusters, and initial audit logs
npm run seed
```

### 5. Run Automated Tests
```bash
# Runs the 10-point unit test suite
npm test

# Runs the end-to-end integration test suite
npx tsx test/integration-test.ts
```

### 6. Build & Launch Application
```bash
# Production Build
npm run build

# Start Production Server (runs on http://localhost:3000)
npm start

# Or Development Mode
npm run dev
```

---

## 🛡️ Security & Privacy Guarantees

1. **Role-Based Regional Scoping**: Regional Officers can only view complaints whose institution falls within their region. Queries enforce this on the server side (`WHERE institution.region CONTAINS officer.region`).
2. **Student Privacy**: Public status checks strictly redact internal officer notes, officer names, internal IDs, and other students' identities.
3. **CSV Injection Defense**: Exported spreadsheets sanitize cells starting with formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) to protect officers opening exports in MS Excel.
4. **Rate Limiting**: Public submission and login endpoints are wrapped with in-memory sliding window rate limiters.
5. **No Passwords in Audit Logs**: Audit events record timestamps, action names, entity IDs, and actor emails, but never passwords or token secrets.

---

## 📜 Disclaimer
This software is a demonstration prototype developed for Smart India Hackathon internal evaluation. It is not an official AICTE production service unless formally integrated and approved by AICTE authorities. All seeded institutional records and complaints are fictional demo cases.

#   C a s e l e n s  
 