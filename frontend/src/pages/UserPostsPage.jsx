import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostCard from '../components/common/PostCard';

const UserPostsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const meRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true });
        setCurrentUser(meRes.data);

        // Fetch profile info using user ID
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/user/${id}`, { withCredentials: true });
        setProfile(profileRes.data);

        // Fetch this user's posts
        const postsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${profileRes.data.user._id}`);
        setPosts(postsRes.data);
      } catch {
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, { withCredentials: true });
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleEditPost = () => {
    // navigate to feed with edit, or just ignore for now
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {profile?.user?.name || 'User'}'s Posts
            </h1>
            <p className="text-sm text-gray-500">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
          {profile && (
            <Link
              to={`/profile/${id}`}
              className="ml-auto flex items-center gap-2"
            >
              <img
                src={profile.user?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                alt={profile.user?.name}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
            </Link>
          )}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-[#00F0FF]" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500 py-16 bg-[#111] rounded-2xl border border-white/5"
          >
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">This user hasn't shared anything yet.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {posts.map((post, idx) => (
                <PostCard
                  key={post._id}
                  post={post}
                  idx={idx}
                  currentUser={currentUser}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPostsPage;
