const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    avatar: {
      public_id: String,
      url: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
      },
    },
    coverImage: {
      url: {
        type: String,
      }
    },
    bio: {
      type: String,
      maxlength: [220, 'Headline cannot exceed 220 characters'],
    },
    about: {
      type: String,
      maxlength: [2000, 'About cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    status: {
      type: String,
    },
    company: {
      type: String,
    },
    githubusername: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    openToWork: {
      isLooking: { type: Boolean, default: false },
      jobTitles: { type: [String], default: [] },
      workplaces: { type: [String], default: [] },
      locations: { type: [String], default: [] }
    },
    providingServices: {
      isProviding: { type: Boolean, default: false },
      services: { type: [String], default: [] },
      details: { type: String, maxlength: 500 }
    },
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        from: { type: Date, required: true },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    education: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        from: { type: Date, required: true },
        to: { type: Date },
        current: { type: Boolean, default: false },
      },
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        issueDate: { type: Date, required: true },
        credentialId: { type: String },
        credentialUrl: { type: String },
      }
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        repositoryUrl: { type: String },
        liveUrl: { type: String },
        technologies: { type: [String], default: [] },
        image: {
          public_id: String,
          url: String,
        },
      },
    ],
    resume: {
      url: { type: String },
      originalName: { type: String },
    },
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    profileViews: [
      {
        viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
