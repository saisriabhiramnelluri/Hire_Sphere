import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoSearch, IoAdd, IoBriefcase, IoEye, IoClose, IoCreate } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import { useDebounce } from '../../hooks/useDebounce';
import { driveService } from '../../services/driveService';
import toast from 'react-hot-toast';
import { formatDate, formatCTCRange } from '../../utils/helpers';
import { JOB_TYPE_LABELS } from '../../utils/constants';

const MyDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDrive, setSelectedDrive] = useState(null);

  const { isOpen: isCloseModalOpen, open: openCloseModal, close: closeCloseModal } = useModal();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchDrives();
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: debouncedSearchTerm,
      };

      const response = await driveService.getMyDrives(params);
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

  const handleCloseDrive = async () => {
    try {
      const response = await driveService.closeDrive(selectedDrive._id);
      if (response.success) {
        toast.success('Drive closed successfully');
        closeCloseModal();
        fetchDrives();
      }
    } catch (error) {
      toast.error('Failed to close drive');
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'published', label: 'Published' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'closed', label: 'Closed' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'closed':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      case 'ongoing':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'published':
        return 'Published';
      case 'ongoing':
        return 'Ongoing';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">My Drives</h1>
            <p className="text-primary-600 mt-1">Manage your placement drives</p>
          </div>
          <Link to="/recruiter/create-drive">
            <Button icon={<IoAdd />}>Create New Drive</Button>
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Search by job title..."
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
          ) : drives.length === 0 ? (
            <div className="text-center py-12">
              <IoBriefcase className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600 mb-4">No drives found</p>
              <Link to="/recruiter/create-drive">
                <Button icon={<IoAdd />}>Create Your First Drive</Button>
              </Link>
            </div>
          ) : (
            <>
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
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-primary-900">
                              {drive.jobTitle}
                            </h3>
                            <p className="text-primary-600 text-sm mt-1">{drive.companyName}</p>
                          </div>
                          <span className={`badge ${getStatusBadgeClass(drive.status)} ml-4`}>
                            {getStatusLabel(drive.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-primary-500">Job Type</p>
                            <p className="text-sm font-semibold text-primary-900">
                              {JOB_TYPE_LABELS[drive.jobType]}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-500">CTC</p>
                            <p className="text-sm font-semibold text-primary-900">
                              {formatCTCRange(drive.ctc.min, drive.ctc.max)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-500">Applications</p>
                            <p className="text-sm font-semibold text-primary-900">
                              {drive.applicationsCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-500">Deadline</p>
                            <p className="text-sm font-semibold text-primary-900">
                              {formatDate(drive.applicationDeadline)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Link to={`/recruiter/drives/${drive._id}`}>
                            <Button size="sm" icon={<IoEye />}>
                              View
                            </Button>
                          </Link>
                          {drive.status !== 'closed' && (
                            <Link to={`/recruiter/drives/${drive._id}/edit`}>
                              <Button size="sm" variant="secondary" icon={<IoCreate />}>
                                Edit
                              </Button>
                            </Link>
                          )}
                          {(drive.status === 'published' || drive.status === 'ongoing') && (
                            <Link to={`/recruiter/drives/${drive._id}/applicants`}>
                              <Button size="sm" variant="secondary">
                                Applicants ({drive.applicationsCount || 0})
                              </Button>
                            </Link>
                          )}
                          {(drive.status === 'published' || drive.status === 'ongoing') && (
                            <Button
                              size="sm"
                              variant="danger"
                              icon={<IoClose />}
                              onClick={() => {
                                setSelectedDrive(drive);
                                openCloseModal();
                              }}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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

      <Modal isOpen={isCloseModalOpen} onClose={closeCloseModal} title="Close Drive">
        <div className="space-y-4">
          <p className="text-primary-700">
            Are you sure you want to close <strong>{selectedDrive?.jobTitle}</strong>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Closing the drive will prevent new applications. Existing applications will remain accessible.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeCloseModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCloseDrive}>
              Close Drive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyDrives;
