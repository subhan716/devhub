import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Ban, 
  FileCode2, 
  UserCheck, 
  MessageSquare, 
  ShieldAlert,
  RefreshCw,
  Activity,
  Server
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import MetricGlowCard from '../components/telemetry/MetricGlowCard';
import VelocityAreaChart from '../components/telemetry/VelocityAreaChart';
import PlatformFleetDistribution from '../components/telemetry/PlatformFleetDistribution';
import RealTimeSystemPulse from '../components/telemetry/RealTimeSystemPulse';
import QuickOperationsConsole from '../components/telemetry/QuickOperationsConsole';
import UserTable from '../components/UserTable';
import ModerationQueue from '../components/ModerationQueue';
import BroadcastModal from '../components/BroadcastModal';
import MobileAppConfig from '../components/MobileAppConfig';
import AuditLogsExplorer from '../components/AuditLogsExplorer';
import PolicyCMS from '../components/PolicyCMS';
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
      toast.error('Failed to fetch telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const summary = stats?.summary || {};
  const trends = stats?.trends || {};

  return (
    <div className="flex min-h-screen bg-[#09090B] text-zinc-100 font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
        onLogout={onLogout}
        pendingReportsCount={summary.pendingReportsCount || 0}
      />

      {/* Main Operations Canvas */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight capitalize">
              {activeTab === 'overview' && 'Platform Telemetry & Overview'}
              {activeTab === 'users' && 'User Directory & Governance'}
              {activeTab === 'moderation' && 'Content Moderation Sentinel'}
              {activeTab === 'broadcast' && 'System Broadcast & Notification Hub'}
              {activeTab === 'mobile_app' && 'Mobile Fleet & Version Gatekeeper'}
              {activeTab === 'policies' && 'Legal & Policy Governance Center'}
              {activeTab === 'audit_logs' && 'Security Audit Forensics & Compliance'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Operations control plane for DevHub cross-platform ecosystem
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Services Online
            </div>
            <button
              onClick={fetchStats}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Telemetry */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Top Primary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <MetricGlowCard
                title="Total Users"
                value={summary.totalUsers}
                subtitle="Registered accounts"
                change="+Live"
                changeType="positive"
                icon={Users}
                onClick={() => setActiveTab('users')}
              />

              <MetricGlowCard
                title="Verified Developers"
                value={summary.totalVerified}
                subtitle="Official blue badges"
                change="Verified"
                changeType="positive"
                icon={CheckCircle2}
                onClick={() => setActiveTab('users')}
              />

              <MetricGlowCard
                title="Feed Posts"
                value={summary.totalPosts}
                subtitle="Syntax code snippets"
                change="Active"
                changeType="neutral"
                icon={FileCode2}
                onClick={() => setActiveTab('moderation')}
              />

              <MetricGlowCard
                title="Pending Reports"
                value={summary.pendingReportsCount}
                subtitle={summary.pendingReportsCount > 0 ? 'Requires attention' : 'Queue is clean'}
                change={summary.pendingReportsCount > 0 ? 'Action Needed' : 'Clean'}
                changeType={summary.pendingReportsCount > 0 ? 'negative' : 'positive'}
                icon={ShieldAlert}
                onClick={() => setActiveTab('moderation')}
              />
            </div>

            {/* Secondary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <MetricGlowCard
                title="Network Connections"
                value={summary.totalConnections}
                subtitle="Accepted peer edges"
                change="Graph Active"
                changeType="positive"
                icon={UserCheck}
              />

              <MetricGlowCard
                title="Direct Messages"
                value={summary.totalMessages}
                subtitle="Socket.IO throughput"
                change="Real-time"
                changeType="positive"
                icon={MessageSquare}
              />

              <MetricGlowCard
                title="Suspended Accounts"
                value={summary.totalSuspended}
                subtitle="Security holds applied"
                change="Neutralized"
                changeType={summary.totalSuspended > 0 ? 'negative' : 'positive'}
                icon={Ban}
                onClick={() => setActiveTab('users')}
              />
            </div>

            {/* Middle Row: Velocity Area Chart (7 Cols) + Fleet Distribution & Pulse (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <VelocityAreaChart trends={trends} />
              </div>

              <div className="lg:col-span-5 space-y-5">
                <PlatformFleetDistribution summary={summary} />
                <RealTimeSystemPulse />
              </div>
            </div>

            {/* Bottom Row: Quick Operations Console */}
            <div>
              <QuickOperationsConsole
                onNavigate={(tabId) => setActiveTab(tabId)}
                pendingReportsCount={summary.pendingReportsCount || 0}
              />
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

        {/* Tab 6: Legal & Policy CMS */}
        {activeTab === 'policies' && <PolicyCMS />}

        {/* Tab 7: Security Audit Logs */}
        {activeTab === 'audit_logs' && <AuditLogsExplorer />}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
