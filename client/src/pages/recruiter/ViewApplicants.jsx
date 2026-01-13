import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoArrowBack,
  IoSearch,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoDownload,
  IoPerson,
  IoRefresh,
  IoChevronForward,
  IoEye,
  IoDocumentText,
  IoSend,
  IoVideocam
} from 'react-icons/io5';
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
import { driveService } from '../../services/driveService';
import { offerService } from '../../services/offerService';
import ScheduleInterviewModal from '../../components/interview/ScheduleInterviewModal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

// Generate a slug from stage name
const generateStatusSlug = (stageName) => {
  return stageName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const ViewApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [driveInfo, setDriveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const { isOpen: isRejectModalOpen, open: openRejectModal, close: closeRejectModal } = useModal();
  const { isOpen: isDetailsModalOpen, open: openDetailsModal, close: closeDetailsModal } = useModal();
  const { isOpen: isOfferModalOpen, open: openOfferModal, close: closeOfferModal } = useModal();
  const { isOpen: isInterviewModalOpen, open: openInterviewModal, close: closeInterviewModal } = useModal();

  // Offer form state
  const [offerFormData, setOfferFormData] = useState({
    designation: '',
    ctc: '',
    joiningDate: '',
    location: '',
    bondDuration: '0',
    benefits: '',
    validUntil: '',
  });
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [sendingOffer, setSendingOffer] = useState(false);

  // Generate dynamic status options based on drive's hiring pipeline
  const pipelineStatuses = useMemo(() => {
    if (!driveInfo?.selectionProcess?.length) return [];

    return driveInfo.selectionProcess
      .filter(stage => stage.stage && stage.stage.trim())
      .map((stage, index) => ({
        value: generateStatusSlug(stage.stage),
        label: stage.stage,
        order: index,
      }));
  }, [driveInfo]);

  // Get status display info
  const getStatusInfo = (status, rejectedAtStage) => {
    if (status === 'rejected') {
      const stageName = rejectedAtStage ?
        (pipelineStatuses.find(s => s.value === rejectedAtStage)?.label || rejectedAtStage) :
        'Unknown';
      return {
        label: `Rejected at ${stageName}`,
        color: 'badge-danger',
        isRejected: true
      };
    }
    if (status === 'applied') return { label: 'Applied', color: 'badge-warning' };
    if (status === 'offered') return { label: 'Offered', color: 'badge-success' };
    if (status === 'withdrawn') return { label: 'Withdrawn', color: 'badge-secondary' };

    const pipelineStatus = pipelineStatuses.find(s => s.value === status);
    if (pipelineStatus) {
      return { label: pipelineStatus.label, color: 'badge-info' };
    }

    return { label: status || 'Unknown', color: 'badge-secondary' };
  };

  // Get next stage for an applicant
  const getNextStage = (currentStatus) => {
    if (currentStatus === 'applied' && pipelineStatuses.length > 0) {
      return pipelineStatuses[0];
    }
    const currentIndex = pipelineStatuses.findIndex(s => s.value === currentStatus);
    if (currentIndex >= 0 && currentIndex < pipelineStatuses.length - 1) {
      return pipelineStatuses[currentIndex + 1];
    }
    if (currentIndex === pipelineStatuses.length - 1) {
      return { value: 'offered', label: 'Offered' };
    }
    return null;
  };

  // Check if applicant can be advanced
  const canAdvance = (status) => {
    return status !== 'offered' && status !== 'rejected' && status !== 'withdrawn';
  };

  // All status options for filtering
  const statusOptions = useMemo(() => {
    const options = [{ value: '', label: 'All Status' }];
    options.push({ value: 'applied', label: 'Applied' });

    pipelineStatuses.forEach(status => {
      options.push({ value: status.value, label: status.label });
    });

    options.push({ value: 'offered', label: 'Offered' });
    options.push({ value: 'rejected', label: 'Rejected' });

    return options;
  }, [pipelineStatuses]);

  useEffect(() => {
    fetchDriveInfo();
  }, [id]);

  useEffect(() => {
    if (driveInfo) {
      fetchApplicants();
    }
  }, [id, currentPage, statusFilter, driveInfo]);

  const fetchDriveInfo = async () => {
    try {
      const response = await driveService.getDriveById(id);
      if (response.success) {
        setDriveInfo(response.data.drive);
      }
    } catch (error) {
      toast.error('Failed to fetch drive information');
      navigate('/recruiter/drives');
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const response = await applicationService.getApplicants(id, params);
      if (response.success) {
        setApplicants(response.data.applications || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  // APPROVE - Move to next stage
  const handleApprove = async (applicant) => {
    const nextStage = getNextStage(applicant.status);
    if (!nextStage) {
      toast.error('Cannot determine next stage');
      return;
    }

    setProcessingId(applicant._id);
    try {
      const response = await applicationService.updateApplicationStatus(
        applicant._id,
        nextStage.value,
        `Approved and moved to ${nextStage.label}`
      );
      if (response.success) {
        toast.success(`Approved! Moved to: ${nextStage.label}`);
        fetchApplicants();
      }
    } catch (error) {
      toast.error('Failed to approve applicant');
    } finally {
      setProcessingId(null);
    }
  };

  // REJECT - Open rejection modal
  const handleRejectClick = (applicant) => {
    setSelectedApplicant(applicant);
    setRejectionReason('');
    openRejectModal();
  };

  // Confirm rejection
  const handleRejectConfirm = async () => {
    if (!selectedApplicant) return;

    setProcessingId(selectedApplicant._id);
    try {
      const response = await applicationService.rejectApplicants(
        [selectedApplicant._id],
        rejectionReason || `Rejected at ${getStatusInfo(selectedApplicant.status).label} stage`
      );
      if (response.success) {
        toast.success('Applicant rejected');
        closeRejectModal();
        setSelectedApplicant(null);
        setRejectionReason('');
        fetchApplicants();
      }
    } catch (error) {
      toast.error('Failed to reject applicant');
    } finally {
      setProcessingId(null);
    }
  };

  // Open send offer modal
  const handleSendOfferClick = (applicant) => {
    setSelectedApplicant(applicant);
    setOfferFormData({
      designation: driveInfo?.jobTitle || '',
      ctc: driveInfo?.ctc?.min?.toString() || '',
      joiningDate: '',
      location: driveInfo?.jobLocation || '',
      bondDuration: '0',
      benefits: '',
      validUntil: '',
    });
    setOfferLetterFile(null);
    openOfferModal();
  };

  // Send offer letter
  const handleSendOffer = async () => {
    if (!selectedApplicant) return;

    if (!offerFormData.designation || !offerFormData.ctc || !offerFormData.joiningDate ||
      !offerFormData.location || !offerFormData.validUntil) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!offerLetterFile) {
      toast.error('Please upload the offer letter document');
      return;
    }

    setSendingOffer(true);
    try {
      const formData = new FormData();
      formData.append('offerLetter', offerLetterFile);
      formData.append('designation', offerFormData.designation);
      formData.append('ctc', offerFormData.ctc);
      formData.append('joiningDate', offerFormData.joiningDate);
      formData.append('location', offerFormData.location);
      formData.append('bondDuration', offerFormData.bondDuration || '0');
      formData.append('validUntil', offerFormData.validUntil);
      if (offerFormData.benefits) {
        formData.append('benefits', JSON.stringify(offerFormData.benefits.split(',').map(b => b.trim())));
      }

      const response = await offerService.createOffer(selectedApplicant._id, formData);
      if (response.success) {
        toast.success('Offer letter sent successfully!');
        closeOfferModal();
        setSelectedApplicant(null);
        fetchApplicants();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send offer');
    } finally {
      setSendingOffer(false);
    }
  };

  const filteredApplicants = applicants.filter((app) =>
    app.studentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.studentId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.studentId?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-primary-900">Applicants</h1>
              {driveInfo && (
                <p className="text-primary-600 mt-1">{driveInfo.jobTitle} - {driveInfo.companyName}</p>
              )}
            </div>
          </div>
          <Button icon={<IoRefresh />} variant="secondary" onClick={fetchApplicants}>
            Refresh
          </Button>
        </div>
      </FadeIn>

      {/* Hiring Pipeline Visualization */}
      {pipelineStatuses.length > 0 && (
        <FadeIn delay={0.05}>
          <Card>
            <h3 className="text-sm font-medium text-primary-700 mb-3">Hiring Pipeline</h3>
            <div className="flex items-center flex-wrap gap-2">
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                1. Applied
              </span>
              <IoChevronForward className="text-primary-400" />
              {pipelineStatuses.map((stage, index) => (
                <React.Fragment key={stage.value}>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {index + 2}. {stage.label}
                  </span>
                  <IoChevronForward className="text-primary-400" />
                </React.Fragment>
              ))}
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                ✓ Offered
              </span>
            </div>
            <p className="text-xs text-primary-500 mt-3">
              Use <span className="text-green-600 font-medium">✓ Approve</span> to move applicants to the next stage,
              or <span className="text-red-600 font-medium">✗ Reject</span> to reject them at their current stage.
            </p>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <Card>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<IoSearch />}
              />
              <Dropdown
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={statusOptions}
              />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <IoPerson className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600">No applicants found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-200">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Branch / CGPA
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Current Stage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Next Stage
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-primary-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-primary-200">
                    {filteredApplicants.map((app, index) => {
                      const statusInfo = getStatusInfo(app.status, app.rejectedAtStage);
                      const nextStage = getNextStage(app.status);
                      const isProcessing = processingId === app._id;
                      const showAdvanceActions = canAdvance(app.status);
                      const showOfferAction = app.status === 'offered';

                      return (
                        <motion.tr
                          key={app._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-primary-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-900">
                              {app.studentId?.firstName} {app.studentId?.lastName}
                            </div>
                            <div className="text-xs text-primary-500">
                              {app.studentId?.studentId}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-900">{app.studentId?.branch}</div>
                            <div className="text-xs text-primary-500">
                              CGPA: {app.studentId?.cgpa || app.studentId?.academicDetails?.currentCGPA || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`badge ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {nextStage && showAdvanceActions ? (
                              <span className="text-sm text-primary-600">
                                → {nextStage.label}
                              </span>
                            ) : showOfferAction ? (
                              <span className="text-xs text-green-600 font-medium">Send Offer Letter</span>
                            ) : (
                              <span className="text-xs text-primary-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-2">
                              {showAdvanceActions && (
                                <>
                                  {/* APPROVE Button */}
                                  <button
                                    onClick={() => handleApprove(app)}
                                    disabled={isProcessing}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                                    title={`Approve → ${nextStage?.label}`}
                                  >
                                    <IoCheckmarkCircle size={16} className="mr-1" />
                                    Approve
                                  </button>
                                  {/* REJECT Button */}
                                  <button
                                    onClick={() => handleRejectClick(app)}
                                    disabled={isProcessing}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                    title="Reject at current stage"
                                  >
                                    <IoCloseCircle size={16} className="mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {/* SEND OFFER Button for 'offered' status */}
                              {showOfferAction && (
                                <button
                                  onClick={() => handleSendOfferClick(app)}
                                  className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-secondary-600 hover:bg-secondary-700 rounded-lg transition-colors"
                                  title="Send Offer Letter"
                                >
                                  <IoDocumentText size={16} className="mr-1" />
                                  Send Offer
                                </button>
                              )}
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setSelectedApplicant(app);
                                  openDetailsModal();
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <IoEye size={18} />
                              </button>
                              {/* Schedule Interview - show for interview stages */}
                              {showAdvanceActions && app.status?.includes('interview') && (
                                <button
                                  onClick={() => {
                                    setSelectedApplicant(app);
                                    openInterviewModal();
                                  }}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Schedule Video Interview"
                                >
                                  <IoVideocam size={18} />
                                </button>
                              )}
                              {/* Download Resume */}
                              {app.studentId?.resumes?.[0]?.url && (
                                <a
                                  href={app.studentId.resumes[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Download Resume"
                                >
                                  <IoDownload size={18} />
                                </a>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
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

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} title="Reject Applicant">
        {selectedApplicant && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                You are about to reject <strong>{selectedApplicant.studentId?.firstName} {selectedApplicant.studentId?.lastName}</strong> at the
                <strong className="ml-1">{getStatusInfo(selectedApplicant.status).label}</strong> stage.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="Provide feedback for the candidate..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={closeRejectModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectConfirm}
                disabled={processingId === selectedApplicant._id}
                loading={processingId === selectedApplicant._id}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Send Offer Letter Modal */}
      <Modal isOpen={isOfferModalOpen} onClose={closeOfferModal} title="Send Offer Letter" size="lg">
        {selectedApplicant && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                Sending offer to: <strong>{selectedApplicant.studentId?.firstName} {selectedApplicant.studentId?.lastName}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Designation"
                value={offerFormData.designation}
                onChange={(e) => setOfferFormData({ ...offerFormData, designation: e.target.value })}
                placeholder="e.g., Software Engineer"
                required
              />
              <Input
                label="CTC (LPA)"
                type="number"
                value={offerFormData.ctc}
                onChange={(e) => setOfferFormData({ ...offerFormData, ctc: e.target.value })}
                placeholder="e.g., 12"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Joining Date"
                type="date"
                value={offerFormData.joiningDate}
                onChange={(e) => setOfferFormData({ ...offerFormData, joiningDate: e.target.value })}
                required
              />
              <Input
                label="Location"
                value={offerFormData.location}
                onChange={(e) => setOfferFormData({ ...offerFormData, location: e.target.value })}
                placeholder="e.g., Bangalore"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bond Duration (months)"
                type="number"
                value={offerFormData.bondDuration}
                onChange={(e) => setOfferFormData({ ...offerFormData, bondDuration: e.target.value })}
                placeholder="0 if no bond"
              />
              <Input
                label="Offer Valid Until"
                type="date"
                value={offerFormData.validUntil}
                onChange={(e) => setOfferFormData({ ...offerFormData, validUntil: e.target.value })}
                required
              />
            </div>

            <Input
              label="Benefits (comma-separated)"
              value={offerFormData.benefits}
              onChange={(e) => setOfferFormData({ ...offerFormData, benefits: e.target.value })}
              placeholder="e.g., Health Insurance, Stock Options, Flexible Hours"
            />

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Offer Letter (PDF) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setOfferLetterFile(e.target.files[0])}
                className="input-field"
              />
              {offerLetterFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {offerLetterFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={closeOfferModal}>
                Cancel
              </Button>
              <Button
                icon={<IoSend />}
                onClick={handleSendOffer}
                loading={sendingOffer}
                disabled={sendingOffer}
              >
                Send Offer Letter
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Applicant Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="Applicant Details" size="lg">
        {selectedApplicant && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-primary-600">Name</h3>
                <p className="text-primary-900 font-semibold">
                  {selectedApplicant.studentId?.firstName} {selectedApplicant.studentId?.lastName}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Student ID</h3>
                <p className="text-primary-900">{selectedApplicant.studentId?.studentId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Branch</h3>
                <p className="text-primary-900">{selectedApplicant.studentId?.branch}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">CGPA</h3>
                <p className="text-primary-900">
                  {selectedApplicant.studentId?.cgpa || selectedApplicant.studentId?.academicDetails?.currentCGPA || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Email</h3>
                <p className="text-primary-900">{selectedApplicant.studentId?.email || selectedApplicant.studentId?.userId?.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Phone</h3>
                <p className="text-primary-900">{selectedApplicant.studentId?.phone || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-primary-600 mb-2">Current Stage</h3>
              <span className={`badge ${getStatusInfo(selectedApplicant.status, selectedApplicant.rejectedAtStage).color}`}>
                {getStatusInfo(selectedApplicant.status, selectedApplicant.rejectedAtStage).label}
              </span>
            </div>

            {selectedApplicant.studentId?.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-primary-600 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.studentId.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedApplicant.timeline?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-primary-600 mb-2">Application Timeline</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedApplicant.timeline.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${entry.status === 'rejected' ? 'bg-red-500' : 'bg-secondary-500'}`}></div>
                      <div>
                        <p className="font-medium text-primary-900">
                          {getStatusInfo(entry.status, selectedApplicant.rejectedAtStage).label}
                        </p>
                        {entry.remarks && <p className="text-sm text-primary-600">{entry.remarks}</p>}
                        <p className="text-xs text-primary-500">{formatDate(entry.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedApplicant.studentId?.resumes?.[0]?.url && (
              <div>
                <h3 className="text-sm font-medium text-primary-600 mb-2">Resume</h3>
                <a
                  href={selectedApplicant.studentId.resumes[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-secondary-600 hover:underline"
                >
                  <IoDownload className="mr-2" />
                  Download Resume
                </a>
              </div>
            )}

            {/* Actions in modal */}
            {canAdvance(selectedApplicant.status) && (
              <div className="pt-4 border-t border-primary-200">
                <div className="flex space-x-3">
                  <Button
                    icon={<IoCheckmarkCircle />}
                    onClick={() => {
                      handleApprove(selectedApplicant);
                      closeDetailsModal();
                    }}
                    disabled={processingId === selectedApplicant._id}
                  >
                    Approve → {getNextStage(selectedApplicant.status)?.label}
                  </Button>
                  <Button
                    variant="danger"
                    icon={<IoCloseCircle />}
                    onClick={() => {
                      closeDetailsModal();
                      handleRejectClick(selectedApplicant);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {selectedApplicant.status === 'offered' && (
              <div className="pt-4 border-t border-primary-200">
                <Button
                  icon={<IoDocumentText />}
                  onClick={() => {
                    closeDetailsModal();
                    handleSendOfferClick(selectedApplicant);
                  }}
                >
                  Send Offer Letter
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={closeInterviewModal}
        application={selectedApplicant}
        onSuccess={(interview) => {
          toast.success(`Interview scheduled! Room ID: ${interview.roomId}`);
          closeInterviewModal();
        }}
      />
    </div>
  );
};

export default ViewApplicants;
