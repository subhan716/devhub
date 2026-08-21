import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/common/PostCard';
import { ArrowLeft } from 'lucide-react';

const PostPage = () => {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get('commentId'); // Used for deep linking
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, { withCredentials: true });
        setPost(res.data);
      } catch (err) {
        console.error(err);
        setError('Post not found or has been deleted');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0A66C2] dark:bg-[#00F0FF] selection:text-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center mt-20">
          <div className="w-8 h-8 border-4 border-[#0A66C2] dark:border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0A66C2] dark:bg-[#00F0FF] selection:text-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-24 text-center">
          <h2 className="text-2xl font-bold text-slate-600 dark:text-gray-400">{error || 'Post not found'}</h2>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-6 px-6 py-2 bg-[#1A1A1A] hover:bg-white/10 rounded-full transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0A66C2] dark:bg-[#00F0FF] selection:text-black flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-12">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 px-4 py-1.5 bg-[#1A1A1A] hover:bg-white/10 rounded-full transition-colors text-sm text-gray-300 inline-flex items-center gap-2 border border-slate-200 dark:border-white/5"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* PostCard will handle its own comments if we pass autoOpenComments */}
        <PostCard post={post} currentUser={currentUser} autoOpenComments={true} targetCommentId={commentId} />
      </main>
    </div>
  );
};

export default PostPage;
