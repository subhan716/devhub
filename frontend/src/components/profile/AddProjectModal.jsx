import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Link as LinkIcon, GitBranch } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    liveUrl: '',
    technologies: '',
    image: null, // this will hold the { url, public_id } object from backend
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/upload/project-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setFormData({ ...formData, image: { url: data.url } });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert comma separated string to array
    const submitData = {
      ...formData,
      technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : []
    };

    try {
      const { data } = await axios.put('http://localhost:5000/api/profile/projects', submitData, { withCredentials: true });
      onAdd(data); // Pass updated profile to parent
      toast.success('Project added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        repositoryUrl: '',
        liveUrl: '',
        technologies: '',
        image: null,
      });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add project');
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
            <h2 className="text-xl font-bold text-white">Add Project</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Image Upload Area */}
            <div className="w-full h-48 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-black/30 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              {formData.image ? (
                <>
                  <img src={formData.image.url} alt="Project Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <Upload size={16} /> Change Thumbnail
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-gray-500 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-300">Upload Project Thumbnail</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x800px (JPG/PNG)</p>
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Project Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" required placeholder="e.g. E-Commerce Dashboard" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Technologies Used</label>
                <input type="text" name="technologies" value={formData.technologies} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none" placeholder="React, Node.js, MongoDB (comma separated)" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">GitHub Repository URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GitBranch className="text-gray-500" size={18} />
                  </div>
                  <input type="url" name="repositoryUrl" value={formData.repositoryUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none" placeholder="https://github.com/..." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Live Demo URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="text-gray-500" size={18} />
                  </div>
                  <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#00F0FF]/50 outline-none" placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Project Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#00F0FF]/50 outline-none resize-none" placeholder="Describe the problem it solves, architecture, and features..." required></textarea>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-white hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || uploadingImage} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-black bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] hover:opacity-90 transition-opacity disabled:opacity-50">
                <Save size={18} />
                {isSubmitting ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProjectModal;
