import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostCard from '../components/common/PostCard';
import { PostSkeleton } from '../components/common/Skeletons';

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
        setIsLoading(true);
        // 1. Fetch current user
        const meRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true });
        setCurrentUser(meRes.data);

        // 2. Fetch profile info
        const targetParam = id || meRes.data?._id || meRes.data?.id;
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/user/${targetParam}`, { withCredentials: true });
        setProfile(profileRes.data);

        // 3. Fetch user's posts & reposts
        const resolvedUserId = profileRes.data?.user?._id || profileRes.data?.user?.id || profileRes.data?.userId || targetParam;
        const postsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${resolvedUserId}`, { withCredentials: true });
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error('Failed to load user posts:', err);
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
      setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const authorName = profile?.user?.name || profile?.name || 'Developer';
  const authorAvatar = profile?.user?.avatar?.url || profile?.user?.avatarUrl || profile?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 bg-white dark:bg-[#111] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {authorName}'s Activity & Posts
              </h1>
              <p className="text-xs text-gray-500 font-medium">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <Link
            to={`/profile/${id || profile?.user?._id || ''}`}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 group-hover:border-[#0A66C2] dark:group-hover:border-[#00F0FF] transition-colors"
            />
          </Link>
        </div>

        {/* Posts Stream */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <FileText size={32} className="mx-auto mb-3 text-gray-400 opacity-60" />
              <p className="text-sm font-medium">No posts or reposts published yet.</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                idx={idx}
                currentUser={currentUser}
                onDelete={handleDeletePost}
                onEdit={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPostsPage;
