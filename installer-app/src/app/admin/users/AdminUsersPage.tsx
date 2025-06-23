import React from "react";
import AdminInviteUserPage from "./AdminInviteUserPage";
import AdminUserListPage from "./AdminUserListPage";

const AdminUsersPage: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <AdminInviteUserPage />
      <AdminUserListPage />
    </div>
  );
};

export default AdminUsersPage;

