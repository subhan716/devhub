import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const AnalyticsModal = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
          const { data } = await axios.get('http://localhost:5000/api/profile/analytics', { withCredentials: true });
          setAnalytics(data);
        } catch (error) {
          toast.error('Failed to load analytics');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-[#00F0FF]" size={24} />
              Profile Analytics
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
              </div>
            ) : analytics ? (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Eye size={16} /> <span className="text-sm font-medium">Total Views</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{analytics.totalViews}</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <TrendingUp size={16} /> <span className="text-sm font-medium">Last 7 Days</span>
                    </div>
                    <div className="text-3xl font-bold text-[#00F0FF]">+{analytics.recentViews}</div>
                  </div>
                </div>

                {/* Recent Viewers */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Viewers</h3>
                  
                  {analytics.viewers && analytics.viewers.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent="true">
                      {analytics.viewers.map((view, idx) => {
                        if (!view.viewer) return null; // Handle deleted users safely
                        return (
                          <Link 
                            key={idx} 
                            to={`/profile/${view.viewer._id}`}
                            onClick={onClose}
                            className="flex items-center justify-between bg-[#1a1a1a] hover:bg-white/5 p-3 rounded-xl border border-white/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={view.viewer.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                                alt={view.viewer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors">{view.viewer.name}</p>
                                <p className="text-xs text-gray-400 line-clamp-1">{view.viewer.status || 'Member'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                              <Clock size={12} />
                              {formatDistanceToNow(new Date(view.viewedAt), { addSuffix: true })}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
                      <Eye size={32} className="mx-auto mb-3 opacity-20" />
                      <p>No recent views</p>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalyticsModal;
