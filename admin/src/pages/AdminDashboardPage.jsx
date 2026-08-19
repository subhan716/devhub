import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Ban, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  ShieldAlert,
  Activity,
  RefreshCw,
  TrendingUp,
  Clock,
  Smartphone,
  Shield
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import StatsCard from '../components/StatsCard';
import UserTable from '../components/UserTable';
import ModerationQueue from '../components/ModerationQueue';
import BroadcastModal from '../components/BroadcastModal';
import MobileAppConfig from '../components/MobileAppConfig';
import AuditLogsExplorer from '../components/AuditLogsExplorer';
import { getAdminStats } from '../api/adminApi';
import toast from 'react-hot-toast';

const AdminDashboardPage = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to fetch real-time telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const summary = stats?.summary || {};
  const trends = stats?.trends || {};

  return (
    <div className="flex min-h-screen bg-[#080808]">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
        onLogout={onLogout}
        pendingReportsCount={summary.pendingReportsCount || 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 capitalize">
              {activeTab === 'overview' && 'Platform Overview & Telemetry'}
              {activeTab === 'users' && 'User Directory & Governance'}
              {activeTab === 'moderation' && 'Trust & Safety Moderation Queue'}
              {activeTab === 'broadcast' && 'System Broadcast & Announcement Hub'}
              {activeTab === 'mobile_app' && 'Mobile Fleet & Version Gatekeeper'}
              {activeTab === 'audit_logs' && 'Security Audit Forensics & Compliance'}
            </h2>
            <p className="text-xs text-gray-400">
              Live enterprise operations console for DevHub social & developer platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              API Services Online
            </div>
            <button
              onClick={fetchStats}
              className="p-2 bg-[#141414] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Real-time Metrics"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Users"
                value={summary.totalUsers}
                change="+Live"
                icon={Users}
                color="cyan"
              />
              <StatsCard
                title="Verified Developers"
                value={summary.totalVerified}
                change="Badged"
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Total Posts"
                value={summary.totalPosts}
                change="Feed Activity"
                icon={FileText}
                color="purple"
              />
              <StatsCard
                title="Pending Reports"
                value={summary.pendingReportsCount}
                change={summary.pendingReportsCount > 0 ? 'Action Needed' : 'Clean'}
                icon={ShieldAlert}
                color="rose"
              />
            </div>

            {/* Secondary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Network Connections"
                value={summary.totalConnections}
                icon={UserCheck}
                color="cyan"
              />
              <StatsCard
                title="Messages Exchanged"
                value={summary.totalMessages}
                icon={MessageSquare}
                color="purple"
              />
              <StatsCard
                title="Suspended Accounts"
                value={summary.totalSuspended}
                icon={Ban}
                color="rose"
              />
            </div>

            {/* 7-Day Activity Trends Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Signups Activity */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#00F0FF]" />
                    Signups (Last 7 Days)
                  </h3>
                  <span className="text-[11px] text-gray-500">Live DB Metrics</span>
                </div>
                {trends.signups && trends.signups.length > 0 ? (
                  <div className="space-y-2">
                    {trends.signups.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                          <Clock size={13} className="text-gray-500" />
                          {item._id}
                        </div>
                        <span className="text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/20">
                          +{item.count} Users
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">No signups recorded in the last 7 days.</p>
                )}
              </div>

              {/* Recent Posts Activity */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-purple-400" />
                    Feed Posts (Last 7 Days)
                  </h3>
                  <span className="text-[11px] text-gray-500">Content Pulse</span>
                </div>
                {trends.posts && trends.posts.length > 0 ? (
                  <div className="space-y-2">
                    {trends.posts.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                          <Clock size={13} className="text-gray-500" />
                          {item._id}
                        </div>
                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                          +{item.count} Posts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">No posts recorded in the last 7 days.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Governance */}
        {activeTab === 'users' && <UserTable />}

        {/* Tab 3: Moderation */}
        {activeTab === 'moderation' && <ModerationQueue />}

        {/* Tab 4: Broadcast */}
        {activeTab === 'broadcast' && <BroadcastModal />}

        {/* Tab 5: Mobile App Fleet */}
        {activeTab === 'mobile_app' && <MobileAppConfig />}

        {/* Tab 6: Security Audit Logs */}
        {activeTab === 'audit_logs' && <AuditLogsExplorer />}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
