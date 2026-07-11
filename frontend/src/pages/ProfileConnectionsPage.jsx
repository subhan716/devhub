import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, UserCheck, MoreHorizontal, UserMinus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const ProfileConnectionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, connectionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile/user/${id}`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/network/connections/${id}`, { withCredentials: true })
      ]);
      setProfile(profileRes.data);
      setConnections(connectionsRes.data);
    } catch (error) {
      toast.error('Failed to load connections');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Connection',
      message: `Are you sure you want to remove ${userName} from your connections?`,
      confirmText: 'Remove',
      isDestructive: true,
      onConfirm: async () => {
        setActionLoading(`remove-${userId}`);
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/network/remove/${userId}`, { withCredentials: true });
          toast.success('Connection removed');
          fetchData();
        } catch (error) {
          toast.error('Error removing connection');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">Profile not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#00F0FF] hover:underline">Go back</button>
      </div>
    );
  }

  // Headline: bio field from profile
  const userHeadline = profile.bio || '';

  return (
    <div className="max-w-4xl mx-auto pb-20">

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
      />

      {/* Profile Header Card */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-4 flex items-center gap-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={22} />
        </button>

        <Link to={`/profile/${id}`}>
          <img
            src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={profile.user?.name}
            className="w-16 h-16 rounded-full border border-white/10 object-cover flex-shrink-0"
          />
        </Link>

        <div className="min-w-0">
          <Link to={`/profile/${id}`} className="text-xl font-bold text-white hover:text-[#00F0FF] transition-colors block">
            {profile.user?.name}&apos;s Connections
          </Link>
          {/* Headline below name */}
          {userHeadline && (
            <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{userHeadline}</p>
          )}
          {profile.location && (
            <p className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <MapPin size={11} /> {profile.location}
            </p>
          )}
          <div className="text-[#00F0FF] text-xs font-semibold mt-1">{connections.length} Connections</div>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">{connections.length} Connections</h2>
        <div className="text-gray-400 text-sm mb-6 pb-4 border-b border-white/5">Sort by: Recently added</div>

        {connections.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No connections yet</h3>
            <p className="text-gray-400 text-sm">This user hasn&apos;t made any connections yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {connections.map((conn) => (
              <div
                key={conn.connectionId}
                className="flex flex-col sm:flex-row sm:items-start justify-between py-5 border-b border-white/5 gap-4 hover:bg-white/[0.02] transition-colors -mx-6 px-6"
              >
                <div className="flex gap-4 items-start w-full sm:w-2/3">
                  <Link to={`/profile/${conn.user._id}`} className="flex-shrink-0">
                    <img
                      src={conn.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt={conn.user?.name}
                      className="w-16 h-16 min-w-[4rem] min-h-[4rem] rounded-full object-cover border border-white/10"
                    />
                  </Link>
                  <div className="flex flex-col overflow-hidden">
                    <Link
                      to={`/profile/${conn.user._id}`}
                      className="text-white font-semibold text-base hover:text-[#00F0FF] transition-colors truncate block"
                    >
                      {conn.user?.name}
                    </Link>
                    {/* Headline — bio (headline field) → status → role */}
                    {(conn.user?.bio || conn.user?.status || conn.user?.role) && (
                      <p className="text-gray-400 text-sm line-clamp-2 mt-0.5 leading-relaxed">
                        {conn.user?.bio || conn.user?.status || conn.user?.role}
                      </p>
                    )}
                    {/* Location — only show if available */}
                    {conn.user?.location && (
                      <p className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <MapPin size={10} /> {conn.user.location}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Connected on {conn.connectedAt
                        ? new Date(conn.connectedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'recently'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:pl-4">
                  <Link
                    to={`/messages?user=${conn.user._id}`}
                    className="px-5 py-1.5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/40 transition-all text-sm"
                  >
                    Message
                  </Link>

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
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-20 py-2"
                          >
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleRemoveConnection(conn.user._id, conn.user?.name);
                              }}
                              disabled={actionLoading === `remove-${conn.user._id}`}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3"
                            >
                              {actionLoading === `remove-${conn.user._id}`
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <UserMinus size={16} />
                              }
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
    </div>
  );
};

export default ProfileConnectionsPage;
