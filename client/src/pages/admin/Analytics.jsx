import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoTrendingUp, IoTrophy, IoBriefcase, IoPeople } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [branchStats, setBranchStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overallRes, branchRes, companyRes] = await Promise.all([
        api.get('/admin/analytics/overall'),
        api.get('/admin/analytics/branch-wise'),
        api.get('/admin/analytics/company-wise'),
      ]);

      if (overallRes.success) setAnalytics(overallRes.data);
      if (branchRes.success) setBranchStats(branchRes.data.branchStats);
      if (companyRes.success) setCompanyStats(companyRes.data.companyStats);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Analytics & Reports</h1>
          <p className="text-primary-600 mt-1">Comprehensive placement statistics</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FadeIn delay={0.1}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {analytics?.totalStudents || 0}
                </p>
              </div>
              <IoPeople className="text-blue-500" size={48} />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Placed Students</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {analytics?.placedStudents || 0}
                </p>
              </div>
              <IoTrophy className="text-green-500" size={48} />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Placement Rate</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {analytics?.placementPercentage || 0}%
                </p>
              </div>
              <IoTrendingUp className="text-purple-500" size={48} />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Drives</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {analytics?.totalDrives || 0}
                </p>
              </div>
              <IoBriefcase className="text-orange-500" size={48} />
            </div>
          </Card>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.5}>
          <Card title="CTC Statistics">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                <span className="text-primary-700 font-medium">Average CTC</span>
                <span className="text-xl font-bold text-primary-900">
                  ₹{(analytics?.avgCTC || 0).toFixed(2)} LPA
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent-50 rounded-lg">
                <span className="text-accent-700 font-medium">Highest CTC</span>
                <span className="text-xl font-bold text-accent-900">
                  ₹{analytics?.maxCTC || 0} LPA
                </span>
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.6}>
          <Card title="Top Companies">
            <div className="space-y-3">
              {companyStats.slice(0, 5).map((company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-primary-900">{company._id}</p>
                    <p className="text-sm text-primary-600">{company.studentsHired} students hired</p>
                  </div>
                  <span className="text-secondary-600 font-semibold">
                    ₹{company.avgCTC.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.7}>
        <Card title="Branch-wise Placement Statistics">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Placed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Unplaced
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Placement %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Avg CGPA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {branchStats.map((branch, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-primary-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-900">
                      {branch.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {branch.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {branch.placed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {branch.unplaced}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-primary-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-accent-500 h-2 rounded-full"
                            style={{ width: `${branch.placementPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-primary-900">
                          {branch.placementPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {branch.avgCGPA}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Analytics;
