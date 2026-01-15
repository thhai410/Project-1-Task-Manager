import React, { useEffect, useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatDate } from '../../../utils/formatters';
import { getStatusColor, getPriorityColor } from '../../../utils/colors';

const TaskModal = ({ open, onClose, tasks, setTasks, fetchApi }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || tasks.length > 0) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetchApi();
        if (res.status === 'SUCCESS') {
          setTasks(res.data || []);
        }
      } catch (err) {
        console.error('Fetch tasks error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [open]);

  return (
    <ModalWrapper title="Quản lý công việc" open={open} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có công việc nào</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Dự án</th>
                <th className="px-4 py-3 text-left">Người thực hiện</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Tiến độ</th>
                <th className="px-4 py-3 text-left">Ưu tiên</th>
                <th className="px-4 py-3 text-left">Hạn chót</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.project_id?.name ||
                      t.project_id?.title ||
                      'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.assignee_id?.name || 'Chưa giao'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        t.status
                      )}`}
                    >
                      {t.status || 'Not Started'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {typeof t.progress === 'number' ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[40px]">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${t.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 min-w-[30px]">{t.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                        t.priority
                      )}`}
                    >
                      {t.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(t.due_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModalWrapper>
  );
};

export default TaskModal;
