import React, { useEffect, useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatDate } from '../../../utils/formatters';

const UserModal = ({ open, onClose, users, setUsers, fetchApi }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || users.length > 0) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetchApi();
        if (res.status === 'SUCCESS') {
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open]);

  return (
    <ModalWrapper title="Quản lý người dùng" open={open} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có người dùng nào</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3">Tên</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Username</th>
                <th className="text-left px-4 py-3">Vai trò</th>
                <th className="text-left px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.username || u.user_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        u.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(u.created_date)}
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

export default UserModal;
