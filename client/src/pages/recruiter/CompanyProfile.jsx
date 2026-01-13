import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoSave, IoCreate, IoCloudUpload, IoBusiness, IoGlobe, IoPeople } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const CompanyProfile = () => {
  const { profile: contextProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    companyDescription: '',
    // Nested contactPerson object
    contactPerson: {
      firstName: '',
      lastName: '',
      designation: '',
      phone: '',
      alternateEmail: '',
    },
    // Nested headquarters object
    headquarters: {
      city: '',
      state: '',
      country: '',
    },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const companySizeOptions = [
    { value: '1-50', label: '1-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getRecruiterProfile();
      if (response.success && response.data.recruiter) {
        const prof = response.data.recruiter;
        setProfile(prof);
        setFormData({
          companyName: prof.companyName || '',
          companyWebsite: prof.companyWebsite || '',
          companySize: prof.companySize || '',
          industry: prof.industry || '',
          companyDescription: prof.companyDescription || '',
          contactPerson: {
            firstName: prof.contactPerson?.firstName || '',
            lastName: prof.contactPerson?.lastName || '',
            designation: prof.contactPerson?.designation || '',
            phone: prof.contactPerson?.phone || '',
            alternateEmail: prof.contactPerson?.alternateEmail || '',
          },
          headquarters: {
            city: prof.headquarters?.city || '',
            state: prof.headquarters?.state || '',
            country: prof.headquarters?.country || '',
          },
        });
        if (prof.companyLogo?.url) {
          setLogoPreview(prof.companyLogo.url);
        }
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

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactPerson: { ...prev.contactPerson, [name]: value },
    }));
  };

  const handleHeadquartersChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      headquarters: { ...prev.headquarters, [name]: value },
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = profile
        ? await userService.updateRecruiterProfile(formData)
        : await userService.createRecruiterProfile(formData);

      if (response.success) {
        const updatedProfile = response.data.recruiter || response.data.profile;
        updateProfile(updatedProfile);
        setProfile(updatedProfile);

        if (logoFile) {
          try {
            const logoFormData = new FormData();
            logoFormData.append('logo', logoFile);
            await userService.uploadCompanyLogo(logoFormData);
            toast.success('Logo uploaded successfully');
          } catch (logoError) {
            toast.error('Profile saved but logo upload failed');
          }
        }

        toast.success('Profile saved successfully');
        setEditing(false);
        fetchProfile();
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

  if (!profile && !editing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FadeIn>
          <Card className="text-center max-w-md">
            <IoBusiness className="mx-auto text-primary-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-primary-900 mb-2">
              Complete Your Company Profile
            </h2>
            <p className="text-primary-600 mb-6">
              Please complete your company profile to post drives
            </p>
            <Button icon={<IoCreate />} onClick={() => setEditing(true)}>
              Create Profile
            </Button>
          </Card>
        </FadeIn>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {profile ? 'Edit Company Profile' : 'Create Company Profile'}
            </h1>
            <p className="text-primary-600 mt-1">Update your company information</p>
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FadeIn delay={0.1}>
            <Card title="Company Logo">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <IoBusiness className="text-primary-400" size={48} />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors">
                    <IoCloudUpload className="mr-2" />
                    Upload Logo
                  </span>
                </label>
                <p className="text-xs text-primary-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card title="Company Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Website"
                  name="companyWebsite"
                  type="url"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
                <Dropdown
                  label="Company Size"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  options={companySizeOptions}
                  required
                />
                <Input
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g., Technology, Finance"
                  required
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className="input-field min-h-[120px]"
                  placeholder="Tell us about your company..."
                  maxLength={1000}
                />
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.25}>
            <Card title="Headquarters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="City"
                  name="city"
                  value={formData.headquarters.city}
                  onChange={handleHeadquartersChange}
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.headquarters.state}
                  onChange={handleHeadquartersChange}
                />
                <Input
                  label="Country"
                  name="country"
                  value={formData.headquarters.country}
                  onChange={handleHeadquartersChange}
                />
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card title="Contact Person">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.contactPerson.firstName}
                  onChange={handleContactChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.contactPerson.lastName}
                  onChange={handleContactChange}
                  required
                />
                <Input
                  label="Designation"
                  name="designation"
                  value={formData.contactPerson.designation}
                  onChange={handleContactChange}
                  placeholder="e.g., HR Manager"
                  required
                />
                <Input
                  label="Phone (10 digits)"
                  name="phone"
                  type="tel"
                  value={formData.contactPerson.phone}
                  onChange={handleContactChange}
                  placeholder="e.g., 9876543210"
                  pattern="[0-9]{10}"
                  required
                />
                <Input
                  label="Alternate Email"
                  name="alternateEmail"
                  type="email"
                  value={formData.contactPerson.alternateEmail}
                  onChange={handleContactChange}
                />
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex justify-end space-x-4">
              {profile && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" icon={<IoSave />} loading={saving} disabled={saving}>
                Save Profile
              </Button>
            </div>
          </FadeIn>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Company Profile</h1>
            <p className="text-primary-600 mt-1">View your company information</p>
          </div>
          <Button icon={<IoCreate />} onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn delay={0.1}>
          <Card className="lg:col-span-1">
            <div className="text-center">
              <div className="w-32 h-32 bg-primary-100 rounded-full mx-auto flex items-center justify-center mb-4 overflow-hidden">
                {profile.companyLogo?.url ? (
                  <img
                    src={profile.companyLogo.url}
                    alt={profile.companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IoBusiness className="text-primary-400" size={48} />
                )}
              </div>
              <h2 className="text-2xl font-bold text-primary-900">{profile.companyName}</h2>
              {profile.industry && (
                <p className="text-primary-600 mt-1">{profile.industry}</p>
              )}
              {profile.companyWebsite && (
                <a
                  href={profile.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-secondary-600 hover:text-secondary-700 mt-3 text-sm"
                >
                  <IoGlobe className="mr-1" />
                  Visit Website
                </a>
              )}
            </div>
          </Card>
        </FadeIn>

        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.2}>
            <Card title="Company Overview">
              <div className="space-y-4">
                {profile.companySize && (
                  <div className="flex items-center space-x-3">
                    <IoPeople className="text-primary-500" size={20} />
                    <div>
                      <p className="text-sm text-primary-600">Company Size</p>
                      <p className="font-semibold text-primary-900">{profile.companySize}</p>
                    </div>
                  </div>
                )}
                {profile.companyDescription && (
                  <div>
                    <p className="text-sm text-primary-600 mb-2">About</p>
                    <p className="text-primary-900">{profile.companyDescription}</p>
                  </div>
                )}
                {profile.headquarters && (profile.headquarters.city || profile.headquarters.state || profile.headquarters.country) && (
                  <div>
                    <p className="text-sm text-primary-600 mb-2">Headquarters</p>
                    <p className="text-primary-900">
                      {[profile.headquarters.city, profile.headquarters.state, profile.headquarters.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card title="Contact Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-primary-600">Contact Person</p>
                  <p className="font-semibold text-primary-900">
                    {profile.contactPerson?.firstName} {profile.contactPerson?.lastName}
                  </p>
                  {profile.contactPerson?.designation && (
                    <p className="text-sm text-primary-500">{profile.contactPerson.designation}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-primary-600">Phone</p>
                  <p className="font-semibold text-primary-900">{profile.contactPerson?.phone}</p>
                </div>
                {profile.contactPerson?.alternateEmail && (
                  <div>
                    <p className="text-sm text-primary-600">Alternate Email</p>
                    <p className="font-semibold text-primary-900">{profile.contactPerson.alternateEmail}</p>
                  </div>
                )}
              </div>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
