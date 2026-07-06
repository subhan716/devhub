import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Link as LinkIcon, GitBranch, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const techOptions = ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'Vue.js', 'Angular', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS', 'Sass', 'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'React Native', 'Flutter', 'SQL', 'MySQL', 'PostgreSQL', 'Redis', 'GraphQL', 'Firebase', 'AWS', 'Docker'];

const projectTitleOptions = ['E-Commerce Platform', 'Social Media App', 'Task Management App', 'Portfolio Website', 'Blog Website', 'Chat Application', 'Weather App', 'Recipe App', 'Fitness Tracker', 'Expense Tracker', 'Job Board', 'Quiz App', 'Music Player', 'Booking System'];

const AddProjectInline = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    liveUrl: '',
    technologies: '',
    thumbnail: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);

  // GitHub Fetching State
  const [githubUsername, setGithubUsername] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  // Local Autocomplete State
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isTechFocused, setIsTechFocused] = useState(false);

  const titleSuggestions = (formData.title.trim().length > 0 && isTitleFocused)
    ? projectTitleOptions.filter(t => t.toLowerCase().includes(formData.title.toLowerCase())).slice(0, 5)
    : [];

  const currentTechWord = formData.technologies.split(',').pop().trim();
  const techSuggestions = (currentTechWord.length > 0 && isTechFocused)
    ? techOptions.filter(t => t.toLowerCase().includes(currentTechWord.toLowerCase()) && !formData.technologies.toLowerCase().includes(t.toLowerCase())).slice(0, 5)
    : [];

  const handleTechSelect = (suggestion) => {
    const techArray = formData.technologies.split(',').map(t => t.trim());
    techArray.pop(); // Remove the incomplete word
    if (techArray.length > 0 && techArray[0] === "") techArray.shift();
    techArray.push(suggestion);
    setFormData({ ...formData, technologies: techArray.join(', ') + ', ' });
    setIsTechFocused(false);
  };

  const fetchGithubRepos = async () => {
    if (!githubUsername) return;
    setIsFetchingRepos(true);
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=20`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setGithubRepos(data);
      setShowRepoDropdown(true);
    } catch (err) {
      toast.error('Failed to fetch repositories. Check username.');
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleSelectRepo = (repo) => {
    setFormData({
      ...formData,
      title: repo.name,
      description: repo.description || '',
      repositoryUrl: repo.html_url,
      liveUrl: repo.homepage || '',
      technologies: repo.language ? repo.language : '',
    });
    setShowRepoDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let thumbnailUrl = null;

      if (formData.thumbnail) {
        const uploadData = new FormData();
        uploadData.append('image', formData.thumbnail);
        const uploadRes = await axios.post('http://localhost:5000/api/upload/project', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        thumbnailUrl = uploadRes.data.url;
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        liveUrl: formData.liveUrl,
        technologies: formData.technologies,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl })
      };

      const { data } = await axios.put('http://localhost:5000/api/profile/projects', projectData, { withCredentials: true });
      onAdd(data);
      toast.success('Project added successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl mt-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h3 className="text-lg font-bold text-white">Add Project</h3>
          
          <div className="flex items-center gap-2 relative">
            <GitBranch size={16} className="text-gray-400 absolute left-2 pointer-events-none" />
            <input 
              type="text" 
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="GitHub Username"
              className="w-36 bg-[#0a0a0a] border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white outline-none focus:border-[#00F0FF]/50 transition-colors"
            />
            <button 
              type="button" 
              onClick={fetchGithubRepos}
              disabled={isFetchingRepos || !githubUsername}
              className="text-xs font-bold text-black bg-[#00F0FF] px-3 py-1.5 rounded-lg hover:bg-[#00F0FF]/90 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            >
              {isFetchingRepos ? 'Fetching...' : 'Fetch Repos'}
            </button>

            {showRepoDropdown && githubRepos.length > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRepoDropdown(false)} />
                <div className="absolute top-full right-0 mt-2 w-64 max-h-64 overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20">
                  <div className="p-2 border-b border-white/5 text-[10px] text-gray-400 text-center bg-black/40 font-medium">
                    <span className="text-[#00F0FF] mr-1">ℹ</span> Only public repositories are displayed.
                  </div>
                  {githubRepos.map(repo => (
                    <div 
                      key={repo.id} 
                      onClick={() => handleSelectRepo(repo)} 
                      className="p-3 hover:bg-[#00F0FF]/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                    >
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <GitBranch size={12} className="text-[#00F0FF]" /> {repo.name}
                      </p>
                      {repo.description && <p className="text-xs text-gray-400 truncate mt-1">{repo.description}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-medium text-gray-400">Project Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  onFocus={() => setIsTitleFocused(true)}
                  onBlur={() => setTimeout(() => setIsTitleFocused(false), 200)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                  required 
                  placeholder="e.g. E-Commerce Platform" 
                />
                {titleSuggestions.length > 0 && isTitleFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                    {titleSuggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, title: suggestion });
                          setIsTitleFocused(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-medium text-gray-400">Technologies Used *</label>
                <input 
                  type="text" 
                  name="technologies" 
                  value={formData.technologies} 
                  onChange={handleChange}
                  onFocus={() => setIsTechFocused(true)}
                  onBlur={() => setTimeout(() => setIsTechFocused(false), 200)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                  required 
                  placeholder="e.g. React, Node.js, MongoDB (comma separated)" 
                />
                {techSuggestions.length > 0 && isTechFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                    {techSuggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                        onClick={() => handleTechSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">GitHub Repository URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <GitBranch className="text-gray-500" size={14} />
                    </div>
                    <input type="url" name="repositoryUrl" value={formData.repositoryUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 pl-8 pr-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" placeholder="https://github.com/..." />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Live Demo URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <LinkIcon className="text-gray-500" size={14} />
                    </div>
                    <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 pl-8 pr-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-48 shrink-0 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Project Thumbnail</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video sm:aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-[#00F0FF]/50 bg-[#0a0a0a] flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group"
              >
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-medium text-white">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-[#00F0FF] transition-colors">
                    <ImageIcon size={24} />
                    <span className="text-xs font-medium text-center px-4">Upload Image</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-xs font-medium text-gray-400">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm resize-none" placeholder="Describe the project, your role, and the impact..."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-lg text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer">
              <Upload size={16} />
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddProjectInline;
