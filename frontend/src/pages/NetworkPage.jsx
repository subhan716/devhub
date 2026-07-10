import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, UserPlus, UserCheck, MapPin, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('invitations');
  
  // Follow System State
  const [followSuggestions, setFollowSuggestions] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  // Connection System State
  const [pendingRequests, setPendingRequests] = useState({ received: [], sent: [] });
  const [connectionSuggestions, setConnectionSuggestions] = useState([]);
  const [connections, setConnections] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const [
        suggRes, follRes, followingRes,
        pendRes, connSuggRes, connRes
      ] = await Promise.all([
        // Follow Data
        axios.get('http://localhost:5000/api/profile/suggestions', { withCredentials: true }),
        axios.get('http://localhost:5000/api/profile/followers', { withCredentials: true }),
        axios.get('http://localhost:5000/api/profile/following', { withCredentials: true }),
        // Connection Data
        axios.get('http://localhost:5000/api/network/pending', { withCredentials: true }),
        axios.get('http://localhost:5000/api/network/suggestions', { withCredentials: true }),
        axios.get('http://localhost:5000/api/network/connections', { withCredentials: true })
      ]);
      
      setFollowSuggestions(suggRes.data);
      setFollowers(follRes.data);
      setFollowing(followingRes.data);
      
      setPendingRequests(pendRes.data);
      setConnectionSuggestions(connSuggRes.data);
      setConnections(connRes.data);
    } catch (error) {
      toast.error('Failed to fetch network data');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Connection Actions ----------------

  const handleConnect = async (userId) => {
    setActionLoading(`connect-${userId}`);
    try {
      await axios.post(`http://localhost:5000/api/network/connect/${userId}`, {}, { withCredentials: true });
      toast.success('Connection request sent!');
      fetchNetworkData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoading(`accept-${requestId}`);
    try {
      await axios.put(`http://localhost:5000/api/network/accept/${requestId}`, {}, { withCredentials: true });
      toast.success('Connection accepted!');
      fetchNetworkData();
    } catch (error) {
      toast.error('Error accepting request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(`reject-${requestId}`);
    try {
      await axios.put(`http://localhost:5000/api/network/reject/${requestId}`, {}, { withCredentials: true });
      fetchNetworkData();
    } catch (error) {
      toast.error('Error rejecting request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveConnection = async (userId) => {
    if(!window.confirm('Are you sure you want to remove this connection?')) return;
    setActionLoading(`remove-${userId}`);
    try {
      await axios.delete(`http://localhost:5000/api/network/remove/${userId}`, { withCredentials: true });
      toast.success('Connection removed');
      fetchNetworkData();
    } catch (error) {
      toast.error('Error removing connection');
    } finally {
      setActionLoading(null);
    }
  };

  // ---------------- Follow Actions ----------------

  const handleFollowToggle = async (userId, isFollowingUser) => {
    setActionLoading(`follow-${userId}`);
    try {
      const action = isFollowingUser ? 'unfollow' : 'follow';
      await axios.post(`http://localhost:5000/api/profile/${action}/${userId}`, {}, { withCredentials: true });
      
      const [suggRes, follRes, followingRes] = await Promise.all([
        axios.get('http://localhost:5000/api/profile/suggestions', { withCredentials: true }),
        axios.get('http://localhost:5000/api/profile/followers', { withCredentials: true }),
        axios.get('http://localhost:5000/api/profile/following', { withCredentials: true })
      ]);
      setFollowSuggestions(suggRes.data);
      setFollowers(follRes.data);
      setFollowing(followingRes.data);
      
      toast.success(`Successfully ${isFollowingUser ? 'unfollowed' : 'followed'} user`);
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { id: 'invitations', label: 'Invitations', icon: <Users size={16} />, count: pendingRequests.received.length },
    { id: 'connections', label: 'Connections', icon: <UserCheck size={16} />, count: connections.length },
    { id: 'following', label: 'Following', icon: <UserCheck size={16} />, count: following.length },
    { id: 'followers', label: 'Followers', icon: <UserPlus size={16} />, count: followers.length },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00F0FF]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Tabs Header */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-1 sm:p-2 w-full">
        <div className="flex justify-between gap-1 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:px-4 py-2 sm:py-3 rounded-xl font-medium sm:font-semibold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="scale-75 sm:scale-100">{tab.icon}</span>
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="text-[10px] sm:text-xs lg:hidden">{tab.label.substring(0, 4)}..</span>
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                activeTab === tab.id ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'bg-white/10 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>


      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* INVITATIONS TAB */}
          {activeTab === 'invitations' && (
            <div className="space-y-8">
              {pendingRequests.received.length > 0 ? (
                <section className="bg-[#111] border border-white/5 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Pending Invitations</h2>
                  <div className="space-y-4">
                    {pendingRequests.received.map((req) => (
                      <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 gap-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={req.requester.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                            alt={req.requester.name} 
                            className="w-12 h-12 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <h3 className="text-white font-semibold">{req.requester.name}</h3>
                            <p className="text-gray-400 text-sm">Wants to connect</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={actionLoading === `reject-${req._id}`}
                            className="flex-1 sm:flex-none px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-white/10 sm:border-transparent disabled:opacity-50"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => handleAccept(req._id)}
                            disabled={actionLoading === `accept-${req._id}`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                          >
                            {actionLoading === `accept-${req._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={18} />}
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">No pending invitations</h3>
                  <p className="text-gray-400 text-sm">When someone wants to connect with you, it will appear here.</p>
                </div>
              )}

              {/* Suggestions for connections */}
              <section className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Suggested Connections</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connectionSuggestions.map((user) => (
                    <div key={user._id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col items-center text-center">
                      <img 
                        src={user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                        alt={user.name} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#111] shadow-lg mb-4"
                      />
                      <h3 className="text-white font-semibold truncate w-full">{user.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 capitalize line-clamp-1">{user.role || 'Developer'}</p>
                      <button
                        onClick={() => handleConnect(user._id)}
                        disabled={actionLoading === `connect-${user._id}` || pendingRequests.sent.some(req => req.recipient._id === user._id)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black font-medium transition-all duration-300 disabled:opacity-50"
                      >
                        {actionLoading === `connect-${user._id}` ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : pendingRequests.sent.some(req => req.recipient._id === user._id) ? (
                          'Pending'
                        ) : (
                          <>
                            <UserPlus size={16} /> Connect
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* CONNECTIONS TAB */}
          {activeTab === 'connections' && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">No connections yet</h3>
                  <p className="text-gray-400 text-sm">Start connecting with other developers to build your network.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connections.map((conn) => (
                    <div key={conn.connectionId} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={conn.user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt={conn.user.name} 
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <Link to={`/profile/${conn.user._id}`} className="text-white font-medium hover:text-[#00F0FF] transition-colors truncate block">
                            {conn.user.name}
                          </Link>
                          <p className="text-gray-400 text-xs capitalize truncate">{conn.user.role || 'Developer'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveConnection(conn.user._id)}
                        disabled={actionLoading === `remove-${conn.user._id}`}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                        title="Remove Connection"
                      >
                        {actionLoading === `remove-${conn.user._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <X size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FOLLOWING TAB */}
          {activeTab === 'following' && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">You are not following anyone yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {following.map((profile) => (
                    <div key={profile._id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} className="w-10 h-10 rounded-full" />
                        <div>
                          <Link to={`/profile/${profile.user._id}`} className="text-white font-medium hover:text-[#00F0FF]">{profile.user?.name}</Link>
                        </div>
                      </div>
                      <button onClick={() => handleFollowToggle(profile.user._id, true)} className="text-sm px-4 py-1.5 border border-white/10 rounded-full text-white hover:bg-white/5">
                        {actionLoading === `follow-${profile.user._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Following'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FOLLOWERS TAB */}
          {activeTab === 'followers' && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">You don't have any followers yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {followers.map((profile) => {
                    const isFollowingUser = following.some(f => f.user._id === profile.user._id);
                    return (
                      <div key={profile._id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <img src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} className="w-10 h-10 rounded-full" />
                          <div>
                            <Link to={`/profile/${profile.user._id}`} className="text-white font-medium hover:text-[#00F0FF]">{profile.user?.name}</Link>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleFollowToggle(profile.user._id, isFollowingUser)}
                          className={`text-sm px-4 py-1.5 rounded-full ${isFollowingUser ? 'border border-white/10 text-white' : 'bg-[#00F0FF] text-black'}`}
                        >
                          {actionLoading === `follow-${profile.user._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : (isFollowingUser ? 'Following' : 'Follow Back')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NetworkPage;
