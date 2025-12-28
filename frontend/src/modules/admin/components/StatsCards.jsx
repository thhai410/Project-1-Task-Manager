import { Users, Folder, CheckSquare, TrendingUp } from 'lucide-react';

const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Stat title="Người dùng" value={stats.totalUsers} icon={Users} />
    <Stat title="Dự án" value={stats.totalProjects} icon={Folder} />
    <Stat title="Đang làm" value={stats.activeTasks} icon={CheckSquare} />
    <Stat title="Hoàn thành" value={stats.completedTasks} icon={TrendingUp} />
  </div>
);

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon className="w-6 h-6 text-orange-600" />
    </div>
  </div>
);

export default StatsCards;
