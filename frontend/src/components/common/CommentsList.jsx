import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, postId, onReply, onDelete, depth = 0, isTarget, currentUser }) => {
  const [likes, setLikes] = useState(comment.likes || []);
  const [showReplies, setShowReplies] = useState(depth === 0);
  const myUserId = currentUser?._id || currentUser?.id;
  const isLiked = myUserId && likes.includes(myUserId);
  const isAuthor = myUserId === (comment.user?._id || comment.user);
  const commentRef = useRef(null);

  useEffect(() => {
    if (isTarget && commentRef.current) {
      setTimeout(() => {
        commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight class
        commentRef.current.classList.add('bg-white/10');
        setTimeout(() => {
          if (commentRef.current) commentRef.current.classList.remove('bg-white/10');
        }, 3000);
      }, 500);
    }
  }, [isTarget]);

  const handleLike = async () => {
    try {
      const originalLikes = [...likes];
      setLikes(isLiked ? likes.filter(id => id !== myUserId) : [...likes, myUserId]);
      
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/comments/like/${comment._id}`, {}, { withCredentials: true });
      setLikes(data);
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  return (
    <div ref={commentRef} className={`flex gap-3 mb-4 transition-colors duration-1000 p-2 rounded-xl ${isTarget ? 'bg-white/5' : ''}`}>
      <img src={comment.user?.avatar?.url || 'https://www.gravatar.com/avatar/0?d=mp'} alt={comment.user?.name} className="w-8 h-8 rounded-full border border-white/10 mt-1" />
      <div className="flex-1">
        <div className="bg-[#1a1a1a] p-3 rounded-2xl rounded-tl-none border border-white/5 relative group">
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium text-sm text-white">{comment.user?.name}</span>
            <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          </div>
          <p className="text-sm text-gray-300">{comment.text}</p>
          
          {/* Delete Button (Only for author) */}
          {isAuthor && (
            <button onClick={() => onDelete(comment._id)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
          )}
        </div>
        
        {/* Comment Actions */}
        <div className="flex gap-4 mt-1.5 ml-2 text-xs font-semibold text-gray-500">
          <button onClick={handleLike} className={`hover:text-white transition-colors ${isLiked ? 'text-[#00F0FF]' : ''}`}>
            Like {likes.length > 0 && `(${likes.length})`}
          </button>
          {depth < 2 && (
            <button onClick={() => onReply(comment)} className="hover:text-white transition-colors">
              Reply
            </button>
          )}
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-xs text-[#00F0FF] hover:underline mb-3 font-medium">
              {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showReplies ? 'Hide replies' : `View ${comment.replies.length} replies`}
            </button>
            
            <AnimatePresence>
              {showReplies && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {comment.replies.map(reply => (
                    <CommentItem 
                      key={reply._id} 
                      comment={reply} 
                      postId={postId} 
                      onReply={onReply} 
                      onDelete={onDelete} 
                      depth={depth + 1} 
                      isTarget={reply._id === isTarget}
                      currentUser={currentUser}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const CommentsList = ({ postId, targetCommentId, onUpdateCount, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [sort, setSort] = useState('newest'); // 'newest', 'oldest', 'top'

  useEffect(() => {
    fetchComments();
  }, [postId, sort]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/${postId}?sort=${sort}`, { withCredentials: true });
      
      // Build reply tree
      const map = {};
      const roots = [];
      data.forEach(c => {
        map[c._id] = { ...c, replies: [] };
      });
      data.forEach(c => {
        if (c.parentComment) {
          if (map[c.parentComment]) map[c.parentComment].replies.push(map[c._id]);
        } else {
          roots.push(map[c._id]);
        }
      });
      
      setComments(roots);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const payload = { text };
      if (replyTo) payload.parentCommentId = replyTo._id;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/comments/${postId}`, payload, { withCredentials: true });
      setText('');
      setReplyTo(null);
      fetchComments();
      if (onUpdateCount) onUpdateCount(1);
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}`, { withCredentials: true });
      fetchComments();
      // Since delete might remove replies, we just refresh entirely
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-white">Comments</h4>
        <select 
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#111] border border-white/10 text-xs text-gray-400 rounded-lg px-2 py-1 outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="top">Top comments</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-lg text-xs text-gray-300">
            <span>Replying to <span className="font-bold text-[#00F0FF]">{replyTo.user?.name}</span></span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">Cancel</button>
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="bg-[#00F0FF] text-black px-4 py-2 rounded-full font-bold text-sm disabled:opacity-50 transition-all hover:bg-[#00F0FF]/90"
          >
            Post
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : comments.length > 0 ? (
        comments.map(c => (
          <CommentItem 
            key={c._id} 
            comment={c} 
            postId={postId} 
            onReply={setReplyTo} 
            onDelete={handleDelete} 
            isTarget={c._id === targetCommentId}
            currentUser={currentUser}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first!</p>
      )}
    </div>
  );
};

export default CommentsList;
