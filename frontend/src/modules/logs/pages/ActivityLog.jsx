import React, { useEffect, useState } from 'react';
import { Plus, Search, Clock, X, Trash2, Edit, CheckSquare } from 'lucide-react';
import { getLogs, addLog, deleteLog, updateLog } from '../services/logs.api';
import { getTasks } from '../../tasks/services/tasks.api';

// Create/Edit Log Modal
function LogModal({ isOpen, onClose, log, tasks, onSave }) {
  const [formData, setFormData] = useState({
    task_id: '',
    title: '',
    description: '',
    worked_time: 0
  });

  useEffect(() => {
    if (log) {
      setFormData({
        task_id: log.task_id?._id || log.task_id || '',
        title: log.title || '',
        description: log.description || '',
        worked_time: log.worked_time || 0
      });
    } else {
      setFormData({
        task_id: tasks[0]?._id || '',
        title: '',
        description: '',
        worked_time: 0
      });
    }
  }, [log, tasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.task_id) {
      alert('Vui lòng chọn công việc');
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save log error:', error);
      alert('Lưu log thất bại');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {log ? 'Chỉnh sửa Log' : 'Tạo Log mới'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Công việc <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.task_id}
                onChange={(e) => setFormData({...formData, task_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={!!log} // Cannot change task when editing
              >
                <option value="">Chọn công việc</option>
                {tasks.map(task => (
                  <option key={task._id} value={task._id}>
                    {task.title} {task.project_id?.name ? `(${task.project_id.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập tiêu đề log"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                placeholder="Mô tả chi tiết"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian làm việc (giờ)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.worked_time}
                onChange={(e) => setFormData({...formData, worked_time: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                {log ? 'Cập nhật' : 'Tạo Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchTasks();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (taskFilter) params.taskId = taskFilter;
      
      const res = await getLogs(params);
      setLogs(res?.data || []);
    } catch (error) {
      console.error('Fetch logs error:', error);
      alert('Lấy danh sách log thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res?.data || []);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    }
  };

  const handleCreateLog = () => {
    setEditingLog(null);
    setModalOpen(true);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setModalOpen(true);
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Bạn có chắc muốn xóa log này?')) return;

    try {
      const res = await deleteLog(logId);
      if (res.status === 'SUCCESS') {
        await fetchLogs();
        alert('Xóa log thành công!');
      }
    } catch (error) {
      console.error('Delete log error:', error);
      alert('Xóa log thất bại');
    }
  };

  const handleSaveLog = async (formData) => {
    try {
      if (editingLog) {
        // Update existing log - backend expects logId in body
        const payload = {
          logId: editingLog._id,
          title: formData.title,
          description: formData.description || '',
          worked_time: formData.worked_time || 0
        };
        const res = await updateLog(payload);
        if (res.status === 'SUCCESS') {
          await fetchLogs();
          setModalOpen(false);
          setEditingLog(null);
          alert('Cập nhật log thành công!');
        }
      } else {
        // Create new log
        const payload = {
          task_id: formData.task_id,
          title: formData.title,
          description: formData.description || '',
          worked_time: formData.worked_time || 0
        };
        const res = await addLog(payload);
        if (res.status === 'SUCCESS') {
          await fetchLogs();
          setModalOpen(false);
          alert('Tạo log thành công!');
        }
      }
    } catch (error) {
      console.error('Save log error:', error);
      alert(error.response?.data?.message || 'Lưu log thất bại');
      throw error;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.task_id?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Log công việc</h1>
          <p className="text-gray-600 mt-1">Theo dõi thời gian làm việc trên các công việc</p>
        </div>
        <button
          onClick={handleCreateLog}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
        >
          <Plus className="w-5 h-5" />
          Tạo log mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={taskFilter}
          onChange={(e) => {
            setTaskFilter(e.target.value);
            setTimeout(fetchLogs, 100);
          }}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Tất cả công việc</option>
          {tasks.map(task => (
            <option key={task._id} value={task._id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Chưa có log nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{log.title}</h3>
                      {log.task_id && (
                        <p className="text-sm text-gray-600 mt-1">
                          Công việc: <span className="font-medium">{log.task_id.title}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {log.description && (
                    <p className="text-gray-600 mb-3 ml-13">{log.description}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500 ml-13">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(log.created_date)}</span>
                    </div>
                    {log.worked_time > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-orange-600">{log.worked_time}h</span>
                        <span>thời gian làm việc</span>
                      </div>
                    )}
                    {log.user_id && (
                      <div className="flex items-center gap-2">
                        <span>Bởi: {log.user_id.name || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditLog(log)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Worked Time */}
      {logs.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-800 mb-1">Tổng thời gian làm việc</h3>
              <p className="text-sm text-orange-600">
                {logs.reduce((sum, log) => sum + (log.worked_time || 0), 0).toFixed(1)} giờ
              </p>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {logs.reduce((sum, log) => sum + (log.worked_time || 0), 0).toFixed(1)}h
            </div>
          </div>
        </div>
      )}

      <LogModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingLog(null);
        }}
        log={editingLog}
        tasks={tasks}
        onSave={handleSaveLog}
      />
    </div>
  );
}
