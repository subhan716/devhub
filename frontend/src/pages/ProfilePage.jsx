import { useState, useEffect, useRef } from 'react';
import { MapPin, Briefcase, Calendar, Link as LinkIcon, Heart, MessageCircle, Repeat2, GraduationCap, FolderGit2, FileText, Trash2, Plus, Edit3, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AddExperienceInline from '../components/profile/AddExperienceInline';
import AddEducationInline from '../components/profile/AddEducationInline';
import AddProjectInline from '../components/profile/AddProjectInline';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const isOwner = true; // Always true for /profile/me

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/profile/me');
        setProfile(data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Expected for new users, don't show an error toast
          console.log('No profile found. Please set one up.');
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    const loadingToast = toast.loading(`Uploading ${type}...`);

    try {
      const endpoint = type === 'avatar' ? '/api/upload/avatar' : '/api/upload/cover';
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (type === 'avatar') {
        setProfile(prev => ({ ...prev, user: { ...prev.user, avatar: { url: data.url } } }));
      } else {
        setProfile(prev => ({ ...prev, coverImage: { url: data.url } }));
      }
      
      toast.success(`${type} updated successfully!`, { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to upload ${type}`, { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('document', file);

    setUploadingResume(true);
    const loadingToast = toast.loading(`Uploading Resume...`);
    try {
      const { data } = await axios.post('http://localhost:5000/api/upload/resume', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setProfile({ ...profile, resume: { url: data.url, originalName: data.originalName } });
      toast.success('Resume uploaded successfully', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to upload resume. Make sure it is a PDF or DOC.', { id: loadingToast });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/profile/experience/${id}`, { withCredentials: true });
      setProfile(data);
      toast.success('Experience deleted');
    } catch (error) {
      toast.error('Failed to delete experience');
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/profile/education/${id}`, { withCredentials: true });
      setProfile(data);
      toast.success('Education deleted');
    } catch (error) {
      toast.error('Failed to delete education');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/profile/projects/${id}`, { withCredentials: true });
      setProfile(data);
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-500 py-20 bg-[#111] rounded-2xl border border-white/5 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
        <p>Please setup your profile to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Cover & Avatar Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-white/10 bg-[#111]">
        {/* Cover Photo */}
        <div 
          className="h-48 w-full relative" 
          style={{ 
            backgroundColor: profile.coverImage?.url ? 'transparent' : '#1a1a1a',
            backgroundImage: profile.coverImage?.url ? `url(${profile.coverImage.url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <label className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer text-white z-10">
            <Edit3 size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading} />
          </label>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="relative">
              <img 
                src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-[#111] object-cover bg-[#111]"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-[#00F0FF] text-black rounded-full hover:bg-white transition-colors cursor-pointer shadow-lg z-10">
                <Image size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading} />
              </label>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors cursor-pointer border border-white/10"
            >
              Edit Profile
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">{profile.user?.name}</h1>
            <p className="text-[#00F0FF] font-medium text-sm mt-1">{profile.status}</p>
          </div>

          <p className="text-gray-300 mt-4 text-sm max-w-2xl leading-relaxed">
            {profile.bio || 'No bio provided.'}
          </p>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-400">
            {profile.company && (
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} /> {profile.company}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} /> {profile.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} /> Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white font-bold mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-white font-bold mb-4">Links</h3>
            <div className="space-y-3">
              {profile.githubusername && (
                <a href={`https://github.com/${profile.githubusername}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  github.com/{profile.githubusername}
                </a>
              )}
              {profile.socialLinks?.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-[#00F0FF] transition-colors cursor-pointer text-sm">
                  <LinkIcon size={18} /> Personal Website
                </a>
              )}

              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-[#0A66C2] transition-colors cursor-pointer text-sm">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileText size={18} className="text-[#00F0FF]" /> Resume
              </h3>
              {isOwner && (
                <div>
                  <button onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume} className="text-xs text-[#00F0FF] hover:underline cursor-pointer disabled:opacity-50">
                    {uploadingResume ? 'Uploading...' : 'Update'}
                  </button>
                  <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" className="hidden" />
                </div>
              )}
            </div>
            {profile.resume?.url ? (
              <a href={profile.resume.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors">
                View {profile.resume.originalName || 'Resume'}
              </a>
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">
                No resume uploaded
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Experience, Education, Projects */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Experience */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Briefcase size={20} className="text-[#00F0FF]" /> Experience
              </h3>
              {isOwner && (
                <button onClick={() => setIsAddExpOpen(!isAddExpOpen)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isAddExpOpen ? 'bg-white/10 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'}`}>
                  <Plus size={18} className={`transform transition-transform ${isAddExpOpen ? 'rotate-45' : ''}`} />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {isAddExpOpen && <AddExperienceInline onClose={() => setIsAddExpOpen(false)} onAdd={setProfile} />}
            </AnimatePresence>

            <div className={`space-y-6 ${isAddExpOpen ? 'mt-6' : ''}`}>
              {profile.experience && profile.experience.length > 0 ? (
                profile.experience.map(exp => (
                  <div key={exp._id} className="relative group border-l-2 border-white/10 pl-4 pb-2">
                    <div className="absolute w-3 h-3 bg-[#111] border-2 border-[#00F0FF] rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{exp.title}</h4>
                        <p className="text-gray-400 text-sm">{exp.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(exp.from).toLocaleDateString()} - {exp.current ? 'Present' : (exp.to ? new Date(exp.to).toLocaleDateString() : '')}
                        </p>
                      </div>
                      {isOwner && (
                        <button onClick={() => handleDeleteExperience(exp._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-500 transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {exp.description && <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No experience added yet.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <GraduationCap size={20} className="text-[#8A2BE2]" /> Education
              </h3>
              {isOwner && (
                <button onClick={() => setIsAddEduOpen(!isAddEduOpen)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isAddEduOpen ? 'bg-white/10 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'}`}>
                  <Plus size={18} className={`transform transition-transform ${isAddEduOpen ? 'rotate-45' : ''}`} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isAddEduOpen && <AddEducationInline onClose={() => setIsAddEduOpen(false)} onAdd={setProfile} />}
            </AnimatePresence>

            <div className={`space-y-6 ${isAddEduOpen ? 'mt-6' : ''}`}>
              {profile.education && profile.education.length > 0 ? (
                profile.education.map(edu => (
                  <div key={edu._id} className="relative group border-l-2 border-white/10 pl-4 pb-2">
                    <div className="absolute w-3 h-3 bg-[#111] border-2 border-[#8A2BE2] rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{edu.school}</h4>
                        <p className="text-gray-400 text-sm">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(edu.from).toLocaleDateString()} - {edu.current ? 'Present' : (edu.to ? new Date(edu.to).toLocaleDateString() : '')}
                        </p>
                      </div>
                      {isOwner && (
                        <button onClick={() => handleDeleteEducation(edu._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-500 transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No education added yet.</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FolderGit2 size={20} className="text-white" /> Projects
              </h3>
              {isOwner && (
                <button onClick={() => setIsAddProjectOpen(!isAddProjectOpen)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isAddProjectOpen ? 'bg-white/10 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'}`}>
                  <Plus size={18} className={`transform transition-transform ${isAddProjectOpen ? 'rotate-45' : ''}`} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isAddProjectOpen && <AddProjectInline onClose={() => setIsAddProjectOpen(false)} onAdd={setProfile} />}
            </AnimatePresence>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isAddProjectOpen ? 'mt-6' : ''}`}>
              {profile.projects && profile.projects.length > 0 ? (
                profile.projects.map(prj => (
                  <div key={prj._id} className="group bg-black/30 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                    {prj.image?.url && (
                      <div className="w-full h-32 overflow-hidden bg-gray-900">
                        <img src={prj.image.url} alt={prj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4 relative">
                      {isOwner && (
                        <button onClick={() => handleDeleteProject(prj._id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <h4 className="text-white font-bold text-sm mb-1">{prj.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{prj.description}</p>
                      {prj.technologies && prj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {prj.technologies.slice(0, 3).map(tech => (
                            <span key={tech} className="px-2 py-0.5 bg-white/5 text-[10px] text-gray-300 rounded-sm">{tech}</span>
                          ))}
                          {prj.technologies.length > 3 && <span className="px-2 py-0.5 bg-white/5 text-[10px] text-gray-300 rounded-sm">+{prj.technologies.length - 3}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-auto">
                        {prj.liveUrl && (
                          <a href={prj.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#00F0FF] hover:underline flex items-center gap-1">
                            <LinkIcon size={12} /> Live
                          </a>
                        )}
                        {prj.repositoryUrl && (
                          <a href={prj.repositoryUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            <FolderGit2 size={12} /> Repo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-sm text-gray-500 text-center py-6">
                  No projects added yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
