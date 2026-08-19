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
  Shield,
  Zap,
  Radio,
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
    <div className="flex min-h-screen bg-[#08080A] text-white">
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
        {/* Top Header & Live Telemetry Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
              <h2 className="text-xl font-extrabold text-white tracking-tight capitalize">
                {activeTab === 'overview' && 'Platform Overview & Live Operations'}
                {activeTab === 'users' && 'User Directory & Identity Governance'}
                {activeTab === 'moderation' && 'Trust & Safety Moderation Sentinel'}
                {activeTab === 'broadcast' && 'System Broadcast & Announcement Hub'}
                {activeTab === 'mobile_app' && 'Mobile Fleet & Version Gatekeeper'}
                {activeTab === 'audit_logs' && 'Security Audit Forensics & Compliance'}
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enterprise control center for DevHub cross-platform social & developer ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-extrabold text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              API Services Online
            </div>
            <button
              onClick={fetchStats}
              className="p-2.5 bg-[#141418] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer shadow-sm hover:border-[#00F0FF]/30"
              title="Refresh Real-time Metrics"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Telemetry */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Row: Primary Key Performance Indicators (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricGlowCard
                title="Total Developer Fleet"
                value={summary.totalUsers}
                subtitle="Registered developer accounts"
                change="+Live"
                changeType="positive"
                icon={Users}
                accentColor="cyan"
                sparklineData={[4, 5, 5, 6, 6, 6, summary.totalUsers || 6]}
                onClick={() => setActiveTab('users')}
              />

              <MetricGlowCard
                title="Verified Identities"
                value={summary.totalVerified}
                subtitle="Issued verified checkmarks"
                change="Badged"
                changeType="positive"
                icon={CheckCircle}
                accentColor="emerald"
                sparklineData={[1, 1, 1, 1, 1, 1, summary.totalVerified || 1]}
                onClick={() => setActiveTab('users')}
              />

              <MetricGlowCard
                title="Feed Content & Code"
                value={summary.totalPosts}
                subtitle="Syntax highlighted snippets"
                change="Feed Velocity"
                changeType="neutral"
                icon={FileText}
                accentColor="purple"
                sparklineData={[1, 1, 2, 2, 2, 2, summary.totalPosts || 2]}
                onClick={() => setActiveTab('moderation')}
              />

              <MetricGlowCard
                title="Trust & Safety Queue"
                value={summary.pendingReportsCount}
                subtitle={summary.pendingReportsCount > 0 ? 'Cases require triage' : 'All systems clean'}
                change={summary.pendingReportsCount > 0 ? 'Attention Needed' : 'Clean Queue'}
                changeType={summary.pendingReportsCount > 0 ? 'negative' : 'positive'}
                icon={ShieldAlert}
                accentColor={summary.pendingReportsCount > 0 ? 'rose' : 'emerald'}
                sparklineData={[0, 0, 0, 0, 0, 0, summary.pendingReportsCount || 0]}
                onClick={() => setActiveTab('moderation')}
              />
            </div>

            {/* Secondary Row: Platform Operations & Graph Density */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricGlowCard
                title="Network Graph Edges"
                value={summary.totalConnections}
                subtitle="Accepted peer connections"
                change="Graph Density"
                changeType="positive"
                icon={UserCheck}
                accentColor="cyan"
                sparklineData={[1, 2, 2, 3, 3, 3, summary.totalConnections || 3]}
              />

              <MetricGlowCard
                title="Direct Messages"
                value={summary.totalMessages}
                subtitle="Real-time Socket.IO messages"
                change="Throughput High"
                changeType="positive"
                icon={MessageSquare}
                accentColor="purple"
                sparklineData={[20, 35, 48, 62, 70, 75, summary.totalMessages || 78]}
              />

              <MetricGlowCard
                title="Security Account Holds"
                value={summary.totalSuspended}
                subtitle="Suspended / Neutralized accounts"
                change="Zero Active Bans"
                changeType="positive"
                icon={Ban}
                accentColor={summary.totalSuspended > 0 ? 'rose' : 'emerald'}
                sparklineData={[0, 0, 0, 0, 0, 0, summary.totalSuspended || 0]}
                onClick={() => setActiveTab('users')}
              />
            </div>

            {/* Middle Row: Velocity Area Chart (Left) + Fleet Share & System Pulse (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Velocity Area Chart (7 Cols) */}
              <div className="lg:col-span-7">
                <VelocityAreaChart trends={trends} />
              </div>

              {/* Right Column: Fleet Distribution & Live Cluster Pulse (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <PlatformFleetDistribution summary={summary} />
                <RealTimeSystemPulse />
              </div>
            </div>

            {/* Bottom Row: Quick Operations Command Console */}
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

        {/* Tab 6: Security Audit Logs */}
        {activeTab === 'audit_logs' && <AuditLogsExplorer />}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
