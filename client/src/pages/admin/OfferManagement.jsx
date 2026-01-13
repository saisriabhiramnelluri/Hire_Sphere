import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoClose, IoDownload, IoEye } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate, formatCTC } from '../../utils/helpers';

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const { isOpen: isViewModalOpen, open: openViewModal, close: closeViewModal } = useModal();

  useEffect(() => {
    fetchOffers();
  }, [currentPage, statusFilter]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/offers', {
        params: {
          page: currentPage,
          limit: 10,
          status: statusFilter,
        },
      });
      if (response.success) {
        setOffers(response.data.offers || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Offer Management</h1>
            <p className="text-primary-600 mt-1">Track and manage all placement offers</p>
          </div>
          <Button icon={<IoDownload />} variant="secondary">
            Export Report
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Search by student or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Dropdown
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>

          <div className="overflow-x-auto">
            {offers.length === 0 ? (
              <div className="text-center py-12 text-primary-500">
                No offers found
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-primary-200">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        CTC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Offer Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-primary-200">
                    {offers.map((offer, index) => (
                      <motion.tr
                        key={offer._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-primary-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-900">
                            {offer.studentId?.firstName} {offer.studentId?.lastName}
                          </div>
                          <div className="text-sm text-primary-500">
                            {offer.studentId?.studentId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                          {offer.driveId?.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                          {offer.offerDetails?.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-900">
                          {formatCTC(offer.offerDetails?.ctc)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getStatusBadgeClass(offer.status)}`}>
                            {offer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                          {formatDate(offer.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              openViewModal();
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <IoEye size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

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
          </div>
        </Card>
      </FadeIn>

      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} title="Offer Details" size="lg">
        {selectedOffer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-primary-600">Student</h3>
                <p className="text-primary-900 font-semibold">
                  {selectedOffer.studentId?.firstName} {selectedOffer.studentId?.lastName}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Company</h3>
                <p className="text-primary-900 font-semibold">
                  {selectedOffer.driveId?.companyName}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Position</h3>
                <p className="text-primary-900">{selectedOffer.offerDetails?.designation}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">CTC</h3>
                <p className="text-primary-900 font-semibold">
                  {formatCTC(selectedOffer.offerDetails?.ctc)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Location</h3>
                <p className="text-primary-900">{selectedOffer.offerDetails?.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-600">Joining Date</h3>
                <p className="text-primary-900">
                  {formatDate(selectedOffer.offerDetails?.joiningDate)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-primary-600 mb-2">Status</h3>
              <span className={`badge ${getStatusBadgeClass(selectedOffer.status)}`}>
                {selectedOffer.status}
              </span>
            </div>

            {selectedOffer.offerLetter?.url && (
              <div>
                <h3 className="text-sm font-medium text-primary-600 mb-2">Offer Letter</h3>
                <a
                  href={selectedOffer.offerLetter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-600 hover:underline inline-flex items-center"
                >
                  <IoDownload className="mr-2" />
                  Download Offer Letter
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfferManagement;
