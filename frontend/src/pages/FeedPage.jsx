import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Code2, Send, MessageCircle, Heart, Repeat2, MoreHorizontal, Video, FileText, X, Globe, Plus, AlertCircle, Loader2 } from 'lucide-react';
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
  const [postContent, setPostContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !codeContent.trim() && !selectedImage) {
      toast.error('Post content cannot be completely empty');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImage = null;

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
          uploadedImage = { url: uploadRes.data.url };
        } catch (err) {
          toast.error('Failed to upload image. Posting text/code instead.');
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Build Post Body
      const postData = {
        content: postContent,
        image: uploadedImage
      };

      if (isCodeMode && codeContent.trim()) {
        postData.codeSnippet = { code: codeContent, language: codeLanguage };
      }

      // 3. Submit Post
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/posts`, postData, { withCredentials: true });
      
      // Refresh feed
      setPosts([data, ...posts]);
      
      // Reset Form and close modal
      setPostContent('');
      setCodeContent('');
      setIsCodeMode(false);
      removeSelectedImage();
      setIsModalOpen(false);
      toast.success('Post deployed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPostModal = (mode = 'text') => {
    setIsModalOpen(true);
    if (mode === 'code') {
      setIsCodeMode(true);
    } else if (mode === 'image') {
      setTimeout(() => fileInputRef.current?.click(), 100);
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
            onClick={() => {
              openPostModal('image');
              toast('Videos will use standard media format', { icon: '🎥' });
            }}
            className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5"
          >
            <Video size={18} className="text-[#5f9b41]" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
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
              <PostCard key={post._id} post={post} idx={idx} isHighlighted={idx === 0} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal dialog for creating a post */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#161616]">
                <h3 className="text-lg font-bold text-white">Create a post</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
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

                {/* Text Content Input */}
                <textarea
                  placeholder="What do you want to talk about?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none min-h-[140px] text-base leading-relaxed"
                />

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

                {/* Code Snippet Input */}
                {isCodeMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]"
                  >
                    <div className="bg-[#2d2d2d] px-4 py-2 text-xs text-gray-400 font-mono border-b border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>Language:</span>
                        <select 
                          value={codeLanguage} 
                          onChange={(e) => setCodeLanguage(e.target.value)}
                          className="bg-black/30 border border-white/15 rounded px-2 py-0.5 text-white text-[11px] font-mono outline-none"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          setIsCodeMode(false);
                          setCodeContent('');
                        }} 
                        className="hover:text-white"
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
              <div className="px-5 py-4 border-t border-white/5 bg-[#161616] flex justify-between items-center">
                <div className="flex gap-1.5">
                  {/* Photo Action */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${imagePreview ? 'text-[#00F0FF]' : 'text-gray-400 hover:text-white'}`}
                    title="Add a photo"
                  >
                    <Image size={20} />
                  </button>

                  {/* Code Action */}
                  <button 
                    onClick={() => setIsCodeMode(!isCodeMode)}
                    className={`p-2.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isCodeMode ? 'text-[#00F0FF]' : 'text-gray-400 hover:text-white'}`}
                    title="Add code snippet"
                  >
                    <Code2 size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {isUploading && (
                    <span className="text-xs text-gray-500 flex items-center gap-1.5 animate-pulse">
                      <Loader2 size={12} className="animate-spin" /> Uploading image...
                    </span>
                  )}
                  <button 
                    onClick={handlePostSubmit}
                    disabled={isSubmitting || isUploading || (!postContent.trim() && !codeContent.trim() && !selectedImage)}
                    className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold rounded-full transition-all text-sm flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-[#00F0FF] cursor-pointer"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;
