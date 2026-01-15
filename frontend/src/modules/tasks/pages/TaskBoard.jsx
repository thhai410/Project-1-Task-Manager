import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Filter, MoreVertical, MessageSquare, Paperclip, Calendar, CheckSquare } from 'lucide-react';
import { getTasks, addTask, updateTask, deleteTask } from '../services/tasks.api';
import { getProjects } from '../../projects/services/projects.api';

const STATUSES = [
  { id: 'Not Started', name: 'Chưa bắt đầu', color: 'gray', bgClass: 'bg-gray-400' },
  { id: 'In Progress', name: 'Đang thực hiện', color: 'blue', bgClass: 'bg-blue-500' },
  { id: 'Completed', name: 'Hoàn thành', color: 'green', bgClass: 'bg-green-500' }
];

// Task Card Component
function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-move mb-3"
      onClick={(e) => {
        // Only open edit if not dragging
        if (!isDragging) {
          e.stopPropagation();
          onEdit(task);
        }
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800 flex-1">{task.title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          task.priority === 'High' ? 'bg-red-100 text-red-700' :
          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {task.priority || 'Medium'}
        </span>
      </div>

      {task.des && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.des}</p>
      )}

      {typeof task.progress === 'number' && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Tiến độ</span>
            <span className="text-xs font-semibold text-gray-700">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.assignee_id ? (
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-semibold" title={task.assignee_id.name}>
              {task.assignee_id.name?.[0] || 'U'}
            </div>
          ) : (
            <span className="text-xs text-gray-400">Chưa giao</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
function KanbanColumn({ status, tasks, onEdit, onDelete }) {
  const { setNodeRef } = useDroppable({ id: status.id });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${status.bgClass}`}></div>
          <h3 className="font-semibold text-gray-900 text-lg">{status.name}</h3>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <p className="text-sm">Chưa có công việc nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Create/Edit Task Modal
function TaskModal({ isOpen, onClose, task, projects, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    des: '',
    priority: 'Medium',
    project_id: '',
    due_date: '',
    assignee_id: '',
    estimate_time: 0,
    worked_time: 0,
    progress: 0
  });
  const [projectMembers, setProjectMembers] = useState([]);

  // Khởi tạo form khi task thay đổi hoặc modal mở
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        des: task.des || '',
        priority: task.priority || 'Medium',
        project_id: task.project_id?._id || task.project_id || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assignee_id: task.assignee_id?._id || task.assignee_id || '',
        estimate_time: task.estimate_time || 0,
        worked_time: task.worked_time || 0,
        progress: task.progress || 0
      });
    } else {
      setFormData({
        title: '',
        des: '',
        priority: 'Medium',
        project_id: projects[0]?._id || '',
        due_date: '',
        assignee_id: '',
        estimate_time: 0,
        worked_time: 0,
        progress: 0
      });
    }
  }, [task, projects, isOpen]);
  
  // Cập nhật project members khi project_id thay đổi
  useEffect(() => {
    if (formData.project_id) {
      const selectedProject = projects.find(p => p._id === formData.project_id);
      if (selectedProject?.members) {
        setProjectMembers(selectedProject.members);
      }
    }
  }, [task, projects, formData.project_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project_id) {
      alert('Vui lòng nhập tiêu đề và chọn dự án');
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save task error:', error);
      alert('Lưu task thất bại');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {task ? 'Chỉnh sửa Task' : 'Tạo Task Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nhập tiêu đề task"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={formData.des}
              onChange={(e) => setFormData({...formData, des: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows="3"
              placeholder="Mô tả chi tiết task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ưu tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dự án</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Chọn dự án</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>{project.name || project.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Người thực hiện</label>
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Chọn người thực hiện</option>
                {projectMembers && projectMembers.length > 0 ? (
                  projectMembers.map(member => (
                    <option key={member.user_id?._id || member._id} value={member.user_id?._id || member._id}>
                      {member.user_id?.name || member.name || 'Unknown'}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có thành viên</option>
                )}
              </select>
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiến độ (%)</label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-gray-700 min-w-[50px]">{formData.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${formData.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian ước tính (giờ)</label>
              <input
                type="number"
                min="0"
                value={formData.estimate_time}
                onChange={(e) => setFormData({...formData, estimate_time: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
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
              {task ? 'Cập nhật' : 'Tạo Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [progressFilter, setProgressFilter] = useState('');
  const [showProgressFilter, setShowProgressFilter] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (progressFilter) {
        const [min, max] = progressFilter.split('-');
        params.progressMin = parseInt(min) || 0;
        params.progressMax = parseInt(max) || 100;
      }
      const res = await getTasks(params);
      setTasks(res?.data || []);
    } catch (e) {
      console.error('fetchTasks', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res?.data || []);
    } catch (e) {
      console.error('fetchProjects', e);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [progressFilter]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(t => t._id === activeId);
    const overContainer = STATUSES.find(s => s.id === overId);

    if (!activeTask) return;

    if (overContainer) {
      // Dropped on a column
      if (activeTask.status !== overContainer.id) {
        try {
          await updateTask(activeId, { status: overContainer.id });
          setTasks(prev => prev.map(t =>
            t._id === activeId ? { ...t, status: overContainer.id } : t
          ));
        } catch (err) {
          console.error('move task', err);
        }
      }
    } else {
      // Dropped on another task
      const overTask = tasks.find(t => t._id === overId);
      if (!overTask || activeTask.status !== overTask.status) return;

      const columnTasks = tasks.filter(t => t.status === activeTask.status);
      const oldIndex = columnTasks.findIndex(t => t._id === activeId);
      const newIndex = columnTasks.findIndex(t => t._id === overId);

      const newTasks = arrayMove(columnTasks, oldIndex, newIndex);
      setTasks(prev => prev.filter(t => t.status !== activeTask.status).concat(newTasks));
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc muốn xóa task này?')) return;

    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('delete task', err);
      alert('Xóa task thất bại');
    }
  };

  const handleSaveTask = async (formData) => {
    try {
      const payload = {
        ...formData,
        assignee_id: formData.assignee_id || undefined, // Only send if has value
      };
      
      if (editingTask) {
        // Update existing task
        const res = await updateTask(editingTask._id, payload);
        if (res.status === 'SUCCESS') {
          await fetchTasks(); // Refresh to get updated data
        }
      } else {
        // Create new task
        const res = await addTask({ ...payload, status: 'Not Started' });
        if (res.status === 'SUCCESS') {
          await fetchTasks(); // Refresh to get new task
        }
      }
    } catch (error) {
      console.error('Save task error:', error);
      throw error;
    }
  };

  const tasksByStatus = (statusId) => tasks.filter(t => (t.status || 'Not Started') === statusId);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex justify-between items-center mb-6 px-6 pt-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng Kanban</h1>
          <p className="text-gray-600 mt-1">Quản lý công việc theo trạng thái</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setShowProgressFilter(!showProgressFilter)}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Lọc tiến độ {progressFilter && `(${progressFilter}%)`}
            </button>
            {showProgressFilter && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-56 z-50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phạm vi tiến độ</label>
                    <select
                      value={progressFilter}
                      onChange={(e) => {
                        setProgressFilter(e.target.value);
                        setShowProgressFilter(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="0-25">0% - 25% (Mới bắt đầu)</option>
                      <option value="25-50">25% - 50% (Đang tiến hành)</option>
                      <option value="50-75">50% - 75% (Gần hoàn thành)</option>
                      <option value="75-100">75% - 100% (Sắp xong)</option>
                      <option value="100-100">100% (Hoàn thành)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setProgressFilter('');
                      setShowProgressFilter(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
                  >
                    Xóa lọc
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="flex-1 px-6 pb-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {STATUSES.map(status => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  tasks={tasksByStatus(status.id)}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <TaskCard
                  task={tasks.find(t => t._id === activeId)}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
        projects={projects}
        onSave={handleSaveTask}
      />
    </div>
  );
}