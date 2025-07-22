import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  MapPin, 
  LogOut,
  UserPlus,
  Building,
  CreditCard,
  Menu,
  X,
  Database,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
  Settings,
  Bell,
  Star,
  Crown,
  Award
} from 'lucide-react';
import { supabase } from '../../../api/supabaseClient';
import Swal from '../../../pages/swal.js';

const AdminSidebar = ({ user, profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['Master Data']);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await Swal.fire({
        icon: 'success',
        title: 'Logout Berhasil',
        text: 'Anda telah berhasil logout.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleSubmenu = (title) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/admin',
      active: location.pathname === '/admin',
      gradient: 'from-blue-500 to-purple-600',
      description: 'Overview & Analytics'
    },
    {
      title: 'Master Data',
      icon: <Database className="h-5 w-5" />,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Data Management',
      submenu: [
        {
          title: 'Kelola Pengguna',
          icon: <UserPlus className="h-4 w-4" />,
          path: '/admin/users',
          active: location.pathname === '/admin/users',
          description: 'Manage employees'
        },
        {
          title: 'Kelola Departemen',
          icon: <Building className="h-4 w-4" />,
          path: '/admin/departments',
          active: location.pathname === '/admin/departments',
          description: 'Department setup'
        },
        {
          title: 'Kelola Jabatan',
          icon: <Briefcase className="h-4 w-4" />,
          path: '/admin/positions',
          active: location.pathname === '/admin/positions',
          description: 'Position management'
        },
        {
          title: 'Kelola Bank',
          icon: <Database className="h-4 w-4" />,
          path: '/admin/bank',
          active: location.pathname === '/admin/bank',
          description: 'Bank information'
        }
      ]
    },
    {
      title: 'Kelola Absensi',
      icon: <Calendar className="h-5 w-5" />,
      path: '/admin/attendance',
      active: location.pathname === '/admin/attendance',
      gradient: 'from-orange-500 to-red-500',
      description: 'Attendance Management'
    },
    {
      title: 'Kelola Pembayaran',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/admin/salary-payment',
      active: location.pathname === '/admin/salary-payment',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Salary & Payments'
    },
    {
      title: 'Lokasi Kantor',
      icon: <MapPin className="h-5 w-5" />,
      path: '/admin/location',
      active: location.pathname === '/admin/location',
      gradient: 'from-indigo-500 to-blue-600',
      description: 'Office Location Setup'
    }
  ];

  return (
    <>
      {/* Mobile menu button - Enhanced */}
      <div className="lg:hidden fixed top-4 left-4 z-50 print:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay - Enhanced */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black transition-all duration-300 z-40 ${
          isMobileOpen ? 'bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* Sidebar - Completely redesigned */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out print:hidden
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-slate-700/50 shadow-2xl
        `}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative flex flex-col h-full">
          {/* Header - Enhanced */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-slate-400 flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Management System</span>
                  </p>
                </div>
              </div>
            )}
            
            {/* Collapse button - Desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          </div>

          {/* User info - Enhanced */}
          <div className={`p-6 border-b border-slate-700/50 ${isCollapsed ? 'px-3' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.name} 
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <Crown className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {profile?.name || 'Administrator'}
                    </p>
                    <Award className="h-4 w-4 text-yellow-400" />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{profile?.email || user?.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu items - Completely redesigned */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={item.title} className="animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.title)}
                        className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                          isCollapsed ? 'p-3' : 'p-4'
                        } hover:shadow-lg hover:scale-[1.02] transform`}
                      >
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                        
                        {/* Glass effect */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                              {item.icon}
                            </div>
                            {!isCollapsed && (
                              <div className="text-left">
                                <span className="text-white font-medium group-hover:text-blue-200 transition-colors">
                                  {item.title}
                                </span>
                                <p className="text-xs text-slate-400 group-hover:text-blue-300 transition-colors">
                                  {item.description}
                                </p>
                              </div>
                            )}
                          </div>
                          {!isCollapsed && (
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                              expandedMenus.includes(item.title) ? 'rotate-180' : ''
                            }`} />
                          )}
                        </div>
                      </button>
                      
                      {(!isCollapsed && expandedMenus.includes(item.title)) && (
                        <div className="mt-2 ml-4 space-y-1 animate-slideInUp">
                          {item.submenu.map((subItem, subIndex) => (
                            <button
                              key={subItem.path}
                              onClick={() => {
                                navigate(subItem.path);
                                if (window.innerWidth < 1024) setIsMobileOpen(false);
                              }}
                              className={`w-full group flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 animate-slideInLeft ${
                                subItem.active 
                                  ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg border border-blue-400/30' 
                                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                              }`}
                              style={{ animationDelay: `${subIndex * 50}ms` }}
                            >
                              <div className={`p-1.5 rounded-md transition-all duration-200 ${
                                subItem.active 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-slate-700/50 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                              }`}>
                                {subItem.icon}
                              </div>
                              <div className="text-left flex-1">
                                <span className="text-sm font-medium">{subItem.title}</span>
                                <p className="text-xs opacity-75">{subItem.description}</p>
                              </div>
                              {subItem.active && (
                                <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        navigate(item.path);
                        if (window.innerWidth < 1024) setIsMobileOpen(false);
                      }}
                      className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                        isCollapsed ? 'p-3' : 'p-4'
                      } hover:shadow-lg hover:scale-[1.02] transform ${
                        item.active 
                          ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 shadow-lg border border-blue-400/30' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      {/* Gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                        item.active ? 'opacity-30' : ''
                      }`}></div>
                      
                      {/* Glass effect */}
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg group-hover:scale-110 transition-transform duration-200 ${
                          item.active ? 'scale-110 shadow-xl' : ''
                        }`}>
                          {item.icon}
                        </div>
                        {!isCollapsed && (
                          <div className="text-left flex-1">
                            <span className={`font-medium transition-colors ${
                              item.active ? 'text-white' : 'text-slate-300 group-hover:text-white'
                            }`}>
                              {item.title}
                            </span>
                            <p className={`text-xs transition-colors ${
                              item.active ? 'text-blue-200' : 'text-slate-400 group-hover:text-blue-300'
                            }`}>
                              {item.description}
                            </p>
                          </div>
                        )}
                        {!isCollapsed && item.active && (
                          <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                        )}
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer section - Enhanced */}
          <div className="p-4 border-t border-slate-700/50">
            {/* Quick stats */}
            {!isCollapsed && (
              <div className="mb-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-medium text-slate-300">System Status</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-400">Database</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-400">Services</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout button - Enhanced */}
            <button
              onClick={handleLogout}
              className={`w-full group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* Glass effect */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <LogOut className="h-4 w-4 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="text-left">
                    <span className="text-slate-300 group-hover:text-white font-medium transition-colors">
                      Logout
                    </span>
                    <p className="text-xs text-slate-400 group-hover:text-red-300 transition-colors">
                      Sign out safely
                    </p>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;