# 📜 DevHub Unified Trust, Legal & Automated Email Architecture
**Document Reference:** `DEVHUB-LEGAL-EMAIL-SPEC-2026` • **Standard:** Enterprise / LinkedIn / GitHub / GDPR / ISO 27001 Aligned  
**Ecosystem Coverage:** Public Web (React + Vite), Mobile App (Flutter), Admin Sentinel (Port 5174), Backend (Node.js/SendGrid)

---

## 1. Executive Legal & Regulatory Compliance Framework

DevHub operates as a high-density professional social network and code collaboration ecosystem featuring real-time messaging, multi-language syntax sandboxing, and administrative zero-trust governance. To protect user intellectual property, establish explicit moderation jurisdiction, and ensure 100% email deliverability without spam penalties, the platform adheres to international regulatory frameworks:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               GLOBAL REGULATORY & COMPLIANCE MATRIX                              │
├─────────────────────────┬──────────────────────────┬─────────────────────────────────────────────┤
│ REGULATION / STANDARD   │ JURISDICTION             │ PLATFORM ENFORCEMENT & MANDATORY CONTROLS   │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────────────────┤
│ GDPR (EU 2016/679)      │ European Union & Global  │ • Art. 17: Right to Erasure (Account Purge) │
│                         │                          │ • Art. 20: Data Portability (1-Click JSON)  │
│                         │                          │ • Art. 13/14: Transparent Privacy Policy    │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────────────────┤
│ CCPA / CPRA             │ California, United States│ • Explicit "Do Not Sell My Personal Info"   │
│                         │                          │ • Consumer disclosure on telemetry logging  │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────────────────┤
│ CAN-SPAM Act & RFC 8058 │ International Email Std  │ • Physical address in all email footers     │
│                         │                          │ • One-Click Unsubscribe & Direct Legal URLs │
│                         │                          │ • Non-deceptive headers & sender identity   │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────────────────┤
│ Apple UGC Guideline 1.2 │ iOS App Store Submission │ • Published Developer Code of Conduct       │
│ Google Play UGC Policy  │ Android Fleet Submission │ • In-app 1-click reporting mechanism        │
│                         │                          │ • 24-hour T&S Sentinel Moderation Protocol  │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────────────────┤
│ ISO/IEC 27001 & SOC 2   │ Information Security     │ • Zero-Trust session invalidation ($O(1)$)  │
│                         │                          │ • Immutable WORM audit logs for actions     │
└─────────────────────────┴──────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. Multi-Channel Legal Discovery & User Experience Architecture

Policy documents must be easily accessible, highly legible, printable, and transparently presented at critical authentication and interaction touchpoints across the entire ecosystem.

```
                               ┌──────────────────────────────────────────────┐
                               │       DEVHUB TRUST & LEGAL PORTAL            │
                               │  URL: `/legal` • `/terms` • `/privacy`       │
                               │             `/guidelines`                    │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌─────────────────────────┬──────────────────┴───────────────────┬─────────────────────────┐
         ▼                         ▼                                      ▼                         ▼
┌─────────────────┐       ┌─────────────────┐                    ┌─────────────────┐       ┌─────────────────┐
│  LEFT SIDEBAR   │       │ TOP NAVBAR MENU │                    │  RIGHT SIDEBAR  │       │  AUTH SCREENS   │
├─────────────────┤       ├─────────────────┤                    ├─────────────────┤       ├─────────────────┤
│ • Dedicated     │       │ • Profile       │                    │ • Desktop Mini- │       │ • Signup / Login│
│   "Trust &      │       │   Avatar Menu   │                    │   Footer Links  │       │   Disclaimers   │
│   Guidelines"   │       │ • "Trust &      │                    │ • Guidelines    │       │ • Explicit      │
│   Action Button │       │   Policies" Link│                    │ • Terms • Policy│       │   Consent Check │
└─────────────────┘       └─────────────────┘                    └─────────────────┘       └─────────────────┘
         │                         │                                      │                         │
         └─────────────────────────┴──────────────────┬───────────────────┴─────────────────────────┘
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │ AUTOMATED EMAIL LEGAL FOOTER│
                                       ├─────────────────────────────┤
                                       │ • Terms • Privacy • Rules   │
                                       │ • Physical Company Address  │
                                       │ • Unsubscribe Preferences   │
                                       └─────────────────────────────┘
```

### Discovery Hierarchy Touchpoints:
1. **Left Navigation Drawer (`Sidebar.jsx`):** Persistent `Trust & Guidelines` action item positioned immediately above the `Sign Out` button on both desktop and mobile drawer views.
2. **Profile Avatar Menu (`TopNavbar.jsx`):** `Trust & Policies` dropdown item linking to the Legal Center with a single click.
3. **Right Sidebar Mini-Footer (`RightSidebar.jsx`):** LinkedIn-style metadata footer: `Guidelines • Terms of Service • Privacy Policy • Trust Desk • © 2026 DevHub`.
4. **Authentication Gates (`RegisterPage.jsx` & `LoginPage.jsx`):** Explicit agreement statement: *"By creating an account or signing in, you agree to DevHub's Terms of Service, Privacy Policy, and Community Guidelines."*
5. **Transactional Email Footers:** Standardized dark-mode legal signature on every system email dispatch.

---

## 3. Deep Legal Text & Production Policy Clauses

### 3.1 Master Terms of Service (`/terms`)

```
MASTER SERVICE AGREEMENT & DEVELOPER TERMS
Effective Date: August 20, 2026 • Last Revised: August 20, 2026
```

#### Clause 1: Account Eligibility & Authentication Security
- Users must be at least 13 years of age (or the minimum legal age required in their country) to create a DevHub account.
- Users connecting via GitHub OAuth or Google OAuth agree to maintain valid, authorized credentials.
- Users are solely responsible for all activities occurring under their session tokens. DevHub provides cryptographic session termination ($O(1)$ token version invalidation) in Account Settings.

#### Clause 2: 100% Developer Intellectual Property Ownership
- **Developers retain full, unencumbered intellectual property ownership of all original source code, repository snippets, architectures, and project descriptions published on DevHub.**
- By publishing content publicly, the user grants DevHub a non-exclusive, worldwide, royalty-free license to host, cache, render, syntax-highlight, and index the content solely for the purpose of operating, securing, and promoting the DevHub developer network.

#### Clause 3: Prohibited Exploits & Malicious Activities
Users agree NOT to engage in:
- Scraping, automated bot extraction, or rate-limit circumvention without explicit API authorization.
- Reverse engineering or exploiting vulnerabilities in the DevHub platform or another developer's published code.
- Credential harvesting, distributed denial-of-service (DDoS), or distribution of unauthenticated payload execution scripts.

#### Clause 4: Trust & Safety Sentinel Jurisdiction & Moderation Authority
- DevHub Trust & Safety Sentinel reserves the right to sandbox, flag, shadow-filter, or permanently delete any content or terminate user accounts that breach these Terms or the Community Guidelines.
- Administrative moderation actions are logged to an immutable Write-Once-Read-Many (WORM) audit trail for legal compliance.

#### Clause 5: Service Availability, Maintenance & Disclaimers
- DevHub operates with a **99.9% uptime target**. Scheduled maintenance windows are announced in advance via the Network Broadcast Sentinel.
- DevHub is provided on an "AS IS" and "AS AVAILABLE" basis. DevHub disclaims all liability for uncommitted draft posts or third-party open-source code executed by users locally.

---

### 3.2 Developer Community Guidelines & Code of Conduct (`/guidelines`)

```
DEVELOPER CODE OF CONDUCT & COMMUNITY STANDARDS
Standard: Professional Developer Respect & Security Integrity
```

#### Standard 1: Zero Tolerance for Malicious Code & Exploit Payloads
- **Prohibited Content:** Trojans, ransomware, keyloggers, botnet agents, unauthenticated reverse shells, weaponized zero-days, or cryptocurrency miners.
- **Educational PoC Standard:** Educational security research and Proof-of-Concepts (PoCs) are permitted **only if**:
  1. Clearly disclaimed as educational research in the post heading.
  2. The code is non-destructive and cannot execute autonomously against live infrastructure.
  3. Safe test vectors (e.g. `127.0.0.1` or `example.com`) are utilized.

#### Standard 2: Secret & Credential Quarantine
- Developers must never post production API keys (Stripe, AWS, OpenAI, GitHub), private SSH certificates, database connection strings containing passwords, or JSON Web Key Sets (JWKS) private keys.
- DevHub automated heuristics immediately quarantine posts containing exposed live secret patterns to protect the developer from credential theft.

#### Standard 3: Professional Technical Discourse & Anti-Harassment
- DevHub is built for collaborative engineering. We encourage rigorous technical debate, constructive code reviews, and architectural critique.
- We strictly prohibit:
  - Personal attacks, ad hominem insults, hate speech, racism, or discriminatory conduct.
  - Doxxing (publishing another person's private address, phone number, or confidential employer data).
  - Targeted downvoting campaigns or connection spamming.

#### Standard 4: Open Source License Compliance & Anti-Plagiarism
- Developers must respect open-source licenses (MIT, Apache 2.0, GNU GPLv3, BSD).
- Repositories and snippets derived from existing open-source work must retain original copyright notices and proper author attribution. Plagiarism or claiming sole credit for community-maintained repositories will result in immediate content removal.

#### Standard 5: Automated 3-Strike Governance Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             3-TIER STRIKE ENFORCEMENT & QUARANTINE                               │
├─────────┬──────────────────────┬───────────────────────────────┬─────────────────────────────────┤
│ TIER    │ TRIGGER SEVERITY     │ PLATFORM RESTRICTIONS         │ RECOVERY / EXPIRATION           │
├─────────┼──────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ STRIKE 1│ Minor policy breach  │ • Content removed             │ Expires after 90 days of clean  │
│         │ (Spam, uncredited)   │ • Formal in-app & email notice│ platform standing.              │
│         │                      │ • 24h shadow-filtering applied│                                 │
├─────────┼──────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ STRIKE 2│ Repeated violation or│ • 7-day read-only lockout     │ Expires after 180 days. User is │
│         │ severe harassment    │ • Cannot post, comment or chat│ placed on monitored probation.  │
│         │                      │ • Loss of Verified Badge      │                                 │
├─────────┼──────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ STRIKE 3│ 3 accumulated strikes│ • Automated account suspension│ Permanent unless reversed by    │
│         │ or critical exploit  │ • Cryptographic session purge │ formal Trust & Safety appeal.   │
│         │ distribution         │ • Complete network quarantine │                                 │
└─────────┴──────────────────────┴───────────────────────────────┴─────────────────────────────────┘
```

---

### 3.3 Global Privacy Policy (`/privacy`)

```
GLOBAL DATA PROTECTION & PRIVACY POLICY
Framework: GDPR (EU 2016/679) • CCPA/CPRA (California) • PIPEDA Aligned
```

#### Section 1: Ingested Developer Data Inventory
1. **Direct Profile Data:** Name, email, profile avatar, technical headline, skills array, experience history, education records, and GitHub profile URL.
2. **Content Data:** Code snippets, discussions, comments, direct messages (encrypted in transit and at rest), and reaction metrics.
3. **Security & Session Telemetry:** Cryptographic session tokens, login timestamps, device user agents, and hashed IP addresses used solely for account defense and brute-force detection.

#### Section 2: Zero Third-Party Data Monetization Covenant
- **DevHub will NEVER sell, license, rent, or trade your personal information, email address, connection network, or code snippets to data brokers, advertising networks, or third-party recruiters without your explicit opt-in consent.**

#### Section 3: Data Subject Rights (GDPR Articles 15–22 & CCPA)
- **Right to Access & Data Portability (Article 20):** Developers can download a comprehensive, machine-readable `.json` archive of their entire profile, posts, comments, and connection records directly from Account Settings or via Super Admin export.
- **Right to Erasure / Right to be Forgotten (Article 17):** When an account is deleted, all personal records, active sessions, and private messages are purged from production databases.
- **Right to Rectification (Article 16):** Full self-service editing of all profile and identity fields.

#### Section 4: Cryptographic Cookie & Session Storage
- DevHub uses strictly necessary, first-party `HttpOnly`, `SameSite=Strict`, `Secure` cookies and encrypted `localStorage` for JWT authentication. DevHub does NOT utilize third-party tracking pixels or cross-site behavioral cookies.

---

## 4. Automated Transactional Email Engine (`emailService.js`)

### 4.1 Dispatch Architecture & Failover Circuit Breaker

```
                           ┌─────────────────────────────────────┐
                           │      SYSTEM APPLICATION EVENT       │
                           │  (Strike, Ban, Session Revocation)  │
                           └──────────────────┬──────────────────┘
                                              │
                                              ▼
                           ┌─────────────────────────────────────┐
                           │      `emailService.js` ENGINE       │
                           │  • HTML Template Compiler           │
                           │  • Legal Signature Attachment       │
                           │  • RFC 8058 Header Injection        │
                           └──────────────────┬──────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │ (Primary: SendGrid Web API HTTPS)           │ (Fallback: Nodemailer SMTP)
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │     SENDGRID REST API       │               │       GMAIL / SMTP TLS      │
        │ • Port 443 (Never blocked)  │ ── Failover ─►│ • Port 587 STARTTLS         │
        │ • Dedicated IP Deliverability│               │ • Direct authenticated relay│
        └──────────────┬──────────────┘               └──────────────┬──────────────┘
                       │                                             │
                       └──────────────────────┬──────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   RECIPIENT INBOX (GMAIL,   │
                               │   OUTLOOK, PROTON, APPLE)   │
                               └─────────────────────────────┘
```

### 4.2 Linear-Dark HTML Email Design System Tokens
All transactional emails generated by DevHub adhere to a modern dark-mode responsive design system:

```css
/* Email Design Tokens */
:root {
  --bg-canvas: #050508;
  --bg-card: #0D0D14;
  --border-card: #1F1F2E;
  --text-primary: #FFFFFF;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --brand-cyan: #00F0FF;
  --alert-red: #EF4444;
  --warning-amber: #F59E0B;
  --success-green: #10B981;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
```

### 4.3 Production HTML Template Boilerplate (`Linear-Dark Standard`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #050508; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; }
    .container { max-width: 580px; margin: 0 auto; padding: 32px 16px; }
    .card { background-color: #0D0D14; border: 1px solid #1F1F2E; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .logo-text { font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; text-decoration: none; }
    .logo-cyan { color: #00F0FF; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace; letter-spacing: 0.5px; text-transform: uppercase; }
    .badge-warning { background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-danger { background-color: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-info { background-color: rgba(0, 240, 255, 0.15); color: #00F0FF; border: 1px solid rgba(0, 240, 255, 0.3); }
    .heading { font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 16px 0 8px 0; line-height: 1.3; }
    .body-text { font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px 0; }
    .detail-box { background-color: #08080C; border: 1px solid #1F1F2E; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #E2E8F0; }
    .btn { display: inline-block; background-color: #00F0FF; color: #000000; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 10px; text-align: center; margin-top: 8px; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #64748B; line-height: 1.6; }
    .footer a { color: #94A3B8; text-decoration: underline; margin: 0 6px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://devhub-sub.vercel.app" class="logo-text">Dev<span class="logo-cyan">Hub</span></a>
    </div>

    <!-- Main Card -->
    <div class="card">
      {{badgeHtml}}
      <h1 class="heading">{{heading}}</h1>
      <p class="body-text">{{bodyText}}</p>

      {{#if detailBox}}
      <div class="detail-box">
        {{{detailBox}}}
      </div>
      {{/if}}

      {{#if actionUrl}}
      <div style="text-align: center; margin-top: 24px;">
        <a href="{{actionUrl}}" class="btn">{{actionText}}</a>
      </div>
      {{/if}}
    </div>

    <!-- Legal & Compliance Footer (CAN-SPAM / GDPR) -->
    <div class="footer">
      <p>
        <a href="https://devhub-sub.vercel.app/guidelines">Community Guidelines</a> •
        <a href="https://devhub-sub.vercel.app/terms">Terms of Service</a> •
        <a href="https://devhub-sub.vercel.app/privacy">Privacy Policy</a>
      </p>
      <p style="margin-top: 8px;">
        DevHub Corporation • Trust & Safety Operations<br>
        This is an official administrative notice regarding your account security.
      </p>
    </div>
  </div>
</body>
</html>
```

### 4.4 Complete Email Trigger Matrix & Data Schemas

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TRANSACTIONAL EMAIL SPECIFICATIONS                                   │
├─────────────────────┬────────────────────────────────┬──────────────────────────┬──────────────────────┤
│ EVENT / ACTION      │ SUBJECT TEMPLATE               │ BADGE TIER               │ ACTION BUTTON (CTA)  │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 1. Strike Issued    │ `[DevHub] Community Warning:   │ `⚠️ STRIKE #{n} RECORDED`│ `Review Guidelines`  │
│                     │ Strike #{n} Issued`            │ (Amber)                  │ `/guidelines`        │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 2. Content Removed  │ `[DevHub] Notice of Content    │ `🛡️ CONTENT QUARANTINED` │ `View Policy Standards`│
│                     │ Removal: Policy Violation`     │ (Amber)                  │ `/guidelines`        │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 3. Account Suspended│ `[URGENT] Your DevHub Account  │ `🚨 ACCOUNT SUSPENDED`   │ `Contact Trust Desk` │
│                     │ Has Been Suspended`            │ (Red)                    │ `mailto:support...`  │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 4. Access Restored  │ `[DevHub] Account Reinstated:  │ `✅ ACCESS RESTORED`     │ `Go to Feed`         │
│                     │ Access Restored`               │ (Green)                  │ `/feed`              │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 5. Badge Granted    │ `🎉 Congratulations! You are a │ `⭐ VERIFIED DEVELOPER`  │ `View Profile`       │
│                     │ Verified Developer on DevHub`  │ (Cyan)                   │ `/profile`           │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 6. Sessions Revoked │ `[Security Alert] Your Active  │ `🔒 SESSIONS PURGED`     │ `Secure Account`     │
│                     │ DevHub Sessions Were Terminated`│ (Red)                   │ `/settings`          │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 7. Critical Advisory│ `[CRITICAL ADVISORY] Action    │ `🚨 SECURITY DIRECTIVE`  │ `Review Advisory`    │
│                     │ Required: DevHub Security`     │ (Red)                    │ `/settings`          │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 8. Connect Request  │ `[DevHub] {Name} wants to      │ `👥 CONNECTION INVITE`   │ `Accept Connection`  │
│                     │ connect with you`              │ (Blue)                   │ `/network`           │
├─────────────────────┼────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ 9. Unread Digest    │ `[DevHub] You have unread      │ `💬 UNREAD CONVERSATION` │ `Open Chat`          │
│                     │ messages from {Name}`          │ (Blue)                   │ `/messages`          │
└─────────────────────┴────────────────────────────────┴──────────────────────────┴──────────────────────┘
```

---

## 5. End-to-End Execution & Testing Plan

### Step 1: Frontend Legal & Trust Center Portal (`frontend/src/`)
1. Implement `frontend/src/pages/LegalCenterPage.jsx` with tabbed views for `/guidelines`, `/terms`, and `/privacy`.
2. Configure route declarations in `frontend/src/App.jsx`.
3. Mount navigation entry points in `Sidebar.jsx`, `TopNavbar.jsx`, `RightSidebar.jsx`, `LoginPage.jsx`, and `RegisterPage.jsx`.

### Step 2: Backend Email Notification Engine (`backend/src/`)
1. Create `backend/src/services/emailService.js` with responsive Linear-Dark HTML template generator.
2. Integrate `emailService` into `adminController.js` methods (`issueUserStrike`, `moderateReportedPost`, `updateUserStatus`, `revokeUserSessions`, and `broadcastNotification`).
3. Integrate `emailService` into `connectionController.js` for connection invitation emails.

### Step 3: Verification & Automated Test Suite
1. Run `scratch/test_legal_and_emails.js`:
   - Validates template HTML generation for all 9 email events.
   - Verifies CAN-SPAM and GDPR legal footer links.
   - Triggers real SendGrid/SMTP dispatch and checks delivery logs.
2. Build production assets (`npm run build`) for `frontend` and `admin` to verify 0 syntax or bundling regressions.
