const Policy = require('../models/Policy');
const AuditLog = require('../models/AuditLog');

// @desc    Get active policy by slug (Public endpoint for Web + Flutter App)
// @route   GET /api/policies/:slug
// @access  Public
const getPolicyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const validSlugs = ['guidelines', 'terms', 'privacy'];
    if (!validSlugs.includes(slug)) {
      return res.status(400).json({ message: 'Invalid policy slug. Expected guidelines, terms, or privacy.' });
    }

    // Auto-seed if empty
    await Policy.seedDefaultPoliciesIfEmpty();

    const policy = await Policy.findOne({ slug, isPublished: true });
    if (!policy) {
      return res.status(404).json({ message: `Policy '${slug}' not found.` });
    }

    res.status(200).json({
      slug: policy.slug,
      title: policy.title,
      version: policy.version,
      content: policy.content,
      effectiveDate: policy.effectiveDate,
      updatedAt: policy.updatedAt,
      changelog: policy.changelog,
    });
  } catch (error) {
    console.error('Error in getPolicyBySlug:', error);
    res.status(500).json({ message: 'Failed to retrieve policy: ' + error.message });
  }
};

// @desc    Get all active policies list & metadata (Public)
// @route   GET /api/policies
// @access  Public
const getAllPolicies = async (req, res) => {
  try {
    await Policy.seedDefaultPoliciesIfEmpty();

    const policies = await Policy.find({ isPublished: true }).select('slug title version effectiveDate updatedAt');
    res.status(200).json({ policies });
  } catch (error) {
    console.error('Error in getAllPolicies:', error);
    res.status(500).json({ message: 'Failed to retrieve policies list: ' + error.message });
  }
};

// @desc    Update policy content & version (Super Admin only)
// @route   PUT /api/admin/policies/:slug
// @access  Private / Super Admin
const updatePolicy = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, version, changeSummary } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Policy content cannot be empty.' });
    }

    let policy = await Policy.findOne({ slug });
    if (!policy) {
      await Policy.seedDefaultPoliciesIfEmpty();
      policy = await Policy.findOne({ slug });
    }

    if (!policy) {
      return res.status(404).json({ message: `Policy '${slug}' not found.` });
    }

    const previousVersion = policy.version;
    const newVersion = version && version.trim() ? version.trim() : incrementSemanticVersion(previousVersion);

    policy.title = title || policy.title;
    policy.content = content;
    policy.version = newVersion;
    policy.lastUpdatedBy = {
      adminId: req.adminUser?._id,
      email: req.adminUser?.email || 'admin@devhub.internal',
      name: req.adminUser?.name || 'Super Admin',
    };

    policy.changelog.unshift({
      version: newVersion,
      changeSummary: changeSummary || 'Policy updated by Super Admin',
      updatedAt: new Date(),
      updatedByEmail: req.adminUser?.email || 'admin@devhub.internal',
    });

    await policy.save();

    // Immutable WORM Audit Log Recording
    try {
      await AuditLog.create({
        action: 'POLICY_UPDATED',
        actor: {
          id: req.adminUser?._id,
          role: req.adminUser?.role || 'super_admin',
          email: req.adminUser?.email || 'admin@devhub.internal',
          ipAddress: req.ip || req.connection?.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
        },
        target: {
          entityType: 'Policy',
          entityId: policy._id.toString(),
          identifier: policy.slug,
        },
        justification: changeSummary || `Updated policy ${policy.slug} to ${newVersion}`,
        diff: {
          previousVersion,
          newVersion,
          title: policy.title,
        },
        securityClassification: 'L4_AUDIT',
        status: 'SUCCESS',
      });
    } catch (auditErr) {
      console.error('AuditLog warning in updatePolicy:', auditErr.message);
    }

    // Real-Time Socket.IO Live Broadcast to connected Web & Mobile clients
    const io = req.app.get('io');
    if (io) {
      io.emit('policy_updated', {
        slug: policy.slug,
        title: policy.title,
        version: policy.version,
        updatedAt: policy.updatedAt,
      });
    }

    res.status(200).json({
      message: `Policy '${policy.slug}' updated and published successfully (v${newVersion})`,
      policy,
    });
  } catch (error) {
    console.error('Error in updatePolicy:', error);
    res.status(500).json({ message: 'Failed to update policy: ' + error.message });
  }
};

// Helper: Increments semantic version patch (e.g. 1.0.0 -> 1.0.1)
function incrementSemanticVersion(v) {
  if (!v || typeof v !== 'string') return '1.0.1';
  const parts = v.split('.').map(Number);
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    parts[2] += 1;
    return parts.join('.');
  }
  return v + '.1';
}

module.exports = {
  getPolicyBySlug,
  getAllPolicies,
  updatePolicy,
};
