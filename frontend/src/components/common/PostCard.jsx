import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Heart, MessageCircle, Repeat2, Edit3, Trash2, Link2, Bookmark } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import toast from 'react-hot-toast';
import axios from 'axios';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('php', php);

const PostCard = ({ post, idx = 0, currentUser, onDelete, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Safely extract IDs for comparison
  const myUserId = currentUser?._id || currentUser?.user?._id;
  const authorId = post.author?._id || post.author;
  const isAuthor = myUserId && authorId && myUserId === authorId;

  // Like system local state for instant feedback
  const [likes, setLikes] = useState(post.likes || []);
  const isLiked = myUserId && likes.includes(myUserId);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success('Link copied to clipboard!');
    setIsMenuOpen(false);
  };

  const handleSavePost = () => {
    toast.success('Post saved to bookmarks!');
    setIsMenuOpen(false);
  };

  const handleLikeClick = async () => {
    if (!myUserId) {
      toast.error('Please log in to like posts');
      return;
    }

    // Optimistic Update
    const originalLikes = [...likes];
    const updatedLikes = isLiked 
      ? likes.filter(id => id !== myUserId)
      : [...likes, myUserId];

    setLikes(updatedLikes);

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/posts/like/${post._id}`,
        {},
        { withCredentials: true }
      );
      // Sync strictly with server response
      setLikes(data.likes);
    } catch (error) {
      // Rollback on failure
      setLikes(originalLikes);
      toast.error('Failed to update like');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(idx * 0.1, 0.5) }}
      className="bg-[#111] rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-visible group transition-colors duration-300 border border-white/5 hover:border-white/10"
    >
      {/* Post Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img 
            src={post.author?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
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

        {/* 3-Dots Menu Container */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Options Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-48 bg-[#181820] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden"
              >
                {isAuthor && (
                  <>
                    <button 
                      onClick={() => {
                        onEdit(post);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Edit3 size={15} className="text-gray-400" />
                      <span>Edit Post</span>
                    </button>
                    <button 
                      onClick={() => {
                        onDelete(post._id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={15} />
                      <span>Delete Post</span>
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                  </>
                )}

                <button 
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Link2 size={15} className="text-gray-400" />
                  <span>Copy Link</span>
                </button>
                
                <button 
                  onClick={handleSavePost}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Bookmark size={15} className="text-gray-400" />
                  <span>Save Post</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Code Snippet */}
      {post.codeSnippet && post.codeSnippet.code && (
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

      {/* Media attachment (Image/Video) */}
      {post.image && post.image.url && (
        <div className="rounded-xl overflow-hidden border border-white/10 my-2">
          {post.image.url.includes('/video/upload/') || post.image.url.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={post.image.url} controls className="w-full h-auto object-cover max-h-80" />
          ) : (
            <img src={post.image.url} alt="Post attachment" className="w-full h-auto object-cover max-h-80" />
          )}
        </div>
      )}

      {/* Post Footer Actions */}
      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5 text-xs font-medium text-gray-400">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLikeClick}
          className={`flex items-center gap-2 transition-colors group/btn cursor-pointer ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
        >
          <Heart 
            size={16} 
            className={`transition-all duration-200 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 group-hover/btn:text-red-500 group-hover/btn:fill-red-500/20'}`} 
          /> 
          <span>{likes.length} Likes</span>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
        >
          <MessageCircle size={16} /> {post.commentsCount || 0} Comments
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 hover:text-[#8A2BE2] transition-colors cursor-pointer"
        >
          <Repeat2 size={16} /> {post.repostsCount || 0} Reposts
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PostCard;
