import { Activity, Clock } from 'lucide-react';

const RecentActivities = ({ activities }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
    {activities.length === 0 ? (
      <p className="text-gray-500 text-center">Chưa có hoạt động</p>
    ) : (
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-4 bg-gray-50 p-3 rounded-lg">
            <Activity className="text-orange-600" />
            <div>
              <p className="text-sm">
                <b>{a.user}</b> {a.action}
              </p>
              <div className="text-xs text-gray-500 flex gap-3">
                <span>{a.time}</span>
                {a.workedTime > 0 && (
                  <span className="flex items-center ga p-1">
                    <Clock size={12} /> {a.workedTime}h
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default RecentActivities;
