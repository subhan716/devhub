import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Scale, Lock, ExternalLink, HelpCircle } from 'lucide-react';

const RightSidebar = ({ currentUser }) => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const navigate = useNavigate();

  // Get the current logged-in user's ID safely
  const currentUserId = currentUser?._id || currentUser?.user?._id;

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/network/suggestions`, { withCredentials: true });
      const filtered = data.filter(u => {
        const isSelfId = currentUserId && u._id === currentUserId;
        const isSelfName = currentUser?.name && u.name.toLowerCase() === currentUser.name.toLowerCase();
        return !isSelfId && !isSelfName;
      });
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
      window.dispatchEvent(new Event('network-update'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect');
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== userId));
    }
  };

  return (
    <div className="w-80 h-screen fixed right-0 top-0 border-l border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a] pt-24 pb-6 px-6 hidden xl:block overflow-y-auto scrollbar-none z-10 transition-colors duration-200">
      {/* Suggested Connections Box */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-lg">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-5">Suggested Connections</h3>
        
        <div className="flex flex-col gap-5">
          {suggestedUsers.length > 0 ? suggestedUsers.map((user) => (
            <div key={user._id} className="flex flex-col gap-3 group">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer min-w-0" 
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <img 
                    src={user.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 group-hover:border-[#0A66C2] dark:group-hover:border-[#00F0FF]/50 transition-colors flex-shrink-0" 
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-900 dark:text-white text-xs font-semibold group-hover:text-[#0A66C2] dark:group-hover:text-[#00F0FF] transition-colors truncate">
                      {user.name}
                    </span>
                    <span className="text-gray-500 text-[11px] truncate">
                      {user.role || 'Developer'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleConnect(user._id)}
                  disabled={loadingIds.includes(user._id)}
                  className="px-3.5 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 dark:bg-[#00F0FF]/10 dark:text-[#00F0FF] dark:hover:bg-[#00F0FF]/20 dark:border-[#00F0FF]/20 text-xs font-semibold rounded-full transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  {loadingIds.includes(user._id) ? '...' : 'Connect'}
                </button>
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No new suggestions</p>
          )}
        </div>
      </div>
      
      {/* Active Working Footer Legal & Governance Links */}
      <div className="mt-6 bg-white dark:bg-[#111]/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-3 text-[11px] text-gray-500 dark:text-gray-400 shadow-sm dark:shadow-none">
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
  );
};

export default RightSidebar;
