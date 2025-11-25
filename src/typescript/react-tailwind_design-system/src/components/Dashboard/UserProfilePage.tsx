import React from 'react';

export interface UserProfilePageProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    bio?: string;
  };
  actions?: React.ReactNode;
  stats?: Array<{ label: string; value: number | string }>;
  responsive?: boolean;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  actions,
  stats,
  responsive = true,
}) => {
  return (
    <div className={responsive ? 'p-6 max-w-2xl mx-auto space-y-6' : 'p-4'}>
      <div className="flex items-center gap-4">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div>
          <div className="text-xl font-bold">{user.name}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
          {user.role && <div className="text-xs text-blue-500">{user.role}</div>}
        </div>
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      {user.bio && <div className="text-gray-700 text-sm mt-2">{user.bio}</div>}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
