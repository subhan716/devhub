import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Link as LinkIcon, GitBranch, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const techOptions = ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'Vue.js', 'Angular', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS', 'Sass', 'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'React Native', 'Flutter', 'SQL', 'MySQL', 'PostgreSQL', 'Redis', 'GraphQL', 'Firebase', 'AWS', 'Docker'];

const projectTitleOptions = ['E-Commerce Platform', 'Social Media App', 'Task Management App', 'Portfolio Website', 'Blog Website', 'Chat Application', 'Weather App', 'Recipe App', 'Fitness Tracker', 'Expense Tracker', 'Job Board', 'Quiz App', 'Music Player', 'Booking System'];

const AddProjectInline = ({ onClose, onAdd, initialData = null }) => {
  const [formData, setFormData] = useState(initialData ? {
    title: initialData.title || '',
    description: initialData.description || '',
    repositoryUrl: initialData.repositoryUrl || '',
    liveUrl: initialData.liveUrl || ''
  } : {
    title: '',
    description: '',
    repositoryUrl: '',
    liveUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedTechs, setSelectedTechs] = useState(initialData && initialData.technologies ? initialData.technologies : []);
  const [techInput, setTechInput] = useState('');

  // GitHub Fetching State
  const [githubUsername, setGithubUsername] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const titleSuggestions = (formData.title.trim().length > 0 && isTitleFocused)
    ? projectTitleOptions.filter(t => t.toLowerCase().includes(formData.title.toLowerCase())).slice(0, 5)
    : [];

  const techSuggestions = techInput.trim().length > 0
    ? techOptions.filter(t => t.toLowerCase().includes(techInput.toLowerCase()) && !selectedTechs.includes(t)).slice(0, 5)
    : [];

  const addTech = (tech) => {
    if (!selectedTechs.includes(tech)) {
      setSelectedTechs([...selectedTechs, tech]);
    }
    setTechInput('');
  };

  const removeTech = (techToRemove) => {
    setSelectedTechs(selectedTechs.filter(t => t !== techToRemove));
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const typed = techInput.trim();
      if (!typed) return;

      const exactMatch = techOptions.find(t => t.toLowerCase() === typed.toLowerCase());
      if (exactMatch) {
        addTech(exactMatch);
      } else if (techSuggestions.length > 0) {
        addTech(techSuggestions[0]);
      } else {
        addTech(typed);
      }
    }
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
      liveUrl: repo.homepage || ''
    });
    if (repo.language) {
      if (!selectedTechs.includes(repo.language)) {
        setSelectedTechs([...selectedTechs, repo.language]);
      }
    }
    setShowRepoDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        liveUrl: formData.liveUrl,
        technologies: selectedTechs.join(', ')
      };

      if (initialData) {
        const { data } = await axios.put(`http://localhost:5000/api/profile/projects/${initialData._id}`, projectData, { withCredentials: true });
        onAdd(data);
        toast.success('Project updated successfully!');
      } else {
        const { data } = await axios.put('http://localhost:5000/api/profile/projects', projectData, { withCredentials: true });
        onAdd(data);
        toast.success('Project added successfully!');
      }
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
          <h3 className="text-lg font-bold text-white">{initialData ? 'Edit Project' : 'Add Project'}</h3>
          
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
                <div className="absolute top-full right-0 mt-2 w-64 max-h-64 overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent hover:scrollbar-thumb-[#00F0FF]/50 transition-colors">
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
          
          <div className="space-y-4">
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
              
              {selectedTechs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTechs.map((tech) => (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      key={tech} 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#8A2BE2]/20 border border-white/10 text-white text-xs"
                    >
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)} className="hover:text-[#FF0055] transition-colors ml-1 cursor-pointer">
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <input 
                type="text" 
                value={techInput} 
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                placeholder="Type a skill and press Enter (e.g. React)" 
              />
              {techSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {techSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                      onClick={() => addTech(suggestion)}
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Project' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddProjectInline;
