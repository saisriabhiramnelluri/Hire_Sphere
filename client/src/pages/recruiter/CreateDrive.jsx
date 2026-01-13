import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoAdd, IoClose } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import DraggableHiringPipeline from '../../components/common/DraggableHiringPipeline';
import FadeIn from '../../components/animations/FadeIn';
import { BRANCHES } from '../../utils/constants';
import { driveService } from '../../services/driveService';
import toast from 'react-hot-toast';
import { validateFutureDate } from '../../utils/validators';

const CreateDrive = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    jobType: '',
    jobLocation: '',
    workMode: 'onsite',
    ctcMin: '',
    ctcMax: '',
    positions: '',
    applicationDeadline: '',
    driveDate: '',
    minCGPA: '',
    maxBacklogs: '0',
    minTenthMarks: '',
    minTwelfthMarks: '',
    branches: [],
    allowedBatches: [],
    skillsRequired: [],
  });

  const [selectionStages, setSelectionStages] = useState([
    { stage: 'Aptitude Test', description: '' },
    { stage: 'Technical Interview', description: '' },
  ]);

  const [currentSkill, setCurrentSkill] = useState('');

  const currentYear = new Date().getFullYear();
  const batchOptions = [
    { value: currentYear, label: `${currentYear}` },
    { value: currentYear + 1, label: `${currentYear + 1}` },
    { value: currentYear + 2, label: `${currentYear + 2}` },
    { value: currentYear + 3, label: `${currentYear + 3}` },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleBranchToggle = (branch) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.includes(branch)
        ? prev.branches.filter((b) => b !== branch)
        : [...prev.branches, branch],
    }));
  };

  const handleBatchToggle = (batch) => {
    setFormData((prev) => ({
      ...prev,
      allowedBatches: prev.allowedBatches.includes(batch)
        ? prev.allowedBatches.filter((b) => b !== batch)
        : [...prev.allowedBatches, batch],
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skillsRequired.includes(currentSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, currentSkill.trim()],
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skill),
    }));
  };

  const addStage = () => {
    setSelectionStages([...selectionStages, { stage: '', description: '' }]);
  };

  const removeStage = (index) => {
    setSelectionStages(selectionStages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index, field, value) => {
    const updated = [...selectionStages];
    updated[index][field] = value;
    setSelectionStages(updated);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.jobDescription.trim()) newErrors.jobDescription = 'Job description is required';
    if (!formData.jobType) newErrors.jobType = 'Job type is required';
    if (!formData.jobLocation.trim()) newErrors.jobLocation = 'Job location is required';
    if (!formData.ctcMin) newErrors.ctcMin = 'Minimum CTC is required';
    if (!formData.positions) newErrors.positions = 'Number of positions is required';
    if (!formData.applicationDeadline) newErrors.applicationDeadline = 'Application deadline is required';
    if (!formData.minCGPA) newErrors.minCGPA = 'Minimum CGPA is required';
    if (formData.branches.length === 0) newErrors.branches = 'Select at least one branch';
    if (formData.allowedBatches.length === 0) newErrors.allowedBatches = 'Select at least one batch';

    const deadlineError = validateFutureDate(formData.applicationDeadline, 'Application deadline');
    if (deadlineError) newErrors.applicationDeadline = deadlineError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const driveData = {
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        jobType: formData.jobType,
        jobLocation: formData.jobLocation,
        workMode: formData.workMode,
        ctc: {
          min: parseFloat(formData.ctcMin),
          max: formData.ctcMax ? parseFloat(formData.ctcMax) : parseFloat(formData.ctcMin),
        },
        positions: parseInt(formData.positions),
        applicationDeadline: formData.applicationDeadline,
        driveDate: formData.driveDate || null,
        eligibilityCriteria: {
          branches: formData.branches,
          minCGPA: parseFloat(formData.minCGPA),
          maxBacklogs: parseInt(formData.maxBacklogs),
          allowedBatches: formData.allowedBatches.map(Number),
          minTenthMarks: formData.minTenthMarks ? parseFloat(formData.minTenthMarks) : 0,
          minTwelfthMarks: formData.minTwelfthMarks ? parseFloat(formData.minTwelfthMarks) : 0,
        },
        selectionProcess: selectionStages.filter((s) => s.stage.trim()),
        skillsRequired: formData.skillsRequired,
      };

      const response = await driveService.createDrive(driveData);
      if (response.success) {
        toast.success('Drive created successfully! Waiting for admin approval.');
        navigate('/recruiter/drives');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <IoArrowBack size={24} className="text-primary-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Create New Drive</h1>
            <p className="text-primary-600 mt-1">Post a new placement drive</p>
          </div>
        </div>
      </FadeIn>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FadeIn delay={0.1}>
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                error={errors.companyName}
                required
              />
              <Input
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                error={errors.jobTitle}
                required
              />
              <Dropdown
                label="Job Type"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                options={[
                  { value: 'full_time', label: 'Full Time' },
                  { value: 'internship', label: 'Internship' },
                  { value: 'both', label: 'Both' },
                ]}
                error={errors.jobType}
                required
              />
              <Input
                label="Job Location"
                name="jobLocation"
                value={formData.jobLocation}
                onChange={handleChange}
                error={errors.jobLocation}
                required
              />
              <Dropdown
                label="Work Mode"
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                options={[
                  { value: 'onsite', label: 'On-site' },
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' },
                ]}
              />
              <Input
                label="Number of Positions"
                name="positions"
                type="number"
                value={formData.positions}
                onChange={handleChange}
                error={errors.positions}
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                className={`input-field min-h-[120px] ${errors.jobDescription ? 'border-red-500' : ''}`}
                placeholder="Enter detailed job description..."
              />
              {errors.jobDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
              )}
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card title="Compensation & Timeline">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Minimum CTC (LPA)"
                name="ctcMin"
                type="number"
                step="0.01"
                value={formData.ctcMin}
                onChange={handleChange}
                error={errors.ctcMin}
                required
              />
              <Input
                label="Maximum CTC (LPA)"
                name="ctcMax"
                type="number"
                step="0.01"
                value={formData.ctcMax}
                onChange={handleChange}
                helperText="Leave blank if same as minimum"
              />
              <Input
                label="Application Deadline"
                name="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleChange}
                error={errors.applicationDeadline}
                required
              />
              <Input
                label="Drive Date"
                name="driveDate"
                type="date"
                value={formData.driveDate}
                onChange={handleChange}
                helperText="Optional"
              />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card title="Eligibility Criteria">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-3">
                  Eligible Branches <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BRANCHES.map((branch) => (
                    <label key={branch} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.branches.includes(branch)}
                        onChange={() => handleBranchToggle(branch)}
                        className="rounded border-primary-300 text-secondary-500 focus:ring-secondary-500"
                      />
                      <span className="text-sm text-primary-700">{branch}</span>
                    </label>
                  ))}
                </div>
                {errors.branches && (
                  <p className="mt-1 text-sm text-red-600">{errors.branches}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-3">
                  Allowed Batches <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {batchOptions.map((batch) => (
                    <label key={batch.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowedBatches.includes(batch.value)}
                        onChange={() => handleBatchToggle(batch.value)}
                        className="rounded border-primary-300 text-secondary-500 focus:ring-secondary-500"
                      />
                      <span className="text-sm text-primary-700">{batch.label}</span>
                    </label>
                  ))}
                </div>
                {errors.allowedBatches && (
                  <p className="mt-1 text-sm text-red-600">{errors.allowedBatches}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Minimum CGPA"
                  name="minCGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.minCGPA}
                  onChange={handleChange}
                  error={errors.minCGPA}
                  required
                />
                <Input
                  label="Maximum Active Backlogs"
                  name="maxBacklogs"
                  type="number"
                  min="0"
                  value={formData.maxBacklogs}
                  onChange={handleChange}
                />
                <Input
                  label="Minimum 10th Marks (%)"
                  name="minTenthMarks"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.minTenthMarks}
                  onChange={handleChange}
                />
                <Input
                  label="Minimum 12th Marks (%)"
                  name="minTwelfthMarks"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.minTwelfthMarks}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card title="Skills Required">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Add a skill (e.g., JavaScript, Python)"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} icon={<IoAdd />}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-secondary-900"
                    >
                      <IoClose size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.5}>
          <Card title="Selection Process (Hiring Pipeline)">
            <DraggableHiringPipeline
              stages={selectionStages}
              setStages={setSelectionStages}
            />
          </Card>
        </FadeIn>

        <FadeIn delay={0.6}>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              Create Drive
            </Button>
          </div>
        </FadeIn>
      </form>
    </div>
  );
};

export default CreateDrive;
