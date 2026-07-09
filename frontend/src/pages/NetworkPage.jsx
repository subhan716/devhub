import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, UserPlus, UserCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkData = async () => {
      setIsLoading(true);
      try {
        const [suggRes, follRes, followingRes] = await Promise.all([
          axios.get('http://localhost:5000/api/profile/suggestions', { withCredentials: true }),
          axios.get('http://localhost:5000/api/profile/followers', { withCredentials: true }),
          axios.get('http://localhost:5000/api/profile/following', { withCredentials: true })
        ]);
        setSuggestions(suggRes.data);
        setFollowers(follRes.data);
        setFollowing(followingRes.data);
      } catch (error) {
        toast.error('Failed to fetch network data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworkData();
  }, []);

  const handleFollowToggle = async (userId, isFollowingUser) => {
    try {
      const action = isFollowingUser ? 'unfollow' : 'follow';
      await axios.post(`http://localhost:5000/api/profile/${action}/${userId}`, {}, { withCredentials: true });
      
      // Refresh network data to keep lists accurate
      const [suggRes, follRes, followingRes] = await Promise.all([
        axios.get('http://localhost:5000/api/profile/suggestions', { withCredentials: true }),
        axios.get('http://localhost:5000/api/profile/followers', { withCredentials: true }),
        axios.get('http://localhost:5000/api/profile/following', { withCredentials: true })
      ]);
      setSuggestions(suggRes.data);
      setFollowers(follRes.data);
      setFollowing(followingRes.data);
      
      toast.success(`Successfully ${isFollowingUser ? 'unfollowed' : 'followed'} user`);
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: <Users size={16} />, count: suggestions.length },
    { id: 'following', label: 'Following', icon: <UserCheck size={16} />, count: following.length },
    { id: 'followers', label: 'Followers', icon: <UserPlus size={16} />, count: followers.length },
  ];

  const renderProfileCard = (profile, listType) => {
    const isFollowingUser = following.some(f => f.user._id === profile.user._id);
    
    return (
      <motion.div
        key={profile._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
      >
        <Link to={`/profile/${profile.user._id}`}>
          <img 
            src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
            alt={profile.user?.name}
            className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover border border-white/10 cursor-pointer"
          />
        </Link>
        <div className="flex-1">
          <Link to={`/profile/${profile.user._id}`} className="text-white font-bold text-lg hover:text-[#00F0FF] transition-colors line-clamp-1">
            {profile.user?.name}
          </Link>
          <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{profile.status || 'Developer'}</p>
          {profile.location && (
            <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-500 mt-1">
              <MapPin size={12} />
              {profile.location}
            </div>
          )}
        </div>
        <button 
          onClick={() => handleFollowToggle(profile.user._id, isFollowingUser)}
          className={`mt-3 sm:mt-0 px-6 py-2 rounded-full text-sm font-bold transition-colors w-full sm:w-auto ${
            isFollowingUser 
              ? 'border border-white/10 text-white hover:bg-white/5' 
              : 'bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
          }`}
        >
          {isFollowingUser ? 'Following' : 'Follow'}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* Network Header */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="text-[#00F0FF]" />
          My Network
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
              {tab.count > 0 && (
                <span className="ml-2 bg-[#00F0FF]/20 text-[#00F0FF] py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
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
          
          {/* SUGGESTIONS TAB */}
          {activeTab === 'suggestions' && (
            <AnimatePresence>
              {suggestions.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
                  No new suggestions at the moment.
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map(profile => renderProfileCard(profile, 'suggestions'))}
                </div>
              )}
            </AnimatePresence>
          )}

          {/* FOLLOWING TAB */}
          {activeTab === 'following' && (
            <AnimatePresence>
              {following.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
                  You are not following anyone yet.
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {following.map(profile => renderProfileCard(profile, 'following'))}
                </div>
              )}
            </AnimatePresence>
          )}

          {/* FOLLOWERS TAB */}
          {activeTab === 'followers' && (
            <AnimatePresence>
              {followers.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
                  You don't have any followers yet.
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followers.map(profile => renderProfileCard(profile, 'followers'))}
                </div>
              )}
            </AnimatePresence>
          )}

        </div>
      )}

    </div>
  );
};

export default NetworkPage;
