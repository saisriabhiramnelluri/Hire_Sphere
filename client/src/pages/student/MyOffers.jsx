import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoTrophy, IoDownload, IoCheckmarkCircle, IoClose, IoTime, IoDocumentText } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import { offerService } from '../../services/offerService';
import { applicationService } from '../../services/applicationService';
import toast from 'react-hot-toast';
import { formatDate, formatCTC } from '../../utils/helpers';

const MyOffers = () => {
  const [formalOffers, setFormalOffers] = useState([]);
  const [pendingOfferApplications, setPendingOfferApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [respondingOffer, setRespondingOffer] = useState(false);
  const [responseRemarks, setResponseRemarks] = useState('');

  const { isOpen: isAcceptModalOpen, open: openAcceptModal, close: closeAcceptModal } = useModal();
  const { isOpen: isRejectModalOpen, open: openRejectModal, close: closeRejectModal } = useModal();
  const { isOpen: isDetailsModalOpen, open: openDetailsModal, close: closeDetailsModal } = useModal();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);

      // Fetch formal offers
      const offersResponse = await offerService.getMyOffers();
      if (offersResponse.success) {
        setFormalOffers(offersResponse.data.offers || []);
      }

      // Fetch applications with "offered" status
      const applicationsResponse = await applicationService.getMyApplications({ status: 'offered' });
      if (applicationsResponse.success) {
        // Filter out applications that already have formal offers
        const formalOfferAppIds = (offersResponse.data.offers || []).map(o => o.applicationId?._id || o.applicationId);
        const pendingApps = (applicationsResponse.data.applications || []).filter(
          app => !formalOfferAppIds.includes(app._id)
        );
        setPendingOfferApplications(pendingApps);
      }
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToOffer = async (decision) => {
    setRespondingOffer(true);
    try {
      const response = await offerService.respondToOffer(
        selectedOffer._id,
        decision,
        responseRemarks
      );

      if (response.success) {
        toast.success(`Offer ${decision === 'accepted' ? 'accepted' : 'rejected'} successfully`);
        setResponseRemarks('');
        closeAcceptModal();
        closeRejectModal();
        fetchOffers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond to offer');
    } finally {
      setRespondingOffer(false);
    }
  };

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

  const hasAnyOffers = formalOffers.length > 0 || pendingOfferApplications.length > 0;

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">My Offers</h1>
          <p className="text-primary-600 mt-1">View and manage your placement offers</p>
        </div>
      </FadeIn>

      {!hasAnyOffers ? (
        <FadeIn delay={0.1}>
          <Card>
            <div className="text-center py-12">
              <IoTrophy className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600">No offers received yet</p>
              <p className="text-sm text-primary-500 mt-2">
                Keep applying and you'll receive offers soon!
              </p>
            </div>
          </Card>
        </FadeIn>
      ) : (
        <div className="space-y-8">
          {/* Pending Offer Notifications (Applications with 'offered' status but no formal offer yet) */}
          {pendingOfferApplications.length > 0 && (
            <FadeIn delay={0.1}>
              <div>
                <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                  <IoTime className="mr-2 text-yellow-500" />
                  New Offers Received
                </h2>
                <div className="space-y-4">
                  {pendingOfferApplications.map((app, index) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-medium">
                                🎉 Congratulations!
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-primary-900">
                              {app.driveId?.companyName}
                            </h3>
                            <p className="text-primary-700">{app.driveId?.jobTitle}</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-primary-500">Expected CTC</p>
                                <p className="text-sm font-semibold text-primary-900">
                                  {formatCTC(app.driveId?.ctc?.min)} - {formatCTC(app.driveId?.ctc?.max)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-primary-500">Location</p>
                                <p className="text-sm font-semibold text-primary-900">
                                  {app.driveId?.jobLocation}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-primary-500">Offer Date</p>
                                <p className="text-sm font-semibold text-primary-900">
                                  {formatDate(app.updatedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start">
                                <IoDocumentText className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
                                <div>
                                  <p className="text-yellow-800 font-medium">Formal offer letter pending</p>
                                  <p className="text-sm text-yellow-700 mt-1">
                                    The recruiter will send you the formal offer letter with detailed terms soon.
                                    You'll be able to accept or reject once you receive it.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Formal Offers */}
          {formalOffers.length > 0 && (
            <FadeIn delay={0.2}>
              <div>
                <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                  <IoDocumentText className="mr-2 text-secondary-500" />
                  Offer Letters
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {formalOffers.map((offer, index) => (
                    <motion.div
                      key={offer._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-primary-900">
                                  {offer.driveId?.companyName}
                                </h3>
                                <p className="text-lg text-primary-700 mt-1">
                                  {offer.offerDetails?.designation}
                                </p>
                              </div>
                              <span className={`badge ${getStatusBadgeClass(offer.status)} ml-4`}>
                                {offer.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                              <div>
                                <p className="text-xs text-primary-500 mb-1">Package</p>
                                <p className="text-xl font-bold text-accent-600">
                                  {formatCTC(offer.offerDetails?.ctc)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-primary-500 mb-1">Location</p>
                                <p className="text-sm font-semibold text-primary-900">
                                  {offer.offerDetails?.location}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-primary-500 mb-1">Joining Date</p>
                                <p className="text-sm font-semibold text-primary-900">
                                  {formatDate(offer.offerDetails?.joiningDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-primary-500 mb-1">Offer Date</p>
                                <p className="text-sm font-semibold text-primary-900">
                                  {formatDate(offer.createdAt)}
                                </p>
                              </div>
                            </div>

                            {offer.offerLetter?.url && (
                              <a
                                href={offer.offerLetter.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-secondary-600 hover:text-secondary-700 font-medium mb-4"
                              >
                                <IoDownload className="mr-2" />
                                Download Offer Letter
                              </a>
                            )}

                            {offer.status === 'pending' && (
                              <div className="flex flex-wrap gap-3 mt-4">
                                <Button
                                  icon={<IoCheckmarkCircle />}
                                  variant="success"
                                  onClick={() => {
                                    setSelectedOffer(offer);
                                    openAcceptModal();
                                  }}
                                >
                                  Accept Offer
                                </Button>
                                <Button
                                  icon={<IoClose />}
                                  variant="danger"
                                  onClick={() => {
                                    setSelectedOffer(offer);
                                    openRejectModal();
                                  }}
                                >
                                  Reject Offer
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedOffer(offer);
                                    openDetailsModal();
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            )}

                            {offer.status === 'accepted' && (
                              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-green-800 font-medium">
                                  🎉 Congratulations! You've accepted this offer.
                                </p>
                              </div>
                            )}

                            {offer.status === 'rejected' && offer.studentRemarks && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-primary-500 mb-1">Your Remarks</p>
                                <p className="text-sm text-primary-700">{offer.studentRemarks}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      )}

      <Modal isOpen={isAcceptModalOpen} onClose={closeAcceptModal} title="Accept Offer">
        <div className="space-y-4">
          <p className="text-primary-700">
            Are you sure you want to accept the offer from{' '}
            <strong>{selectedOffer?.driveId?.companyName}</strong>?
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              By accepting this offer, you confirm your commitment to join the company. This
              action cannot be undone.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={responseRemarks}
              onChange={(e) => setResponseRemarks(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="Add any comments..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeAcceptModal}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => handleRespondToOffer('accepted')}
              loading={respondingOffer}
              disabled={respondingOffer}
            >
              Accept Offer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} title="Reject Offer">
        <div className="space-y-4">
          <p className="text-primary-700">
            Are you sure you want to reject the offer from{' '}
            <strong>{selectedOffer?.driveId?.companyName}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={responseRemarks}
              onChange={(e) => setResponseRemarks(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Please provide a reason..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRespondToOffer('rejected')}
              loading={respondingOffer}
              disabled={respondingOffer || !responseRemarks.trim()}
            >
              Reject Offer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="Offer Details" size="lg">
        {selectedOffer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                <h3 className="text-sm font-medium text-primary-600">Package</h3>
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
              <div>
                <h3 className="text-sm font-medium text-primary-600">Bond Period</h3>
                <p className="text-primary-900">
                  {selectedOffer.offerDetails?.bondDuration ? `${selectedOffer.offerDetails.bondDuration} months` : 'No bond'}
                </p>
              </div>
            </div>

            {selectedOffer.offerDetails?.benefits?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-primary-600 mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOffer.offerDetails.benefits.map((benefit, idx) => (
                    <span key={idx} className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyOffers;
