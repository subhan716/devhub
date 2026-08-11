import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Code2, Send, MessageCircle, Heart, Repeat2, MoreHorizontal, Video, FileText, X, Globe, Plus, AlertCircle, Loader2, AtSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/common/PostCard';

const FeedPage = () => {
  const { currentUser } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null); // track if editing existing post
  const [postToDelete, setPostToDelete] = useState(null); // track post selected for deletion
  const [postContent, setPostContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  
  // Media Attachments States
  const [activeAttachmentType, setActiveAttachmentType] = useState('none'); // 'none', 'image', 'video'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // @Mention autocomplete state
  const [connections, setConnections] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef(null);
  const mentionDropdownRef = useRef(null);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`, { withCredentials: true });
        setPosts(data);
      } catch (error) {
        toast.error('Failed to load feed');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Fetch user's connections for mention autocomplete
  useEffect(() => {
    if (!currentUser) return;
    const fetchConnections = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/network/connections`, { withCredentials: true });
        setConnections(data);
      } catch {
        // silently ignore
      }
    };
    fetchConnections();
  }, [currentUser]);

  // Handle textarea input and detect @mention
  const handlePostContentChange = (e) => {
    const value = e.target.value;
    setPostContent(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      const query = atMatch[1].toLowerCase();
      setMentionQuery(query);
      const filtered = connections.filter(conn => {
        const name = (conn.user?.name || '').toLowerCase();
        return name.includes(query);
      });
      setMentionSuggestions(filtered.slice(0, 6));
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionSuggestions([]);
    }
  };

  // Insert the selected mention into textarea
  const handleMentionSelect = (user) => {
    const cursorPos = textareaRef.current?.selectionStart || postContent.length;
    const textBeforeCursor = postContent.substring(0, cursorPos);
    const textAfterCursor = postContent.substring(cursorPos);
    const beforeAt = textBeforeCursor.replace(/@(\w*)$/, '');
    const insertedName = user.name.replace(/\s+/g, '');
    const newText = `${beforeAt}@${insertedName} ${textAfterCursor}`;
    setPostContent(newText);
    setShowMentions(false);
    setMentionSuggestions([]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      removeSelectedVideo();
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      removeSelectedImage();
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedVideo = () => {
    setSelectedVideo(null);
    setVideoPreview('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeAllMedia = () => {
    removeSelectedImage();
    removeSelectedVideo();
    setActiveAttachmentType('none');
  };

  // Delete Post Handler
  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${postToDelete}`, { withCredentials: true });
      setPosts(prev => prev.filter(post => post._id !== postToDelete));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setPostToDelete(null);
    }
  };

  // Edit Post Trigger
  const handleEditPostClick = (post) => {
    setEditingPostId(post._id);
    setPostContent(post.content);
    
    if (post.codeSnippet) {
      setIsCodeMode(true);
      setCodeContent(post.codeSnippet.code);
      setCodeLanguage(post.codeSnippet.language || 'javascript');
    } else {
      setIsCodeMode(false);
      setCodeContent('');
    }

    if (post.image && post.image.url) {
      if (post.image.url.includes('/video/upload/') || post.image.url.match(/\.(mp4|webm|ogg)$/i)) {
        setActiveAttachmentType('video');
        setVideoPreview(post.image.url);
      } else {
        setActiveAttachmentType('image');
        setImagePreview(post.image.url);
      }
    } else {
      removeAllMedia();
    }

    setIsModalOpen(true);
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !codeContent.trim() && !selectedImage && !selectedVideo && !imagePreview && !videoPreview) {
      toast.error('Post content cannot be completely empty');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedMedia = null;
      if (imagePreview && !selectedImage) {
        uploadedMedia = { url: imagePreview };
      }
      if (videoPreview && !selectedVideo) {
        uploadedMedia = { url: videoPreview };
      }

      // 1. Handle image upload if selected
      if (selectedImage) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedImage);
        try {
          const uploadRes = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload/project-image`,
            formData,
            {
              withCredentials: true,
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          );
          uploadedMedia = { url: uploadRes.data.url };
        } catch (err) {
          toast.error('Failed to upload image.');
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Handle video upload if selected (using generic chat-attachment endpoint)
      if (selectedVideo) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('attachment', selectedVideo);
        try {
          const uploadRes = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload/chat-attachment`,
            formData,
            {
              withCredentials: true,
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          );
          uploadedMedia = { url: uploadRes.data.url };
        } catch (err) {
          toast.error('Failed to upload video.');
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // 3. Build Post Body
      const postData = {
        content: postContent,
        image: uploadedMedia
      };

      if (isCodeMode && codeContent.trim()) {
        postData.codeSnippet = { code: codeContent, language: codeLanguage };
      } else {
        postData.codeSnippet = null;
      }

      let resData;
      if (editingPostId) {
        // Edit flow
        const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/posts/${editingPostId}`, postData, { withCredentials: true });
        setPosts(prev => prev.map(p => p._id === editingPostId ? data : p));
        toast.success('Post updated successfully!');
      } else {
        // Create flow
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/posts`, postData, { withCredentials: true });
        setPosts([data, ...posts]);
        toast.success('Post deployed successfully!');
      }
      
      // Reset Form and close modal
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setPostContent('');
    setCodeContent('');
    setIsCodeMode(false);
    setEditingPostId(null);
    removeAllMedia();
    setIsModalOpen(false);
  };

  const openPostModal = (mode = 'text') => {
    setIsModalOpen(true);
    setEditingPostId(null);
    
    // Explicitly toggle features based on selected trigger
    if (mode === 'code') {
      setIsCodeMode(true);
      removeAllMedia();
    } else {
      setIsCodeMode(false);
      if (mode === 'image') {
        setActiveAttachmentType('image');
      } else if (mode === 'video') {
        setActiveAttachmentType('video');
      } else {
        setActiveAttachmentType('none');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* LinkedIn Style Create Post Trigger Box */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img 
            src={currentUser?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
            alt={currentUser?.name || 'Profile'} 
            className="w-12 h-12 rounded-full object-cover border border-white/10"
          />
          <button 
            onClick={() => openPostModal('text')}
            className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full px-5 py-3.5 text-left text-gray-400 font-medium text-sm transition-colors cursor-pointer outline-none"
          >
            Start a post
          </button>
        </div>
        
        {/* Row of Action Buttons */}
        <div className="flex justify-around pt-2 border-t border-white/5">
          <button 
            onClick={() => openPostModal('image')}
            className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5"
          >
            <Image size={18} className="text-[#378fe9]" />
            <span>Photo</span>
          </button>
          
          <button 
            onClick={() => openPostModal('code')}
            className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5"
          >
            <Code2 size={18} className="text-[#e7a33e]" />
            <span>Code Snippet</span>
          </button>

          <button 
            onClick={() => openPostModal('video')}
            className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5"
          >
            <Video size={18} className="text-[#5f9b41]" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={handleVideoChange} 
        accept="video/*" 
        className="hidden" 
      />

      {/* Feed Stream */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-[#00F0FF]" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500 py-12 bg-[#111] rounded-2xl border border-white/5"
          >
            No posts yet. Be the first to share something!
          </motion.div>
        ) : (
          <AnimatePresence>
            {posts.map((post, idx) => (
              <PostCard 
                key={post._id} 
                post={post} 
                idx={idx} 
                isHighlighted={idx === 0} 
                currentUser={currentUser}
                onDelete={handleDeletePost}
                onEdit={handleEditPostClick}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal dialog for creating a post */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full sm:max-w-xl bg-[#111] border-0 sm:border border-white/10 rounded-none sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#161616]">
                <h3 className="text-lg font-bold text-white">{editingPostId ? 'Edit post' : 'Create a post'}</h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <img 
                    src={currentUser?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                    alt={currentUser?.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-white font-semibold text-sm leading-tight">{currentUser?.name}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 border border-white/10 rounded-full px-2 py-0.5 bg-white/[0.02] w-fit">
                      <Globe size={11} />
                      <span>Post to Anyone</span>
                    </div>
                  </div>
                </div>

                {/* Text Content Input with Mention Autocomplete */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    placeholder="What do you want to talk about? Type @ to mention a connection..."
                    value={postContent}
                    onChange={handlePostContentChange}
                    className="w-full bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none min-h-[140px] text-base leading-relaxed"
                  />

                  {/* @Mention Suggestion Dropdown */}
                  <AnimatePresence>
                    {showMentions && mentionSuggestions.length > 0 && (
                      <motion.div
                        ref={mentionDropdownRef}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full z-50 w-full max-w-xs bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {mentionSuggestions.map((conn) => (
                          <button
                            key={conn.connectionId || conn.user?._id}
                            onMouseDown={(e) => { e.preventDefault(); handleMentionSelect(conn.user); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                          >
                            <img
                              src={conn.user?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                              alt={conn.user?.name}
                              className="w-7 h-7 rounded-full border border-white/10 object-cover"
                            />
                            <div>
                              <p className="text-sm text-white font-medium leading-tight">{conn.user?.name}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Drag & Drop style Image Placeholder if mode is image and no preview yet */}
                {activeAttachmentType === 'image' && !imagePreview && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-[#00F0FF]/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="p-3 bg-white/5 rounded-full text-gray-400 group-hover:text-[#00F0FF] group-hover:bg-[#00F0FF]/10 transition-all">
                      <Image size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">Select image to share</p>
                      <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, JPEG, GIF</p>
                    </div>
                  </div>
                )}

                {/* Image Preview Container */}
                {imagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                    <img src={imagePreview} alt="Selected preview" className="w-full max-h-[300px] object-cover" />
                    <button 
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-red-500 text-white rounded-full transition-colors shadow-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Drag & Drop style Video Placeholder if mode is video and no preview yet */}
                {activeAttachmentType === 'video' && !videoPreview && (
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-[#00F0FF]/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="p-3 bg-white/5 rounded-full text-gray-400 group-hover:text-[#00F0FF] group-hover:bg-[#00F0FF]/10 transition-all">
                      <Video size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">Select video to share</p>
                      <p className="text-xs text-gray-500 mt-1">Supports MP4, WebM, OGG</p>
                    </div>
                  </div>
                )}

                {/* Video Preview Container */}
                {videoPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black group">
                    <video src={videoPreview} controls className="w-full max-h-[300px]" />
                    <button 
                      type="button"
                      onClick={removeSelectedVideo}
                      className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-red-500 text-white rounded-full transition-colors shadow-lg cursor-pointer z-10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Code Snippet Input */}
                {isCodeMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]"
                  >
                    <div className="bg-[#2d2d2d] px-4 py-2.5 text-xs text-gray-400 font-mono border-b border-white/5 flex justify-between items-center">
                      <span className="font-semibold text-white">Code Snippet</span>
                      <button 
                        onClick={() => {
                          setIsCodeMode(false);
                          setCodeContent('');
                        }} 
                        className="hover:text-white p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      placeholder="// Paste or write your code snippet here..."
                      className="w-full bg-transparent text-gray-300 font-mono text-xs p-4 resize-none focus:outline-none min-h-[150px] leading-relaxed"
                      spellCheck="false"
                    />
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-t-white/5 bg-[#161616] flex justify-between items-center">
                <div className="flex gap-1.5">
                  {/* Photo Action */}
                  <button 
                    onClick={() => {
                      setIsCodeMode(false);
                      setActiveAttachmentType('image');
                    }}
                    className={`p-2.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${activeAttachmentType === 'image' ? 'text-[#00F0FF] bg-[#00F0FF]/10' : 'text-gray-400 hover:text-white'}`}
                    title="Add a photo"
                  >
                    <Image size={20} />
                  </button>

                  {/* Video Action */}
                  <button 
                    onClick={() => {
                      setIsCodeMode(false);
                      setActiveAttachmentType('video');
                    }}
                    className={`p-2.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${activeAttachmentType === 'video' ? 'text-[#00F0FF] bg-[#00F0FF]/10' : 'text-gray-400 hover:text-white'}`}
                    title="Add a video"
                  >
                    <Video size={20} />
                  </button>

                  {/* Code Action */}
                  <button 
                    onClick={() => {
                      removeAllMedia();
                      setIsCodeMode(!isCodeMode);
                    }}
                    className={`p-2.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isCodeMode ? 'text-[#00F0FF] bg-[#00F0FF]/10' : 'text-gray-400 hover:text-white'}`}
                    title="Add code snippet"
                  >
                    <Code2 size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {isUploading && (
                    <span className="text-xs text-gray-500 flex items-center gap-1.5 animate-pulse">
                      <Loader2 size={12} className="animate-spin" /> Uploading media...
                    </span>
                  )}
                  <button 
                    onClick={handlePostSubmit}
                    disabled={isSubmitting || isUploading || (!postContent.trim() && !codeContent.trim() && !selectedImage && !selectedVideo)}
                    className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold rounded-full transition-all text-sm flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-[#00F0FF] cursor-pointer"
                  >
                    {isSubmitting ? (editingPostId ? 'Saving...' : 'Posting...') : (editingPostId ? 'Save' : 'Post')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {postToDelete && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPostToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            {/* Dialog Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-center z-10"
            >
              <div className="mx-auto p-3 bg-red-500/10 rounded-full text-red-500 w-fit">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Delete Post?</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Are you sure you want to permanently delete this post? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setPostToDelete(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl border border-white/5 transition-all cursor-pointer outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all cursor-pointer outline-none shadow-lg shadow-red-500/10"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;
