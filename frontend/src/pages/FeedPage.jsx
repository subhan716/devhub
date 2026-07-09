import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Code2, Send, MessageCircle, Heart, Repeat2, MoreHorizontal } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/common/PostCard';

const FeedPage = () => {
  const { currentUser } = useOutletContext();
  const [postContent, setPostContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/posts');
        setPosts(data);
      } catch (error) {
        toast.error('Failed to load feed');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !codeContent.trim()) {
      toast.error('Post cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = { content: postContent };
      if (isCodeMode && codeContent.trim()) {
        postData.codeSnippet = { code: codeContent, language: 'javascript' };
      }

      const { data } = await axios.post('http://localhost:5000/api/posts', postData);
      setPosts([data, ...posts]);
      setPostContent('');
      setCodeContent('');
      setIsCodeMode(false);
      toast.success('Posted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* Create Post Component */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-4">
        <div className="flex gap-4">
          <img 
            src={currentUser?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
            alt={currentUser?.name || 'Profile'} 
            className="w-10 h-10 rounded-full object-cover border border-white/10 cursor-pointer bg-[#111]"
          />
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              placeholder="Share an update or code snippet..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[40px] text-sm pt-2"
            />
            {isCodeMode && (
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#1e1e1e]">
                <div className="bg-[#2d2d2d] px-4 py-2 text-xs text-gray-400 font-mono border-b border-white/5 flex justify-between">
                  <span>javascript</span>
                  <button onClick={() => setIsCodeMode(false)} className="hover:text-white">✕</button>
                </div>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full bg-transparent text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none min-h-[120px]"
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-14">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium cursor-pointer">
              <Image size={16} /> Photo
            </button>
            <button 
              onClick={() => setIsCodeMode(!isCodeMode)}
              className={`flex items-center gap-2 transition-colors text-xs font-medium cursor-pointer ${isCodeMode ? 'text-[#00F0FF]' : 'text-gray-400 hover:text-white'}`}
            >
              <Code2 size={16} /> Code
            </button>
          </div>
          <button 
            onClick={handlePostSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 font-bold rounded-full transition-colors text-sm border border-[#00F0FF]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500 py-10 bg-[#111] rounded-2xl border border-white/5"
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
    </div>
  );
};

export default FeedPage;
