// ==========================================
// FILE: frontend/src/components/PassportSystem.jsx
// Enhanced Passport Verification System Component
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, CheckCircle, Shield, UserCheck, Award, Settings, 
  LogOut, Upload, Camera, PenTool, Clock, Eye, AlertCircle, CheckSquare,
  Search, Filter, Download, BarChart3, TrendingUp, UserPlus, Edit,
  Trash2, Save, X, Plus, RefreshCw, Bell, Menu
} from 'lucide-react';

const PassportSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New application submitted', time: '5 min ago', unread: true },
    { id: 2, message: 'Document verified successfully', time: '1 hour ago', unread: true },
  ]);

  const [applications, setApplications] = useState([
    { id: 'APP001', name: 'Rajesh Kumar', status: 'pending', stage: 'token', date: '2025-10-01', email: 'rajesh@example.com', phone: '9123456780' },
    { id: 'APP002', name: 'Priya Sharma', status: 'verification', stage: 'photo', date: '2025-10-02', email: 'priya@example.com', phone: '9123456781' },
    { id: 'APP003', name: 'Amit Patel', status: 'processing', stage: 'police', date: '2025-10-03', email: 'amit@example.com', phone: '9123456782' },
    { id: 'APP004', name: 'Sneha Reddy', status: 'approved', stage: 'completed', date: '2025-09-28', email: 'sneha@example.com', phone: '9123456783' },
    { id: 'APP005', name: 'Vikram Singh', status: 'rejected', stage: 'approval', date: '2025-09-25', email: 'vikram@example.com', phone: '9123456784' },
  ]);

  const roles = {
    user: { name: 'User Portal', icon: Users, color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
    token: { name: 'Token Authenticator', icon: Shield, color: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
    photo: { name: 'Photo & Sign Validator', icon: Camera, color: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600' },
    verification: { name: 'Verification Officer', icon: FileText, color: 'bg-green-500', gradient: 'from-green-500 to-green-600' },
    processing: { name: 'Processing Officer', icon: UserCheck, color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
    approval: { name: 'Approval Officer', icon: Award, color: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
    admin: { name: 'Administrator', icon: Settings, color: 'bg-gray-800', gradient: 'from-gray-800 to-gray-900' }
  };

  const handleLogin = () => {
    if (credentials.username && credentials.password) {
      setCurrentUser({ role: selectedRole, username: credentials.username });
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole('');
    setCredentials({ username: '', password: '' });
    setActiveTab('dashboard');
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const openModal = (application) => {
    setModalData(application);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  // Login Screen Component
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-xl transform hover:scale-110 transition-transform">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Passport Verification System</h1>
            <p className="text-gray-600 text-lg">Secure Multi-Role Portal for Passport Processing</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Verified</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Multi-Role</span>
              </div>
            </div>
          </div>

          {!selectedRole ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-slide-in">
              {Object.entries(roles).map(([key, role]) => {
                const RoleIcon = role.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`bg-gradient-to-br ${role.gradient} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group`}
                  >
                    <RoleIcon className="w-12 h-12 mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                    <h3 className="text-lg font-semibold">{role.name}</h3>
                    <div className="mt-2 text-xs opacity-80">Click to login</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto animate-fade-in">
              <div className="text-center mb-6">
                {(() => {
                  const RoleIcon = roles[selectedRole].icon;
                  return (
                    <div>
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${roles[selectedRole].gradient} rounded-xl mb-3 shadow-lg`}>
                        <RoleIcon className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{roles[selectedRole].name}</h2>
                      <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedRole('');
                      setCredentials({ username: '', password: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleLogin}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r ${roles[selectedRole].gradient} text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg`}
                  >
                    Login
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Demo Credentials: Any username/password</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const role = currentUser.role;
  const RoleIcon = roles[role].icon;

  const statsConfig = {
    user: [
      { label: 'My Applications', value: '5', icon: FileText, color: 'blue', change: '+2' },
      { label: 'Pending', value: '2', icon: Clock, color: 'yellow', change: '+1' },
      { label: 'Approved', value: '2', icon: CheckCircle, color: 'green', change: '+1' },
      { label: 'In Progress', value: '1', icon: RefreshCw, color: 'purple', change: '0' },
    ],
    admin: [
      { label: 'Total Applications', value: '247', icon: FileText, color: 'blue', change: '+12' },
      { label: 'Pending Review', value: '45', icon: Clock, color: 'yellow', change: '+5' },
      { label: 'Approved Today', value: '12', icon: CheckCircle, color: 'green', change: '+3' },
      { label: 'Active Officers', value: '18', icon: Users, color: 'purple', change: '+2' },
    ],
    default: [
      { label: 'Pending Tasks', value: '8', icon: AlertCircle, color: 'orange', change: '+2' },
      { label: 'Completed Today', value: '15', icon: CheckSquare, color: 'green', change: '+5' },
      { label: 'Total Processed', value: '234', icon: FileText, color: 'blue', change: '+15' },
      { label: 'Avg Time', value: '3.2d', icon: TrendingUp, color: 'purple', change: '-0.3' },
    ]
  };

  const stats = statsConfig[role] || statsConfig.default;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className={`bg-gradient-to-r ${roles[role].gradient} text-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RoleIcon className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold">{roles[role].name}</h1>
                <p className="text-xs opacity-90">{currentUser.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative group">
                <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all relative">
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-3">Notifications</h3>
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 mb-2 rounded ${notif.unread ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <StatIcon className={`w-8 h-8 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Application Form */}
        {role === 'user' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Submit New Application
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500" />
                <p className="text-sm text-gray-600">Upload Documents</p>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500" />
                <p className="text-sm text-gray-600">Capture Photo</p>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <PenTool className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500" />
                <p className="text-sm text-gray-600">Digital Signature</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Submit</p>
              </button>
            </div>
          </div>
        )}

        {/* Admin Module Cards */}
        {role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(roles).map(([key, moduleRole]) => {
              const ModuleIcon = moduleRole.icon;
              return (
                <div key={key} className={`bg-gradient-to-br ${moduleRole.gradient} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all`}>
                  <ModuleIcon className="w-10 h-10 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{moduleRole.name}</h3>
                  <p className="text-sm opacity-90 mb-3">Manage {moduleRole.name.toLowerCase()}</p>
                  <button className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm hover:bg-opacity-30 transition-all">
                    View Module
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verification">Verification</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {role === 'user' ? 'My Applications' : 'Application Queue'}
            </h2>
            <span className="text-sm text-gray-500">
              Showing {getFilteredApplications().length} of {applications.length} applications
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredApplications().map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{app.email}</div>
                      <div className="text-xs">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{app.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'verification' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openModal(app)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        {role !== 'user' && (
                          <button className="text-green-600 hover:text-green-900 flex items-center">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Application Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Application ID</p>
                  <p className="font-semibold">{modalData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applicant Name</p>
                  <p className="font-semibold">{modalData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{modalData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">{modalData.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission Date</p>
                  <p className="font-semibold">{modalData.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Stage</p>
                  <p className="font-semibold capitalize">{modalData.stage}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Process Application
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Download Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassportSystem;