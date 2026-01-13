import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoArrowBack, 
  IoCheckmarkCircle, 
  IoTime,
  IoDocument,
  IoCalendar
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { applicationService } from '../../services/applicationService';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { APPLICATION_STATUS_LABELS } from '../../utils/constants';

const ApplicationStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getApplicationById(id);
      if (response.success) {
        setApplication(response.data.application);
      }
    } catch (error) {
      toast.error('Failed to fetch application details');
      navigate('/student/applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!application) {
    return null;
  }

  const statusSteps = [
    { key: 'applied', label: 'Applied', icon: IoDocument },
    { key: 'shortlisted', label: 'Shortlisted', icon: IoCheckmarkCircle },
    { key: 'test_cleared', label: 'Test Cleared', icon: IoCheckmarkCircle },
    { key: 'interview_scheduled', label: 'Interview', icon: IoCalendar },
    { key: 'interview_cleared', label: 'Interview Cleared', icon: IoCheckmarkCircle },
    { key: 'offered', label: 'Offered', icon: IoCheckmarkCircle },
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === application.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/student/applications')}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <IoArrowBack size={24} className="text-primary-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Application Status</h1>
            <p className="text-primary-600 mt-1">Track your application progress</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-900">
              {application.driveId?.companyName}
            </h2>
            <p className="text-lg text-primary-700">{application.driveId?.jobTitle}</p>
            <p className="text-sm text-primary-600 mt-2">
              Applied on {formatDate(application.createdAt)}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200" />

            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isRejected = application.status === 'rejected' && index === currentStepIndex;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start space-x-4"
                  >
                    <div
                      className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                        isRejected
                          ? 'bg-red-100 border-red-500'
                          : isCompleted
                          ? 'bg-accent-500 border-accent-500'
                          : 'bg-white border-primary-300'
                      }`}
                    >
                      <step.icon
                        className={
                          isRejected
                            ? 'text-red-500'
                            : isCompleted
                            ? 'text-white'
                            : 'text-primary-400'
                        }
                        size={24}
                      />
                    </div>

                    <div className="flex-1 pt-2">
                      <h3
                        className={`text-lg font-semibold ${
                          isRejected
                            ? 'text-red-700'
                            : isCompleted
                            ? 'text-primary-900'
                            : 'text-primary-500'
                        }`}
                      >
                        {step.label}
                      </h3>

                      {isCurrent && !isRejected && (
                        <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium">
                            Current Status: {APPLICATION_STATUS_LABELS[application.status]}
                          </p>
                          {application.remarks && (
                            <p className="text-sm text-blue-700 mt-2">{application.remarks}</p>
                          )}
                        </div>
                      )}

                      {isRejected && (
                        <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-800 font-medium">
                            Application Rejected
                          </p>
                          {application.remarks && (
                            <p className="text-sm text-red-700 mt-2">
                              Reason: {application.remarks}
                            </p>
                          )}
                        </div>
                      )}

                      {step.key === 'interview_scheduled' &&
                        isCompleted &&
                        application.interviewSchedule && (
                          <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 font-medium mb-2">
                              Interview Details
                            </p>
                            <div className="space-y-1 text-sm text-green-700">
                              <p>
                                <strong>Date:</strong>{' '}
                                {formatDate(application.interviewSchedule.date)}
                              </p>
                              {application.interviewSchedule.time && (
                                <p>
                                  <strong>Time:</strong> {application.interviewSchedule.time}
                                </p>
                              )}
                              {application.interviewSchedule.venue && (
                                <p>
                                  <strong>Venue:</strong> {application.interviewSchedule.venue}
                                </p>
                              )}
                              {application.interviewSchedule.mode && (
                                <p>
                                  <strong>Mode:</strong> {application.interviewSchedule.mode}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </FadeIn>

      {application.timeline && application.timeline.length > 0 && (
        <FadeIn delay={0.2}>
          <Card title="Activity Timeline">
            <div className="space-y-3">
              {application.timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg"
                >
                  <IoTime className="text-primary-500 mt-1" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-900">{item.status}</p>
                    <p className="text-xs text-primary-600 mt-1">{formatDate(item.timestamp)}</p>
                    {item.remarks && (
                      <p className="text-sm text-primary-700 mt-1">{item.remarks}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
};

export default ApplicationStatus;
