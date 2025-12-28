import React, { useEffect, useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatDate } from '../../../utils/formatters';
import { getStatusColor } from '../../../utils/colors';

const ProjectModal = ({ open, onClose, projects, setProjects, fetchApi }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || projects.length > 0) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetchApi();
        if (res.status === 'SUCCESS') {
          setProjects(res.data || []);
        }
      } catch (err) {
        console.error('Fetch projects error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [open]);

  return (
    <ModalWrapper title="Quản lý dự án" open={open} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có dự án nào</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{p.name}</h4>
                  {p.title && (
                    <p className="text-sm text-gray-600">{p.title}</p>
                  )}
                  {p.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                    p.status
                  )}`}
                >
                  {p.status || 'Not Started'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Chủ dự án</p>
                  <p className="font-medium">
                    {p.owner_id?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Thành viên</p>
                  <p className="font-medium">
                    {p.members?.length || 0} người
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tiến độ</p>
                  <p className="font-medium">{p.progress || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày tạo</p>
                  <p className="font-medium">
                    {formatDate(p.created_date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalWrapper>
  );
};

export default ProjectModal;
