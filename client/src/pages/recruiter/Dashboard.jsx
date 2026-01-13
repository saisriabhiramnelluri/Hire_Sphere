import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoBriefcase, 
  IoDocuments, 
  IoPeople,
  IoTrophy,
  IoAdd,
  IoArrowForward
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/recruiter/dashboard');
      if (response.success) {
        setDashboardData(response.data);
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

  const stats = dashboardData?.stats || {};
  const recentDrives = dashboardData?.recentDrives || [];

  const statCards = [
    {
      title: 'Active Drives',
      value: stats.activeDrives || 0,
      icon: IoBriefcase,
      color: 'bg-secondary-500',
      bgColor: 'bg-secondary-50',
      link: '/recruiter/drives',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications || 0,
      icon: IoDocuments,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Shortlisted',
      value: stats.shortlisted || 0,
      icon: IoPeople,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Offers Made',
      value: stats.offersMade || 0,
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
            <h1 className="text-3xl font-bold text-primary-900">Recruiter Dashboard</h1>
            <p className="text-primary-600 mt-1">Manage your recruitment drives</p>
          </div>
          <Link to="/recruiter/create-drive">
            <Button icon={<IoAdd />}>Create New Drive</Button>
          </Link>
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

      <FadeIn delay={0.5}>
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary-900">Recent Drives</h2>
            <Link to="/recruiter/drives">
              <button className="text-secondary-600 hover:text-secondary-700 font-medium inline-flex items-center">
                View All
                <IoArrowForward className="ml-2" />
              </button>
            </Link>
          </div>

          {recentDrives.length === 0 ? (
            <div className="text-center py-12">
              <IoBriefcase className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600 mb-4">No drives created yet</p>
              <Link to="/recruiter/create-drive">
                <Button icon={<IoAdd />}>Create Your First Drive</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDrives.map((drive, index) => (
                <motion.div
                  key={drive._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <Link to={`/recruiter/drives/${drive._id}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary-900">
                          {drive.jobTitle}
                        </h3>
                        <p className="text-primary-600 text-sm mt-1">{drive.jobLocation}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-primary-600">
                          <span>{drive.applicationsCount || 0} applications</span>
                          <span>•</span>
                          <span>Deadline: {formatDate(drive.applicationDeadline)}</span>
                        </div>
                      </div>
                      <span className={`badge ${
                        drive.status === 'published' ? 'badge-success' :
                        drive.status === 'draft' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {drive.status}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
};

export default Dashboard;
