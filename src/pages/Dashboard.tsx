import { Users, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { DashboardChart } from '@/components/Dashboard/DashboardChart';
import { mockDashboardStats } from '@/data/mockData';

export default function Dashboard() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.userGrowth}
          changeLabel="vs last month"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={Building2}
        />
        <StatsCard
          title="Active Schemes"
          value={stats.activeSchemes}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Investments"
          value={stats.totalInvestments}
          change={stats.monthlyGrowth}
          changeLabel="vs last month"
          icon={DollarSign}
          trend="up"
        />
      </div>

      {/* Chart */}
      <DashboardChart />
    </div>
  );
}