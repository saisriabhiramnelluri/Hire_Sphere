import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoClose, IoEye } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate, formatCTCRange } from '../../utils/helpers';

const ManageDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { isOpen: isViewModalOpen, open: openViewModal, close: closeViewModal } = useModal();
  const { isOpen: isRejectModalOpen, open: openRejectModal, close: closeRejectModal } = useModal();

  useEffect(() => {
    fetchPendingDrives();
  }, [currentPage]);

  const fetchPendingDrives = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/drives/pending');
      if (response.success) {
        setDrives(response.data.drives);
      }
    } catch (error) {
      toast.error('Failed to fetch pending drives');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDrive = async (driveId) => {
    try {
      const response = await api.patch(`/admin/drives/${driveId}/approve`);
      if (response.success) {
        toast.success('Drive approved successfully');
        fetchPendingDrives();
      }
    } catch (error) {
      toast.error('Failed to approve drive');
    }
  };

  const handleRejectDrive = async () => {
    try {
      const response = await api.patch(`/admin/drives/${selectedDrive._id}/reject`, {
        reason: rejectionReason,
      });
      if (response.success) {
        toast.success('Drive rejected successfully');
        closeRejectModal();
        setRejectionReason('');
        fetchPendingDrives();
      }
    } catch (error) {
      toast.error('Failed to reject drive');
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Manage Drives</h1>
          <p className="text-primary-600 mt-1">Review and approve placement drives</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          {drives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-primary-500">No pending drives for approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drives.map((drive, index) => (
                <motion.div
                  key={drive._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-primary-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-primary-900">
                          {drive.companyName}
                        </h3>
                        <span className="badge badge-info">{drive.jobType}</span>
                      </div>
                      <p className="text-primary-700 font-medium mb-3">{drive.jobTitle}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-primary-500">CTC</p>
                          <p className="text-sm font-semibold text-primary-900">
                            {formatCTCRange(drive.ctc.min, drive.ctc.max)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-500">Location</p>
                          <p className="text-sm font-semibold text-primary-900">{drive.jobLocation}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-500">Positions</p>
                          <p className="text-sm font-semibold text-primary-900">{drive.positions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-500">Deadline</p>
                          <p className="text-sm font-semibold text-primary-900">
                            {formatDate(drive.applicationDeadline)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-primary-500 mb-1">Eligibility</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            CGPA ≥ {drive.eligibilityCriteria.minCGPA}
                          </span>
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            Backlogs ≤ {drive.eligibilityCriteria.maxBacklogs}
                          </span>
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            {drive.eligibilityCriteria.branches.length} Branches
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedDrive(drive);
                          openViewModal();
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <IoEye size={20} />
                      </button>
                      <button
                        onClick={() => handleApproveDrive(drive._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <IoCheckmarkCircle size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDrive(drive);
                          openRejectModal();
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <IoClose size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>

      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} title="Drive Details" size="lg">
        {selectedDrive && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">Company Information</h3>
              <div className="bg-primary-50 p-4 rounded-lg space-y-2">
                <p><strong>Company:</strong> {selectedDrive.companyName}</p>
                <p><strong>Position:</strong> {selectedDrive.jobTitle}</p>
                <p><strong>Type:</strong> {selectedDrive.jobType}</p>
                <p><strong>Location:</strong> {selectedDrive.jobLocation}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-primary-900 mb-2">Job Description</h3>
              <p className="text-primary-700 text-sm bg-primary-50 p-4 rounded-lg">
                {selectedDrive.jobDescription}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-primary-900 mb-2">Eligibility Criteria</h3>
              <div className="bg-primary-50 p-4 rounded-lg space-y-2">
                <p><strong>Min CGPA:</strong> {selectedDrive.eligibilityCriteria.minCGPA}</p>
                <p><strong>Max Backlogs:</strong> {selectedDrive.eligibilityCriteria.maxBacklogs}</p>
                <p><strong>Branches:</strong> {selectedDrive.eligibilityCriteria.branches.join(', ')}</p>
                <p><strong>Batches:</strong> {selectedDrive.eligibilityCriteria.allowedBatches.join(', ')}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} title="Reject Drive">
        <div className="space-y-4">
          <p className="text-primary-700">
            Please provide a reason for rejecting this drive:
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Enter rejection reason..."
            required
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleRejectDrive}
              disabled={!rejectionReason.trim()}
            >
              Reject Drive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageDrives;
