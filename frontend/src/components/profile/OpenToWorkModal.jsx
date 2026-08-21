import { useState } from 'react';
import { X, Briefcase, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const OpenToWorkModal = ({ isOpen, onClose, profile, setProfile }) => {
  const [formData, setFormData] = useState({
    isLooking: profile?.openToWork?.isLooking || true,
    jobTitles: profile?.openToWork?.jobTitles?.join(', ') || '',
    workplaces: profile?.openToWork?.workplaces?.join(', ') || 'Remote, On-site',
    locations: profile?.openToWork?.locations?.join(', ') || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setFormData({ ...formData, isLooking: !formData.isLooking });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        openToWork: {
          isLooking: formData.isLooking,
          jobTitles: formData.jobTitles.split(',').map(t => t.trim()).filter(Boolean),
          workplaces: formData.workplaces.split(',').map(t => t.trim()).filter(Boolean),
          locations: formData.locations.split(',').map(t => t.trim()).filter(Boolean)
        }
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/profile`, payload, { withCredentials: true });
      setProfile(data);
      toast.success(formData.isLooking ? 'Open to Work status enabled!' : 'Open to Work status disabled');
      onClose();
    } catch (error) {
      toast.error('Failed to update Open to Work status');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-200 dark:border-white/10 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="text-[#0A66C2] dark:text-[#00F0FF]" /> Edit job preferences
            </h2>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-600 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-white/5">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">Open to Work</p>
                <p className="text-sm text-slate-600 dark:text-gray-400">Show recruiters and others that you're looking</p>
              </div>
              <button 
                type="button" 
                onClick={handleToggle}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.isLooking ? 'bg-[#0A66C2] dark:bg-[#00F0FF]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isLooking ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {formData.isLooking && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Job titles you are looking for</label>
                  <input
                    type="text"
                    name="jobTitles"
                    value={formData.jobTitles}
                    onChange={handleChange}
                    placeholder="e.g. Graphic Designer, Frontend Developer (comma separated)"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#0A66C2] dark:border-[#00F0FF]/50 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Workplaces</label>
                  <input
                    type="text"
                    name="workplaces"
                    value={formData.workplaces}
                    onChange={handleChange}
                    placeholder="e.g. Remote, On-site, Hybrid (comma separated)"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#0A66C2] dark:border-[#00F0FF]/50 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Locations (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute top-3.5 left-3.5 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="locations"
                      value={formData.locations}
                      onChange={handleChange}
                      placeholder="e.g. New York, London (comma separated)"
                      className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#0A66C2] dark:border-[#00F0FF]/50 outline-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-white font-medium hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-[#0A66C2] dark:bg-[#00F0FF] hover:bg-[#0A66C2] dark:bg-[#00F0FF]/90 text-black font-bold transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OpenToWorkModal;
