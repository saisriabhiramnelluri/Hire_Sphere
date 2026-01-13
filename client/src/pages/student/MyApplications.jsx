import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoSearch, IoClose, IoBriefcase, IoChevronDown, IoChevronUp, IoTimeOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import { applicationService } from '../../services/applicationService';
import toast from 'react-hot-toast';
import { formatDate, formatCTC } from '../../utils/helpers';

// Core status colors (for known statuses)
const CORE_STATUS_COLORS = {
  applied: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  offered: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Generate status slug from stage name (matching recruiter logic)
const generateStatusSlug = (stageName) => {
  return stageName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

// Get dynamic status info based on drive's selection process
const getStatusInfo = (app) => {
  const status = app.status;
  const selectionProcess = app.driveId?.selectionProcess || [];

  // Core statuses
  if (status === 'applied') {
    return { label: 'Applied', color: CORE_STATUS_COLORS.applied };
  }
  if (status === 'offered') {
    return { label: 'Offered 🎉', color: CORE_STATUS_COLORS.offered };
  }
  if (status === 'withdrawn') {
    return { label: 'Withdrawn', color: CORE_STATUS_COLORS.withdrawn };
  }
  if (status === 'rejected') {
    // Find the stage name where rejection occurred
    const rejectedAtStage = app.rejectedAtStage;
    if (rejectedAtStage && rejectedAtStage !== 'applied') {
      const stageInfo = selectionProcess.find(s => generateStatusSlug(s.stage) === rejectedAtStage);
      const stageName = stageInfo?.stage || rejectedAtStage;
      return {
        label: `Rejected at ${stageName}`,
        color: CORE_STATUS_COLORS.rejected
      };
    }
    return { label: 'Rejected', color: CORE_STATUS_COLORS.rejected };
  }

  // Dynamic pipeline status - find matching stage
  const stageInfo = selectionProcess.find(s => generateStatusSlug(s.stage) === status);
  if (stageInfo) {
    return {
      label: stageInfo.stage,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  }

  // Fallback - convert slug to readable format
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return { label, color: 'bg-purple-100 text-purple-800 border-purple-200' };
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState({});

  const { isOpen: isWithdrawModalOpen, open: openWithdrawModal, close: closeWithdrawModal } = useModal();

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
      };

      const response = await applicationService.getMyApplications(params);
      if (response.success) {
        setApplications(response.data.applications);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const response = await applicationService.withdrawApplication(selectedApplication._id);
      if (response.success) {
        toast.success('Application withdrawn successfully');
        closeWithdrawModal();
        fetchApplications();
      }
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const toggleTimeline = (appId) => {
    setExpandedTimeline(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'applied', label: 'Applied' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredApplications = applications.filter((app) =>
    app.driveId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.driveId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">My Applications</h1>
            <p className="text-primary-600 mt-1">Track your application status through the hiring process</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Search by company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<IoSearch />}
            />
            <Dropdown
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>

          {loading ? (
            <Loader />
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <IoBriefcase className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600 mb-4">No applications found</p>
              <Link to="/student/drives">
                <Button>Browse Drives</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredApplications.map((app, index) => {
                  const statusInfo = getStatusInfo(app);
                  const isExpanded = expandedTimeline[app._id];
                  const hasTimeline = app.timeline && app.timeline.length > 0;

                  return (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-primary-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-primary-900">
                                {app.driveId?.companyName}
                              </h3>
                              <p className="text-primary-700 font-medium">
                                {app.driveId?.jobTitle}
                              </p>
                            </div>
                            <span className={`badge ${statusInfo.color} border ml-4`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-primary-500">CTC</p>
                              <p className="text-sm font-semibold text-primary-900">
                                {formatCTC(app.driveId?.ctc?.min)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-500">Location</p>
                              <p className="text-sm font-semibold text-primary-900">
                                {app.driveId?.jobLocation}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-500">Applied On</p>
                              <p className="text-sm font-semibold text-primary-900">
                                {formatDate(app.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-500">Last Updated</p>
                              <p className="text-sm font-semibold text-primary-900">
                                {formatDate(app.updatedAt)}
                              </p>
                            </div>
                          </div>

                          {/* Show latest remarks/update */}
                          {app.timeline?.length > 0 && app.timeline[app.timeline.length - 1]?.remarks && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium mb-1">Latest Update</p>
                              <p className="text-sm text-blue-900">{app.timeline[app.timeline.length - 1].remarks}</p>
                            </div>
                          )}

                          {/* Timeline Toggle */}
                          {hasTimeline && (
                            <button
                              onClick={() => toggleTimeline(app._id)}
                              className="mt-4 flex items-center text-sm text-secondary-600 hover:text-secondary-800 transition-colors"
                            >
                              <IoTimeOutline className="mr-1" />
                              {isExpanded ? 'Hide' : 'View'} Application Timeline
                              {isExpanded ? <IoChevronUp className="ml-1" /> : <IoChevronDown className="ml-1" />}
                            </button>
                          )}

                          {/* Expanded Timeline */}
                          {isExpanded && hasTimeline && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 border-l-2 border-primary-200 pl-4 space-y-3"
                            >
                              {app.timeline.map((entry, idx) => {
                                const entryStatusInfo = getStatusInfo({ ...app, status: entry.status });
                                return (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-secondary-500 border-2 border-white"></div>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-medium text-primary-900">{entryStatusInfo.label}</p>
                                        {entry.remarks && (
                                          <p className="text-sm text-primary-600 mt-1">{entry.remarks}</p>
                                        )}
                                      </div>
                                      <p className="text-xs text-primary-500 whitespace-nowrap ml-4">
                                        {formatDate(entry.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>

                        {app.status === 'applied' && (
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              openWithdrawModal();
                            }}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Withdraw Application"
                          >
                            <IoClose size={20} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </FadeIn>

      <Modal isOpen={isWithdrawModalOpen} onClose={closeWithdrawModal} title="Withdraw Application">
        <div className="space-y-4">
          <p className="text-primary-700">
            Are you sure you want to withdraw your application for{' '}
            <strong>{selectedApplication?.driveId?.jobTitle}</strong> at{' '}
            <strong>{selectedApplication?.driveId?.companyName}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              This action cannot be undone. You will not be able to reapply for this drive.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeWithdrawModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleWithdraw}>
              Withdraw Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyApplications;
