import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
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

const EditProfileModal = ({ isOpen, onClose, currentProfile, setProfile }) => {
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    location: '',
    status: '',
    skills: '',
    githubusername: '',
    bio: '',
    twitter: '',
    linkedin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [statusSuggestions, setStatusSuggestions] = useState([]);
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        company: currentProfile.company || '',
        website: currentProfile.socialLinks?.website || '',
        location: currentProfile.location || '',
        status: currentProfile.status || '',
        skills: currentProfile.skills ? currentProfile.skills.join(', ') : '',
        githubusername: currentProfile.githubusername || '',
        bio: currentProfile.bio || '',
        twitter: currentProfile.socialLinks?.twitter || '',
        linkedin: currentProfile.socialLinks?.linkedin || '',
      });
      setStatusInput(currentProfile.status || '');
    }
  }, [currentProfile]);

  useEffect(() => {
    if (statusInput.trim().length > 0 && isStatusFocused) {
      const filtered = statusOptions.filter(
        status => status.toLowerCase().includes(statusInput.toLowerCase())
      );
      setStatusSuggestions(filtered.slice(0, 5));
    } else {
      setStatusSuggestions([]);
    }
  }, [statusInput, isStatusFocused]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/profile', formData, { withCredentials: true });
      setProfile(data);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10"
        >
          <div className="sticky top-0 bg-[#111]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-20">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Professional Status *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="status"
                    value={statusInput}
                    onChange={(e) => {
                      setStatusInput(e.target.value);
                      setFormData({ ...formData, status: e.target.value });
                    }}
                    onFocus={() => setIsStatusFocused(true)}
                    onBlur={() => setTimeout(() => setIsStatusFocused(false), 200)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 outline-none transition-all"
                    placeholder="e.g. Software Engineer"
                    required
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {statusSuggestions.length > 0 && isStatusFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute z-40 w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent"
                      >
                        {statusSuggestions.map((status) => (
                          <div
                            key={status}
                            onClick={() => {
                              setStatusInput(status);
                              setFormData({ ...formData, status });
                              setIsStatusFocused(false);
                            }}
                            className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 text-white text-sm"
                          >
                            {status}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Skills * (comma separated)</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="HTML, CSS, JavaScript" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">GitHub Username</label>
                <input type="text" name="githubusername" value={formData.githubusername} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none resize-none"></textarea>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="Website URL" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" />
                <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter URL" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" />
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-[#111] py-4 border-t border-white/10 mt-auto">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 bg-[#00F0FF] text-black font-semibold rounded-xl hover:bg-[#00F0FF]/90 transition-colors disabled:opacity-50 cursor-pointer">
                <Save size={18} />
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
