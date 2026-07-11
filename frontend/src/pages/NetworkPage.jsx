import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Users, UserPlus, UserCheck, MapPin, Check, X, Loader2, MessageSquare, MoreHorizontal, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NetworkPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'invitations';
  const invitationTab = searchParams.get('sub') || 'received';

  const setActiveTab = (tab) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    }, { replace: true });
  };

  const setInvitationTab = (sub) => {
    setSearchParams(prev => {
      prev.set('sub', sub);
      return prev;
    }, { replace: true });
  };
  const [activeDropdown, setActiveDropdown] = useState(null);
  
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

    const handleNetworkUpdate = () => {
      fetchNetworkData();
    };
    window.addEventListener('network-update', handleNetworkUpdate);
    return () => window.removeEventListener('network-update', handleNetworkUpdate);
  }, []);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const [
        suggRes, follRes, followingRes,
        pendRes, connSuggRes, connRes
      ] = await Promise.all([
        // Follow Data
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/suggestions`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/followers`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/following`, { withCredentials: true }),
        // Connection Data
        axios.get(`${import.meta.env.VITE_API_URL}/api/network/pending`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/network/suggestions`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/network/connections`, { withCredentials: true })
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/network/connect/${userId}`, {}, { withCredentials: true });
      toast.success('Connection request sent!');
      fetchNetworkData();
      window.dispatchEvent(new Event('network-update'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoading(`accept-${requestId}`);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/network/accept/${requestId}`, {}, { withCredentials: true });
      toast.success('Connection accepted!');
      fetchNetworkData();
      window.dispatchEvent(new Event('network-update'));
    } catch (error) {
      toast.error('Error accepting request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(`reject-${requestId}`);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/network/reject/${requestId}`, {}, { withCredentials: true });
      fetchNetworkData();
      window.dispatchEvent(new Event('network-update'));
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/network/remove/${userId}`, { withCredentials: true });
      toast.success('Connection removed');
      fetchNetworkData();
      window.dispatchEvent(new Event('network-update'));
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/profile/${action}/${userId}`, {}, { withCredentials: true });
      
      const [suggRes, follRes, followingRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/suggestions`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/followers`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/following`, { withCredentials: true })
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
            <div className="space-y-6">
              {/* Sub-tabs for Invitations */}
              <div className="flex gap-4 border-b border-white/5 pb-2">
                <button
                  onClick={() => setInvitationTab('received')}
                  className={`pb-2 px-2 text-sm font-semibold transition-colors relative ${invitationTab === 'received' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Received ({pendingRequests.received.length})
                  {invitationTab === 'received' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00F0FF] rounded-t-full"></div>}
                </button>
                <button
                  onClick={() => setInvitationTab('sent')}
                  className={`pb-2 px-2 text-sm font-semibold transition-colors relative ${invitationTab === 'sent' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sent ({pendingRequests.sent.length})
                  {invitationTab === 'sent' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00F0FF] rounded-t-full"></div>}
                </button>
              </div>

              {invitationTab === 'received' && (
                pendingRequests.received.length > 0 ? (
                  <section className="bg-[#111] border border-white/5 rounded-2xl p-6">
                    <div className="space-y-4">
                      {pendingRequests.received.map((req) => (
                        <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 gap-4">
                          <div className="flex items-center gap-4 cursor-pointer">
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
                    <h3 className="text-white font-bold text-lg mb-2">No received invitations</h3>
                    <p className="text-gray-400 text-sm">When someone wants to connect with you, it will appear here.</p>
                  </div>
                )
              )}

              {invitationTab === 'sent' && (
                pendingRequests.sent.length > 0 ? (
                  <section className="bg-[#111] border border-white/5 rounded-2xl p-6">
                    <div className="space-y-4">
                      {pendingRequests.sent.map((req) => (
                        <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 gap-4">
                          <div className="flex items-center gap-4 cursor-pointer">
                            <img 
                              src={req.recipient.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                              alt={req.recipient.name} 
                              className="w-12 h-12 rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <h3 className="text-white font-semibold">{req.recipient.name}</h3>
                              <p className="text-gray-400 text-sm">Request sent</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Since req.recipient._id is what removeConnection expects:
                                handleRemoveConnection(req.recipient._id);
                              }}
                              disabled={actionLoading === `remove-${req.recipient._id}`}
                              className="flex-1 sm:flex-none px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10 disabled:opacity-50"
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">No sent invitations</h3>
                    <p className="text-gray-400 text-sm">Requests you send to others will appear here.</p>
                  </div>
                )
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
              <h2 className="text-xl font-bold text-white mb-2">{connections.length} Connections</h2>
              <div className="text-gray-400 text-sm mb-6 pb-4 border-b border-white/5">Sort by: Recently added</div>
              
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">No connections yet</h3>
                  <p className="text-gray-400 text-sm">Start connecting with other developers to build your network.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {connections.map((conn) => (
                    <div key={conn.connectionId} className="flex flex-col sm:flex-row sm:items-start justify-between py-5 border-b border-white/5 gap-4 hover:bg-white/[0.02] transition-colors -mx-6 px-6">
                      <div className="flex gap-4 items-start w-full sm:w-2/3">
                        <img 
                          src={conn.user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt={conn.user.name} 
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-white/10"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <Link to={`/profile/${conn.user._id}`} className="text-white font-semibold text-base hover:text-[#00F0FF] transition-colors truncate block">
                            {conn.user.name}
                          </Link>
                          <p className="text-gray-400 text-sm line-clamp-2 mt-0.5 leading-relaxed">{conn.user.bio || conn.user.role || 'Software Engineer | Developer'}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            Connected on {conn.connectedAt ? new Date(conn.connectedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'recently'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:pl-4">
                        <button className="px-5 py-1.5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/40 transition-all text-sm">
                          Message
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === conn.connectionId ? null : conn.connectionId)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                          
                          <AnimatePresence>
                            {activeDropdown === conn.connectionId && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-20 py-2"
                                >
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      handleRemoveConnection(conn.user._id);
                                    }}
                                    disabled={actionLoading === `remove-${conn.user._id}`}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3"
                                  >
                                    {actionLoading === `remove-${conn.user._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus size={16} />}
                                    Remove connection
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FOLLOWING TAB */}
          {activeTab === 'following' && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">{following.length} Following</h2>
              <div className="text-gray-400 text-sm mb-6 pb-4 border-b border-white/5">People you follow</div>
              
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">You are not following anyone yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {following.map((profile) => (
                    <div key={profile._id} className="flex flex-col sm:flex-row sm:items-start justify-between py-5 border-b border-white/5 gap-4 hover:bg-white/[0.02] transition-colors -mx-6 px-6">
                      <div className="flex gap-4 items-start w-full sm:w-2/3">
                        <img 
                          src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt={profile.user?.name} 
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-white/10"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <Link to={`/profile/${profile.user._id}`} className="text-white font-semibold text-base hover:text-[#00F0FF] transition-colors truncate block">
                            {profile.user?.name}
                          </Link>
                          <p className="text-gray-400 text-sm line-clamp-2 mt-0.5 leading-relaxed">{profile.bio || profile.user?.role || 'Software Engineer'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:pl-4">
                        <button className="px-5 py-1.5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/40 transition-all text-sm">
                          Message
                        </button>
                        <button 
                          onClick={() => handleFollowToggle(profile.user._id, true)}
                          className="px-5 py-1.5 border border-white/10 text-white hover:bg-white/5 rounded-full transition-colors text-sm"
                        >
                          {actionLoading === `follow-${profile.user._id}` ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Following'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FOLLOWERS TAB */}
          {activeTab === 'followers' && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">{followers.length} Followers</h2>
              <div className="text-gray-400 text-sm mb-6 pb-4 border-b border-white/5">People following you</div>
              
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">You don't have any followers yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {followers.map((profile) => {
                    const isFollowingUser = following.some(f => f.user._id === profile.user._id);
                    return (
                      <div key={profile._id} className="flex flex-col sm:flex-row sm:items-start justify-between py-5 border-b border-white/5 gap-4 hover:bg-white/[0.02] transition-colors -mx-6 px-6">
                        <div className="flex gap-4 items-start w-full sm:w-2/3">
                          <img 
                            src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                            alt={profile.user?.name} 
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-white/10"
                          />
                          <div className="flex flex-col overflow-hidden">
                            <Link to={`/profile/${profile.user._id}`} className="text-white font-semibold text-base hover:text-[#00F0FF] transition-colors truncate block">
                              {profile.user?.name}
                            </Link>
                            <p className="text-gray-400 text-sm line-clamp-2 mt-0.5 leading-relaxed">{profile.bio || profile.user?.role || 'Software Engineer'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:pl-4">
                          <button className="px-5 py-1.5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/40 transition-all text-sm">
                            Message
                          </button>
                          <button 
                            onClick={() => handleFollowToggle(profile.user._id, isFollowingUser)}
                            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${isFollowingUser ? 'border border-white/10 text-white hover:bg-white/5' : 'bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 shadow-[0_0_10px_rgba(0,240,255,0.2)]'}`}
                          >
                            {actionLoading === `follow-${profile.user._id}` ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isFollowingUser ? 'Following' : 'Follow Back')}
                          </button>
                        </div>
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
