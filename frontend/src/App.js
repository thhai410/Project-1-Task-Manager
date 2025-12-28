import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./modules/auth/hooks/useAuth";
import Home from "./modules/home/pages/Home";
import Dashboard from "./modules/home/pages/Dashboard";
import AdminDashboard from "./modules/admin/pages/AdminDashBoard";
import Login from "./modules/auth/pages/Login";
import Register from "./modules/auth/pages/Register";
import DashboardLayout from "./shared/components/DashboardLayout";
import AdminLayout from "./shared/components/AdminLayout";
import UserProtectedRoute from "./shared/components/UserProtectedRoute";
import AdminProtectedRoute from "./shared/components/AdminProtectedRoute";
import ProjectList from "./modules/projects/pages/ProjectList";
import TaskBoard from "./modules/tasks/pages/TaskBoard";
import ActivityLog from "./modules/logs/pages/ActivityLog";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes - Chặn Admin */}
          <Route path="/dashboard" element={
            <UserProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </UserProtectedRoute>
          } />
          <Route path="/projects" element={
            <UserProtectedRoute>
              <DashboardLayout><ProjectList /></DashboardLayout>
            </UserProtectedRoute>
          } />
          <Route path="/tasks" element={
            <UserProtectedRoute>
              <DashboardLayout><TaskBoard /></DashboardLayout>
            </UserProtectedRoute>
          } />
          <Route path="/logs" element={
            <UserProtectedRoute>
              <DashboardLayout><ActivityLog /></DashboardLayout>
            </UserProtectedRoute>
          } />
          
          {/* Admin Routes - Chỉ Admin */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </AdminProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
