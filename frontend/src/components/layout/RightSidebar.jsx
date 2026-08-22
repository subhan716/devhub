import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Scale, Lock, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';

const RightSidebar = ({ currentUser }) => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const navigate = useNavigate();

  // Get the current logged-in user's ID safely
  const currentUserId = currentUser?._id || currentUser?.user?._id || currentUser?.id;

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/network/suggestions`, { withCredentials: true });
      const filtered = Array.isArray(data) ? data.filter(u => {
        const targetId = u._id || u.id;
        const isSelfId = currentUserId && targetId === currentUserId;
        const isSelfName = currentUser?.name && u.name.toLowerCase() === currentUser.name.toLowerCase();
        return !isSelfId && !isSelfName;
      }) : [];
      setSuggestedUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
    }
  };

  useEffect(() => {
    fetchSuggestions();

    const handleNetworkUpdate = () => {
      fetchSuggestions();
    };

    window.addEventListener('network-update', handleNetworkUpdate);
    return () => window.removeEventListener('network-update', handleNetworkUpdate);
  }, [currentUserId]);

  const handleConnect = async (userId) => {
    setLoadingIds(prev => [...prev, userId]);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/network/connect/${userId}`, {}, { withCredentials: true });
      toast.success('Connection request sent');
      setSuggestedUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
      window.dispatchEvent(new Event('network-update'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect');
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Limit suggestions in the sidebar widget to 3-4 users
  const visibleSuggestions = suggestedUsers.slice(0, 4);

  return (
    <aside className="w-80 h-screen fixed right-0 top-0 border-l border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a] pt-20 pb-6 px-6 hidden xl:flex flex-col justify-between overflow-y-auto scrollbar-none z-10 transition-colors duration-200">
      {/* Top Section: Suggested Connections Card */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">Suggested Connections</h3>
            {suggestedUsers.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400">
                {suggestedUsers.length}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((user) => {
                const userId = user._id || user.id;
                const avatarSrc = user.avatar?.url || user.avatarUrl || (typeof user.avatar === 'string' ? user.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
                
                return (
                  <div key={userId} className="flex items-center justify-between gap-3 group">
                    <div 
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1" 
                      onClick={() => navigate(`/profile/${userId}`)}
                    >
                      <img 
                        src={avatarSrc} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 group-hover:border-[#0A66C2] dark:group-hover:border-[#00F0FF]/50 transition-colors flex-shrink-0 bg-slate-100 dark:bg-[#1a1a1a]" 
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-900 dark:text-white text-xs font-semibold group-hover:text-[#0A66C2] dark:group-hover:text-[#00F0FF] transition-colors truncate">
                          {user.name}
                        </span>
                        <span className="text-gray-500 text-[11px] truncate">
                          {user.role || user.bio || 'Developer'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConnect(userId)}
                      disabled={loadingIds.includes(userId)}
                      className="px-3 py-1 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 dark:bg-[#00F0FF]/10 dark:text-[#00F0FF] dark:hover:bg-[#00F0FF]/20 dark:border-[#00F0FF]/20 text-xs font-semibold rounded-full transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
                    >
                      {loadingIds.includes(userId) ? '...' : 'Connect'}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No new suggestions</p>
            )}
          </div>

          {/* Show All Recommendations Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
            <Link 
              to="/network?tab=suggestions" 
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0A66C2] dark:text-[#00F0FF] hover:text-blue-700 dark:hover:text-cyan-300 transition-colors group cursor-pointer w-full py-1"
            >
              <span>Show all recommendations</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Section: Active Working Footer Legal & Governance Links */}
      <div className="mt-auto pt-4">
        <div className="bg-white dark:bg-[#111]/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-3 text-[11px] text-gray-500 dark:text-gray-400 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500 block font-semibold">
            Trust & Legal Center
          </span>

          <div className="flex flex-col gap-2">
            <Link 
              to="/guidelines" 
              className="flex items-center justify-between hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-amber-500 dark:text-amber-400" />
                <span>Community Guidelines</span>
              </div>
              <span className="text-[10px] text-gray-400 group-hover:text-[#0A66C2] dark:group-hover:text-[#00F0FF]">→</span>
            </Link>

            <Link 
              to="/terms" 
              className="flex items-center justify-between hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Scale size={13} className="text-blue-500 dark:text-cyan-400" />
                <span>Terms of Service</span>
              </div>
              <span className="text-[10px] text-gray-400 group-hover:text-[#0A66C2] dark:group-hover:text-[#00F0FF]">→</span>
            </Link>

            <Link 
              to="/privacy" 
              className="flex items-center justify-between hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-emerald-500 dark:text-emerald-400" />
                <span>Privacy Policy (GDPR)</span>
              </div>
              <span className="text-[10px] text-gray-400 group-hover:text-[#0A66C2] dark:group-hover:text-[#00F0FF]">→</span>
            </Link>

            <a 
              href="mailto:devhubapp.support@gmail.com" 
              className="flex items-center justify-between hover:text-slate-900 dark:hover:text-white transition-colors group cursor-pointer pt-1 border-t border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <HelpCircle size={13} />
                <span>Trust Desk & Support</span>
              </div>
              <ExternalLink size={11} className="text-gray-400" />
            </a>
          </div>

          <div className="text-[10px] text-gray-400 dark:text-gray-600 font-mono pt-1">
            DevHub Corporation © 2026
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
