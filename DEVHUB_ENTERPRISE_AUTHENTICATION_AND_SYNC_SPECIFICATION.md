# 🔐 DevHub Enterprise Authentication, Identity & Fleet Sync Specification (v2.0)

> **Document Type:** Production Architecture & Security Specification  
> **Status:** Approved for Implementation & Fleet Deployment  
> **Ecosystem Parity:** Web App (React 19 / Vite), Mobile App (iOS / Android), Admin Governance Panel, and Supabase PostgreSQL Engine.

---

## 1. 🏛️ Executive Summary & Design Philosophy

DevHub’s authentication ecosystem is engineered to deliver a **Silicon Valley / LinkedIn-grade user experience** combined with **military-grade security and cross-platform synchronization**.

Instead of abrupt redirects and primitive credentials, DevHub utilizes a **unified Identity & Session Lifecycle** spanning:
1. **Web App (`https://devhub-sub.vercel.app`)**: Dual-Token Security (Memory Access Token + `SameSite=None; Secure; HttpOnly` Refresh Token).
2. **Mobile App (iOS / Android Native)**: Hardware-backed Keystore/Keychain storage with Secure Bearer Token rotation and OAuth PKCE Deep-Linking (`devhub://auth/callback`).
3. **Admin Governance Control Plane**: Real-time authentication forensics, failed attempt alarms, automated brute-force lockouts, and instant cross-fleet session termination.

```
                                  ┌────────────────────────────────────────┐
                                  │      Client Surface Channels           │
                                  │  • Web App (SPA + SSR)                 │
                                  │  • Mobile App (iOS / Android)          │
                                  │  • Admin Security Console              │
                                  └───────────────────┬────────────────────┘
                                                      │
                                                      ▼
                                  ┌────────────────────────────────────────┐
                                  │   Express 5.x Enterprise Gateway       │
                                  │  • IP & Device Rate Limiters           │
                                  │  • Helmet Security Headers             │
                                  │  • Cryptographic Salt & Argon2/Bcrypt  │
                                  └───────────────────┬────────────────────┘
                                                      │
                                                      ▼
                                  ┌────────────────────────────────────────┐
                                  │     Prisma 7 ORM Connection Pool       │
                                  └───────────────────┬────────────────────┘
                                                      │
                                                      ▼
                                  ┌────────────────────────────────────────┐
                                  │      Supabase PostgreSQL Database      │
                                  │  • User Table (tokenVersion, strikes)  │
                                  │  • PendingUser Table (TTL Queue)       │
                                  │  • AdminUser Table (2FA, Scopes)       │
                                  │  • AuditLog Table (Forensic Records)   │
                                  └────────────────────────────────────────┘
```

---

## 2. 🛡️ Multi-Method Authentication Protocols

DevHub supports 4 primary authentication pathways with seamless cross-platform parity:

| Auth Flow | Mechanism | Supported Platforms | Security Guardrails |
| :--- | :--- | :--- | :--- |
| **Email + Password + OTP** | 6-Digit cryptographic verification code dispatched via SendGrid / Nodemailer | Web, Mobile | 15-min IP rate-limit, 3-attempt OTP lockout, 10-min TTL expiry |
| **Google OAuth 2.0 (PKCE)** | Authorization Code Flow with Proof Key for Code Exchange (PKCE) | Web, Mobile | State validation, Nonce check, Deep-link token exchange |
| **GitHub OAuth 2.0 (PKCE)** | Direct Developer Handshake with verified email extraction | Web, Mobile | Scope minimization (`read:user`, `user:email`) |
| **Admin 2FA (TOTP)** | Time-based One-Time Password via Google Authenticator / Authy | Admin Panel | Encrypted secret, RFC 6238 compliance, 30s rotation |

---

## 3. 🔄 Unified Token Lifecycle & Cross-Fleet Session Revocation

### 3.1. Dual-Token Architecture
1. **Access Token (`accessToken`)**:
   - **Lifespan:** 15 Minutes (Short-lived).
   - **Storage:** React / Mobile App Memory (Never in `localStorage` on Web to prevent XSS exfiltration).
   - **Payload:** `{ id, email, role, tokenVersion, isVerified, iat, exp }`.
2. **Refresh Token (`refreshToken`)**:
   - **Lifespan:** 7 Days (Sliding window).
   - **Web Storage:** Secure `HttpOnly; SameSite=None; Secure; Path=/` Cookie.
   - **Mobile Storage:** Encrypted iOS Keychain / Android Keystore.

### 3.2. Instant Cross-Fleet Kill Switch (`tokenVersion`)
Whenever an account password is changed, a session is revoked, or an administrator suspends an account from the Admin Panel:
1. The `tokenVersion` integer in Supabase PostgreSQL is incremented (`tokenVersion = tokenVersion + 1`).
2. All outstanding Access Tokens (which contain the old `tokenVersion`) immediately fail JWT validation.
3. Every active mobile app instance, web browser tab, and tablet session is instantly terminated within **<50ms** without waiting for token expiration.

---

## 4. 🗄️ Database Schema & Relational Specifications (Supabase PostgreSQL)

```prisma
model User {
  id                       String           @id @default(uuid())
  name                     String
  email                    String           @unique
  passwordHash             String?
  avatarUrl                String?          @default("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png")
  statusPreference         String           @default("online")
  googleId                 String?          @unique
  githubId                 String?          @unique
  role                     Role             @default(user)
  isVerified               Boolean          @default(false)
  isVerifiedBadge          Boolean          @default(false)
  badgeType                BadgeType        @default(none)
  isSuspended              Boolean          @default(false)
  isShadowBanned           Boolean          @default(false)
  suspendedReason          String?
  suspendedAt              DateTime?
  tokenVersion             Int              @default(0)
  strikesCount             Int              @default(0)
  reportsCount             Int              @default(0)
  reports                  Json?            @default("[]")
  warnings                 Json?            @default("[]")
  
  // Anti-Brute-Force & OTP Security
  otp                      String?
  otpExpire                DateTime?
  otpResendAttempts        Int              @default(0)
  otpResendTimeWindowStart DateTime?
  otpFailedAttempts        Int              @default(0)
  otpLockUntil             DateTime?
  
  refreshToken             String?
  passwordResetToken       String?
  passwordResetExpires     DateTime?
  
  createdAt                DateTime         @default(now())
  updatedAt                DateTime         @updatedAt

  profile                  Profile?
  posts                    Post[]
  comments                 Comment[]
  sentMessages             Message[]        @relation("SentMessages")
  receivedMessages         Message[]        @relation("ReceivedMessages")
  notificationsReceived    Notification[]   @relation("RecipientNotifications")

  @@index([email])
  @@index([name])
}

model PendingUser {
  id                       String    @id @default(uuid())
  name                     String
  email                    String    @unique
  passwordHash             String?
  googleId                 String?
  githubId                 String?
  otp                      String?
  otpExpire                DateTime?
  otpResendAttempts        Int       @default(0)
  otpResendTimeWindowStart DateTime?
  otpFailedAttempts        Int       @default(0)
  otpLockUntil             DateTime?
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt

  @@index([email])
}
```

---

## 5. 📡 Complete API Contract Specification

### 5.1. User Registration (`POST /api/auth/register`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Alex Mercer",
  "email": "alex.mercer@devhub.com",
  "password": "SecurePassword123!"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Verification code dispatched to your email address.",
  "data": {
    "email": "alex.mercer@devhub.com",
    "requiresOtp": true,
    "otpExpiresInSeconds": 600
  }
}
```

---

### 5.2. OTP Verification (`POST /api/auth/verify-otp`)
- **Request Body:**
```json
{
  "email": "alex.mercer@devhub.com",
  "otp": "849201"
}
```
- **Response (`200 OK` - Sets `refreshToken` HTTP-only Cookie):**
```json
{
  "success": true,
  "message": "Account verified successfully. Welcome to DevHub!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c7a8b3f1-42e9-4e2b-91d4-629b3c4f5a10",
    "name": "Alex Mercer",
    "email": "alex.mercer@devhub.com",
    "avatarUrl": "https://cdn.pixabay.com/photo/...",
    "role": "user",
    "isVerified": true,
    "tokenVersion": 0
  }
}
```

---

### 5.3. User Login (`POST /api/auth/login`)
- **Request Body:**
```json
{
  "email": "alex.mercer@devhub.com",
  "password": "SecurePassword123!"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c7a8b3f1-42e9-4e2b-91d4-629b3c4f5a10",
    "name": "Alex Mercer",
    "email": "alex.mercer@devhub.com",
    "avatarUrl": "https://cdn.pixabay.com/...",
    "role": "user",
    "isVerified": true
  }
}
```

---

### 5.4. Current User Session & Handshake (`GET /api/auth/me`)
- **Headers:** `Authorization: Bearer <accessToken>` or Cookie credentials.
- **Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "id": "c7a8b3f1-42e9-4e2b-91d4-629b3c4f5a10",
    "name": "Alex Mercer",
    "email": "alex.mercer@devhub.com",
    "role": "user",
    "isVerified": true,
    "statusPreference": "online"
  }
}
```

---

### 5.5. Revoke All Sessions (`POST /api/auth/revoke-all-sessions`)
- **Headers:** `Authorization: Bearer <accessToken>`
- **Behavior:** Increments `tokenVersion` on Supabase, clears cookies, forces re-login across all mobile & web devices.
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "All active sessions have been terminated."
}
```

---

## 6. 📱 Mobile App Deep-Link & OAuth Protocol

When a user initiates Google or GitHub login on the iOS/Android mobile app:
1. The mobile app opens the in-app secure browser (ASWebAuthenticationSession on iOS / Custom Tabs on Android).
2. URL: `https://devhub-api-node.onrender.com/api/auth/google?platform=mobile`
3. Upon successful Google authorization, the backend redirects to the custom URI scheme:
   `devhub://auth/callback?token=<accessToken>&refreshToken=<refreshToken>`
4. The mobile app securely captures the deep link, stores the `refreshToken` in the Encrypted Keychain, and stores the `accessToken` in memory state.

---

## 7. 🚀 Progressive Onboarding Wizard (Post-Signup Flow)

Rather than redirecting a brand-new user directly to an empty feed, DevHub launches the **Progressive Onboarding Wizard**:

```
[ Step 1: Upload Avatar & Banner ]
                │
                ▼
[ Step 2: Headline, Bio & Primary Role (Creator / Engineer / Founder) ]
                │
                ▼
[ Step 3: Select Top 5 Skills & Industry Focus (AI, Design, Startups) ]
                │
                ▼
[ Step 4: Suggested First 5 Connections & Follows ]
                │
                ▼
[ Enter Live Home Feed with Pre-Populated Tailored Content ]
```

---

## 8. 🛡️ Admin Panel Governance & Forensics Integration

The Admin Panel (`devhub-admin`) provides real-time surveillance over the auth ecosystem:
1. **Brute-Force Monitor**: Real-time stream of failed login attempts and temporary IP lockouts.
2. **Account Suspension & Strike Engine**: Admins can issue strikes or suspend accounts with 1-click token invalidation.
3. **Session Forensics Explorer**: View user's last login IP, device agent, and login timestamps stored in `AuditLog`.
