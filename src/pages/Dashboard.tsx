import { Users, Building2, TrendingUp, IndianRupee } from "lucide-react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { DashboardChart } from "@/components/Dashboard/DashboardChart";
import { mockDashboardStats } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { adminApi } from "@/api/apiService";

export default function Dashboard() {
  // const stats = mockDashboardStats;
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.getSummary().then((res) => {
      setStats(res);
    });
  }, []);

  const { user } = useAuth();
  const monthsOrder = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];

  const chartData = stats
    ? monthsOrder.map((month) => ({
      month: month.toUpperCase(),
      investments: stats.monthly_investment[month],
      users: Math.floor(Math.random() * 100), // you can replace with real API later
    }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        {/* <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}! Here's what's happening with your business
          today.
        </p> */}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="Total Projects" value={stats.total_projects} icon={Building2} />
          <StatsCard title="Active Schemes" value={stats.active_schemes} icon={TrendingUp} />
          <StatsCard title="Purchased Units" value={stats.purchased_units} icon={Users} />
          <StatsCard title="Total Investments" value={stats.total_investment} icon={IndianRupee} />
          <StatsCard title="Total Paid Amount" value={stats.users_paid_amount} icon={IndianRupee} />
        </div>
      )}

      {/* Chart */}
      <DashboardChart data={chartData} />
    </div>
  );

}