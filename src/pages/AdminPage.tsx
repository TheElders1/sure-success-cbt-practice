import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import Layout from '../components/layout/Layout';
import {
  Users, Activity, TrendingUp, Award, Flame, BarChart3,
  Search, Download, Trash2, Eye, Shield, Database,
  RefreshCw, Settings
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  faculty: string;
  join_date: string;
  last_visit: string;
  total_quizzes_taken: number;
  average_score: number;
  level: number;
  account_status: string;
}

interface Faculty {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

interface SystemStats {
  totalUsers: number;
  totalQuizAttempts: number;
  platformAverage: number;
  activeThisWeek: number;
  totalAchievements: number;
  longestStreak: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalQuizAttempts: 0,
    platformAverage: 0,
    activeThisWeek: 0,
    totalAchievements: 0,
    longestStreak: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  async function loadAdminData() {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadFaculties(),
        loadDepartments(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    setUsers(data || []);
  }

  async function loadFaculties() {
    const { data, error } = await supabase
      .from('faculties')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading faculties:', error);
      return;
    }

    setFaculties(data || []);
  }

  async function loadDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading departments:', error);
      return;
    }

    setDepartments(data || []);
  }

  async function loadStats() {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, total_quizzes_taken, average_score, longest_streak, last_visit');

    if (usersError) {
      console.error('Error loading users for stats:', usersError);
      return;
    }

    const { data: achievementsData, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('id');

    if (achievementsError) {
      console.error('Error loading achievements:', achievementsError);
    }

    const { data: quizData, error: quizError } = await supabase
      .from('quiz_results')
      .select('id');

    if (quizError) {
      console.error('Error loading quiz results:', quizError);
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const activeThisWeek = usersData?.filter(u => {
      if (!u.last_visit) return false;
      return new Date(u.last_visit) > oneWeekAgo;
    }).length || 0;

    const totalQuizzes = usersData?.reduce((sum, u) => sum + (u.total_quizzes_taken || 0), 0) || 0;
    const avgScore = usersData && usersData.length > 0
      ? usersData.reduce((sum, u) => sum + (u.average_score || 0), 0) / usersData.length
      : 0;
    const longestStreak = Math.max(...(usersData?.map(u => u.longest_streak || 0) || [0]));

    setStats({
      totalUsers: usersData?.length || 0,
      totalQuizAttempts: quizData?.length || totalQuizzes,
      platformAverage: Math.round(avgScore),
      activeThisWeek,
      totalAchievements: achievementsData?.length || 0,
      longestStreak
    });
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      alert('Error deleting user: ' + error.message);
      return;
    }

    alert('User deleted successfully');
    loadAdminData();
  }

  async function handleExportData() {
    const exportData = {
      exportDate: new Date().toISOString(),
      users,
      faculties,
      departments,
      stats
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFaculty = selectedFaculty === 'all' || user.faculty === selectedFaculty;

    return matchesSearch && matchesFaculty;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600">System administration and analytics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadAdminData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Users"
            value={stats.totalUsers.toString()}
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Quiz Attempts"
            value={stats.totalQuizAttempts.toString()}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Platform Average"
            value={`${stats.platformAverage}%`}
            color="purple"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Active This Week"
            value={stats.activeThisWeek.toString()}
            color="orange"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Total Achievements"
            value={stats.totalAchievements.toString()}
            color="yellow"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            label="Longest Streak"
            value={`${stats.longestStreak} days`}
            color="red"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.total_quizzes_taken || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (user.average_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                          (user.average_score || 0) >= 60 ? 'bg-blue-100 text-blue-800' :
                          (user.average_score || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.average_score || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        Level {user.level || 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.account_status === 'active' ? 'bg-green-100 text-green-800' :
                          user.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.account_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Faculties ({faculties.length})
            </h3>
            <div className="space-y-2">
              {faculties.map(faculty => {
                const deptCount = departments.filter(d => d.faculty_id === faculty.id).length;
                return (
                  <div key={faculty.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{faculty.name}</div>
                    <div className="text-sm text-gray-600">
                      {faculty.code} - {deptCount} departments
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              System Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Faculties</span>
                <span className="font-semibold text-gray-900">{faculties.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Departments</span>
                <span className="font-semibold text-gray-900">{departments.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Registered Users</span>
                <span className="font-semibold text-gray-900">{users.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold text-gray-900">{stats.activeThisWeek}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Faculty</p>
                  <p className="font-medium text-gray-900">{selectedUser.faculty || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{selectedUser.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.join_date ? new Date(selectedUser.join_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Visit</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.last_visit ? new Date(selectedUser.last_visit).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Quizzes</p>
                  <p className="font-medium text-gray-900">{selectedUser.total_quizzes_taken || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className="font-medium text-gray-900">{selectedUser.average_score || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium text-gray-900">{selectedUser.level || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedUser.account_status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
