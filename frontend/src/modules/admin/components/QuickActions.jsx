import { Users, Folder, CheckSquare, BarChart3 } from 'lucide-react';

const QuickActions = ({ onUsers, onProjects, onTasks }) => {
  const actions = [
    { title: 'Người dùng', icon: Users, action: onUsers },
    { title: 'Dự án', icon: Folder, action: onProjects },
    { title: 'Công việc', icon: CheckSquare, action: onTasks },
    { title: 'Báo cáo', icon: BarChart3, action: () => alert('Đang phát triển') }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.action}
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <a.icon className="mb-2 text-orange-600" />
            <p className="font-medium">{a.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
