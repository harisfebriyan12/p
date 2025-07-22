import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../app/admin/components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
