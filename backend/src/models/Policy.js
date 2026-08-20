const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: ['guidelines', 'terms', 'privacy'],
    },
    title: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    content: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
      email: String,
      name: String,
    },
    changelog: [
      {
        version: String,
        changeSummary: String,
        updatedAt: { type: Date, default: Date.now },
        updatedByEmail: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Initial Default Policies Generator for auto-seeding
policySchema.statics.seedDefaultPoliciesIfEmpty = async function () {
  const count = await this.countDocuments();
  if (count > 0) return;

  console.log('⚡ Seeding initial production legal policies into MongoDB...');

  const initialPolicies = [
    {
      slug: 'guidelines',
      title: 'DevHub Community Guidelines & Code of Conduct',
      version: '1.0.0',
      content: `# DevHub Community Guidelines & Developer Standards
*Effective Date: August 20, 2026 • Standard: ISO/IEC 27001 Aligned*

DevHub is dedicated to providing a secure, harassment-free, and intellectually vibrant ecosystem for software engineers, creators, and technology leaders worldwide. By accessing or publishing code on DevHub, you agree to uphold the following standards:

---

### 1. Zero Tolerance for Malicious Code & Exploit Payloads
- **Prohibited:** You may not post, link to, or distribute code containing trojans, ransomware, reverse shells, unauthenticated exploit payloads, keyloggers, botnet agents, or crypto-mining scripts.
- **Educational PoC Standard:** Educational security research and Proof-of-Concepts (PoCs) are permitted **only if**:
  1. Clearly disclaimed as educational research in the title/summary.
  2. The code is non-destructive and cannot execute autonomously against live infrastructure.
  3. Safe test vectors (e.g. \`127.0.0.1\` or \`example.com\`) are used.

---

### 2. Secret & Credential Quarantine
- Never publish production API keys (AWS, Stripe, OpenAI, GitHub), private SSH keys, database connection strings, or private certificate pairs.
- DevHub automated sentinels will immediately quarantine posts containing exposed live secret patterns.

---

### 3. Professional Technical Discourse & Anti-Harassment
- We celebrate rigorous technical debate and constructive code reviews.
- We strictly prohibit personal attacks, ad hominem insults, hate speech, doxxing, sexualized commentary, or targeted harassment.

---

### 4. Open Source License Compliance & Attribution
- Respect open-source licenses (MIT, Apache 2.0, GPLv3, BSD).
- Always preserve original license headers and give proper attribution. Plagiarism or claiming sole credit for community-maintained repositories will result in immediate content removal.

---

### 5. Automated 3-Strike Governance Matrix
DevHub Trust & Safety Sentinel enforces an automated tiered strike governance system:
- **Strike 1 (Warning):** Content removed, formal notice issued, 24h shadow-filter applied.
- **Strike 2 (Probation):** 7-day read-only restriction on posting and messaging. Loss of Verified Developer badge.
- **Strike 3 (Termination):** Automated permanent account suspension, cryptographic session purge, and network quarantine.`,
      changelog: [
        {
          version: '1.0.0',
          changeSummary: 'Initial production baseline published',
          updatedByEmail: 'system@devhub.internal',
        },
      ],
    },
    {
      slug: 'terms',
      title: 'DevHub Master Terms of Service',
      version: '1.0.0',
      content: `# DevHub Terms of Service
*Effective Date: August 20, 2026 • Master Service Agreement*

Welcome to DevHub! These Terms of Service govern your access to and use of the DevHub platform, developer APIs, web application, and mobile ecosystem.

---

### 1. Acceptance of Terms & Eligibility
By registering an account, connecting via GitHub OAuth or Google OAuth, or accessing DevHub, you agree to be bound by these Terms. You must be at least 13 years of age to use the service.

---

### 2. 100% Developer Code Ownership Guarantee
- **You retain 100% intellectual property ownership of all original source code, repository snippets, architectures, and discussions published on DevHub.**
- By publishing content publicly, you grant DevHub a non-exclusive, worldwide, royalty-free license to host, render, syntax-highlight, cache, and index the content solely for operating, securing, and promoting the developer network.

---

### 3. Account Security & Session Responsibilities
You are responsible for maintaining the confidentiality of your credentials. DevHub provides cryptographic session termination ($O(1)$ token version invalidation) in Account Settings to revoke unauthorized devices instantly.

---

### 4. Trust & Safety Sentinel Moderation Authority
DevHub Trust & Safety Sentinel reserves the right to sandbox, flag, shadow-filter, or permanently delete any content or terminate user accounts that breach these Terms or the Community Guidelines. All moderation actions are recorded in an immutable WORM audit trail.

---

### 5. Service Availability & SLA Target
DevHub operates with a **99.9% uptime target**. While we engineer high-availability multi-region databases, DevHub is provided on an "AS IS" basis. We recommend maintaining local git backups of all critical code snippets.`,
      changelog: [
        {
          version: '1.0.0',
          changeSummary: 'Initial production baseline published',
          updatedByEmail: 'system@devhub.internal',
        },
      ],
    },
    {
      slug: 'privacy',
      title: 'DevHub Global Privacy & Data Protection Policy',
      version: '1.0.0',
      content: `# DevHub Privacy Policy
*Effective Date: August 20, 2026 • GDPR (EU 2016/679) & CCPA/CPRA Aligned*

At DevHub, developer privacy and cryptographic data integrity are fundamental principles. This policy explains how we collect, protect, and manage your data.

---

### 1. Ingested Developer Data Inventory
- **Profile Data:** Name, verified email address, avatar, headline, skills, experience, and GitHub profile URL.
- **Content Data:** Code snippets, comments, discussions, and direct messages (encrypted in transit and at rest).
- **Security Telemetry:** Cryptographic session tokens, login timestamps, device user agents, and hashed IP addresses used solely for account defense.

---

### 2. Zero Third-Party Data Selling Covenant
**DevHub will NEVER sell, license, rent, or trade your personal information, email address, connection network, or code snippets to data brokers, ad networks, or third-party recruiters without your explicit opt-in consent.**

---

### 3. GDPR & CCPA Developer Rights
- **Data Portability (Article 20):** Download a comprehensive, machine-readable \`.json\` archive of your profile, posts, connections, and comments directly from Account Settings.
- **Right to Erasure (Article 17):** Permanently delete your account and purge all associated cryptographic tokens and posts from our active databases.
- **Right to Rectification (Article 16):** Full self-service editing of all profile and identity fields.

---

### 4. Cryptographic Cookie & Token Storage
We use strictly necessary first-party \`HttpOnly\`, \`SameSite=Strict\`, \`Secure\` cookies and encrypted storage for JWT authentication. We do not use third-party tracking pixels or cross-site behavioral cookies.`,
      changelog: [
        {
          version: '1.0.0',
          changeSummary: 'Initial production baseline published',
          updatedByEmail: 'system@devhub.internal',
        },
      ],
    },
  ];

  await this.insertMany(initialPolicies);
  console.log('✓ Successfully seeded 3 production legal policies (guidelines, terms, privacy)');
};

module.exports = mongoose.model('Policy', policySchema);
