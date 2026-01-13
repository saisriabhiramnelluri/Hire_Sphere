import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoCheckmarkCircle, IoClose, IoFilter } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { applicationService } from '../../services/applicationService';
import toast from 'react-hot-toast';

const ShortlistCandidates = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [filters, setFilters] = useState({
    minCGPA: '',
    maxBacklogs: '',
    branch: '',
  });

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getApplicants(id, {
        status: 'applied',
        ...filters,
      });
      if (response.success) {
        setApplicants(response.data.applicants);
      }
    } catch (error) {
      toast.error('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplicant = (applicantId) => {
    setSelectedApplicants((prev) =>
      prev.includes(applicantId)
        ? prev.filter((id) => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map((app) => app._id));
    }
  };

  const handleShortlist = async () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    try {
      const response = await applicationService.shortlistApplicants(selectedApplicants);
      if (response.success) {
        toast.success(`${selectedApplicants.length} candidates shortlisted successfully!`);
        navigate(`/recruiter/drives/${id}/applicants`);
      }
    } catch (error) {
      toast.error('Failed to shortlist candidates');
    }
  };

  const handleApplyFilters = () => {
    fetchApplicants();
  };

  if (loading) {
    return <Loader fullScreen />;
  }

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
              <h1 className="text-3xl font-bold text-primary-900">Shortlist Candidates</h1>
              <p className="text-primary-600 mt-1">Select candidates to move forward</p>
            </div>
          </div>
          {selectedApplicants.length > 0 && (
            <Button icon={<IoCheckmarkCircle />} onClick={handleShortlist}>
              Shortlist {selectedApplicants.length} Candidate(s)
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card title="Filter Candidates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Minimum CGPA"
              type="number"
              step="0.01"
              value={filters.minCGPA}
              onChange={(e) => setFilters({ ...filters, minCGPA: e.target.value })}
              placeholder="e.g., 7.0"
            />
            <Input
              label="Maximum Backlogs"
              type="number"
              value={filters.maxBacklogs}
              onChange={(e) => setFilters({ ...filters, maxBacklogs: e.target.value })}
              placeholder="e.g., 0"
            />
            <div className="flex items-end">
              <Button icon={<IoFilter />} onClick={handleApplyFilters} fullWidth>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-primary-600">
              Showing {applicants.length} candidate(s) • {selectedApplicants.length} selected
            </p>
            <button
              onClick={handleSelectAll}
              className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
            >
              {selectedApplicants.length === applicants.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-primary-600">No candidates match the criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applicants.map((app, index) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectApplicant(app._id)}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedApplicants.includes(app._id)
                      ? 'border-secondary-500 bg-secondary-50'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedApplicants.includes(app._id)
                          ? 'bg-secondary-500 border-secondary-500'
                          : 'border-primary-300'
                      }`}
                    >
                      {selectedApplicants.includes(app._id) && (
                        <IoCheckmarkCircle className="text-white" size={16} />
                      )}
                    </div>
                  </div>

                  <div className="pr-8">
                    <h3 className="font-semibold text-primary-900 mb-1">
                      {app.studentId?.firstName} {app.studentId?.lastName}
                    </h3>
                    <p className="text-sm text-primary-600 mb-3">{app.studentId?.studentId}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-600">Branch:</span>
                        <span className="font-medium text-primary-900">
                          {app.studentId?.branch}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-600">CGPA:</span>
                        <span className="font-medium text-primary-900">
                          {app.studentId?.academicDetails?.currentCGPA}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-600">Backlogs:</span>
                        <span className="font-medium text-primary-900">
                          {app.studentId?.academicDetails?.activeBacklogs || 0}
                        </span>
                      </div>
                    </div>

                    {app.studentId?.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {app.studentId.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.studentId.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                            +{app.studentId.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
};

export default ShortlistCandidates;
