# ⚙️ DevHub Settings Page Master Architecture & UI Specification
**Document Reference:** `DEVHUB-SETTINGS-SPEC-2026` • **Standard:** LinkedIn / GitHub / Linear / Stripe Developer Standard  
**Design Directive:** Clean DevHub Dark Aesthetic (`#0A0A0A` / `#111111`, `#00F0FF` accents, zero clutter, 100% functional)

---

## 1. Executive Summary & Design Principles

The **DevHub Settings Hub (`/settings`)** serves as the central control plane for a developer's identity, cryptographic security, privacy, communications, and data rights. 

### Core UI Principles:
1. **Clean DevHub Native Theme:** Matches existing cards (`#111111`, `border-white/5`, `rounded-2xl`) and accents (`#00F0FF`).
2. **No Over-Design / Clutter:** Simple, functional inputs, high-contrast text, clear helper notes, and responsive tabs.
3. **Industry Standard Depth:** Matches GitHub and LinkedIn capabilities (Session Revocation, GDPR Export, Privacy Toggles, Profile Identity).
4. **Desktop & Mobile Responsive:** Smooth vertical sidebar on desktop and clean horizontal scrolling pill tabs on mobile screens.

---

## 2. Multi-Tab Navigation Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DEVHUB SETTINGS HUB LAYOUT                                               │
├───────────────────────────────┬────────────────────────────────────────────────────────────────────────────────┤
│ LEFT VERTICAL TABS (DESKTOP)  │ ACTIVE CONTENT PANEL (RIGHT 8 COLS)                                            │
├───────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ 👤 1. Profile & Identity      │ Personal info, Headline, Company, Skills Matrix, About Story, Social Links     │
│ 🔒 2. Security & Credentials  │ Password change, Active Session Forensics, Remote Sign-Out Killswitch          │
│ 👁️ 3. Privacy & Visibility    │ Online Status Toggle, Search Discovery, Code Post Defaults                     │
│ 🔔 4. Notifications           │ In-App notification alerts, Email notification digest preferences              │
│ 🛡️ 5. Legal & Policies        │ In-App Reader for Community Guidelines, Terms of Service, Privacy Policy       │
│ 📦 6. Data & Account (GDPR)   │ 1-Click GDPR Machine-Readable JSON Export, Permanent Account Deletion          │
└───────────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Deep Specification of Each Settings Tab

### Tab 1: 👤 Profile & Professional Identity
*Purpose: Manage public identity visible to recruiters, peers, and connections.*

1. **Avatar & Cover Section:**
   - Profile photo preview with 1-click Cloudinary upload/replace.
   - Verified Developer Blue Badge indicator (if verified by Admin).
2. **Primary Identity Fields:**
   - **Full Name:** Editable user display name.
   - **Professional Status / Headline:** Quick-select dropdown (Software Engineer, Full Stack, Mobile, DevOps, etc.) + custom typing.
   - **Company / Organization:** Current employer or startup name.
   - **Location:** City, Country / Remote status.
3. **Technical Skills Matrix:**
   - Dynamic tag input (comma separated or interactive chips: React, Node.js, Flutter, Docker, Go).
4. **Bio & Extended About Me Story:**
   - Short Headline (220 chars max for feed cards).
   - Extended Markdown About Story (2000 chars max for full profile overview).
5. **Developer & Social Profiles:**
   - Personal Portfolio Website URL.
   - GitHub Username (used for repo syncing & public card preview).
   - LinkedIn Profile URL.

---

### Tab 2: 🔒 Security, Credentials & Session Forensics
*Purpose: Zero-trust account protection and cryptographic session control.*

1. **Change Password Form:**
   - Current Password field (required for verification).
   - New Password field (strength validation: min 6 chars, alphanumeric).
   - Confirm Password field.
2. **Active Sessions & Device Forensics:**
   - Displays current session metadata: Browser (Chrome/Firefox/Safari), OS (Windows/macOS/Linux), and IP address.
   - Live status indicator: `Current Active Device (Green Pulse)`.
3. **Remote Device Killswitch ($O(1)$ Token Invalidation):**
   - **"Revoke All Other Sessions" Button:** Instantly invalidates all other active JWT refresh tokens across all other laptops and mobile phones.
   - Uses `ConfirmModal` safety guard before triggering logout.

---

### Tab 3: 👁️ Privacy & Visibility Controls
*Purpose: Control developer presence and search discoverability.*

1. **Presence & Online Status:**
   - **Online Mode vs. Invisible / Stealth Mode Toggle:** Choose whether other developers can see when you are currently online in direct messaging.
2. **Search Discoverability:**
   - **Suggested Connections Algorithm Toggle (On / Off):** Allow or disallow DevHub from recommending your profile to other developers in your city/tech stack.
3. **Code Post Default Visibility:**
   - Default visibility setting when creating new code posts: `Public (Global Feed)` or `Connections Only`.

---

### Tab 4: 🔔 Notifications & Communication Preferences
*Purpose: Fine-tune alerts so developers never get spammed.*

1. **In-App Notification Toggles:**
   - 💬 *Direct Messages received*
   - 👥 *New Connection Requests*
   - 💬 *Comments & Code Reviews on your posts*
   - ❤️ *Reactions & Likes on your posts*
2. **Email Notification Digest Toggles:**
   - 📧 *Offline Direct Message Alerts* (Email sent if unread for > 15 minutes).
   - 🚨 *Critical Security Advisories & Policy Updates* (Mandatory / Non-disableable).

---

### Tab 5: 🛡️ Legal, Trust & Policy Reader
*Purpose: In-app transparency and direct compliance reference.*

1. **In-App Policy Selector:**
   - 🛡️ *Community Guidelines & Code of Conduct*
   - 📜 *Master Terms of Service*
   - 🔒 *Global Privacy Policy (GDPR / CCPA)*
2. **Dynamic Live Content Box:**
   - Fetches live text from `GET /api/policies/:slug` (with instant cache fallback).
   - Displays current Semantic Version (e.g. `v1.0.0`) and Effective Date.
3. **Full Portal Link:**
   - Direct button to open the full standalone Legal Portal (`/guidelines` or `/terms`).

---

### Tab 6: 📦 Data Sovereignty, Portability & Account Deletion (GDPR)
*Purpose: Full GDPR/CCPA compliance and user data sovereignty.*

1. **GDPR Article 20: 1-Click Personal Data Portability Archive:**
   - Card explaining developer data ownership.
   - **"Download My Data Archive (.json)" Button:** Downloads complete machine-readable `.json` containing:
     - Account metadata
     - Full Profile history
     - All published Posts & Code Snippets
     - All Comments & Discussion threads
     - Connection network list
2. **GDPR Article 17: Permanent Account Deletion (Danger Zone):**
   - Red high-contrast danger card explaining irreversible data purge.
   - **"Delete My DevHub Account" Button:** Triggers confirmation modal with password requirement to prevent accidental loss.

---

## 4. Navigation & Placement Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              DISCOVERY & PLACEMENT CHECKLIST                                           │
├──────────────────────────────┬─────────────────────────────────────────────────────────────────────────┤
│ 1. Left Sidebar              │ Main Feed links: Feed, My Networks, Jobs, Messaging.                    │
│                              │ Bottom area: Trust & Legal Center, Sign Out.                            │
├──────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
│ 2. Top Navbar Avatar Menu    │ Click Avatar -> My Profile, ⚙️ Account Settings, 🛡️ Trust & Legal,     │
│                              │ Sign Out.                                                               │
├──────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
│ 3. Right Sidebar Mini-Footer │ Working links: Guidelines, Terms of Service, Privacy Policy, Trust Desk.│
├──────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
│ 4. Register & Login Pages    │ Agreement text with active links to `/terms`, `/privacy`, `/guidelines`.│
└──────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Step-by-Step Implementation Roadmap

1. **Update `SettingsPage.jsx` Layout:**
   - Create left vertical navigation tabs on desktop (horizontal pills on mobile).
   - Implement all 6 modular tab panels matching the existing DevHub dark card theme.
2. **Connect Backend APIs:**
   - Tab 1: `GET /api/profile/me` & `POST /api/profile`
   - Tab 2: `PUT /api/auth/update-password` & `POST /api/auth/logout`
   - Tab 5: `GET /api/policies/:slug`
   - Tab 6: `GET /api/profile/export-data`
3. **Build & Verify:**
   - Execute `npm run build` on `frontend` and `admin` to verify 0 errors.
   - Verify all tab transitions, forms, session killswitch, and GDPR JSON export download.
