import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IoPeople,
  IoBriefcase,
  IoDocuments,
  IoTrophy,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoTime
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ driveApprovals: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.success) {
        setStats(response.data.stats);
        setPending(response.data.pending || { driveApprovals: 0 });
        setRecentApplications(response.data.recentApplications);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: IoPeople,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Drives',
      value: stats?.activeDrives || 0,
      icon: IoBriefcase,
      color: 'bg-secondary-500',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: IoDocuments,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Placed Students',
      value: stats?.placedStudents || 0,
      icon: IoTrophy,
      color: 'bg-accent-500',
      bgColor: 'bg-accent-50',
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Admin Dashboard</h1>
            <p className="text-primary-600 mt-1">Manage your placement activities</p>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              className={`${stat.bgColor} rounded-xl p-6 border border-primary-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-primary-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.4}>
          <Card title="Placement Statistics" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
                    <IoTrendingUp className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">Placement Rate</p>
                    <p className="text-2xl font-bold text-primary-900">
                      {stats?.placementPercentage || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Total Recruiters</span>
                  <span className="font-semibold text-primary-900">{stats?.totalRecruiters || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Total Drives</span>
                  <span className="font-semibold text-primary-900">{stats?.totalDrives || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Unplaced Students</span>
                  <span className="font-semibold text-primary-900">
                    {(stats?.totalStudents || 0) - (stats?.placedStudents || 0)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.5}>
          <Card title="Pending Approvals" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="text-sm text-primary-600">Pending Drive Approvals</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {pending?.driveApprovals || 0}
                  </p>
                </div>
                <IoTime className="text-orange-500" size={32} />
              </div>

              {pending?.driveApprovals > 0 && (
                <button
                  onClick={() => window.location.href = '/admin/drives'}
                  className="w-full text-center text-sm text-secondary-600 hover:text-secondary-700 font-medium py-2 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  Review Pending Drives →
                </button>
              )}
            </div>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.6}>
        <Card title="Recent Applications">
          <div className="overflow-x-auto">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-primary-500">
                No recent applications
              </div>
            ) : (
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {recentApplications.map((app, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-primary-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-900">
                          {app.studentId?.firstName} {app.studentId?.lastName}
                        </div>
                        <div className="text-sm text-primary-500">
                          {app.studentId?.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                        {app.driveId?.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                        {app.driveId?.jobTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${app.status === 'offered' ? 'badge-success' :
                          app.status === 'rejected' ? 'badge-danger' :
                            app.status === 'shortlisted' ? 'badge-info' :
                              'badge-warning'
                          }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                        {formatDate(app.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Dashboard;
