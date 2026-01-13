import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoArrowBack, 
  IoLocation, 
  IoBriefcase, 
  IoCalendar,
  IoCheckmarkCircle,
  IoPeople,
  IoSchool,
  IoTime
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import { driveService } from '../../services/driveService';
import { applicationService } from '../../services/applicationService';
import toast from 'react-hot-toast';
import { formatDate, formatCTCRange } from '../../utils/helpers';
import { JOB_TYPE_LABELS, WORK_MODE_LABELS } from '../../utils/constants';

const DriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const { isOpen: isApplyModalOpen, open: openApplyModal, close: closeApplyModal } = useModal();

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      const response = await driveService.getDriveById(id);
      if (response.success) {
        setDrive(response.data.drive);
        setHasApplied(response.data.hasApplied || false);
      }
    } catch (error) {
      toast.error('Failed to fetch drive details');
      navigate('/student/drives');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await applicationService.createApplication({
        driveId: id,
      });

      if (response.success) {
        toast.success('Application submitted successfully!');
        setHasApplied(true);
        closeApplyModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!drive) {
    return null;
  }

  const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();
  const canApply = !hasApplied && !isDeadlinePassed && drive.status === 'published';

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
              <h1 className="text-3xl font-bold text-primary-900">{drive.companyName}</h1>
              <p className="text-primary-600 mt-1">{drive.jobTitle}</p>
            </div>
          </div>
          {canApply && (
            <Button onClick={openApplyModal} icon={<IoCheckmarkCircle />}>
              Apply Now
            </Button>
          )}
          {hasApplied && (
            <div className="flex items-center space-x-2 text-accent-600">
              <IoCheckmarkCircle size={24} />
              <span className="font-medium">Already Applied</span>
            </div>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.1}>
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

          <FadeIn delay={0.2}>
            <Card title="Job Description">
              <p className="text-primary-700 whitespace-pre-line">{drive.jobDescription}</p>
            </Card>
          </FadeIn>

          {drive.skillsRequired && drive.skillsRequired.length > 0 && (
            <FadeIn delay={0.3}>
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
            <FadeIn delay={0.4}>
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
          <FadeIn delay={0.1}>
            <Card className="bg-gradient-to-br from-secondary-50 to-accent-50">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Compensation</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-700">
                  {formatCTCRange(drive.ctc.min, drive.ctc.max)}
                </p>
                <p className="text-sm text-primary-600 mt-1">per annum</p>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
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
                    <IoTime className="text-primary-500 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-primary-600">Drive Date</p>
                      <p className="font-semibold text-primary-900">
                        {formatDate(drive.driveDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
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

          <FadeIn delay={0.4}>
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

      <Modal isOpen={isApplyModalOpen} onClose={closeApplyModal} title="Confirm Application">
        <div className="space-y-4">
          <p className="text-primary-700">
            Are you sure you want to apply for <strong>{drive.jobTitle}</strong> at{' '}
            <strong>{drive.companyName}</strong>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Please ensure you meet all eligibility criteria before applying. Once submitted,
              you cannot withdraw your application.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeApplyModal}>
              Cancel
            </Button>
            <Button onClick={handleApply} loading={applying} disabled={applying}>
              Confirm & Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DriveDetails;
