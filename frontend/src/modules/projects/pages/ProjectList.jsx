import React, { useEffect, useState } from 'react';
import { Plus, Search, X, Users, CheckSquare, Calendar, Edit, Trash2, UserPlus, Eye } from 'lucide-react';
import { getProjects, addProject, getProjectDetail, updateProject, deleteProject, addMemberToProject } from '../services/projects.api';
import { getTasks } from '../../tasks/services/tasks.api';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ProjectList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.keyword = searchTerm;
      
      const res = await getProjects(params);
      setProjects(res?.data || []);
    } catch (error) {
      console.error('Fetch projects error:', error);
      alert('Lấy danh sách dự án thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        title: formData.title || '',
        description_detail: formData.description_detail || '',
        due_date: formData.due_date || null,
        document: formData.document || ''
      };
      const res = await addProject(payload);
      if (res.status === 'SUCCESS') {
        await fetchProjects();
        setShowCreateModal(false);
        alert('Tạo dự án thành công!');
      }
    } catch (error) {
      console.error('Create project error:', error);
      alert('Tạo dự án thất bại');
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      const payload = {
        projectId: selectedProject._id,
        name: formData.name,
        title: formData.title || '',
        description: formData.description || '',
        description_detail: formData.description_detail || '',
        deadline: formData.due_date || null,
        status: formData.status || 'Not Started',
        progress: formData.progress || 0,
        document: formData.document || ''
      };
      const res = await updateProject(payload);
      if (res.status === 'SUCCESS') {
        await fetchProjects();
        setShowEditModal(false);
        setSelectedProject(null);
        alert('Cập nhật dự án thành công!');
      }
    } catch (error) {
      console.error('Update project error:', error);
      alert('Cập nhật dự án thất bại');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;
    
    try {
      const res = await deleteProject(projectId);
      if (res.status === 'SUCCESS') {
        await fetchProjects();
        alert('Xóa dự án thành công!');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      alert('Xóa dự án thất bại');
    }
  };

  const handleViewDetail = async (project) => {
    try {
      const res = await getProjectDetail(project._id);
      if (res.status === 'SUCCESS') {
        setSelectedProject(res.data);
        setShowDetailModal(true);
        
        // Fetch tasks for this project
        const tasksRes = await getTasks({ project_id: project._id });
        setProjectTasks(tasksRes?.data || []);
      }
    } catch (error) {
      console.error('Get project detail error:', error);
      alert('Lấy chi tiết dự án thất bại');
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleAddMember = async (email) => {
    if (!selectedProject) return;
    
    try {
      const res = await addMemberToProject(selectedProject._id, { email, role: 'member' });
      if (res.status === 'SUCCESS') {
        await fetchProjects();
        setShowAddMemberModal(false);
        alert('Thêm thành viên thành công!');
        // Refresh detail if modal is open
        if (showDetailModal) {
          handleViewDetail(selectedProject);
        }
      }
    } catch (error) {
      console.error('Add member error:', error);
      alert(error.response?.data?.message || 'Thêm thành viên thất bại');
    }
  };

  const isOwner = (project) => {
    return project.owner_id?._id === user?.id || project.owner_id?.toString() === user?.id;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dự án</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả dự án của bạn</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
        >
          <Plus className="w-5 h-5" />
          Tạo dự án mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Not Started">Chưa bắt đầu</option>
          <option value="In Progress">Đang tiến hành</option>
          <option value="Completed">Hoàn thành</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Chưa có dự án nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{project.name}</h3>
                    {project.title && (
                      <p className="text-sm text-gray-600 mb-2">{project.title}</p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {project.description || project.description_detail || 'Không có mô tả'}
                    </p>
                  </div>
                  {isOwner(project) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ</span>
                    <span className="font-semibold">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.members?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4" />
                      {projectTasks.filter(t => t.project_id === project._id).length}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {project.status || 'Not Started'}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleViewDetail(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onSave={handleUpdateProject}
        />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
            setProjectTasks([]);
          }}
          project={selectedProject}
          tasks={projectTasks}
          isOwner={isOwner(selectedProject)}
          onAddMember={() => setShowAddMemberModal(true)}
          onEdit={() => {
            setShowDetailModal(false);
            handleEditProject(selectedProject);
          }}
        />
      )}

      {/* Add Member Modal */}
      {selectedProject && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}

// Create Project Modal Component
function CreateProjectModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    description_detail: '',
    due_date: '',
    document: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên dự án');
      return;
    }
    onSave(formData);
    setFormData({
      name: '',
      description: '',
      title: '',
      description_detail: '',
      due_date: '',
      document: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Tạo dự án mới</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập tên dự án"
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
                placeholder="Mô tả dự án"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề phụ</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tiêu đề phụ (tùy chọn)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea
                value={formData.description_detail}
                onChange={(e) => setFormData({...formData, description_detail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                placeholder="Mô tả chi tiết dự án"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu (URL)</label>
              <input
                type="url"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://..."
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
                Tạo dự án
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Project Modal Component
function EditProjectModal({ isOpen, onClose, project, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    description_detail: '',
    due_date: '',
    document: '',
    status: 'Not Started',
    progress: 0
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        title: project.title || '',
        description_detail: project.description_detail || '',
        due_date: project.due_date ? new Date(project.due_date).toISOString().split('T')[0] : '',
        document: project.document || '',
        status: project.status || 'Not Started',
        progress: project.progress || 0
      });
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên dự án');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa dự án</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Not Started">Chưa bắt đầu</option>
                <option value="In Progress">Đang tiến hành</option>
                <option value="Completed">Hoàn thành</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiến độ (%)</label>
              <div className="flex items-center gap-3">
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
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${formData.progress}%` }}
                ></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Project Detail Modal Component
function ProjectDetailModal({ isOpen, onClose, project, tasks, isOwner, onAddMember, onEdit }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
            {project.title && <p className="text-gray-600 mt-1">{project.title}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin dự án</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mô tả</p>
                <p className="text-gray-800">{project.description || project.description_detail || 'Không có mô tả'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status || 'Not Started'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tiến độ</p>
                <p className="text-gray-800">{project.progress || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chủ dự án</p>
                <p className="text-gray-800">{project.owner_id?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Thành viên ({project.members?.length || 0})</h3>
              {isOwner && (
                <button
                  onClick={onAddMember}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm thành viên
                </button>
              )}
            </div>
            <div className="space-y-2">
              {project.members && project.members.length > 0 ? (
                project.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.user_id?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.user_id?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{member.user_id?.email || ''}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {member.role || 'member'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có thành viên nào</p>
              )}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Công việc ({tasks.length})</h3>
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {task.assignee_id?.name || 'Chưa giao'} • {task.status || 'Not Started'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                    {typeof task.progress === 'number' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Tiến độ</span>
                          <span className="text-xs font-semibold text-gray-700">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có công việc nào</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          {isOwner && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Chỉnh sửa
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Member Modal Component
function AddMemberModal({ isOpen, onClose, onAdd }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }
    onAdd(email);
    setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Thêm thành viên</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email thành viên <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="user@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Nhập email của người dùng cần thêm vào dự án</p>
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
                Thêm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
