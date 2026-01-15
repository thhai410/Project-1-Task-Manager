import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, CheckSquare, BarChart3, Users, Plus, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { getDashboardStats } from '../services/dashboard.api';
import { getProjects } from '../../projects/services/projects.api';
import { getTasks } from '../../tasks/services/tasks.api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedThisWeek: 0,
    totalMembers: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const dashboardRes = await getDashboardStats();
      const dashboardData = dashboardRes?.data || {};

      // Fetch recent projects
      const projectsRes = await getProjects();
      const projects = projectsRes?.data || [];
      setRecentProjects(projects.slice(0, 3));

      // Fetch recent tasks
      const tasksRes = await getTasks();
      const tasks = tasksRes?.data || [];
      setRecentTasks(tasks.slice(0, 5));

      // Calculate stats
      const completedThisWeek = tasks.filter(task => {
        if (task.status !== 'Completed') return false;
        const completedDate = new Date(task.updatedAt || task.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return completedDate >= weekAgo;
      }).length;

      // Tính tổng thành viên duy nhất (loại bỏ duplicates)
      const uniqueMemberIds = new Set();
      projects.forEach(p => {
        if (p.members && Array.isArray(p.members)) {
          p.members.forEach(m => {
            const memberId = m.user_id?._id || m.user_id;
            if (memberId) {
              uniqueMemberIds.add(memberId);
            }
          });
        }
      });
      const totalMembers = uniqueMemberIds.size;

      // Set stats
      setStats({
        totalProjects: projects.length,
        activeTasks: tasks.filter(t => t.status === 'In Progress').length,
        completedThisWeek,
        totalMembers
      });

      setOverdueTasks(dashboardData.overdue_tasks || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Tổng dự án', value: stats.totalProjects, icon: Folder, href: '/projects', color: 'bg-orange-500' },
    { name: 'Công việc đang làm', value: stats.activeTasks, icon: CheckSquare, href: '/tasks', color: 'bg-blue-500' },
    { name: 'Hoàn thành tuần này', value: stats.completedThisWeek, icon: BarChart3, href: '/logs', color: 'bg-green-500' },
    { name: 'Thành viên', value: stats.totalMembers, icon: Users, href: '/projects', color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Chào mừng trở lại! Đây là tổng quan về dự án của bạn.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start">
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {overdueTasks.length} công việc quá hạn
                </h3>
                <p className="text-red-600 mb-4">
                  Những công việc này cần được ưu tiên xử lý ngay để tránh ảnh hưởng đến tiến độ dự án.
                </p>
                <Link
                  to="/tasks"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Dự án gần đây</h2>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project._id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600">
                          {project.members?.length || 0} thành viên • {project.status || 'active'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dự án</h3>
                  <p className="text-gray-500 mb-6">Hãy tạo dự án đầu tiên để bắt đầu quản lý công việc.</p>
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo dự án
                  </Link>
                </div>
              )}
              {recentProjects.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Xem tất cả dự án
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Công việc gần đây</h2>
                <CheckSquare className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task._id} className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-3 h-3 rounded-full mt-2 mr-3 ${
                        task.status === 'Completed' ? 'bg-green-500' :
                        task.status === 'In Progress' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{task.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {task.priority} • {task.status}
                        </p>
                        {task.due_date && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có công việc</h3>
                  <p className="text-gray-500 mb-6">Tạo công việc đầu tiên trong dự án của bạn.</p>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo công việc
                  </Link>
                </div>
              )}
              {recentTasks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    to="/tasks"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Xem bảng Kanban
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}