import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, Briefcase, MapPin, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/common/PostCard';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('people');
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setProfiles([]);
        setPosts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const [profilesRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/profile/search?q=${encodeURIComponent(searchQuery)}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/api/posts/search?q=${encodeURIComponent(searchQuery)}`, { withCredentials: true })
        ]);
        
        setProfiles(profilesRes.data);
        setPosts(postsRes.data);
      } catch (error) {
        toast.error('Failed to fetch search results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const tabs = [
    { id: 'people', label: 'People', icon: <Users size={16} /> },
    { id: 'posts', label: 'Posts', icon: <FileText size={16} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* Search Header */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <SearchIcon className="text-[#00F0FF]" />
          Search Results for "{searchQuery}"
        </h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-white/5 pb-2 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white shadow-md border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'people' && profiles.length > 0 && (
                <span className="ml-2 bg-[#00F0FF]/20 text-[#00F0FF] py-0.5 px-2 rounded-full text-xs">
                  {profiles.length}
                </span>
              )}
              {tab.id === 'posts' && posts.length > 0 && (
                <span className="ml-2 bg-[#00F0FF]/20 text-[#00F0FF] py-0.5 px-2 rounded-full text-xs">
                  {posts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div className="flex flex-col gap-4">
          
          {/* PEOPLE TAB */}
          {activeTab === 'people' && (
            <AnimatePresence>
              {profiles.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
                  No people found matching "{searchQuery}"
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profiles.map((profile, idx) => (
                    <motion.div
                      key={profile._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors flex items-center gap-4"
                    >
                      <Link to={`/profile/${profile.user._id}`}>
                        <img 
                          src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt={profile.user?.name}
                          className="w-16 h-16 rounded-full object-cover border border-white/10 cursor-pointer"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/profile/${profile.user._id}`} className="text-white font-bold text-lg hover:text-[#00F0FF] transition-colors line-clamp-1">
                          {profile.user?.name}
                        </Link>
                        <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{profile.status || 'Developer'}</p>
                        {profile.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin size={12} />
                            {profile.location}
                          </div>
                        )}
                      </div>
                      <Link 
                        to={`/profile/${profile.user._id}`}
                        className="px-4 py-2 border border-[#00F0FF]/30 text-[#00F0FF] rounded-full text-xs font-bold hover:bg-[#00F0FF]/10 transition-colors"
                      >
                        View
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}

          {/* POSTS TAB */}
          {activeTab === 'posts' && (
            <AnimatePresence>
              {posts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
                  No posts found matching "{searchQuery}"
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  {posts.map((post, idx) => (
                    <PostCard key={post._id} post={post} idx={idx} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
              <Briefcase size={40} className="mx-auto mb-4 text-[#00F0FF]/50" />
              <p>Job search functionality coming soon!</p>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
};

export default SearchPage;
