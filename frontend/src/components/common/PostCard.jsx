import { motion } from 'framer-motion';
import { MoreHorizontal, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

const PostCard = ({ post, idx = 0, isHighlighted = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(idx * 0.1, 0.5) }}
      className={`bg-[#111] rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden group transition-colors duration-300 ${
        isHighlighted ? 'border border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border border-white/5 hover:border-white/10'
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
          <Heart size={16} className="group-hover/btn:fill-[#00F0FF]/20" /> {post.likesCount || 0} Likes
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
