import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  CreditCard,
  Shield,
  Crown,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X,
  Camera,
  Star,
  Award,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Send,
  Bell,
  Settings,
  RefreshCw,
  UserPlus,
  UserCheck,
  UserX,
  Zap,
  Sparkles
} from 'lucide-react';
import { supabase } from '../api/supabaseClient';
import AdminSidebar from '../components/AdminSidebar';
import ProfileModal from '../components/ProfileModal';
import WarningLetterGenerator from '../components/WarningLetterGenerator';

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    employees: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'karyawan',
    position_id: '',
    department: '',
    employee_id: '',
    salary: 0,
    status: 'active',
    join_date: new Date().toISOString().split('T')[0],
    contract_type: 'permanent',
    bank_id: '',
    bank_account_number: '',
    bank_account_name: ''
  });

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
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setCurrentUser(user);
      setProfile(profile);
      
      await Promise.all([
        fetchUsers(),
        fetchPositions(),
        fetchDepartments(),
        fetchBanks()
      ]);
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setContentLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          positions(name_id, department, base_salary),
          bank_info(bank_name, bank_logo),
          employee_salaries(daily_salary, payment_status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(user => user.status === 'active').length || 0;
      const inactive = data?.filter(user => user.status !== 'active').length || 0;
      const admins = data?.filter(user => user.role === 'admin').length || 0;
      const employees = data?.filter(user => user.role === 'karyawan').length || 0;
      
      setStats({ total, active, inactive, admins, employees });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Gagal memuat data pengguna');
    } finally {
      setContentLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('is_active', true)
        .order('name_id');

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_info')
        .select('*')
        .eq('is_active', true)
        .order('bank_name');

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'karyawan',
      position_id: '',
      department: '',
      employee_id: '',
      salary: 0,
      status: 'active',
      join_date: new Date().toISOString().split('T')[0],
      contract_type: 'permanent',
      bank_id: '',
      bank_account_number: '',
      bank_account_name: ''
    });
    setEditingUser(null);
    setShowAddModal(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setContentLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        setSuccess('Pengguna berhasil diperbarui!');
      } else {
        // Create new user (this would typically be done through auth.signUp)
        setError('Pembuatan pengguna baru harus dilakukan melalui halaman registrasi');
        return;
      }

      resetForm();
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Gagal menyimpan pengguna: ' + error.message);
    } finally {
      setContentLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'karyawan',
      position_id: user.position_id || '',
      department: user.department || '',
      employee_id: user.employee_id || '',
      salary: user.salary || 0,
      status: user.status || 'active',
      join_date: user.join_date || new Date().toISOString().split('T')[0],
      contract_type: user.contract_type || 'permanent',
      bank_id: user.bank_id || '',
      bank_account_number: user.bank_account_number || '',
      bank_account_name: user.bank_account_name || ''
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    setContentLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      setSuccess('Pengguna berhasil dihapus!');
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Gagal menghapus pengguna: ' + error.message);
    } finally {
      setContentLoading(false);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleGenerateWarning = (user) => {
    setSelectedUser(user);
    setShowWarningModal(true);
  };

  const exportToCSV = () => {
    if (filteredUsers.length === 0) return;

    const headers = [
      'Nama', 'Email', 'Telepon', 'Jabatan', 'Departemen', 'Status', 'Tanggal Bergabung'
    ];

    const csvContent = [
      headers,
      ...filteredUsers.map(user => [
        user.name || '',
        user.email || '',
        user.phone || '',
        user.positions?.name_id || user.title || '',
        user.department || '',
        user.status || '',
        user.join_date || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'kepala': return <Crown className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'kepala': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesDepartment = !filterDepartment || user.department === filterDepartment;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Memuat Data Pengguna</h3>
          <p className="text-gray-600">Sedang mengumpulkan informasi karyawan...</p>
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
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Kelola Karyawan
                  </h1>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span>Manajemen data karyawan dan pengguna sistem</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setContentLoading(true);
                    fetchUsers().finally(() => setContentLoading(false));
                  }}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={filteredUsers.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Karyawan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-start space-x-3 animate-slideInUp">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">Berhasil!</p>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
              <button 
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-start space-x-3 animate-slideInUp">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatsCard title="Total" value={stats.total} icon={Users} color="blue" />
            <StatsCard title="Aktif" value={stats.active} icon={UserCheck} color="green" />
            <StatsCard title="Tidak Aktif" value={stats.inactive} icon={UserX} color="yellow" />
            <StatsCard title="Admin" value={stats.admins} icon={Shield} color="purple" />
            <StatsCard title="Karyawan" value={stats.employees} icon={User} color="indigo" />
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter & Pencarian</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Semua Role</option>
                <option value="admin">Administrator</option>
                <option value="kepala">Kepala Bagian</option>
                <option value="karyawan">Karyawan</option>
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Semua Departemen</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="terminated">Diberhentikan</option>
              </select>
            </div>
          </div>

          {/* Enhanced Users Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Daftar Karyawan ({filteredUsers.length})
                  </h2>
                </div>
                {contentLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Memuat...</span>
                  </div>
                )}
              </div>
            </div>
            
            {contentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data karyawan...</p>
                </div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Karyawan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jabatan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bergabung
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                                {user.avatar_url ? (
                                  <img 
                                    src={user.avatar_url} 
                                    alt={user.name} 
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  user.name?.charAt(0).toUpperCase()
                                )}
                              </div>
                              {user.is_face_registered && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                  <Camera className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                  {getRoleIcon(user.role)}
                                  <span className="ml-1">
                                    {user.role === 'admin' ? 'Admin' : user.role === 'kepala' ? 'Kepala' : 'Karyawan'}
                                  </span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{user.full_name}</p>
                              {user.employee_id && (
                                <p className="text-xs text-gray-400">ID: {user.employee_id}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="truncate max-w-xs">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.positions?.name_id || user.title || 'Belum diatur'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.department || 'Belum diatur'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktif
                              </>
                            ) : user.status === 'inactive' ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Tidak Aktif
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Diberhentikan
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {user.join_date ? new Date(user.join_date).toLocaleDateString('id-ID') : 'Tidak diketahui'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProfile(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Lihat Profil"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleGenerateWarning(user)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                              title="Buat Surat Peringatan"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada karyawan ditemukan</h3>
                <p className="text-gray-500 mb-6">Coba sesuaikan filter pencarian atau tambah karyawan baru</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Karyawan Pertama</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <ProfileModal
          profile={selectedUser}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Warning Letter Modal */}
      {showWarningModal && selectedUser && (
        <WarningLetterGenerator
          employee={selectedUser}
          issuedByUserId={currentUser?.id}
          onClose={() => {
            setShowWarningModal(false);
            setSelectedUser(null);
          }}
          onGenerated={(letter) => {
            console.log('Warning letter generated:', letter);
            setSuccess('Surat peringatan berhasil dibuat!');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    {editingUser ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingUser ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {editingUser ? 'Perbarui informasi karyawan' : 'Isi data karyawan baru'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informasi Pribadi</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Panggilan *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nama panggilan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={editingUser}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="+62-21-1234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <h3 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Informasi Pekerjaan</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="karyawan">Karyawan</option>
                        <option value="kepala">Kepala Bagian</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan
                      </label>
                      <select
                        name="position_id"
                        value={formData.position_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Pilih Jabatan...</option>
                        {positions.map(position => (
                          <option key={position.id} value={position.id}>
                            {position.name_id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departemen
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Pilih Departemen...</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Karyawan
                      </label>
                      <input
                        type="text"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="EMP001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                        <option value="terminated">Diberhentikan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Bergabung
                      </label>
                      <input
                        type="date"
                        name="join_date"
                        value={formData.join_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Informasi Bank</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank
                      </label>
                      <select
                        name="bank_id"
                        value={formData.bank_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Pilih Bank...</option>
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.id}>
                            {bank.bank_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Rekening
                      </label>
                      <input
                        type="text"
                        name="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Pemegang
                      </label>
                      <input
                        type="text"
                        name="bank_account_name"
                        value={formData.bank_account_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nama sesuai rekening"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={contentLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {contentLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>{editingUser ? 'Perbarui Karyawan' : 'Simpan Karyawan'}</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;