import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './api/supabaseClient';
import Login from './pages/Login';
import Register from './pages/Register';
import { LanguageProvider } from './lib/languageContext';

import AdminLayout from './components/layouts/AdminLayout';
import EmployeeLayout from './components/layouts/EmployeeLayout';

import AdminDashboard from './app/admin/pages/AdminDashboard';
import UserManagement from './app/admin/pages/UserManagement';
import DepartmentManagement from './app/admin/pages/DepartmentManagement';
import PositionManagement from './app/admin/pages/PositionManagement';
import SalaryPaymentManagement from './app/admin/pages/SalaryPaymentManagement';
import LocationSettings from './app/admin/pages/LocationSettings';
import BankManagement from './app/admin/pages/BankManagement';
import AttendanceManagementByDate from './app/admin/pages/AttendanceManagementByDate';

import EmployeeDashboard from './app/employee/pages/EmployeeDashboard';
import AttendanceForm from './app/employee/pages/AttendanceForm';
import ProfileSetup from './app/employee/pages/ProfileSetup';
import AttendanceHistory from './app/employee/pages/AttendanceHistory';
import ActivityLog from './app/employee/pages/ActivityLog';

function App() {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <Router>
          <AppContent />
        </Router>
      </div>
    </LanguageProvider>
  );
}

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to={userRole === 'admin' ? '/admin' : '/'} />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to={userRole === 'admin' ? '/admin' : '/'} />} />

      {session && userRole === 'admin' && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="positions" element={<PositionManagement />} />
          <Route path="salary-payment" element={<SalaryPaymentManagement />} />
          <Route path="location" element={<LocationSettings />} />
          <Route path="bank" element={<BankManagement />} />
          <Route path="attendance" element={<AttendanceManagementByDate />} />
        </Route>
      )}

      {session && userRole === 'karyawan' && (
        <Route path="/" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="attendance" element={<AttendanceForm />} />
          <Route path="profile" element={<ProfileSetup />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="activity" element={<ActivityLog />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to={!session ? '/login' : userRole === 'admin' ? '/admin' : '/'} />} />
    </Routes>
  );
}

export default App;