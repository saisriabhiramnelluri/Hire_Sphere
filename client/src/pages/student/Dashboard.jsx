import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoBriefcase, 
  IoDocuments, 
  IoTrophy, 
  IoCheckmarkCircle,
  IoArrowForward 
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate, formatCTC } from '../../utils/helpers';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '../../utils/constants';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/dashboard');
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
  const recentApplications = dashboardData?.recentApplications || [];
  const placementStatus = dashboardData?.placementStatus || {};

  const statCards = [
    {
      title: 'Eligible Drives',
      value: stats.eligibleDrives || 0,
      icon: IoBriefcase,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      link: '/student/drives',
    },
    {
      title: 'My Applications',
      value: stats.totalApplications || 0,
      icon: IoDocuments,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      link: '/student/applications',
    },
    {
      title: 'Shortlisted',
      value: stats.shortlisted || 0,
      icon: IoCheckmarkCircle,
      color: 'bg-accent-500',
      bgColor: 'bg-accent-50',
      link: '/student/applications?status=shortlisted',
    },
    {
      title: 'Offers Received',
      value: stats.offered || 0,
      icon: IoTrophy,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      link: '/student/offers',
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
          <p className="text-primary-600 mt-1">Welcome back! Here's your placement overview</p>
        </div>
      </FadeIn>

      {placementStatus?.isPlaced && (
        <FadeIn delay={0.1}>
          <Card className="bg-gradient-to-r from-accent-500 to-accent-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Congratulations! You're Placed! 🎉</h3>
                <p className="text-accent-100">
                  <strong>{placementStatus.placedCompany}</strong> • {formatCTC(placementStatus.placedCTC)}
                </p>
                <p className="text-sm text-accent-100 mt-1">
                  Placed on {formatDate(placementStatus.placedDate)}
                </p>
              </div>
              <IoTrophy size={64} className="text-accent-200" />
            </div>
          </Card>
        </FadeIn>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <Link to={stat.link}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`${stat.bgColor} rounded-xl p-6 border border-primary-200 cursor-pointer`}
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
            </Link>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.5}>
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary-900">Recent Applications</h2>
            <Link to="/student/applications">
              <button className="text-secondary-600 hover:text-secondary-700 font-medium inline-flex items-center">
                View All
                <IoArrowForward className="ml-2" />
              </button>
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-12">
              <IoBriefcase className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600 mb-4">No applications yet</p>
              <Link to="/student/drives">
                <button className="btn-primary">Browse Drives</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app, index) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary-900">
                        {app.driveId?.companyName}
                      </h3>
                      <p className="text-primary-700">{app.driveId?.jobTitle}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-primary-600">
                        <span>{app.driveId?.jobLocation}</span>
                        <span>•</span>
                        <span>{formatCTC(app.driveId?.ctc?.min)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${APPLICATION_STATUS_COLORS[app.status]}`}>
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </span>
                      <p className="text-xs text-primary-500 mt-2">
                        Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                  </div>
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
