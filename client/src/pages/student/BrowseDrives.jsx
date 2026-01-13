import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoSearch, IoBriefcase, IoLocation, IoCalendar, IoCheckmarkCircle, IoTime, IoCloseCircle } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import FadeIn from '../../components/animations/FadeIn';
import { useDebounce } from '../../hooks/useDebounce';
import { driveService } from '../../services/driveService';
import { applicationService } from '../../services/applicationService';
import toast from 'react-hot-toast';
import { formatDate, formatCTCRange } from '../../utils/helpers';
import { JOB_TYPE_LABELS } from '../../utils/constants';

const BrowseDrives = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [drives, setDrives] = useState([]);
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchDrives();
    } else {
      fetchAppliedDrives();
    }
  }, [currentPage, jobTypeFilter, debouncedSearchTerm, activeTab]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        jobType: jobTypeFilter,
        search: debouncedSearchTerm,
      };

      const response = await driveService.getEligibleDrives(params);
      if (response.success) {
        setDrives(response.data.drives);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch drives');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedDrives = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications();
      if (response.success) {
        setAppliedDrives(response.data.applications || []);
      }
    } catch (error) {
      toast.error('Failed to fetch applied drives');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { class: 'badge-info', icon: <IoTime size={14} />, text: 'Applied' },
      shortlisted: { class: 'badge-warning', icon: <IoCheckmarkCircle size={14} />, text: 'Shortlisted' },
      offered: { class: 'badge-success', icon: <IoCheckmarkCircle size={14} />, text: 'Offered' },
      accepted: { class: 'badge-success', icon: <IoCheckmarkCircle size={14} />, text: 'Accepted' },
      rejected: { class: 'badge-danger', icon: <IoCloseCircle size={14} />, text: 'Rejected' },
    };
    const config = statusConfig[status] || statusConfig.applied;
    return (
      <span className={`badge ${config.class} flex items-center gap-1`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const jobTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'full_time', label: 'Full Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'both', label: 'Both' },
  ];

  const tabs = [
    { id: 'all', label: 'All Drives' },
    { id: 'applied', label: `Applied (${appliedDrives.length || 0})` },
  ];

  const DriveCard = ({ drive, application = null }) => (
    <Link to={`/student/drives/${drive._id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="bg-white rounded-xl border border-primary-200 p-6 hover:shadow-lg transition-all cursor-pointer h-full"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-primary-900 flex-1">
            {drive.companyName}
          </h3>
          <div className="flex items-center gap-2 ml-2">
            {application && getStatusBadge(application.status)}
            <span className="badge badge-info">
              {JOB_TYPE_LABELS[drive.jobType]}
            </span>
          </div>
        </div>

        <p className="text-primary-700 font-medium mb-4">{drive.jobTitle}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-primary-600">
            <IoLocation className="mr-2 text-primary-400" size={16} />
            {drive.jobLocation}
          </div>
          <div className="flex items-center text-sm text-primary-600">
            <IoBriefcase className="mr-2 text-primary-400" size={16} />
            {formatCTCRange(drive.ctc?.min, drive.ctc?.max)}
          </div>
          <div className="flex items-center text-sm text-primary-600">
            <IoCalendar className="mr-2 text-primary-400" size={16} />
            {application
              ? `Applied on ${formatDate(application.createdAt)}`
              : `Apply by ${formatDate(drive.applicationDeadline)}`
            }
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-primary-200">
          <span className="text-sm text-primary-600">
            {drive.positions} positions
          </span>
          <span className="text-secondary-600 font-medium text-sm hover:underline">
            View Details →
          </span>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Browse Drives</h1>
          <p className="text-primary-600 mt-1">Find placement opportunities</p>
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.1}>
        <div className="flex border-b border-primary-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-primary-600 hover:text-primary-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Filters (only for All Drives) */}
      {activeTab === 'all' && (
        <FadeIn delay={0.15}>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by company or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<IoSearch />}
              />
              <Dropdown
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                options={jobTypeOptions}
              />
            </div>
          </Card>
        </FadeIn>
      )}

      {loading ? (
        <Loader />
      ) : activeTab === 'all' ? (
        // All Drives Tab
        drives.length === 0 ? (
          <FadeIn delay={0.2}>
            <Card>
              <div className="text-center py-12">
                <IoBriefcase className="mx-auto text-primary-300 mb-4" size={64} />
                <p className="text-primary-600">No drives available at the moment</p>
              </div>
            </Card>
          </FadeIn>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive, index) => (
                <FadeIn key={drive._id} delay={index * 0.05}>
                  <DriveCard drive={drive} />
                </FadeIn>
              ))}
            </div>

            {totalPages > 1 && (
              <FadeIn delay={0.3}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </FadeIn>
            )}
          </>
        )
      ) : (
        // Applied Drives Tab
        appliedDrives.length === 0 ? (
          <FadeIn delay={0.2}>
            <Card>
              <div className="text-center py-12">
                <IoBriefcase className="mx-auto text-primary-300 mb-4" size={64} />
                <p className="text-primary-600">You haven't applied to any drives yet</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="text-secondary-600 font-medium mt-2 hover:underline"
                >
                  Browse available drives
                </button>
              </div>
            </Card>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appliedDrives.map((application, index) => (
              <FadeIn key={application._id} delay={index * 0.05}>
                <DriveCard drive={application.driveId} application={application} />
              </FadeIn>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default BrowseDrives;
