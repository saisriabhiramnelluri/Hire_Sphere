import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoArrowBack, 
  IoLocation, 
  IoBriefcase, 
  IoCalendar,
  IoPeople,
  IoSchool,
  IoStatsChart
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { driveService } from '../../services/driveService';
import toast from 'react-hot-toast';
import { formatDate, formatCTCRange } from '../../utils/helpers';
import { JOB_TYPE_LABELS, WORK_MODE_LABELS } from '../../utils/constants';

const DriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriveDetails();
    fetchStatistics();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      const response = await driveService.getDriveById(id);
      if (response.success) {
        setDrive(response.data.drive);
      }
    } catch (error) {
      toast.error('Failed to fetch drive details');
      navigate('/recruiter/drives');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await driveService.getDriveStatistics(id);
      if (response.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics');
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!drive) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: statistics?.totalApplications || 0,
      icon: IoStatsChart,
      color: 'bg-blue-500',
    },
    {
      title: 'Shortlisted',
      value: statistics?.shortlisted || 0,
      icon: IoPeople,
      color: 'bg-purple-500',
    },
    {
      title: 'Interviewed',
      value: statistics?.interviewed || 0,
      icon: IoPeople,
      color: 'bg-secondary-500',
    },
    {
      title: 'Offers Made',
      value: statistics?.offered || 0,
      icon: IoStatsChart,
      color: 'bg-accent-500',
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={24} className="text-primary-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-900">{drive.jobTitle}</h1>
              <p className="text-primary-600 mt-1">{drive.companyName}</p>
            </div>
          </div>
          {drive.status === 'published' && (
            <Link to={`/recruiter/drives/${drive._id}/applicants`}>
              <Button>View Applicants</Button>
            </Link>
          )}
        </div>
      </FadeIn>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <Card className="text-center">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <p className="text-3xl font-bold text-primary-900">{stat.value}</p>
                <p className="text-sm text-primary-600 mt-1">{stat.title}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.2}>
            <Card title="Job Overview">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <IoBriefcase className="text-secondary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-primary-600">Job Type</p>
                    <p className="font-semibold text-primary-900">
                      {JOB_TYPE_LABELS[drive.jobType]}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <IoLocation className="text-secondary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-primary-600">Location</p>
                    <p className="font-semibold text-primary-900">{drive.jobLocation}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <IoBriefcase className="text-secondary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-primary-600">Work Mode</p>
                    <p className="font-semibold text-primary-900">
                      {WORK_MODE_LABELS[drive.workMode]}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <IoPeople className="text-secondary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-primary-600">Positions</p>
                    <p className="font-semibold text-primary-900">{drive.positions}</p>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card title="Job Description">
              <p className="text-primary-700 whitespace-pre-line">{drive.jobDescription}</p>
            </Card>
          </FadeIn>

          {drive.skillsRequired && drive.skillsRequired.length > 0 && (
            <FadeIn delay={0.4}>
              <Card title="Required Skills">
                <div className="flex flex-wrap gap-2">
                  {drive.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            </FadeIn>
          )}

          {drive.selectionProcess && drive.selectionProcess.length > 0 && (
            <FadeIn delay={0.5}>
              <Card title="Selection Process">
                <div className="space-y-4">
                  {drive.selectionProcess.map((stage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-primary-900">{stage.stage}</p>
                        {stage.description && (
                          <p className="text-sm text-primary-600 mt-1">{stage.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </FadeIn>
          )}
        </div>

        <div className="space-y-6">
          <FadeIn delay={0.2}>
            <Card>
              <div className="text-center mb-4">
                <span className={`badge ${
                  drive.status === 'published' ? 'badge-success' :
                  drive.status === 'closed' ? 'badge-danger' :
                  drive.status === 'pending' ? 'badge-warning' :
                  'badge-info'
                } text-base`}>
                  {drive.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary-900 mb-4 text-center">
                Compensation
              </h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-700">
                  {formatCTCRange(drive.ctc.min, drive.ctc.max)}
                </p>
                <p className="text-sm text-primary-600 mt-1">per annum</p>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card title="Important Dates">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <IoCalendar className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-primary-600">Application Deadline</p>
                    <p className="font-semibold text-primary-900">
                      {formatDate(drive.applicationDeadline)}
                    </p>
                  </div>
                </div>
                {drive.driveDate && (
                  <div className="flex items-start space-x-3">
                    <IoCalendar className="text-primary-500 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-primary-600">Drive Date</p>
                      <p className="font-semibold text-primary-900">
                        {formatDate(drive.driveDate)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <IoCalendar className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-primary-600">Created On</p>
                    <p className="font-semibold text-primary-900">
                      {formatDate(drive.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.4}>
            <Card title="Eligibility Criteria">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-sm text-primary-700">Minimum CGPA</span>
                  <span className="font-semibold text-primary-900">
                    {drive.eligibilityCriteria.minCGPA}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-sm text-primary-700">Max Backlogs</span>
                  <span className="font-semibold text-primary-900">
                    {drive.eligibilityCriteria.maxBacklogs}
                  </span>
                </div>
                {drive.eligibilityCriteria.minTenthMarks > 0 && (
                  <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                    <span className="text-sm text-primary-700">10th Marks</span>
                    <span className="font-semibold text-primary-900">
                      {drive.eligibilityCriteria.minTenthMarks}%
                    </span>
                  </div>
                )}
                {drive.eligibilityCriteria.minTwelfthMarks > 0 && (
                  <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                    <span className="text-sm text-primary-700">12th Marks</span>
                    <span className="font-semibold text-primary-900">
                      {drive.eligibilityCriteria.minTwelfthMarks}%
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Card title="Eligible Branches">
              <div className="space-y-2">
                {drive.eligibilityCriteria.branches.map((branch, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm text-primary-700"
                  >
                    <IoSchool className="text-secondary-500" size={16} />
                    <span>{branch}</span>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;
