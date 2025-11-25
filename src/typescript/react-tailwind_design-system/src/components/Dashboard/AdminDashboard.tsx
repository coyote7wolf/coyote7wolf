import React from 'react';

export interface AdminDashboardProps {
  title?: string;
  widgets: React.ReactNode[];
  users?: Array<{ name: string; role: string; status: string }>;
  actions?: React.ReactNode;
  responsive?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  title,
  widgets,
  users,
  actions,
  responsive = true,
}) => {
  return (
    <div className={responsive ? 'p-6 space-y-6' : 'p-4'}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {actions && <div className="mb-4">{actions}</div>}
      <div
        className={responsive ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-wrap gap-4'}
      >
        {widgets.map((widget, i) => (
          <div key={i} className="bg-white rounded shadow p-4">
            {widget}
          </div>
        ))}
      </div>
      {users && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">用戶列表</h3>
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">姓名</th>
                <th className="py-2 px-4 border-b">角色</th>
                <th className="py-2 px-4 border-b">狀態</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                  <td className="py-2 px-4 border-b">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
