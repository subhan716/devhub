import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Trash2, ChevronDown, ChevronUp, Edit3, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import ConfirmModal from './ConfirmModal';
import { CommentSkeleton } from './Skeletons';

const CommentItem = ({ comment, postId, onReply, onDelete, depth = 0, isTarget, currentUser }) => {
  const [likes, setLikes] = useState(comment.likes || []);
  const [showReplies, setShowReplies] = useState(depth === 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  
  const myUserId = currentUser?._id || currentUser?.id;
  const isLiked = myUserId && likes.includes(myUserId);
  const isAuthor = myUserId === (comment.user?._id || comment.user);
  const commentRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isTarget && commentRef.current) {
      setTimeout(() => {
        commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentRef.current.classList.add('bg-white/10');
        setTimeout(() => {
          if (commentRef.current) commentRef.current.classList.remove('bg-white/10');
        }, 3000);
      }, 500);
    }
  }, [isTarget]);

  const handleEditSubmit = async () => {
    if (!editText.trim() || editText === comment.text) {
      setIsEditing(false);
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/comments/${comment._id}`, { text: editText }, { withCredentials: true });
      setIsEditing(false);
      // We will rely on socket for real-time or trigger a fetch, but for instant UI we can update comment text locally or via props
      comment.text = editText; // optimistic
    } catch (err) {
      toast.error('Failed to update comment');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(comment.text);
    toast.success('Copied to clipboard');
    setIsMenuOpen(false);
  };

  const handleLike = async () => {
    const originalLikes = [...likes];
    const updatedLikes = isLiked ? likes.filter(id => id !== myUserId) : [...likes, myUserId];
    
    // Optimistic UI update
    setLikes(updatedLikes);
    
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/comments/like/${comment._id}`, {}, { withCredentials: true });
      setLikes(data);
    } catch (error) {
      // Rollback on failure
      setLikes(originalLikes);
      toast.error('Failed to like comment');
    }
  };

  return (
    <div ref={commentRef} className={`flex gap-3 mb-5 transition-colors duration-1000 ${isTarget ? 'bg-[#00F0FF]/10 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
      <img src={comment.user?.avatar?.url || 'https://www.gravatar.com/avatar/0?d=mp'} alt={comment.user?.name} className="w-9 h-9 rounded-full object-cover mt-0.5 border border-white/5" />
      <div className="flex-1">
        <div className="relative group">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm text-gray-100 hover:underline cursor-pointer">{comment.user?.name}</span>
            <span className="text-[11px] text-gray-500">• {
              formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }).includes('less than a minute')
                ? 'Just now' 
                : formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }).replace(/^in /, '')
            }</span>
          </div>
          {isEditing ? (
            <div className="mt-1 mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00F0FF] resize-none h-20 custom-scrollbar"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-full">Cancel</button>
                <button onClick={handleEditSubmit} className="text-xs bg-[#00F0FF] text-black font-bold px-3 py-1.5 rounded-full hover:bg-[#00F0FF]/90">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-gray-200 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
          )}
          
          {/* Horizontal Actions (Edit, Delete, Copy) */}
          {!isEditing && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#111] rounded-full p-1 border border-white/5 shadow-lg">
              {isAuthor && (
                <>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Edit Comment"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(comment._id)} 
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button 
                onClick={copyToClipboard} 
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Copy Text"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
        

        {/* Comment Actions */}
        <div className="flex items-center gap-4 mt-1.5 text-[12px] font-semibold text-gray-500">
          <button onClick={handleLike} className={`group flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}>
            <Heart size={14} className={`transition-all ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
            {likes.length > 0 && <span>{likes.length}</span>}
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
            <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-[12px] text-[#00F0FF] hover:underline mb-3 font-semibold">
              <span className="w-6 border-b border-[#00F0FF]/30 mr-1 inline-block mb-1"></span>
              {showReplies ? 'Hide replies' : `View ${comment.replies.length} replies`}
            </button>
            
            <AnimatePresence>
              {showReplies && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="pl-2 border-l border-white/5 ml-3 mt-2">
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
                  </div>
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
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [postId, sort]);

  useEffect(() => {
    if (!socket) return;
    
    const handleCommentChange = (data) => {
      if (data.postId === postId) {
        // Silent refresh so the UI doesn't flicker with loaders
        fetchComments(true);
      }
    };

    socket.on('comment_added', handleCommentChange);
    socket.on('comment_deleted', handleCommentChange);
    socket.on('comment_updated', handleCommentChange);
    
    return () => {
      socket.off('comment_added', handleCommentChange);
      socket.off('comment_deleted', handleCommentChange);
      socket.off('comment_updated', handleCommentChange);
    };
  }, [socket, postId]);

  const fetchComments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
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
      // Let the socket event trigger the silent fetch
      if (onUpdateCount) onUpdateCount(1);
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const removeCommentFromState = (list, idToRemove) => {
    return list.filter(c => c._id !== idToRemove).map(c => ({
      ...c,
      replies: c.replies ? removeCommentFromState(c.replies, idToRemove) : []
    }));
  };

  const confirmDelete = async () => {
    if (!deleteCommentId) return;
    const idToDelete = deleteCommentId;
    
    // Optimistic UI Update
    setComments(prev => removeCommentFromState(prev, idToDelete));
    if (onUpdateCount) onUpdateCount(-1);
    setDeleteCommentId(null);
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/comments/${idToDelete}`, { withCredentials: true });
    } catch (err) {
      toast.error('Failed to delete comment');
      fetchComments(true);
    }
  };

  const targetChecked = useRef(false);

  useEffect(() => {
    if (!loading && targetCommentId && !targetChecked.current && comments.length >= 0) {
      const checkTargetExists = (list) => {
        for (const c of list) {
          if (c._id === targetCommentId) return true;
          if (c.replies && checkTargetExists(c.replies)) return true;
        }
        return false;
      };
      
      // Give a slight delay to ensure render tree is ready before checking
      setTimeout(() => {
        if (!checkTargetExists(comments)) {
          toast.error('The comment you are looking for has been deleted.');
        }
      }, 100);
      targetChecked.current = true;
    }
  }, [loading, comments, targetCommentId]);

  return (
    <div className="flex flex-col h-full">
      {/* Input Form at Top */}
      <div className="mb-6 sticky top-0 -mt-4 sm:-mt-5 pt-4 sm:pt-5 bg-[#111] z-10 pb-4 border-b border-white/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {replyTo && (
            <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-lg text-xs text-gray-300">
              <span>Replying to <span className="font-bold text-[#00F0FF]">{replyTo.user?.name}</span></span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">Cancel</button>
            </div>
          )}
          <div className="flex gap-3 items-start">
            <img src={currentUser?.avatar?.url || 'https://www.gravatar.com/avatar/0?d=mp'} alt="Me" className="w-9 h-9 rounded-full object-cover border border-white/10" />
            <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden focus-within:border-white/20 transition-colors">
              <textarea
                placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none h-[44px] min-h-[44px] max-h-32 custom-scrollbar"
                rows="1"
                onInput={(e) => {
                  e.target.style.height = '44px';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              {text.trim() && (
                <div className="flex justify-end px-3 pb-2 pt-1 border-t border-white/5 bg-[#1a1a1a]">
                  <button 
                    type="submit" 
                    className="bg-[#00F0FF] text-black px-4 py-1.5 rounded-full font-bold text-sm hover:bg-[#00F0FF]/90 transition-all"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex justify-end items-center mb-5 px-2 relative w-full z-20">
        <div className="relative inline-block" ref={sortMenuRef}>
          <button 
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className={`flex items-center gap-2 bg-[#1a1a1a] border rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer outline-none transition-all shadow-sm ${isSortMenuOpen ? 'border-[#00F0FF]/50 text-white' : 'border-white/10 text-gray-300 hover:text-white hover:border-white/20'}`}
          >
            {sort === 'newest' ? 'Newest first' : sort === 'top' ? 'Top comments' : 'Oldest first'}
            <ChevronDown size={14} className={`transition-transform duration-200 ${isSortMenuOpen ? 'rotate-180 text-[#00F0FF]' : 'text-gray-400'}`} />
          </button>
          
          <AnimatePresence>
            {isSortMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-36 bg-[#181820] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden backdrop-blur-md"
              >
                {[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'top', label: 'Top comments' },
                  { value: 'oldest', label: 'Oldest first' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSort(option.value);
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      sort === option.value 
                        ? 'text-[#00F0FF] bg-[#00F0FF]/10' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>



      {/* List */}
      {loading ? (
        <div className="py-4">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
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

      <ConfirmModal
        isOpen={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default CommentsList;
