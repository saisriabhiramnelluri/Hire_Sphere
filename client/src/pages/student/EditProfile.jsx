import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoSave, IoAdd, IoClose, IoCloudUpload } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import FileUpload from '../../components/common/FileUpload';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { BRANCHES } from '../../utils/constants';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isNewProfile, setIsNewProfile] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    branch: '',
    batch: '',
    currentSemester: '8',
    currentCGPA: '',
    activeBacklogs: '0',
    tenthMarks: '',
    twelfthMarks: '',
    skills: [],
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      // Backend returns 'student' not 'profile'
      if (response.success && response.data.student) {
        const profile = response.data.student;
        setIsNewProfile(false); // Profile exists
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          studentId: profile.studentId || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
          gender: profile.gender || '',
          address: typeof profile.address === 'object'
            ? [profile.address.street, profile.address.city, profile.address.state, profile.address.pincode].filter(Boolean).join(', ')
            : profile.address || '',
          branch: profile.branch || '',
          batch: profile.batch || '',
          currentSemester: profile.currentSemester || '8',
          currentCGPA: profile.cgpa || profile.academicDetails?.currentCGPA || '',
          activeBacklogs: profile.activeBacklogs ?? profile.academicDetails?.activeBacklogs ?? '0',
          tenthMarks: profile.tenthMarks || profile.academicDetails?.tenthMarks || '',
          twelfthMarks: profile.twelfthMarks || profile.academicDetails?.twelfthMarks || '',
          skills: profile.skills || [],
        });
      } else {
        setIsNewProfile(true); // New profile
      }
    } catch (error) {
      // Profile doesn't exist, that's okay for first time
      setIsNewProfile(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      setResumeFile(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.batch) newErrors.batch = 'Batch is required';
    if (!formData.currentCGPA) newErrors.currentCGPA = 'CGPA is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);

    try {
      // Use Student model field names (root level, not nested academicDetails)
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        branch: formData.branch,
        batch: parseInt(formData.batch),
        currentSemester: parseInt(formData.currentSemester) || 8,
        cgpa: parseFloat(formData.currentCGPA),
        activeBacklogs: parseInt(formData.activeBacklogs) || 0,
        totalBacklogs: parseInt(formData.activeBacklogs) || 0,
        tenthMarks: parseFloat(formData.tenthMarks),
        twelfthMarks: parseFloat(formData.twelfthMarks),
        skills: formData.skills,
      };

      // Create or update based on whether profile exists
      const response = isNewProfile
        ? await userService.createProfile(profileData)
        : await userService.updateProfile(profileData);

      if (response.success) {
        const updatedProfile = response.data.student;
        updateProfile(updatedProfile);

        if (resumeFile) {
          try {
            const resumeFormData = new FormData();
            resumeFormData.append('resume', resumeFile);
            resumeFormData.append('title', resumeFile.name);
            await userService.uploadResume(resumeFormData);
            toast.success('Resume uploaded successfully');
          } catch (resumeError) {
            toast.error('Profile saved but resume upload failed');
          }
        }

        toast.success(isNewProfile ? 'Profile created successfully' : 'Profile updated successfully');
        navigate('/student/profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const currentYear = new Date().getFullYear();
  const batchOptions = [
    { value: currentYear, label: `${currentYear}` },
    { value: currentYear + 1, label: `${currentYear + 1}` },
    { value: currentYear + 2, label: `${currentYear + 2}` },
    { value: currentYear + 3, label: `${currentYear + 3}` },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/student/profile')}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <IoArrowBack size={24} className="text-primary-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Edit Profile</h1>
            <p className="text-primary-600 mt-1">Update your profile information</p>
          </div>
        </div>
      </FadeIn>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FadeIn delay={0.1}>
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
              <Input
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                error={errors.studentId}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <Dropdown
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field min-h-[80px]"
                placeholder="Enter your address..."
              />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card title="Academic Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                options={BRANCHES.map((b) => ({ value: b, label: b }))}
                error={errors.branch}
                required
              />
              <Dropdown
                label="Batch"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                options={batchOptions}
                error={errors.batch}
                required
              />
              <Input
                label="Current CGPA"
                name="currentCGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.currentCGPA}
                onChange={handleChange}
                error={errors.currentCGPA}
                required
              />
              <Input
                label="Active Backlogs"
                name="activeBacklogs"
                type="number"
                min="0"
                value={formData.activeBacklogs}
                onChange={handleChange}
              />
              <Input
                label="10th Marks (%)"
                name="tenthMarks"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tenthMarks}
                onChange={handleChange}
              />
              <Input
                label="12th Marks (%)"
                name="twelfthMarks"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.twelfthMarks}
                onChange={handleChange}
              />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card title="Skills">
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
                {formData.skills.map((skill, index) => (
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

        <FadeIn delay={0.4}>
          <Card title="Upload Resume">
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-primary-300 rounded-lg p-8 cursor-pointer hover:border-secondary-500 hover:bg-primary-50 transition-all"
              >
                <IoCloudUpload className="text-primary-400 mb-2" size={48} />
                <p className="text-sm text-primary-600 text-center">
                  {resumeFile ? resumeFile.name : 'Click to upload resume (PDF only, max 5MB)'}
                </p>
              </label>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/student/profile')}
            >
              Cancel
            </Button>
            <Button type="submit" icon={<IoSave />} loading={saving} disabled={saving}>
              Save Profile
            </Button>
          </div>
        </FadeIn>
      </form>
    </div>
  );
};

export default EditProfile;
