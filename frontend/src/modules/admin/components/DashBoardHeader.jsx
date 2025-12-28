const DashboardHeader = ({ user }) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Quản lý tổng quan hệ thống</p>
    </div>
    <div className="px-4 py-2 bg-orange-100 rounded-lg">
      Admin: {user?.name}
    </div>
  </div>
);

export default DashboardHeader;
