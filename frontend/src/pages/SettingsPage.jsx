import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User as UserIcon, Building2, MapPin, Globe, MessageCircle, Briefcase, FolderGit2 } from 'lucide-react';
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    location: '',
    status: '',
    skills: '',
    githubusername: '',
    bio: '',
    about: '',
    linkedin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/me`, { withCredentials: true });
        setFormData({
          company: data.company || '',
          website: data.socialLinks?.website || '',
          location: data.location || '',
          status: data.status || '',
          skills: data.skills ? data.skills.join(', ') : '',
          githubusername: data.githubusername || '',
          bio: data.bio || '',
          about: data.about || '',
          linkedin: data.socialLinks?.linkedin || '',
        });
        setStatusInput(data.status || '');
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error('Failed to load profile for editing');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const statusSuggestions = (statusInput.trim().length > 0 && isStatusFocused)
    ? statusOptions.filter(status => status.toLowerCase().includes(statusInput.toLowerCase())).slice(0, 5)
    : [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/profile`, formData, { withCredentials: true });
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Update your personal information and professional details.</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Basic Info Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon size={18} className="text-[#00F0FF]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-300">Professional Status *</label>
                <input 
                  type="text" 
                  value={statusInput} 
                  onChange={(e) => {
                    setStatusInput(e.target.value);
                    setFormData({ ...formData, status: e.target.value });
                  }}
                  onFocus={() => setIsStatusFocused(true)}
                  onBlur={() => setTimeout(() => setIsStatusFocused(false), 200)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                  placeholder="e.g. Frontend Developer" 
                  required 
                />
                {statusSuggestions.length > 0 && isStatusFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {statusSuggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                        onClick={() => {
                          setStatusInput(suggestion);
                          setFormData({ ...formData, status: suggestion });
                          setIsStatusFocused(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Company</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="text-gray-500" size={18} />
                  </div>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" placeholder="e.g. Tech Corp" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="text-gray-500" size={18} />
                  </div>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" placeholder="e.g. San Francisco, CA" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          {/* Professional Details Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Professional Details</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Skills * <span className="text-xs text-gray-500 font-normal">(Comma separated)</span></label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" required placeholder="e.g. HTML, CSS, JavaScript, React" />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300">Headline</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="2" maxLength="220" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors" placeholder="e.g. Flutter Developer | Riverpod..."></textarea>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300">About</label>
                <textarea name="about" value={formData.about} onChange={handleChange} rows="6" maxLength="2000" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors" placeholder="Tell us a detailed story about yourself..."></textarea>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Social Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Personal Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="text-gray-500" size={18} />
                  </div>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">GitHub Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FolderGit2 className="text-gray-500" size={18} />
                  </div>
                  <input type="text" name="githubusername" value={formData.githubusername} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" placeholder="e.g. johndoe" />
                </div>
              </div>



              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">LinkedIn URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="text-gray-500" size={18} />
                  </div>
                  <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none transition-colors" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button 
              type="button" 
              onClick={() => navigate('/profile')} 
              className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex items-center gap-2 px-8 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-xl font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
