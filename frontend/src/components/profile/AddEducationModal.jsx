import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddEducationModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    from: '',
    to: '',
    current: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked, to: checked ? '' : formData.to });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.put('http://localhost:5000/api/profile/education', formData, { withCredentials: true });
      onAdd(data); // Pass updated profile to parent
      toast.success('Education added successfully!');
      
      // Reset form
      setFormData({
        school: '',
        degree: '',
        fieldOfStudy: '',
        from: '',
        to: '',
        current: false,
      });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add education');
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
            <h2 className="text-xl font-bold text-white">Add Education</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">School or University *</label>
                <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" required placeholder="e.g. Stanford University" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Degree *</label>
                <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" required placeholder="e.g. Bachelor of Science" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Field of Study *</label>
                <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" required placeholder="e.g. Computer Science" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Start Date *</label>
                <input type="date" name="from" value={formData.from} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" required style={{ colorScheme: 'dark' }} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">End Date</label>
                <input type="date" name="to" value={formData.to} onChange={handleChange} disabled={formData.current} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none disabled:opacity-50" style={{ colorScheme: 'dark' }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="currentEdu" name="current" checked={formData.current} onChange={handleChange} className="w-4 h-4 rounded border-white/10 bg-[#0a0a0a] text-[#00F0FF] focus:ring-[#00F0FF]/50" />
              <label htmlFor="currentEdu" className="text-sm text-gray-300 cursor-pointer">I currently study here</label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-white hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-black bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] hover:opacity-90 transition-opacity disabled:opacity-50">
                <Save size={18} />
                {isSubmitting ? 'Saving...' : 'Save Education'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEducationModal;
