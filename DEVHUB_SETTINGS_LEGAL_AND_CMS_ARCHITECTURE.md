# 📜 DevHub Unified Settings, Legal Center & Dynamic Policy CMS Architecture
**Document Reference:** `DEVHUB-SETTINGS-LEGAL-CMS-2026` • **Standard:** LinkedIn / GitHub / Stripe / GDPR / ISO 27001 Aligned  
**Ecosystem Coverage:** Public Web App (`frontend/`), Admin Sentinel (`admin/`), Mobile App (Flutter), Backend (`backend/`)

---

## 1. Executive Overview & Industry Standard Design

In top-tier platforms like **LinkedIn**, **GitHub**, and **Linear**, user account configuration and legal compliance are not fragmented pages; they are structured into a unified, high-density **Settings & Privacy Hub**, paired with a **Dedicated Public Legal Center** and backed by an **Admin Dynamic Policy CMS Engine**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              DEVHUB UNIFIED SETTINGS & LEGAL ECOSYSTEM                                 │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────────────────────┤
│ 1. USER SETTINGS HUB         │ 2. PUBLIC LEGAL PORTAL       │ 3. ADMIN POLICY CMS                      │
│    URL: `/settings`          │    URL: `/terms`, `/privacy` │    URL: `admin/policies`                 │
│                              │         `/guidelines`        │                                          │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────┤
│ • 👤 Profile & Identity      │ • 🛡️ Community Guidelines    │ • 📝 Live Split-View Markdown Editor     │
│ • 🔒 Security & Sessions     │ • 📜 Terms of Service        │ • 🏷️ Semantic Versioning (v1.0 -> v1.1)  │
│ • 🛡️ Privacy & Legal Reader  │ • 🔒 Privacy Policy          │ • 💾 Real-Time Database Persistence      │
│ • 📦 GDPR Data Portability   │ • 🖨️ Print & PDF Generator   │ • ⚡ Socket.IO Live Broadcast            │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. User Experience & Navigation Discovery Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │           DEVHUB MAIN APP              │
                                  └──────────────────┬─────────────────────┘
                                                     │
         ┌─────────────────────────┬─────────────────┴─────────────────┬─────────────────────────┐
         ▼                         ▼                                   ▼                         ▼
┌─────────────────┐       ┌─────────────────┐                 ┌─────────────────┐       ┌─────────────────┐
│  LEFT SIDEBAR   │       │ TOP NAVBAR MENU │                 │  RIGHT SIDEBAR  │       │  AUTH SCREENS   │
├─────────────────┤       ├─────────────────┤                 ├─────────────────┤       ├─────────────────┤
│ • ⚙️ Settings    │       │ • 👤 My Profile │                 │ • Mini-Footer:  │       │ • Register Form │
│ • 🛡️ Trust &    │       │ • ⚙️ Settings    │                 │   Guidelines    │       │ • Login Form    │
│   Guidelines    │       │ • 🛡️ Policies   │                 │   Terms         │       │ • Clickable     │
│ • 🚪 Sign Out   │       │ • 🚪 Sign Out   │                 │   Privacy       │       │   Legal Notice  │
└─────────────────┘       └─────────────────┘                 └─────────────────┘       └─────────────────┘
```

### Discovery Hierarchy:
1. **Left Sidebar (`Sidebar.jsx`):** Dedicated navigation buttons for `Settings` (⚙️) and `Trust & Guidelines` (🛡️) right above the `Sign Out` button.
2. **Top Navbar Avatar Menu (`TopNavbar.jsx`):** Quick-access dropdown items: `My Profile`, `Account Settings`, `Trust & Policies`, and `Sign Out`.
3. **Right Sidebar Mini-Footer (`RightSidebar.jsx`):** LinkedIn-style metadata footer on the feed: `Guidelines • Terms of Service • Privacy Policy • Trust Desk • © 2026 DevHub`.
4. **Authentication Screens (`RegisterPage.jsx` & `LoginPage.jsx`):** Legal agreement disclaimer with active routing.

---

## 3. LinkedIn-Grade Multi-Tab Settings Hub (`/settings`)

The current basic form on `SettingsPage.jsx` is transformed into a **4-tab enterprise settings console**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SETTINGS CENTER LAYOUT                                           │
├──────────────────────┬─────────────────────────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION       │ ACTIVE TAB CONTENT PANELS                                                       │
├──────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 👤 1. Profile Details│ • Professional Status, Company, Location, Skills Matrix                         │
│                      │ • Short Headline & Extended About Me Story                                      │
│                      │ • Social Profiles (GitHub, LinkedIn, Portfolio Website)                         │
├──────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 🔒 2. Security &     │ • Change Password Form (Current, New, Confirm)                                  │
│       Sessions       │ • Cryptographic Session Invalidation ($O(1)$ Token Purge)                       │
│                      │ • Active Device / IP Log (Current Browser + Remote Sign-out)                    │
├──────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 🛡️ 3. Privacy &      │ • Live In-App Legal Reader (View Guidelines, Terms, Privacy from DB)            │
│       Legal          │ • Status Visibility Mode (Online / Invisible Stealth Toggle)                    │
├──────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 📦 4. Data & Account │ • GDPR Data Portability: 1-Click "Download My Data Archive (.json)"             │
│       Management     │ • Danger Zone: Permanent Account Deletion & Cryptographic Purge                 │
└──────────────────────┴─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Dedicated Public Legal & Trust Portal (`/legal`, `/terms`, `/privacy`, `/guidelines`)

A standalone, high-contrast, responsive legal portal (`LegalCenterPage.jsx`) accessible to authenticated and unauthenticated users alike.

### Key Capabilities:
- **Dynamic Database Hydration:** Queries `GET /api/policies/:slug` to render real-time policies with offline markdown fallback.
- **Sticky Table of Contents:** Fast navigation between sections.
- **Compliance Badges:** ISO/IEC 27001, GDPR Art. 13/14, and CCPA certification headers.
- **Print & PDF Generator:** Built-in CSS print styling for legal exports.

---

## 5. Admin Dynamic Policy CMS Console (`admin/src/components/PolicyCMS.jsx`)

Super Admins can manage, edit, version, and publish all platform legal policies in real-time without redeploying code.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ADMIN POLICY CMS CONSOLE                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SELECT POLICY: [ 🛡️ Community Guidelines ]  [ 📜 Terms of Service ]  [ 🔒 Privacy Policy ]             │
├───────────────────────────────────────────────────┬────────────────────────────────────────────────────┤
│ 📝 MARKDOWN SOURCE EDITOR                         │ 👁️ LIVE RENDERED PREVIEW (REAL-TIME)               │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ # Community Guidelines                            │ # Community Guidelines                             │
│                                                   │                                                    │
│ ## Section 1: Zero Tolerance for Malware          │ ## Section 1: Zero Tolerance for Malware           │
│ Developers may not post exploit payloads...       │ Developers may not post exploit payloads...        │
├───────────────────────────────────────────────────┴────────────────────────────────────────────────────┤
│ CHANGE LOG REASON: [ Updated Section 1 with AI safety rules                          ]                 │
│ ACTION: [ Save Draft ]  [ 🚀 Publish & Broadcast Update (v1.1.0) ]                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Features:
1. **Live Split-View:** Left side Markdown editor, Right side rendered HTML with syntax highlighting.
2. **Automated Semantic Versioning:** Tracks revision history (e.g. `v1.0.0` -> `v1.1.0`).
3. **Operator Attribution & Audit Trail:** Records `lastUpdatedBy` with Super Admin identity into immutable WORM audit logs.
4. **Socket.IO Real-Time Broadcast:** Emits `policy_updated` so open client tabs refresh without page reload.

---

## 6. Database Models & API Schemas

### 6.1 Policy Model (`backend/src/models/Policy.js`)
```javascript
const policySchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['guidelines', 'terms', 'privacy'] 
  },
  title: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  content: { type: String, required: true }, // Full Markdown Text
  lastUpdatedBy: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    email: String,
    name: String,
  },
  changelog: [{
    version: String,
    changeSummary: String,
    updatedAt: { type: Date, default: Date.now },
    updatedByEmail: String,
  }],
}, { timestamps: true });
```

### 6.2 API Endpoints Matrix

| HTTP Method | Route | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/policies/:slug` | **Public** | Fetch active policy content (Cached / Fast) |
| `GET` | `/api/policies` | **Public** | Fetch all active policy metadata & versions |
| `PUT` | `/api/admin/policies/:slug` | **Super Admin** | Update policy content, increment version, log audit trail |
| `GET` | `/api/users/export-data` | **Authenticated** | Generate 1-Click GDPR personal data archive (.json) |

---

## 7. Step-by-Step Implementation Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             IMPLEMENTATION PHASES & TASKS                                │
├───────────┬──────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1   │ Backend Policy Engine:                                                       │
│           │ • Create `Policy.js` model with initial production markdown content.        │
│           │ • Implement `getPolicyBySlug`, `getAllPolicies`, `updatePolicy` controller. │
│           │ • Add GDPR Data Export endpoint (`GET /api/users/export-data`).              │
├───────────┼──────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2   │ Public Web App Frontend:                                                     │
│           │ • Upgrade `SettingsPage.jsx` into 4-Tab LinkedIn-grade console.              │
│           │ • Build `LegalCenterPage.jsx` with dynamic database loading & fallback.     │
│           │ • Mount routes in `App.jsx` (`/terms`, `/privacy`, `/guidelines`, `/legal`). │
├───────────┼──────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3   │ Admin Panel Policy CMS:                                                      │
│           │ • Build `PolicyCMS.jsx` with Markdown editor, split-preview, and publish bar.│
│           │ • Add "Legal CMS" tab into `AdminSidebar.jsx` and `App.jsx`.                │
├───────────┼──────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4   │ Navigation & Multi-Channel Links:                                            │
│           │ • Update `Sidebar.jsx`, `TopNavbar.jsx`, `RightSidebar.jsx`,                 │
│           │   `RegisterPage.jsx`, and `LoginPage.jsx`.                                   │
├───────────┼──────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5   │ Verification & Automated Testing:                                            │
│           │ • Run `scratch/test_settings_and_policies.js` test suite.                    │
│           │ • Execute `npm run build` on `frontend` and `admin`.                         │
└───────────┴──────────────────────────────────────────────────────────────────────────────┘
```
