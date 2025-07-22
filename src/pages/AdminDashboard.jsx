import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, DollarSign, MapPin, Building, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const adminFeatures = [
    { name: 'Kelola Pengguna', path: '/admin/users', icon: Users },
    { name: 'Kelola Departemen', path: '/admin/departments', icon: Building },
    { name: 'Kelola Jabatan', path: '/admin/positions', icon: Briefcase },
    { name: 'Kelola Gaji', path: '/admin/salary-payment', icon: DollarSign },
    { name: 'Kelola Lokasi', path: '/admin/location', icon: MapPin },
    { name: 'Kelola Absensi', path: '/admin/attendance', icon: Clock },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dasbor Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => (
          <Link
            key={feature.name}
            to={feature.path}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4"
          >
            <feature.icon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">{feature.name}</h2>
              <p className="text-gray-500">Buka halaman {feature.name.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
