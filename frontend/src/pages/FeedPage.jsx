import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Code2, Send, MessageCircle, Heart, Repeat2, MoreHorizontal } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

SyntaxHighlighter.registerLanguage('javascript', js);

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
              <motion.div 
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`bg-[#111] rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden group transition-colors duration-300 ${
                  idx === 0 ? 'border border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border border-white/5 hover:border-white/10'
                }`}
              >
            {/* Post Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <img 
                    src={post.author?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                    alt={post.author?.name || 'Unknown User'} 
                    className="w-10 h-10 rounded-full object-cover border border-white/10 cursor-pointer" 
                  />
                  <div className="flex flex-col leading-tight cursor-pointer">
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
            <p className="text-sm text-gray-200 leading-relaxed">
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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 hover:text-[#00F0FF] transition-colors group/btn cursor-pointer"
              >
                <Heart size={16} className="group-hover/btn:fill-[#00F0FF]/20" /> {post.likesCount} Likes
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                <MessageCircle size={16} /> {post.commentsCount} Comments
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 hover:text-[#8A2BE2] transition-colors cursor-pointer"
              >
                <Repeat2 size={16} /> {post.repostsCount} Reposts
              </motion.button>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
