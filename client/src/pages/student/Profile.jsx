import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IoCreate,
  IoDocumentText,
  IoMail,
  IoCall,
  IoLocation,
  IoSchool,
  IoDownload,
  IoSave,
  IoClose,
  IoAdd,
  IoCloudUpload,
  IoTrash,
  IoCamera
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { BRANCHES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const Profile = () => {
  const { profile: contextProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
    cgpa: '',
    activeBacklogs: '0',
    totalBacklogs: '0',
    tenthMarks: '',
    twelfthMarks: '',
    skills: [],
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const currentYear = new Date().getFullYear();
  const batchOptions = [
    { value: currentYear, label: `${currentYear}` },
    { value: currentYear + 1, label: `${currentYear + 1}` },
    { value: currentYear + 2, label: `${currentYear + 2}` },
    { value: currentYear + 3, label: `${currentYear + 3}` },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success && response.data?.student) {
        const prof = response.data.student;
        setProfile(prof);
        // Populate form data with existing values
        setFormData({
          firstName: prof.firstName || '',
          lastName: prof.lastName || '',
          studentId: prof.studentId || '',
          email: prof.email || '',
          phone: prof.phone || '',
          dateOfBirth: prof.dateOfBirth ? prof.dateOfBirth.split('T')[0] : '',
          gender: prof.gender || '',
          address: typeof prof.address === 'object'
            ? [prof.address.street, prof.address.city, prof.address.state, prof.address.pincode].filter(Boolean).join(', ')
            : prof.address || '',
          branch: prof.branch || '',
          batch: prof.batch || '',
          currentSemester: prof.currentSemester || '8',
          cgpa: prof.cgpa || '',
          activeBacklogs: prof.activeBacklogs ?? '0',
          totalBacklogs: prof.totalBacklogs ?? '0',
          tenthMarks: prof.tenthMarks || '',
          twelfthMarks: prof.twelfthMarks || '',
          skills: prof.skills || [],
        });
      }
    } catch (error) {
      // Profile doesn't exist, enable editing mode
      setEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Auto-populate name from filename if empty
      if (!resumeName) {
        const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
        setResumeName(nameWithoutExt);
      }
    }
  };

  // Upload resume with custom name
  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a file');
      return;
    }
    if (!resumeName.trim()) {
      toast.error('Please enter a resume name');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('title', resumeName.trim());

      const response = await userService.uploadResume(formData);
      if (response.success) {
        setProfile(response.data.student);
        toast.success('Resume uploaded successfully');
        setResumeFile(null);
        setResumeName('');
        // Reset file input
        const fileInput = document.getElementById('resume-upload-view');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    setDeletingResumeId(resumeId);
    try {
      const response = await userService.deleteResume(resumeId);
      if (response.success) {
        setProfile(response.data.student);
        toast.success('Resume deleted successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resume');
    } finally {
      setDeletingResumeId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
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
        cgpa: parseFloat(formData.cgpa),
        activeBacklogs: parseInt(formData.activeBacklogs) || 0,
        totalBacklogs: parseInt(formData.totalBacklogs) || 0,
        tenthMarks: parseFloat(formData.tenthMarks),
        twelfthMarks: parseFloat(formData.twelfthMarks),
        skills: formData.skills,
      };

      const response = profile
        ? await userService.updateProfile(profileData)
        : await userService.createProfile(profileData);

      if (response.success) {
        const updatedProfile = response.data.student;
        updateProfile(updatedProfile);
        setProfile(updatedProfile);

        if (resumeFile) {
          try {
            const resumeFormData = new FormData();
            resumeFormData.append('resume', resumeFile);
            resumeFormData.append('title', resumeFile.name);
            await userService.uploadResume(resumeFormData);
            toast.success('Resume uploaded successfully');
            setResumeFile(null);
          } catch (resumeError) {
            toast.error('Profile saved but resume upload failed');
          }
        }

        toast.success('Profile saved successfully');
        setEditing(false);
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    if (typeof address === 'object') {
      return [address.street, address.city, address.state, address.pincode, address.country]
        .filter(Boolean)
        .join(', ');
    }
    return address;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  // No profile - show create profile form
  if (!profile && !editing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FadeIn>
          <Card className="text-center max-w-md">
            <IoDocumentText className="mx-auto text-primary-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-primary-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-primary-600 mb-6">
              Please complete your profile to apply for placement drives
            </p>
            <Button icon={<IoCreate />} onClick={() => setEditing(true)}>
              Create Profile
            </Button>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">My Profile</h1>
            <p className="text-primary-600 mt-1">
              {editing ? 'Update your profile information' : 'View and manage your profile'}
            </p>
          </div>
          {!editing ? (
            <Button icon={<IoCreate />} onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <Button variant="secondary" icon={<IoClose />} onClick={() => {
              setEditing(false);
              fetchProfile(); // Reset form
            }}>
              Cancel
            </Button>
          )}
        </div>
      </FadeIn>

      {editing ? (
        // EDIT MODE
        <form onSubmit={handleSubmit} className="space-y-6">
          <FadeIn delay={0.1}>
            <Card title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
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
                  required
                />
                <Dropdown
                  label="Batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  options={batchOptions}
                  required
                />
                <Input
                  label="Current CGPA"
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={handleChange}
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
            <div className="flex justify-end">
              <Button type="submit" icon={<IoSave />} loading={saving} disabled={saving}>
                Save Profile
              </Button>
            </div>
          </FadeIn>
        </form>
      ) : (
        // VIEW MODE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FadeIn delay={0.1}>
            <Card className="lg:col-span-1">
              <div className="text-center">
                {/* Profile Photo with Upload */}
                <div className="relative inline-block mb-4">
                  {profile.profilePhoto?.url ? (
                    <img
                      src={profile.profilePhoto.url}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-secondary-200"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold">
                      {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                    </div>
                  )}
                  {/* Upload Photo Button */}
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                  >
                    {uploadingPhoto ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <IoCamera size={20} />
                    )}
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Image size must be less than 5MB');
                        return;
                      }
                      if (!file.type.startsWith('image/')) {
                        toast.error('Only image files are allowed');
                        return;
                      }
                      setUploadingPhoto(true);
                      try {
                        const formData = new FormData();
                        formData.append('photo', file);
                        const response = await userService.uploadPhoto(formData);
                        if (response.success) {
                          setProfile(response.data.student);
                          toast.success('Photo updated successfully');
                        }
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Failed to upload photo');
                      } finally {
                        setUploadingPhoto(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-primary-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-primary-600 mt-1">{profile.studentId}</p>
                <p className="text-sm text-primary-500 mt-2">{profile.branch}</p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center text-sm text-primary-700">
                    <IoMail className="mr-2 text-primary-500" />
                    {profile.email}
                  </div>
                  <div className="flex items-center justify-center text-sm text-primary-700">
                    <IoCall className="mr-2 text-primary-500" />
                    {profile.phone}
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          <div className="lg:col-span-2 space-y-6">
            <FadeIn delay={0.2}>
              <Card title="Academic Information">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-primary-600">Branch</p>
                    <p className="text-lg font-semibold text-primary-900">{profile.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">Batch</p>
                    <p className="text-lg font-semibold text-primary-900">{profile.batch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">Current CGPA</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {profile.cgpa}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">Active Backlogs</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {profile.activeBacklogs ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">10th Marks</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {profile.tenthMarks}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">12th Marks</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {profile.twelfthMarks}%
                    </p>
                  </div>
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card title="Personal Information">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-primary-600">Date of Birth</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {formatDate(profile.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">Gender</p>
                    <p className="text-lg font-semibold text-primary-900 capitalize">
                      {profile.gender}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-primary-600">Address</p>
                    <p className="text-primary-900">{formatAddress(profile.address)}</p>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {profile.skills && profile.skills.length > 0 && (
              <FadeIn delay={0.4}>
                <Card title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
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

            {/* Resume Management Section - Always visible */}
            <FadeIn delay={0.5}>
              <Card title="My Resumes">
                {/* Upload New Resume */}
                <div className="mb-6 p-4 border-2 border-dashed border-primary-200 rounded-lg">
                  <h4 className="font-medium text-primary-900 mb-4">Upload New Resume</h4>
                  <div className="space-y-4">
                    <Input
                      label="Resume Name"
                      placeholder="e.g., Software Engineer Resume, Data Analyst CV"
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Resume File (PDF only, max 5MB)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload-view"
                      />
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="resume-upload-view"
                          className="flex items-center justify-center px-4 py-2 border border-primary-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-primary-50 transition-all"
                        >
                          <IoCloudUpload className="text-primary-500 mr-2" size={20} />
                          <span className="text-sm text-primary-600">
                            {resumeFile ? resumeFile.name : 'Choose File'}
                          </span>
                        </label>
                        <Button
                          onClick={handleUploadResume}
                          icon={<IoAdd />}
                          loading={uploadingResume}
                          disabled={uploadingResume || !resumeFile}
                        >
                          Upload Resume
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List of Uploaded Resumes */}
                {profile.resumes && profile.resumes.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary-900 mb-2">Uploaded Resumes ({profile.resumes.length})</h4>
                    {profile.resumes.map((resume, index) => (
                      <motion.div
                        key={resume._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-primary-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <IoDocumentText className="text-secondary-600" size={24} />
                          <div>
                            <p className="font-medium text-primary-900">{resume.title || 'Untitled Resume'}</p>
                            <p className="text-sm text-primary-600">
                              Uploaded {formatDate(resume.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <IoDownload size={20} />
                          </a>
                          <button
                            onClick={() => handleDeleteResume(resume._id)}
                            disabled={deletingResumeId === resume._id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingResumeId === resume._id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <IoTrash size={20} />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IoDocumentText className="mx-auto text-primary-300 mb-4" size={48} />
                    <p className="text-primary-600">No resumes uploaded yet</p>
                    <p className="text-sm text-primary-500 mt-1">Upload your first resume above</p>
                  </div>
                )}
              </Card>
            </FadeIn>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
