const prisma = require('../config/prisma');
const { getOrSetCache, invalidateCache } = require('../utils/cache');

const defaultPolicies = {
  guidelines: {
    slug: 'guidelines',
    title: 'DevHub Community Guidelines',
    version: '2.0.0',
    content: `# DevHub Community Guidelines
Welcome to DevHub! We are a global network of software developers, engineers, and tech innovators committed to open collaboration, knowledge sharing, and mutual respect.

### 1. Professional Conduct
- Treat all developers with respect, empathy, and professionalism regardless of skill level, background, or identity.
- No harassment, hate speech, trolling, discrimination, or personal attacks will be tolerated under any circumstances.

### 2. Code Quality & Originality
- Share clean, helpful code snippets with proper documentation and clear licensing context.
- Do not post malicious scripts, exploits, copyrighted intellectual property without authorization, or spam.

### 3. Safety & Governance
- Any content violating these standards is subject to immediate moderation, shadow-filtering, or permanent account suspension by our Trust & Safety Desk.`
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    version: '2.0.0',
    content: `# DevHub Terms of Service
**Effective Date:** January 1, 2026

### 1. Acceptance of Terms
By creating an account or accessing the DevHub platform (Web or Mobile), you agree to be bound by these Terms of Service.

### 2. Account Security & Responsibilities
- You are responsible for safeguarding your authentication credentials (including 2FA secrets and API keys).
- You agree to notify DevHub Security immediately of any unauthorized access to your account.

### 3. Service Level & Infrastructure
DevHub provides high-performance developer networking tools powered by an enterprise-grade cloud architecture. We reserve the right to modify, suspend, or terminate services in compliance with our Platform Security Specifications.`
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy (GDPR & CCPA Compliant)',
    version: '2.0.0',
    content: `# DevHub Privacy Policy
**Effective Date:** January 1, 2026

### 1. Data Collection & Processing
We collect only the information necessary to provide our developer networking services, including your name, email, avatar, professional headline, and code posts.

### 2. Zero Unsolicited Tracking
- We never sell your personal or professional data to third parties.
- All stored authentication secrets and passwords are encrypted using multi-round adaptive bcrypt hashes.

### 3. Your Data Rights (GDPR)
You retain full ownership of your data. You may request a complete export or permanent deletion of your profile and data at any time via Settings & Privacy.`
  }
};

const getPolicyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const validSlugs = ['guidelines', 'terms', 'privacy'];
    if (!validSlugs.includes(slug)) {
      return res.status(400).json({ message: 'Invalid policy slug. Expected guidelines, terms, or privacy.' });
    }

    const policy = await getOrSetCache(`policy_${slug}`, 120, async () => {
      let doc = await prisma.policy.findUnique({ where: { slug } });
      if (!doc) {
        const def = defaultPolicies[slug];
        doc = await prisma.policy.create({
          data: {
            slug: def.slug,
            title: def.title,
            version: def.version,
            content: def.content,
            isPublished: true
          }
        });
      }
      return doc;
    });

    res.status(200).json(policy);
  } catch (error) {
    console.error('Error in getPolicyBySlug:', error);
    res.status(500).json({ message: 'Failed to retrieve policy: ' + error.message });
  }
};

const getAllPolicies = async (req, res) => {
  try {
    const policies = await getOrSetCache('all_policies', 120, async () => {
      for (const slug of Object.keys(defaultPolicies)) {
        const exists = await prisma.policy.findUnique({ where: { slug } });
        if (!exists) {
          const def = defaultPolicies[slug];
          await prisma.policy.create({
            data: {
              slug: def.slug,
              title: def.title,
              version: def.version,
              content: def.content,
              isPublished: true
            }
          });
        }
      }

      return await prisma.policy.findMany({
        where: { isPublished: true },
        select: { slug: true, title: true, version: true, updatedAt: true }
      });
    });

    res.status(200).json({ policies });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve policies: ' + error.message });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, version } = req.body;

    const updated = await prisma.policy.upsert({
      where: { slug },
      update: { title, content, version },
      create: { slug, title, content, version, isPublished: true }
    });

    invalidateCache('policy');
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const seedPolicies = async (req, res) => {
  try {
    for (const slug of Object.keys(defaultPolicies)) {
      const def = defaultPolicies[slug];
      await prisma.policy.upsert({
        where: { slug },
        update: { title: def.title, content: def.content, version: def.version },
        create: { slug: def.slug, title: def.title, content: def.content, version: def.version, isPublished: true }
      });
    }
    invalidateCache('policy');
    res.status(200).json({ message: 'Policies seeded successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getPolicyBySlug,
  getAllPolicies,
  updatePolicy,
  seedPolicies
};
