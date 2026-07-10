import { useState, useEffect } from 'react';
import { MapPin, Building2, Globe, FolderGit2, Briefcase, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusOptions = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Mobile Developer',
  'Product Manager', 'Project Manager', 'Scrum Master',
  'Graphic Designer', 'UI/UX Designer', 'Art Director',
  'Data Scientist', 'Machine Learning Engineer', 'Data Analyst',
  'Digital Marketer', 'SEO Specialist', 'Content Creator', 'Writer / Editor',
  'CEO / Founder', 'Entrepreneur', 'Business Owner',
  'Sales / Business Dev', 'Human Resources (HR)', 'Recruiter',
  'Finance / Accounting', 'Operations Manager',
  'Cybersecurity Analyst', 'DevOps Engineer', 'Cloud Architect',
  'QA Engineer', 'Student / Learner', 'Educator / Teacher', 'Other'
];

const EditProfileForm = ({ profile, setProfile, onClose }) => {
  const [formData, setFormData] = useState({
    status: '',
    company: '',
    location: '',
    skills: '',
    githubusername: '',
    bio: '',
    about: '',
    website: '',
    linkedin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        status: profile.status || '',
        company: profile.company || '',
        location: profile.location || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        githubusername: profile.githubusername || '',
        bio: profile.bio || '',
        about: profile.about || '',
        website: profile.socialLinks?.website || '',
        linkedin: profile.socialLinks?.linkedin || '',
      });
      setStatusInput(profile.status || '');
    }
  }, [profile]);

  const statusSuggestions = (statusInput.trim().length > 0 && isStatusFocused)
    ? statusOptions.filter(s => s.toLowerCase().includes(statusInput.toLowerCase())).slice(0, 5)
    : [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/profile', formData, { withCredentials: true });
      setProfile(prev => ({
        ...prev,
        status: data.status,
        company: data.company,
        location: data.location,
        skills: data.skills,
        githubusername: data.githubusername,
        bio: data.bio,
        about: data.about,
        socialLinks: data.socialLinks,
      }));
      toast.success('Profile updated!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors text-sm";
  const labelClass = "text-xs font-medium text-gray-400 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Status */}
      <div className="space-y-1.5 relative">
        <label className={labelClass}>Professional Status *</label>
        <input
          type="text"
          value={statusInput}
          onChange={(e) => { setStatusInput(e.target.value); setFormData({ ...formData, status: e.target.value }); }}
          onFocus={() => setIsStatusFocused(true)}
          onBlur={() => setTimeout(() => setIsStatusFocused(false), 200)}
          className={inputClass}
          placeholder="e.g. Frontend Developer"
          required
        />
        {statusSuggestions.length > 0 && isStatusFocused && (
          <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {statusSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                onClick={() => { setStatusInput(suggestion); setFormData({ ...formData, status: suggestion }); setIsStatusFocused(false); }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Headline */}
      <div className="space-y-1">
        <label className={labelClass}>Headline</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="2"
          maxLength="220"
          className={inputClass}
          placeholder="e.g. Flutter Developer | Riverpod..."
        />
      </div>

      {/* About */}
      <div className="space-y-1">
        <label className={labelClass}>About</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          rows="5"
          maxLength="2000"
          className={inputClass}
          placeholder="Tell us a detailed story about yourself, your career, and your interests..."
        />
      </div>

      {/* Company & Location row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Company</label>
          <div className="relative">
            <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" name="company" value={formData.company} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="e.g. Google" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" name="location" value={formData.location} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="e.g. Karachi" />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className={labelClass}>Skills <span className="text-gray-600">(comma separated)</span></label>
        <input type="text" name="skills" value={formData.skills} onChange={handleChange} className={inputClass} placeholder="React, Node.js, MongoDB..." required />
      </div>

      {/* GitHub */}
      <div>
        <label className={labelClass}>GitHub Username</label>
        <div className="relative">
          <FolderGit2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input type="text" name="githubusername" value={formData.githubusername} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="e.g. johndoe" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/5" />
      <p className="text-xs text-gray-500 font-medium">Social Links</p>

      {/* Website */}
      <div>
        <label className={labelClass}>Personal Website</label>
        <div className="relative">
          <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input type="url" name="website" value={formData.website} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="https://..." />
        </div>
      </div>

      {/* LinkedIn */}
      <div>
        <label className={labelClass}>LinkedIn URL</label>
        <div className="relative">
          <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
