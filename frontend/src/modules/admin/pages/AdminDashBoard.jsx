import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getAdminStatsApi,
  getAllUsersApi,
  getAllProjectsApi,
  getAllTasksApi,
  getAllLogsApi
} from '../../home/services/admin.api';

import DashboardHeader from '../components/DashBoardHeader';
import StatsCards from '../components/StatsCards';
import QuickActions from '../components/QuickActions';
import RecentActivities from '../components/RecentActivities';
import UserModal from '../components/common/modals/UserModal';
import ProjectModal from '../components/common/modals/ProjectModal';
import TaskModal from '../components/common/modals/TaskModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          getAdminStatsApi(),
          getAllLogsApi()
        ]);
        if (statsRes.status === 'SUCCESS') setStats(statsRes.data);
        if (logsRes.status === 'SUCCESS') setRecentActivities(logsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader user={user} />

      <StatsCards stats={stats} />

      <QuickActions
        onUsers={() => setShowUserModal(true)}
        onProjects={() => setShowProjectModal(true)}
        onTasks={() => setShowTaskModal(true)}
      />

      <RecentActivities activities={recentActivities} />

      <UserModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={users}
        setUsers={setUsers}
        fetchApi={getAllUsersApi}
      />

      <ProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        projects={projects}
        setProjects={setProjects}
        fetchApi={getAllProjectsApi}
      />

      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        tasks={tasks}
        setTasks={setTasks}
        fetchApi={getAllTasksApi}
      />
    </div>
  );
};

export default AdminDashboard;
