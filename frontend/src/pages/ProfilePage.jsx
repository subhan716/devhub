import { useState, useEffect, useRef } from 'react';
import { MapPin, Briefcase, Calendar, Link as LinkIcon, Heart, MessageCircle, Repeat2, GraduationCap, FolderGit2, FileText, Trash2, Plus, Edit3, Image, Copy, MoreHorizontal, Users, Eye, Activity, Award, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Lenis from 'lenis';
import AddExperienceInline from '../components/profile/AddExperienceInline';
import AddEducationInline from '../components/profile/AddEducationInline';
import AddCertificationInline from '../components/profile/AddCertificationInline';
import AddProjectInline from '../components/profile/AddProjectInline';
import EditProfileForm from '../components/profile/EditProfileForm';
import AnalyticsModal from '../components/profile/AnalyticsModal';
import ResumeTemplate from '../components/profile/ResumeTemplate';
import ConfirmModal from '../components/common/ConfirmModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GitHubCalendar } from 'react-github-calendar';

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const resumeInputRef = useRef(null);
  const drawerRef = useRef(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams();

  // Disable body scroll when side panel is open, and init custom Lenis for drawer
  useEffect(() => {
    let drawerLenis;
    
    if (isEditProfileOpen) {
      document.body.style.overflow = 'hidden';
      
      if (drawerRef.current) {
        drawerLenis = new Lenis({
          wrapper: drawerRef.current,
          content: drawerRef.current.firstElementChild,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          mouseMultiplier: 1,
        });

        function raf(time) {
          drawerLenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
      
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      if (drawerLenis) {
        drawerLenis.destroy();
      }
    };
  }, [isEditProfileOpen]);

  const [showAllExp, setShowAllExp] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);
  const [showAllCert, setShowAllCert] = useState(false);
  const [visibleProjectsCount, setVisibleProjectsCount] = useState(6);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const resumePdfRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    onConfirm: () => {}
  });

  const isOwner = !id || (currentUserProfile && currentUserProfile.user._id === id);
  const isFollowing = profile && currentUserProfile && profile.followers.includes(currentUserProfile.user._id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch the currently logged in user's profile first to know who they are
        let currentProf = currentUserProfile;
        if (!currentProf) {
          const res = await axios.get('http://localhost:5000/api/profile/me', { withCredentials: true });
          currentProf = res.data;
          setCurrentUserProfile(currentProf);
        }

        let data;
        if (id) {
          const response = await axios.get(`http://localhost:5000/api/profile/user/${id}`, { withCredentials: true });
          data = response.data;
        } else {
          data = currentProf;
        }
        
        setProfile(data);
        if (data && data.user && data.user._id) {
          fetchUserPosts(data.user._id);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('No profile found. Please set one up.');
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserPosts = async (userId) => {
      setIsPostsLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/posts/user/${userId}`);
        setUserPosts(data);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
      } finally {
        setIsPostsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile || !profile.user) return;
    
    const action = isFollowing ? 'unfollow' : 'follow';
    try {
      await axios.post(`http://localhost:5000/api/profile/${action}/${profile.user._id}`, {}, { withCredentials: true });
      
      // Optimistic UI Update
      setProfile(prev => {
        const newFollowers = isFollowing 
          ? prev.followers.filter(followerId => followerId !== currentUserProfile.user._id)
          : [...prev.followers, currentUserProfile.user._id];
        return { ...prev, followers: newFollowers };
      });
      
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

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

  const handleDeleteExperience = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Experience',
      message: 'Are you sure you want to delete this experience? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { data } = await axios.delete(`http://localhost:5000/api/profile/experience/${id}`, { withCredentials: true });
          setProfile(data);
          toast.success('Experience deleted');
        } catch (error) {
          toast.error('Failed to delete experience');
        }
      }
    });
  };

  const handleDeleteEducation = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Education',
      message: 'Are you sure you want to delete this education? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { data } = await axios.delete(`http://localhost:5000/api/profile/education/${id}`, { withCredentials: true });
          setProfile(data);
          toast.success('Education deleted');
        } catch (error) {
          toast.error('Failed to delete education');
        }
      }
    });
  };

  const handleDeleteCertification = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Certification',
      message: 'Are you sure you want to delete this certification? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { data } = await axios.delete(`http://localhost:5000/api/profile/certifications/${id}`, { withCredentials: true });
          setProfile(data);
          toast.success('Certification deleted');
        } catch (error) {
          toast.error('Failed to delete certification');
        }
      }
    });
  };

  const handleDeleteProject = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { data } = await axios.delete(`http://localhost:5000/api/profile/projects/${id}`, { withCredentials: true });
          setProfile(data);
          toast.success('Project removed');
        } catch (error) {
          toast.error('Failed to remove project');
        }
      }
    });
  };

  const handleDuplicateProject = (prj) => {
    setConfirmModal({
      isOpen: true,
      title: 'Duplicate Project',
      message: `Are you sure you want to duplicate "${prj.title}"?`,
      confirmText: 'Duplicate',
      isDestructive: false,
      onConfirm: async () => {
        try {
          const duplicateData = {
            title: prj.title + ' (Copy)',
            description: prj.description,
            repositoryUrl: prj.repositoryUrl,
            liveUrl: prj.liveUrl,
            technologies: Array.isArray(prj.technologies) ? prj.technologies.join(', ') : prj.technologies
          };
          const { data } = await axios.put('http://localhost:5000/api/profile/projects', duplicateData, { withCredentials: true });
          setProfile(data);
          toast.success('Project duplicated!');
        } catch (error) {
          toast.error('Failed to duplicate project');
        }
      }
    });
  };

  const handleDownloadPdf = async () => {
    if (!resumePdfRef.current) return;
    setIsGeneratingPdf(true);
    const toastId = toast.loading('Generating PDF...');
    try {
      // Unhide temporarily to capture perfectly without scrollbar issues
      resumePdfRef.current.style.display = 'block';
      const canvas = await html2canvas(resumePdfRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      resumePdfRef.current.style.display = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.user?.name.replace(/\s+/g, '_')}_DevHub_Resume.pdf`);
      toast.success('Resume downloaded successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsGeneratingPdf(false);
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

      {/* ===== EDIT PROFILE SLIDE-OVER ===== */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsEditProfileOpen(false)}
            />
            {/* Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-white/10 z-50 overflow-y-auto"
              data-lenis-prevent="true"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                  <button onClick={() => setIsEditProfileOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3 mb-8 p-5 bg-[#1a1a1a] rounded-2xl border border-white/10">
                  <div className="relative">
                    <img
                      src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
                    />
                    <label className="absolute bottom-0 right-0 p-2 bg-[#00F0FF] text-black rounded-full hover:bg-white transition-colors cursor-pointer shadow-lg" title="Change profile picture">
                      <Image size={14} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Click the camera icon to change your photo</p>
                </div>

                {/* Edit Form */}
                <EditProfileForm
                  profile={profile}
                  setProfile={setProfile}
                  onClose={() => setIsEditProfileOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== IMAGE PREVIEW MODAL ===== */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="Profile Preview"
              className="w-80 h-80 sm:w-96 sm:h-96 object-cover rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnalyticsModal 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
      />

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
          {isOwner && (
            <label className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer text-white z-10">
              <Edit3 size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading} />
            </label>
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="relative">
              <img
                src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-[#111] object-cover bg-[#111] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsPreviewOpen(true)}
              />
            </div>
            {isOwner ? (
              <div className="flex flex-col items-end gap-3">
                {/* Analytics Badge */}
                <button 
                  onClick={() => setIsAnalyticsOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={14} className="text-[#00F0FF]" />
                  {profile.views || 0} profile views
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditProfileOpen(true)} className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black px-6 py-2 rounded-lg font-bold transition-all text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer">
                    Edit Profile
                  </button>
                  <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm border border-white/5 disabled:opacity-50 cursor-pointer">
                    <FileText size={16} /> {isGeneratingPdf ? 'Wait...' : 'Save to PDF'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleFollowToggle}
                  className={`${isFollowing ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'} px-6 py-2 rounded-lg font-bold transition-all text-sm cursor-pointer`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-white transition-all cursor-pointer">
                  <MessageCircle size={18} />
                </button>
                <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} title="Save to PDF" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-white transition-all border border-white/5 disabled:opacity-50 cursor-pointer">
                  <FileText size={18} />
                </button>
              </div>
            )}
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

          {/* Stats Bar (Premium Glassmorphism UI) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pb-2">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center transition-all group cursor-default">
              <Users size={18} className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
              <span className="text-white font-bold text-2xl">{profile.followers?.length || 0}</span>
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-1">Followers</span>
            </div>
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center transition-all group cursor-default">
              <Users size={18} className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
              <span className="text-white font-bold text-2xl">{profile.following?.length || 0}</span>
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-1">Following</span>
            </div>
            <div className="bg-[#00F0FF]/5 hover:bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-4 flex flex-col items-center justify-center transition-all group shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] relative overflow-hidden cursor-default">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#00F0FF]/20 rounded-full blur-xl group-hover:bg-[#00F0FF]/30 transition-all"></div>
              <Eye size={18} className="text-[#00F0FF]/60 group-hover:text-[#00F0FF] mb-2 transition-colors" />
              <span className="text-[#00F0FF] font-bold text-2xl drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">{profile.views || 0}</span>
              <span className="text-[#00F0FF]/60 text-xs uppercase tracking-wider font-semibold mt-1">Profile Views</span>
            </div>
            <div className="bg-[#8A2BE2]/5 hover:bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-xl p-4 flex flex-col items-center justify-center transition-all group shadow-[0_0_15px_rgba(138,43,226,0.05)] hover:shadow-[0_0_20px_rgba(138,43,226,0.15)] relative overflow-hidden cursor-default">
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#8A2BE2]/20 rounded-full blur-xl group-hover:bg-[#8A2BE2]/30 transition-all"></div>
              <Activity size={18} className="text-[#8A2BE2]/60 group-hover:text-[#8A2BE2] mb-2 transition-colors" />
              <span className="text-[#8A2BE2] font-bold text-2xl drop-shadow-[0_0_8px_rgba(138,43,226,0.5)]">{userPosts.length}</span>
              <span className="text-[#8A2BE2]/60 text-xs uppercase tracking-wider font-semibold mt-1">Total Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-none">
        {['overview', 'projects', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-bold text-sm capitalize transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === tab
                ? 'border-[#00F0FF] text-[#00F0FF]'
                : 'border-transparent text-gray-500 hover:text-white hover:border-white/30'
              }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'projects' && `Projects (${profile.projects?.length || 0})`}
            {tab === 'activity' && 'Activity'}
          </button>
        ))}
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* GitHub Contributions Graph */}
          {profile.githubusername && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg mb-6 overflow-hidden">
              <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#00F0FF]"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                GitHub Contributions
              </h3>
              <div className="flex justify-center overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent">
                <GitHubCalendar
                  username={profile.githubusername}
                  colorScheme="dark"
                  theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#1a1a1a', '#004d4d', '#008080', '#00b3b3', '#00F0FF']
                  }}
                  fontSize={12}
                  blockSize={14}
                  blockMargin={5}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Details */}
            <div className="md:col-span-1 space-y-6">
              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-white font-bold mb-4">Skills</h3>
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
                    <>
                      {(showAllExp ? profile.experience : profile.experience.slice(0, 3)).map(exp => (
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
                      ))}
                      {profile.experience.length > 3 && (
                        <div className="flex justify-center mt-4">
                          <button
                            onClick={() => setShowAllExp(!showAllExp)}
                            className="text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showAllExp ? 'Show Less' : `Show all ${profile.experience.length} experiences`}
                          </button>
                        </div>
                      )}
                    </>
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
                    <>
                      {(showAllEdu ? profile.education : profile.education.slice(0, 3)).map(edu => (
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
                      ))}
                      {profile.education.length > 3 && (
                        <div className="flex justify-center mt-4">
                          <button
                            onClick={() => setShowAllEdu(!showAllEdu)}
                            className="text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showAllEdu ? 'Show Less' : `Show all ${profile.education.length} educations`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No education added yet.</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Award size={20} className="text-[#00F0FF]" /> Certifications
                  </h3>
                  {isOwner && (
                    <button onClick={() => setIsAddCertOpen(!isAddCertOpen)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isAddCertOpen ? 'bg-white/10 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'}`}>
                      <Plus size={18} className={`transform transition-transform ${isAddCertOpen ? 'rotate-45' : ''}`} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isAddCertOpen && <AddCertificationInline onClose={() => setIsAddCertOpen(false)} setProfile={setProfile} />}
                </AnimatePresence>

                <div className={`space-y-6 ${isAddCertOpen ? 'mt-6' : ''}`}>
                  {profile.certifications && profile.certifications.length > 0 ? (
                    <>
                      {(showAllCert ? profile.certifications : profile.certifications.slice(0, 3)).map(cert => (
                        <div key={cert._id} className="relative group border-l-2 border-white/10 pl-4 pb-2">
                          <div className="absolute w-3 h-3 bg-[#111] border-2 border-[#00F0FF] rounded-full -left-[7px] top-1.5"></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-semibold">{cert.title}</h4>
                              <p className="text-gray-400 text-sm">{cert.issuingOrganization}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Issued {new Date(cert.issueDate).toLocaleDateString()}
                              </p>
                              {cert.credentialUrl && (
                                <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[#00F0FF] text-xs hover:underline mt-2 inline-block">
                                  View Credential
                                </a>
                              )}
                            </div>
                            {isOwner && (
                              <button onClick={() => handleDeleteCertification(cert._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-500 transition-all cursor-pointer">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {profile.certifications.length > 3 && (
                        <div className="flex justify-center mt-4">
                          <button
                            onClick={() => setShowAllCert(!showAllCert)}
                            className="text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showAllCert ? 'Show Less' : `Show all ${profile.certifications.length} certifications`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No certifications added yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Tab Content: PROJECTS */}
      {activeTab === 'projects' && (
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
            {(isAddProjectOpen || editingProjectId) && (
              <AddProjectInline
                initialData={editingProjectId ? profile.projects.find(p => p._id === editingProjectId) : null}
                onClose={() => {
                  setIsAddProjectOpen(false);
                  setEditingProjectId(null);
                }}
                onAdd={(data) => {
                  setProfile(data);
                  setIsAddProjectOpen(false);
                  setEditingProjectId(null);
                }}
              />
            )}
          </AnimatePresence>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 ${isAddProjectOpen || editingProjectId ? 'mt-6' : ''}`}>
            {profile.projects && profile.projects.length > 0 ? (
              <>
                {profile.projects.slice(0, visibleProjectsCount).map(prj => (
                  <div key={prj._id} className="group bg-black/30 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all flex flex-col shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    {prj.image?.url && (
                      <div className="w-full h-40 overflow-hidden bg-gray-900">
                        <img src={prj.image.url} alt={prj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4 relative">
                      {isOwner && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/10 rounded-lg p-1 shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-opacity duration-300">
                          <button onClick={() => setEditingProjectId(prj._id)} title="Edit" className="p-1.5 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md transition-all cursor-pointer">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDuplicateProject(prj)} title="Duplicate" className="p-1.5 text-purple-400 hover:bg-purple-500 hover:text-white rounded-md transition-all cursor-pointer">
                            <Copy size={14} />
                          </button>
                          <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>
                          <button onClick={() => handleDeleteProject(prj._id)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      <h4 className="text-white font-bold text-sm mb-1 pr-14">{prj.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{prj.description}</p>
                      {prj.technologies && prj.technologies.length > 0 && Array.isArray(prj.technologies) && (
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
                ))}
              </>
            ) : (
              <div className="col-span-full text-sm text-gray-500 text-center py-6">
                No projects added yet.
              </div>
            )}
          </div>
          
          {/* Show More Button */}
          {profile.projects && profile.projects.length > visibleProjectsCount && (
            <div className="flex justify-center mt-4 mb-6">
              <button
                onClick={() => setVisibleProjectsCount(prev => prev + 6)}
                className="px-8 py-2.5 bg-white/5 hover:bg-[#00F0FF]/10 text-white hover:text-[#00F0FF] font-medium rounded-full border border-white/10 hover:border-[#00F0FF]/30 transition-all flex items-center gap-2 text-sm cursor-pointer shadow-lg"
              >
                Show More Projects
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="mt-2">
          <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <MessageCircle className="text-[#00F0FF]" /> Recent Activity
          </h3>

          <div className="flex flex-col gap-6">
            {isPostsLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center text-gray-500 py-10 bg-[#111] rounded-2xl border border-white/5">
                No recent activity found.
              </div>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-[#111] rounded-2xl p-5 shadow-lg flex flex-col gap-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Post Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <img
                        src={post.author?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                        alt={post.author?.name || 'Unknown User'}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-white font-medium text-sm">{post.author?.name || 'Unknown User'}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>@{post.authorProfile?.handle || post.author?.name?.toLowerCase()?.replace(/\s+/g, '') || 'dev'}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Code Snippet */}
                  {post.codeSnippet && (
                    <div className="rounded-xl overflow-hidden border border-white/10 my-2 shadow-inner text-sm relative">
                      <SyntaxHighlighter
                        language={post.codeSnippet.language}
                        style={vs2015}
                        customStyle={{ margin: 0, padding: '1.5rem', background: '#0d0d0d' }}
                        wrapLongLines={true}
                      >
                        {post.codeSnippet.code}
                      </SyntaxHighlighter>
                    </div>
                  )}

                  {/* Image attachment */}
                  {post.image && (
                    <div className="rounded-xl overflow-hidden border border-[#8A2BE2]/30 my-2 shadow-[0_0_15px_rgba(138,43,226,0.1)]">
                      <img src={post.image.url} alt="Post attachment" className="w-full h-auto object-cover max-h-80" />
                    </div>
                  )}

                  {/* Post Footer Actions */}
                  <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5 text-xs font-medium text-gray-400">
                    <button className="flex items-center gap-2 hover:text-[#00F0FF] transition-colors cursor-pointer">
                      <Heart size={16} /> {post.likesCount || 0} Likes
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                      <MessageCircle size={16} /> {post.commentsCount || 0} Comments
                    </button>
                    <button className="flex items-center gap-2 hover:text-[#8A2BE2] transition-colors cursor-pointer">
                      <Repeat2 size={16} /> {post.repostsCount || 0} Reposts
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ResumeTemplate profile={profile} ref={resumePdfRef} />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
};

export default ProfilePage;
