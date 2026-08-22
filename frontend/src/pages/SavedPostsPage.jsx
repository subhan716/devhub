import { useState, useEffect } from 'react';
import { Bookmark, Search, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostCard from '../components/common/PostCard';
import { PostSkeleton } from '../components/common/Skeletons';

const SavedPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/posts/saved`, { withCredentials: true })
      ]);
      setCurrentUser(userRes.data);
      setPosts(postsRes.data || []);
    } catch (err) {
      console.error('Failed to load saved posts:', err);
      toast.error('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
  };

  const filteredPosts = posts.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.content || '').toLowerCase().includes(q) ||
      (p.author?.name || '').toLowerCase().includes(q) ||
      (p.codeSnippet?.code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen py-4 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-[#00F0FF]/10 text-[#0A66C2] dark:text-[#00F0FF] rounded-2xl">
                <Bookmark size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Saved Posts & Snippets
                </h1>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {posts.length} bookmarked item{posts.length !== 1 ? 's' : ''} in your private library
                </p>
              </div>
            </div>
          </div>

          {/* Search bar inside Saved Posts */}
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved items..."
              className="w-full bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0A66C2] dark:focus:border-[#00F0FF] transition-all placeholder-slate-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Stream */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Bookmark size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {search ? 'No matching saved items' : 'No saved posts yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {search 
                ? 'Try a different search keyword.' 
                : 'Bookmark posts, discussions, and code snippets from your feed to revisit them anytime.'}
            </p>
            {!search && (
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0A66C2] dark:bg-[#00F0FF] text-white dark:text-black font-semibold rounded-xl text-xs shadow-md hover:opacity-95 transition-all"
              >
                Explore Feed
              </Link>
            )}
          </div>
        ) : (
          filteredPosts.map((post, idx) => (
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
  );
};

export default SavedPostsPage;
