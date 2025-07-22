import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Building,
  CreditCard,
  FileText,
  Settings,
  Bell,
  Activity,
  UserCheck,
  UserX,
  Briefcase,
  Database,
  Shield,
  Award,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Star,
  Sparkles
} from 'lucide-react';
import { supabase } from '../api/supabaseClient';
import AdminSidebar from '../components/AdminSidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendance: 0,
    monthlyAttendance: 0,
    totalSalaryPaid: 0,
    pendingPayments: 0,
    lateEmployees: 0,
    absentEmployees: 0,
    onTimePercentage: 0,
    avgWorkHours: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setCurrentUser(user);
      setProfile(profile);
      
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivities(),
        fetchAttendanceChart(),
        fetchDepartmentStats(),
        fetchTopPerformers(),
        fetchAlerts()
      ]);
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch employee stats
      const { data: employees } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin');

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendance } = await supabase
        .from('attendance')
        .select('*')
        .gte('timestamp', `${today}T00:00:00`)
        .lte('timestamp', `${today}T23:59:59`)
        .eq('status', 'berhasil');

      // Fetch monthly attendance
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthlyAttendance } = await supabase
        .from('attendance')
        .select('*')
        .gte('timestamp', startOfMonth)
        .eq('status', 'berhasil');

      // Fetch salary payments
      const { data: salaryPayments } = await supabase
        .from('salary_payments')
        .select('payment_amount, payment_status');

      // Calculate stats
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;
      const todayCheckIns = todayAttendance?.filter(att => att.type === 'masuk').length || 0;
      const monthlyCheckIns = monthlyAttendance?.filter(att => att.type === 'masuk').length || 0;
      const totalSalaryPaid = salaryPayments?.reduce((sum, payment) => 
        payment.payment_status === 'completed' ? sum + (payment.payment_amount || 0) : sum, 0) || 0;
      const pendingPayments = salaryPayments?.filter(payment => 
        payment.payment_status === 'pending' || payment.payment_status === 'processing').length || 0;
      const lateToday = todayAttendance?.filter(att => att.type === 'masuk' && att.is_late).length || 0;
      const onTimeToday = todayCheckIns - lateToday;
      const onTimePercentage = todayCheckIns > 0 ? Math.round((onTimeToday / todayCheckIns) * 100) : 100;
      const avgWorkHours = monthlyAttendance?.reduce((sum, att) => sum + (att.work_hours || 0), 0) / (monthlyCheckIns || 1);

      setStats({
        totalEmployees,
        activeEmployees,
        todayAttendance: todayCheckIns,
        monthlyAttendance: monthlyCheckIns,
        totalSalaryPaid,
        pendingPayments,
        lateEmployees: lateToday,
        absentEmployees: activeEmployees - todayCheckIns,
        onTimePercentage,
        avgWorkHours: Math.round(avgWorkHours * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id(name, email, department)
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      setRecentActivities(data || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchAttendanceChart = async () => {
    try {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartData = await Promise.all(
        last7Days.map(async (date) => {
          const { data } = await supabase
            .from('attendance')
            .select('*')
            .gte('timestamp', `${date}T00:00:00`)
            .lte('timestamp', `${date}T23:59:59`)
            .eq('status', 'berhasil');

          const checkIns = data?.filter(att => att.type === 'masuk').length || 0;
          const lateCount = data?.filter(att => att.type === 'masuk' && att.is_late).length || 0;
          const onTime = checkIns - lateCount;

          return {
            date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
            hadir: checkIns,
            tepat_waktu: onTime,
            terlambat: lateCount
          };
        })
      );

      setAttendanceChart(chartData);
    } catch (error) {
      console.error('Error fetching attendance chart:', error);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const { data: employees } = await supabase
        .from('profiles')
        .select('department')
        .neq('role', 'admin')
        .eq('status', 'active');

      const departmentCounts = employees?.reduce((acc, emp) => {
        const dept = emp.department || 'Tidak Ada';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}) || {};

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
      const deptStats = Object.entries(departmentCounts).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data } = await supabase
        .from('attendance')
        .select(`
          user_id,
          is_late,
          work_hours,
          profiles:user_id(name, department, avatar_url)
        `)
        .gte('timestamp', startOfMonth)
        .eq('status', 'berhasil')
        .eq('type', 'masuk');

      const userStats = data?.reduce((acc, att) => {
        const userId = att.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user: att.profiles,
            totalDays: 0,
            onTimeDays: 0,
            totalHours: 0
          };
        }
        acc[userId].totalDays++;
        if (!att.is_late) acc[userId].onTimeDays++;
        acc[userId].totalHours += att.work_hours || 0;
        return acc;
      }, {}) || {};

      const performers = Object.values(userStats)
        .map(stat => ({
          ...stat.user,
          onTimePercentage: Math.round((stat.onTimeDays / stat.totalDays) * 100),
          avgHours: Math.round((stat.totalHours / stat.totalDays) * 10) / 10,
          totalDays: stat.totalDays
        }))
        .sort((a, b) => b.onTimePercentage - a.onTimePercentage)
        .slice(0, 5);

      setTopPerformers(performers);
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data: warnings } = await supabase
        .from('attendance_warnings')
        .select(`
          *,
          profiles:user_id(name, department)
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: lateEmployees } = await supabase
        .from('attendance')
        .select(`
          user_id,
          late_minutes,
          profiles:user_id(name, department)
        `)
        .eq('is_late', true)
        .gte('timestamp', new Date().toISOString().split('T')[0] + 'T00:00:00')
        .order('late_minutes', { ascending: false })
        .limit(3);

      const alertsList = [
        ...(warnings?.map(w => ({
          type: 'warning',
          title: `Peringatan ${w.warning_type}`,
          message: `${w.profiles?.name} - ${w.description}`,
          time: new Date(w.created_at).toLocaleTimeString('id-ID'),
          severity: w.warning_level
        })) || []),
        ...(lateEmployees?.map(emp => ({
          type: 'late',
          title: 'Keterlambatan',
          message: `${emp.profiles?.name} terlambat ${emp.late_minutes} menit`,
          time: 'Hari ini',
          severity: emp.late_minutes > 30 ? 3 : emp.late_minutes > 15 ? 2 : 1
        })) || [])
      ].slice(0, 5);

      setAlerts(alertsList);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 3: return 'text-red-600 bg-red-50 border-red-200';
      case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Memuat Dashboard Admin</h3>
          <p className="text-gray-600">Sedang mengumpulkan data terbaru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Sidebar */}
      <AdminSidebar user={currentUser} profile={profile} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Enhanced Header */}
        <div className="bg-white shadow-lg border-b border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Dashboard Administrator
                  </h1>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span>Selamat datang, {profile?.name || 'Admin'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Karyawan"
              value={stats.totalEmployees}
              subtitle={`${stats.activeEmployees} aktif`}
              icon={Users}
              color="blue"
              trend="+2.5%"
              trendUp={true}
            />
            <StatsCard
              title="Hadir Hari Ini"
              value={stats.todayAttendance}
              subtitle={`${stats.onTimePercentage}% tepat waktu`}
              icon={UserCheck}
              color="green"
              trend="+5.2%"
              trendUp={true}
            />
            <StatsCard
              title="Gaji Dibayar"
              value={formatCurrency(stats.totalSalaryPaid)}
              subtitle={`${stats.pendingPayments} tertunda`}
              icon={DollarSign}
              color="purple"
              trend="+12.3%"
              trendUp={true}
            />
            <StatsCard
              title="Rata-rata Jam Kerja"
              value={`${stats.avgWorkHours}h`}
              subtitle="per hari"
              icon={Clock}
              color="orange"
              trend="-0.5h"
              trendUp={false}
            />
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Attendance Trend Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tren Kehadiran 7 Hari</h3>
                  <p className="text-gray-500 text-sm">Perbandingan kehadiran harian</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={attendanceChart}>
                  <defs>
                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area type="monotone" dataKey="hadir" stroke="#3B82F6" fillOpacity={1} fill="url(#colorHadir)" strokeWidth={3} />
                  <Area type="monotone" dataKey="terlambat" stroke="#EF4444" fillOpacity={1} fill="url(#colorTerlambat)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Distribusi Departemen</h3>
                  <p className="text-gray-500 text-sm">Jumlah karyawan per departemen</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <span className="text-sm text-gray-600">{dept.name} ({dept.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Performers */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Karyawan Terbaik</h3>
                  <p className="text-gray-500 text-sm">Berdasarkan kehadiran bulan ini</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {performer.name?.charAt(0).toUpperCase()}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{performer.name}</p>
                      <p className="text-sm text-gray-500">{performer.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{performer.onTimePercentage}%</p>
                      <p className="text-xs text-gray-500">{performer.totalDays} hari</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
                  <p className="text-gray-500 text-sm">Absensi real-time</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'masuk' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'masuk' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{activity.profiles?.name}</p>
                      <p className="text-sm text-gray-500">
                        {activity.type === 'masuk' ? 'Masuk' : 'Keluar'} • {new Date(activity.timestamp).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                    {activity.is_late && (
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Peringatan & Alert</h3>
                  <p className="text-gray-500 text-sm">Memerlukan perhatian</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {alerts.length > 0 ? alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-xl border ${getAlertColor(alert.severity)} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                        <p className="text-xs opacity-75 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-500">Tidak ada peringatan</p>
                    <p className="text-sm text-gray-400">Semua berjalan lancar!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
                <p className="text-gray-500 text-sm">Navigasi ke fitur utama</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <QuickActionCard
                title="Kelola Karyawan"
                icon={Users}
                color="blue"
                onClick={() => navigate('/admin/users')}
              />
              <QuickActionCard
                title="Kelola Absensi"
                icon={Calendar}
                color="green"
                onClick={() => navigate('/admin/attendance')}
              />
              <QuickActionCard
                title="Pembayaran Gaji"
                icon={CreditCard}
                color="purple"
                onClick={() => navigate('/admin/salary-payment')}
              />
              <QuickActionCard
                title="Kelola Jabatan"
                icon={Briefcase}
                color="orange"
                onClick={() => navigate('/admin/positions')}
              />
              <QuickActionCard
                title="Kelola Bank"
                icon={Database}
                color="indigo"
                onClick={() => navigate('/admin/bank')}
              />
              <QuickActionCard
                title="Pengaturan"
                icon={Settings}
                color="gray"
                onClick={() => navigate('/admin/location')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stats Card Component
const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend, trendUp }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 font-medium">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
  };

  return (
    <button
      onClick={onClick}
      className={`group p-4 bg-gradient-to-br ${colorClasses[color]} rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105`}
    >
      <div className="flex flex-col items-center space-y-2">
        <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-sm font-medium text-center leading-tight">{title}</span>
      </div>
    </button>
  );
};

export default AdminPanel;