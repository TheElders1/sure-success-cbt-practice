import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import {
  Users, Activity, TrendingUp, Award, Flame, BarChart3,
  Search, Download, Trash2, Eye, Shield, Database,
  RefreshCw, Settings, Megaphone, Plus, LogOut
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('');
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    expires_at: ''
  });

  useEffect(() => {
    const isValidAdminSession = checkAdminSession();
    if (!isValidAdminSession) {
      window.location.href = '/ELD.html';
      return;
    }
    loadAdminData();
  }, [navigate]);

  function checkAdminSession(): boolean {
    const adminSessionStr = localStorage.getItem('eld_admin_session');

    if (!adminSessionStr) {
      return false;
    }

    try {
      const adminSession = JSON.parse(adminSessionStr);

      if (!adminSession.email || !adminSession.loginTime) {
        localStorage.removeItem('eld_admin_session');
        return false;
      }

      if (adminSession.email !== 'admin@theelders.sure') {
        localStorage.removeItem('eld_admin_session');
        return false;
      }

      const SESSION_DURATION = 24 * 60 * 60 * 1000;
      const currentTime = Date.now();
      const sessionAge = currentTime - adminSession.loginTime;

      if (sessionAge > SESSION_DURATION) {
        localStorage.removeItem('eld_admin_session');
        return false;
      }

      setAdminEmail(adminSession.email);
      return true;
    } catch (error) {
      localStorage.removeItem('eld_admin_session');
      return false;
    }
  }

  function handleAdminLogout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('eld_admin_session');
      window.location.href = '/ELD.html';
    }
  }

  async function loadAdminData() {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadFaculties(),
        loadDepartments(),
        loadStats(),
        loadAnnouncements()
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

  async function loadAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading announcements:', error);
      return;
    }

    setAnnouncements(data || []);
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

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault();

    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const { error } = await supabase.from('announcements').insert({
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      expires_at: announcementForm.expires_at || null,
      created_by: null
    });

    if (error) {
      alert('Error creating announcement: ' + error.message);
      return;
    }

    alert('Announcement created successfully');
    setAnnouncementForm({ title: '', content: '', priority: 'medium', expires_at: '' });
    setShowAnnouncementForm(false);
    loadAnnouncements();
  }

  async function handleToggleAnnouncement(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating announcement: ' + error.message);
      return;
    }

    loadAnnouncements();
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting announcement: ' + error.message);
      return;
    }

    alert('Announcement deleted successfully');
    loadAnnouncements();
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
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-900 dark:text-blue-300">
              Logged in as: <strong>{adminEmail}</strong>
            </span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">System administration and analytics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadAdminData}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Management</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Department</th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{user.name || 'N/A'}</div>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                          {user.email}
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                          {user.department || 'N/A'}
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (user.average_score || 0) >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            (user.average_score || 0) >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                            (user.average_score || 0) >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}>
                            {user.average_score || 0}%
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.account_status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            user.account_status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}>
                            {user.account_status}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Faculties ({faculties.length})
            </h3>
            <div className="space-y-2">
              {faculties.map(faculty => {
                const deptCount = departments.filter(d => d.faculty_id === faculty.id).length;
                return (
                  <div key={faculty.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-white">{faculty.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {faculty.code} - {deptCount} departments
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              System Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total Faculties</span>
                <span className="font-semibold text-gray-900 dark:text-white">{faculties.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total Departments</span>
                <span className="font-semibold text-gray-900 dark:text-white">{departments.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Registered Users</span>
                <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.activeThisWeek}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Announcements Management
            </h2>
            <button
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Announcement</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {showAnnouncementForm && (
            <form onSubmit={handleCreateAnnouncement} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expires At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={announcementForm.expires_at}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, expires_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Create Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnnouncementForm(false);
                      setAnnouncementForm({ title: '', content: '', priority: 'medium', expires_at: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No announcements yet</p>
            ) : (
              announcements.map(announcement => (
                <div
                  key={announcement.id}
                  className={`p-4 border rounded-lg ${
                    announcement.is_active
                      ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                            announcement.priority === 'urgent'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : announcement.priority === 'high'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : announcement.priority === 'medium'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {announcement.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            announcement.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {announcement.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{announcement.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                        {announcement.expires_at && (
                          <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          announcement.is_active
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {announcement.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Faculty</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.faculty || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.join_date ? new Date(selectedUser.join_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Visit</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.last_visit ? new Date(selectedUser.last_visit).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Quizzes</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.total_quizzes_taken || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.average_score || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.level || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedUser.account_status}</p>
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
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
