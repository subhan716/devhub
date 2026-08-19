# 🛡️ DevHub Unified Operations & Admin Control Center (LinkedIn-Grade)
## Enterprise Cross-Platform Operations, Trust & Safety, Fleet Governance & Compliance Architecture

> **Document Classification:** Master Operations Blueprint & Technical Implementation Standard  
> **Industry Reference:** LinkedIn Operations Hub, Meta Trust & Safety Sentinel, Stripe Dashboard  
> **Platform Scope:** Web Application (`localhost:5173`), Mobile Application (iOS & Android Flutter App), Operations Console (`localhost:5174`)  
> **Backend Stack:** Node.js, Express.js 5.x, MongoDB Atlas, Redis (Mutex/Queues), Socket.IO, Firebase Cloud Messaging (FCM), Apple Push Notification service (APNs)  
> **Database Architecture Decision:** **Strict Decoupling of Internal Admin Operators (`admin_users`) from Platform End-Users (`users`)** for zero-trust compliance, strict PII isolation, and clean micro-domain boundaries.

---

## 📑 Table of Contents
1. [Executive Ecosystem & High-Concurrency Architecture](#1-executive-ecosystem--high-concurrency-architecture)
2. [Multi-Tier Role-Based Access Control (RBAC) & Zero-Trust Security](#2-multi-tier-role-based-access-control-rbac--zero-trust-security)
   - [2.1 Domain Isolation (`admin_users` vs `users`)](#21-domain-isolation-admin_users-vs-users)
   - [2.2 Role Hierarchy Matrix (L0 to L5)](#22-role-hierarchy-matrix)
   - [2.3 Cryptographic Scope Array in JWT](#23-cryptographic-scope-array-in-jwt)
3. [LinkedIn-Grade Trust & Safety Engine (T&S Sentinel)](#3-linkedin-grade-trust--safety-engine-ts-sentinel)
   - [3.1 Distributed Ticket Queue with Mutex Locking (Redis)](#31-distributed-ticket-queue-with-mutex-locking-redis)
   - [3.2 4-Eyes Principle (Dual-Authorization / Maker-Checker)](#32-4-eyes-principle-dual-authorization--maker-checker)
   - [3.3 Stealth Shadowbanning & Bot Isolation Engine](#33-stealth-shadowbanning--bot-isolation-engine)
   - [3.4 Automated Heuristic Spam & Toxicity Filters](#34-automated-heuristic-spam--toxicity-filters)
4. [Mobile App Fleet Governance (iOS & Android Flutter)](#4-mobile-app-fleet-governance-ios--android-flutter)
   - [4.1 Dynamic Version Gatekeeper & Force-Update Controller](#41-dynamic-version-gatekeeper--force-update-controller)
   - [4.2 Over-The-Air (OTA) Feature Flags & Dynamic Killswitches](#42-over-the-air-ota-feature-flags--dynamic-killswitches)
   - [4.3 Remote Session Invalidation & Device Killswitch](#43-remote-session-invalidation--device-killswitch)
   - [4.4 Enterprise Push Notification Broadcast Engine (FCM / APNs)](#44-enterprise-push-notification-broadcast-engine-fcm--apns)
5. [User Identity & Forensic Security Hub](#5-user-identity--forensic-security-hub)
   - [5.1 Multi-Category Verification Authority (Badges & Tiers)](#51-multi-category-verification-authority-badges--tiers)
   - [5.2 Multi-Account Correlation & Ban Evasion Graph](#52-multi-account-correlation--ban-evasion-graph)
6. [Real-Time Telemetry, Network Graph & Business Analytics](#6-real-time-telemetry-network-graph--business-analytics)
7. [Immutable Security Audit Stream & GDPR Compliance](#7-immutable-security-audit-stream--gdpr-compliance)
8. [Database Schema Specifications (MongoDB Mongoose)](#8-database-schema-specifications-mongodb-mongoose)
   - [8.1 Admin User Schema (`backend/src/models/AdminUser.js`)](#81-admin-user-schema)
   - [8.2 Moderation Ticket Schema (`backend/src/models/ModerationTicket.js`)](#82-moderation-ticket-schema)
   - [8.3 App Configuration Schema (`backend/src/models/AppConfig.js`)](#83-app-configuration-schema)
   - [8.4 Audit Log Schema (`backend/src/models/AuditLog.js`)](#84-audit-log-schema)
9. [Complete Backend Admin API Reference Dictionary](#9-complete-backend-admin-api-reference-dictionary)
10. [Admin Portal Frontend UI Component Architecture](#10-admin-portal-frontend-ui-component-architecture)
11. [Step-by-Step Implementation Roadmap](#11-step-by-step-implementation-roadmap)

---

## 1. Executive Ecosystem & High-Concurrency Architecture

DevHub operations are built as a **distributed, event-driven operations control plane** capable of governing millions of users across Web, iOS, and Android while supporting hundreds of concurrent internal operators without race conditions or data corruption.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DEVHUB OPERATIONS & CONTROL CENTER (PORT 5174)              │
├──────────────────────┬───────────────────────────────┬──────────────────────┤
│  Super Admin Console │  Trust & Safety Queue (Hotkeys│  Mobile Fleet Center │
│  RBAC & Access Matrix│  Live Stream Telemetry        │  Audit Trail Explorer│
└──────────────────────┴───────────────┬───────────────┴──────────────────────┘
                                       │ (HTTPS REST + Admin JWT Scope Guard)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENTERPRISE ADMIN GATEWAY LAYER (PORT 5000)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  • RBAC & Scope Interceptor (Zero-Trust L0 to L5 Verification)              │
│  • Dedicated `admin_users` Authentication & Auth Guard                      │
│  • Redis Mutex Lock Manager (Distributed Concurrency Protection)            │
│  • Push Notification Worker (Firebase Cloud Messaging + APNs)               │
│  • Write-Once-Read-Many (WORM) Immutable Audit Logger                       │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
                        ▼                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     WEB APPLICATION (5173)    │             │   FLUTTER MOBILE APP (iOS/AND)│
├───────────────────────────────┤             ├───────────────────────────────┤
│ • React SPA                   │             │ • Flutter 3.x Native Client   │
│ • Cookie & WebSocket Sync     │             │ • Bearer Header Authentication│
│ • Browser Push Notifications  │             │ • Native FCM / APNs Push      │
│ • Live Socket Stream          │             │ • Version Gate & Remote Kill  │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 2. Multi-Tier Role-Based Access Control (RBAC) & Zero-Trust Security

### 2.1 Domain Isolation (`admin_users` vs `users`)
To adhere to enterprise security and regulatory requirements (SOC2, GDPR):
- **Internal Operators (`admin_users`)**: Stored in a separate, isolated database collection with dedicated password hashing, session expiration, and rate limiting.
- **Platform End-Users (`users`)**: Purely customer data (developers, designers, recruiters) with no internal administrative fields.

### 2.2 Role Hierarchy Matrix

| Tier | Role Key | Target Personnel | Core Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **L5: Super Admin** | `super_admin` | CTO, Founders (`devhubapp.support@gmail.com`) | Full platform control, RBAC role granting, database disaster recovery, global app killswitch, raw API keys, brand settings. |
| **L4: Operations Manager** | `ops_manager` | T&S Leads, Operations Heads | 4-Eyes approval review, moderator shift management, spam filter threshold tuning, broadcast announcements. |
| **L3: Safety & Compliance Officer**| `safety_officer` | Senior Compliance Staff | Account suspension, legal/DMCA takedowns, child safety/harassment triage, GDPR data erasures. |
| **L2: Content Moderator** | `moderator` | Content Moderation Team | Review reported posts/comments, dismiss false flags, delete spam, apply user warnings. *(User PII masked)*. |
| **L1: Support Specialist** | `support_agent` | Customer Service Staff | OTP assistance, profile recovery, ticket handling. Read-only profile view with masked emails. |
| **L0: Growth & BI Analyst** | `analyst` | Data & Marketing Teams | Read-only access to anonymized analytics, retention cohorts, DAU/MAU metrics, conversion funnels. |

### 2.3 Cryptographic Scope Array in JWT
Every administrative action verifies granular scopes embedded in the session:
```json
{
  "adminId": "6a8584640d6872a2ba3e7bb9",
  "role": "super_admin",
  "scopes": [
    "users:read", "users:write", "users:suspend", "users:badge", "users:role",
    "content:read", "content:delete", "content:triage",
    "mobile:config", "mobile:push", "mobile:kill",
    "audit:read", "analytics:read"
  ],
  "ipSubnet": "192.168.1.0/24"
}
```

---

## 3. LinkedIn-Grade Trust & Safety Engine (T&S Sentinel)

### 3.1 Distributed Ticket Queue with Mutex Locking (Redis)
When 200 moderators simultaneously review 5,000 reported posts, naive database queries result in duplicate actions. DevHub Sentinel implements **Distributed Mutex Locking**:

```
[ User Reports Ingestion ]
           │
           ▼
[ Redis Priority Queue: HIGH / MED / LOW ]
           │
           ├───► Mod A clicks "Next Case" ───► [ Acquired Mutex: Post #402 (TTL: 5 min) ]
           │                                          │
           │                                     Post #402 locked & hidden from other 199 mods
           │                                          │
           └───► Mod B clicks "Next Case" ───► [ Acquired Mutex: Post #403 (TTL: 5 min) ]
```

1. **PULL-Mode Auto-Assignment:** Moderators do not pick cases manually from a list. Clicking **"Start Triage Session"** automatically pops the highest priority report.
2. **5-Minute Soft Lock:** If a moderator closes their tab or remains idle, the Redis lock automatically expires and returns the case to the global queue.
3. **Speed Console Hotkeys:**
   - `J` / `K` ➔ Next / Previous Case
   - `D` ➔ Delete Post & Send Warning
   - `S` ➔ Stealth Shadowban
   - `A` ➔ Approve & Dismiss Report

### 3.2 4-Eyes Principle (Dual-Authorization / Maker-Checker)
High-impact destructive actions (e.g. banning an account with >5,000 connections, or deleting a verified company profile) require dual authorization:
1. **Maker (L2 Moderator):** Flags account: *"Propose Suspension for @bad_actor (Reason: Copyright Infringement)"*.
2. **Checker (L4 Lead Admin):** Receives notification in the **Approval Inbox**.
3. **Execution:** Database mutation only occurs once the Lead Admin verifies and cryptographically approves the ticket.

### 3.3 Stealth Shadowbanning & Bot Isolation Engine
- When an abusive user or automated spam bot is shadowbanned (`isShadowBanned: true`):
  - **Offender's Experience:** They can still post, like, and comment normally on their screen without error.
  - **Platform Experience:** The feed and search algorithms silently filter their posts for all other users.
  - **Benefit:** Spammers and botnet controllers do not realize they have been neutralized, preventing them from instantly generating new accounts.

### 3.4 Automated Heuristic Spam & Toxicity Filters
- Real-time pre-filter inspects all incoming posts and comments for:
  - Known phishing / scam domains.
  - Rapid message velocity (>10 posts per minute ➔ auto-flagged).
  - Malicious / obfuscated script payloads in code blocks.

---

## 4. Mobile App Fleet Governance (iOS & Android Flutter)

### 4.1 Dynamic Version Gatekeeper & Force-Update Controller
Controls minimum supported mobile versions dynamically from the admin panel without backend code modifications:

```json
{
  "android": {
    "minVersion": "1.0.2",
    "latestVersion": "1.1.0",
    "forceUpdate": true,
    "storeUrl": "https://play.google.com/store/apps/details?id=com.devhub.app",
    "releaseNotes": "Critical security patches & 60 FPS feed optimization."
  },
  "ios": {
    "minVersion": "1.0.2",
    "latestVersion": "1.1.0",
    "forceUpdate": true,
    "storeUrl": "https://apps.apple.com/app/devhub/id123456789",
    "releaseNotes": "Support for iOS 18 dynamic widgets and biometric login."
  }
}
```

- **Flutter Client Handshake (`/api/admin/public/app-config`):**
  - If `installed_version < minVersion` AND `forceUpdate == true` ➔ App displays a non-dismissible modal directing user to App Store / Play Store.

### 4.2 Over-The-Air (OTA) Feature Flags & Dynamic Killswitches
Admins can toggle mobile features instantly across all active apps:
- `feature_code_sharing`: `true` / `false`
- `feature_video_upload`: `true` / `false`
- `feature_job_board`: `true` / `false`
- `feature_dmca_scanner`: `true` / `false`

### 4.3 Remote Session Invalidation & Device Killswitch
- **1-Click Remote Invalidation:** When an account is suspended or reported for fraud, the admin triggers `POST /api/admin/users/:id/revoke-sessions`.
- Backend clears `user.refreshToken`. On the next API request from the Flutter app, the `DioClient` interceptor receives `401 Unauthorized` and clears local `FlutterSecureStorage`, returning the app to the login screen.

### 4.4 Enterprise Push Notification Broadcast Engine (FCM / APNs)
- Multi-Channel Broadcast Manager:
  - **Channel 1 (In-App Banner):** Web & Mobile top sticky alert bar.
  - **Channel 2 (System Notification Inbox):** Injected into user's `/api/notifications` feed.
  - **Channel 3 (Native Push Notification):** Dispatched via Firebase Cloud Messaging & APNs to iOS/Android device lock screens.
- **Targeting Segments:**
  - `ALL_USERS`: Entire registered platform base.
  - `MOBILE_ONLY`: Users with registered mobile FCM tokens.
  - `VERIFIED_ONLY`: Developers with verified blue checkmarks.
  - `INACTIVE_USERS`: Users inactive for >14 days (re-engagement campaign).

---

## 5. User Identity & Forensic Security Hub

### 5.1 Multi-Category Verification Authority (Badges & Tiers)
1-Click verification badge assignment across developer and creator categories:
- 🔵 **Verified Developer / Architect:** Industry professional badge (`isVerifiedBadge: true`).
- 🌟 **Top Open-Source Creator:** Star contributor badge.
- 🏢 **Official Organization / Enterprise:** Corporate recruitment badge.

### 5.2 Multi-Account Correlation & Ban Evasion Graph
- Correlates user accounts based on:
  - Shared IP Subnets & Login Timestamps.
  - Shared GitHub / Google OAuth email domains.
  - Device Fingerprint IDs (Mobile device UUID & Browser Canvas hash).

---

## 6. Real-Time Telemetry, Network Graph & Business Analytics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     LIVE PLATFORM HEALTH TELEMETRY                          │
├─────────────────────┬─────────────────────┬───────────────────┬─────────────┤
│ Total Users         │ Active Web Sockets  │ Active Mobile App │ Posts / Min │
│ 142,850 (+12% MoM)  │ 3,420 Live Users    │ 8,910 Live Users  │ 42.8 / min  │
└─────────────────────┴─────────────────────┴───────────────────┴─────────────┘
```

- **Key Metrics Tracked in Real-Time:**
  - **Active Fleet:** Live Web sockets vs Mobile Flutter app sockets.
  - **Engagement Velocity:** Likes, Reposts, and Messages exchanged per second.
  - **Spam Anomaly Spike Detector:** Alert triggers if post velocity exceeds 500% of baseline.
  - **Network Graph Density:** Mutual connection clusters across technologies (React, Rust, Flutter, Python).

---

## 7. Immutable Security Audit Stream & GDPR Compliance

Every mutation made by any admin is recorded in an **immutable, append-only database collection** (`AuditLog`):

```json
{
  "_id": "6a4b768c...",
  "timestamp": "2026-08-19T14:45:00.000Z",
  "actor": {
    "adminId": "6a8584640d6872a2ba3e7bb9",
    "name": "DevHub Root Administrator",
    "email": "devhubapp.support@gmail.com",
    "role": "super_admin"
  },
  "action": "USER_SUSPENDED",
  "target": {
    "entityType": "User",
    "entityId": "67bc910a2f...",
    "targetEmail": "spammer@botnet.com"
  },
  "details": {
    "reason": "Automated crypto spam detected",
    "previousState": { "isSuspended": false },
    "newState": { "isSuspended": true }
  },
  "ipAddress": "192.168.1.15",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0"
}
```

---

## 8. Database Schema Specifications (MongoDB Mongoose)

### 8.1 Admin User Schema (`backend/src/models/AdminUser.js`)
```javascript
const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['super_admin', 'ops_manager', 'safety_officer', 'moderator', 'support_agent', 'analyst'], 
    default: 'super_admin' 
  },
  scopes: [{ type: String }],
  isActive: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  maxDailyActions: { type: Number, default: 2000 },
  dailyActionsCount: { type: Number, default: 0 },
  refreshToken: { type: String, select: false }
}, { timestamps: true });

adminUserSchema.index({ email: 1 }, { unique: true });
adminUserSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('AdminUser', adminUserSchema);
```

### 8.2 Moderation Ticket Schema (`backend/src/models/ModerationTicket.js`)
```javascript
const mongoose = require('mongoose');

const moderationTicketSchema = new mongoose.Schema({
  targetType: { 
    type: String, 
    enum: ['post', 'comment', 'user', 'message'], 
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    enum: ['spam', 'harassment', 'malicious_code', 'copyright', 'impersonation', 'other'], 
    required: true 
  },
  details: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { 
    type: String, 
    enum: ['pending', 'locked', 'resolved', 'dismissed', 'escalated'], 
    default: 'pending' 
  },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  lockedUntil: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  resolutionAction: { type: String, enum: ['deleted', 'warned', 'shadowbanned', 'dismissed'] },
  resolutionNotes: { type: String },
}, { timestamps: true });

moderationTicketSchema.index({ status: 1, priority: 1, createdAt: 1 });

module.exports = mongoose.model('ModerationTicket', moderationTicketSchema);
```

### 8.3 App Configuration Schema (`backend/src/models/AppConfig.js`)
```javascript
const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'global_config', unique: true },
  android: {
    minVersion: { type: String, default: '1.0.0' },
    latestVersion: { type: String, default: '1.0.0' },
    forceUpdate: { type: Boolean, default: false },
    storeUrl: { type: String, default: '' },
    releaseNotes: { type: String, default: '' },
  },
  ios: {
    minVersion: { type: String, default: '1.0.0' },
    latestVersion: { type: String, default: '1.0.0' },
    forceUpdate: { type: Boolean, default: false },
    storeUrl: { type: String, default: '' },
    releaseNotes: { type: String, default: '' },
  },
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'DevHub is undergoing scheduled infrastructure upgrades.' },
  },
  featureFlags: {
    codeSharing: { type: Boolean, default: true },
    videoUploads: { type: Boolean, default: true },
    directMessaging: { type: Boolean, default: true },
  }
}, { timestamps: true });

appConfigSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('AppConfig', appConfigSchema);
```

### 8.4 Audit Log Schema (`backend/src/models/AuditLog.js`)
```javascript
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
  },
  action: { type: String, required: true, index: true },
  target: {
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    targetEmail: { type: String },
    targetName: { type: String },
  },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

---

## 9. Complete Backend Admin API Reference Dictionary

All routes are mounted under `/api/admin` and protected by `protect` and `protectAdmin`.

| Method | Endpoint | Allowed Roles | Request Body Schema | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | All Admin Roles | — | Platform telemetry: users, active sockets, posts, pending tickets. |
| `GET` | `/api/admin/users` | All Admin Roles | `?page=1&limit=20&search=...&role=...&status=...` | Paginated user management table. |
| `PUT` | `/api/admin/users/:id/status` | `admin`, `super_admin` | `{ "action": "toggleSuspend" \| "toggleShadowban", "reason": string }` | Suspend or shadowban user account. |
| `PUT` | `/api/admin/users/:id/badge` | `admin`, `super_admin` | — | 1-Click Toggle verified checkmark badge (`isVerifiedBadge`). |
| `PUT` | `/api/admin/users/:id/role` | `super_admin` | `{ "role": "user" \| "moderator" \| "admin" }` | Change user RBAC permission role. |
| `POST`| `/api/admin/users/:id/revoke-sessions` | `super_admin` | `{ "reason": string }` | Invalidate all active mobile & web refresh tokens. |
| `GET` | `/api/admin/reports` | All Admin Roles | `?status=pending&priority=high&page=1` | Content moderation triage queue. |
| `POST`| `/api/admin/reports/:id/action` | All Admin Roles | `{ "action": "delete" \| "dismiss" \| "delete_and_ban", "reason": string }` | Resolve reported content. |
| `POST`| `/api/admin/broadcast` | `admin`, `super_admin` | `{ "title": string, "message": string, "type": string, "link": string }` | Dispatch multi-channel broadcast alert. |
| `GET` | `/api/admin/app-config` | All Admin Roles | — | Fetch mobile app versioning and feature flags. |
| `PUT` | `/api/admin/app-config` | `super_admin` | `{ "android": { ... }, "ios": { ... }, "maintenanceMode": { ... } }` | Update mobile app version rules. |
| `GET` | `/api/admin/public/app-config`| Public | — | Flutter Mobile app handshake on startup. |
| `GET` | `/api/admin/audit-logs` | `super_admin` | `?page=1&limit=50` | Query immutable audit forensics trail. |

---

## 10. Admin Portal Frontend UI Component Architecture

Located in `admin/src/`:

```
admin/src/
├── api/
│   └── adminApi.js             # Axios client with credentials & error toast
├── components/
│   ├── layout/
│   │   ├── AdminSidebar.jsx    # Sleek navigation drawer with RBAC tab filtering
│   │   ├── AdminHeader.jsx     # Current admin profile, socket live indicator, logout
│   │   └── MetricCard.jsx      # Glowing neon stat cards with trend indicators
│   ├── users/
│   │   ├── UserTable.jsx       # User list with 1-click badge toggle & role dropdown
│   │   └── UserDetailsModal.jsx# Full user forensics (IP history, devices, reports)
│   ├── moderation/
│   │   ├── ReportQueueCard.jsx # Hotkey-enabled moderation review card
│   │   └── CodeReviewViewer.jsx# Syntax-highlighted suspicious code viewer
│   ├── broadcast/
│   │   └── PushComposerModal.jsx# Multi-channel push notification composer
│   └── common/
│       ├── ConfirmModal.jsx    # Destructive action double-confirmation dialog
│       ├── StatusPill.jsx      # Color-coded badge chips for roles and statuses
│       └── Pagination.jsx      # Reusable pagination component
├── pages/
│   ├── AdminLoginPage.jsx      # Zero-trust login console (`http://localhost:5174/login`)
│   ├── AdminDashboardPage.jsx  # Overview metrics, charts, quick operational actions
│   ├── UsersManagementPage.jsx # Full user database search, verification, and bans
│   ├── ContentModerationPage.jsx# Reported posts/comments triage queue
│   ├── BroadcastPage.jsx       # Global banner & mobile push notification manager
│   ├── MobileAppConfigPage.jsx # Mobile version gatekeeper & maintenance controls
│   └── AuditLogsPage.jsx       # Immutable security audit trail explorer
└── store/
    └── useAdminStore.js        # Global admin session & real-time socket state
```

---

## 11. Step-by-Step Implementation Roadmap

```mermaid
graph TD
    A[Phase 1: Decoupled AdminUser Schema & Backend APIs] --> B[Phase 2: Admin Dashboard & Telemetry UI]
    B --> C[Phase 3: User Governance & 1-Click Badge Engine]
    C --> D[Phase 4: Content Moderation & Triage Console]
    D --> E[Phase 5: Mobile App Version Gate & Push Dispatch UI]
    E --> F[Phase 6: Immutable Audit Forensics & Security Hardening]
```

- [x] **Milestone 1:** Decoupled `admin_users` collection & Super Admin `devhubapp.support@gmail.com` active.
- [x] **Milestone 2:** Reverted `subhanshahid839@gmail.com` to regular user.
- [x] **Milestone 3:** Enterprise Database indexes synced in MongoDB Atlas.
- [x] **Milestone 4:** Complete `/api/admin/*` REST API suite active.
- [ ] **Milestone 5:** Admin Frontend UI tabs (Mobile Versioning, Audit Logs, 1-Click Badge) completed.
