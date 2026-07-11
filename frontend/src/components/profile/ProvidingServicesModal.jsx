import { useState } from 'react';
import { X, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProvidingServicesModal = ({ isOpen, onClose, profile, setProfile }) => {
  const [formData, setFormData] = useState({
    isProviding: profile?.providingServices?.isProviding || true,
    services: profile?.providingServices?.services?.join(', ') || '',
    details: profile?.providingServices?.details || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setFormData({ ...formData, isProviding: !formData.isProviding });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        providingServices: {
          isProviding: formData.isProviding,
          services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
          details: formData.details.trim()
        }
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/profile`, payload, { withCredentials: true });
      setProfile(data);
      toast.success(formData.isProviding ? 'Providing Services status enabled!' : 'Providing Services status disabled');
      onClose();
    } catch (error) {
      toast.error('Failed to update Providing Services status');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-lg bg-[#111] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="text-gray-300" /> Edit services
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-semibold">Providing Services</p>
                <p className="text-sm text-gray-400">Show people the services you offer</p>
              </div>
              <button 
                type="button" 
                onClick={handleToggle}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.isProviding ? 'bg-gray-200' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#111] transition-transform ${formData.isProviding ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {formData.isProviding && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Services</label>
                  <input
                    type="text"
                    name="services"
                    value={formData.services}
                    onChange={handleChange}
                    placeholder="e.g. Accounting, Web Development (comma separated)"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-white/50 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">About your services (Optional)</label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Describe the specific services you provide..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-white/50 outline-none transition-colors resize-none"
                  />
                </div>
              </motion.div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-white font-medium hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-white text-black font-bold transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Services'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProvidingServicesModal;
