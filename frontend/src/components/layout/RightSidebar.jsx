import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RightSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const navigate = useNavigate();

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/network/suggestions`, { withCredentials: true });
      setSuggestedUsers(data);
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
  }, []);

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
    <div className="w-80 h-screen fixed right-0 top-0 border-l border-white/5 bg-[#0a0a0a] pt-24 pb-6 px-6 hidden lg:block overflow-y-auto scrollbar-none z-10">
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
        <h3 className="text-white font-semibold mb-6">Suggested Connections</h3>
        
        <div className="flex flex-col gap-6">
          {suggestedUsers.length > 0 ? suggestedUsers.map((user) => (
            <div key={user._id} className="flex flex-col gap-3 group">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer" 
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <img src={user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[#00F0FF]/50 transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium group-hover:text-[#00F0FF] transition-colors">{user.name}</span>
                    <span className="text-gray-500 text-xs">{user.role || 'Developer'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleConnect(user._id)}
                  disabled={loadingIds.includes(user._id)}
                  className="px-4 py-1.5 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 text-xs font-semibold rounded-full transition-colors border border-[#00F0FF]/20 cursor-pointer disabled:opacity-50"
                >
                  {loadingIds.includes(user._id) ? '...' : 'Connect'}
                </button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-4">No new suggestions</p>
          )}
        </div>
      </div>
      
      {/* Footer Links */}
      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 px-2 text-[11px] text-gray-600">
        <Link to="#" className="hover:text-gray-400 transition-colors">About</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Accessibility</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Help Center</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Privacy & Terms</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Advertising</Link>
        <div className="w-full mt-2">© 2026 DevHub Corporation</div>
      </div>
    </div>
  );
};

export default RightSidebar;
