import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoPeople, IoCheckmarkCircle } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { APPLICATION_STATUS_LABELS } from '../../utils/constants';

const HiringPipeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, [id]);

  const fetchPipeline = async () => {
    try {
      const response = await api.get(`/recruiter/drives/${id}/pipeline`);
      if (response.success) {
        setPipeline(response.data.pipeline);
      }
    } catch (error) {
      toast.error('Failed to fetch hiring pipeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const stages = [
    { key: 'applied', label: 'Applied', color: 'bg-blue-500' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-500' },
    { key: 'test_scheduled', label: 'Test Scheduled', color: 'bg-yellow-500' },
    { key: 'test_cleared', label: 'Test Cleared', color: 'bg-green-500' },
    { key: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-orange-500' },
    { key: 'interview_cleared', label: 'Interview Cleared', color: 'bg-teal-500' },
    { key: 'offered', label: 'Offered', color: 'bg-accent-500' },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <IoArrowBack size={24} className="text-primary-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Hiring Pipeline</h1>
            <p className="text-primary-600 mt-1">Visualize your recruitment funnel</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage, index) => {
            const count = pipeline?.[stage.key] || 0;
            const percentage = pipeline?.total
              ? ((count / pipeline.total) * 100).toFixed(1)
              : 0;

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center">
                  <div className={`${stage.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <IoPeople className="text-white" size={24} />
                  </div>
                  <h3 className="text-sm font-medium text-primary-600 mb-2">
                    {stage.label}
                  </h3>
                  <p className="text-3xl font-bold text-primary-900 mb-1">{count}</p>
                  <p className="text-sm text-primary-500">{percentage}% of total</p>
                  <div className="mt-3 bg-primary-200 rounded-full h-2">
                    <div
                      className={`${stage.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card title="Pipeline Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
              <span className="text-primary-700 font-medium">Total Applications</span>
              <span className="text-2xl font-bold text-primary-900">{pipeline?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium">Conversion Rate (Applied → Offered)</span>
              <span className="text-2xl font-bold text-green-900">
                {pipeline?.total
                  ? ((pipeline.offered / pipeline.total) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <span className="text-yellow-700 font-medium">In Progress</span>
              <span className="text-2xl font-bold text-yellow-900">
                {(pipeline?.shortlisted || 0) + (pipeline?.test_scheduled || 0) + (pipeline?.interview_scheduled || 0)}
              </span>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default HiringPipeline;
