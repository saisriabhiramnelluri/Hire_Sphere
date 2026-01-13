import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoSend, IoMail, IoPeople, IoCheckmarkCircle } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { driveService } from '../../services/driveService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Communications = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [emailData, setEmailData] = useState({
    driveId: '',
    recipientType: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await driveService.getMyDrives({ status: 'published' });
      if (response.success) {
        setDrives(response.data.drives);
      }
    } catch (error) {
      toast.error('Failed to fetch drives');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!emailData.driveId || !emailData.recipientType || !emailData.subject || !emailData.message) {
      toast.error('Please fill all fields');
      return;
    }

    setSending(true);
    try {
      const response = await api.post('/recruiter/communications/send', emailData);
      if (response.success) {
        toast.success('Email sent successfully!');
        setEmailData({
          driveId: '',
          recipientType: '',
          subject: '',
          message: '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const recipientOptions = [
    { value: 'all', label: 'All Applicants' },
    { value: 'shortlisted', label: 'Shortlisted Candidates' },
    { value: 'interviewed', label: 'Interviewed Candidates' },
    { value: 'selected', label: 'Selected Candidates' },
  ];

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Communications</h1>
          <p className="text-primary-600 mt-1">Send emails to applicants</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Select Drive"
                name="driveId"
                value={emailData.driveId}
                onChange={handleChange}
                options={drives.map((drive) => ({
                  value: drive._id,
                  label: drive.jobTitle,
                }))}
                placeholder="Select a drive"
                icon={<IoPeople size={20} />}
                required
              />

              <Dropdown
                label="Recipients"
                name="recipientType"
                value={emailData.recipientType}
                onChange={handleChange}
                options={recipientOptions}
                placeholder="Select recipient type"
                icon={<IoMail size={20} />}
                required
              />
            </div>

            <Input
              label="Subject"
              name="subject"
              value={emailData.subject}
              onChange={handleChange}
              placeholder="Enter email subject"
              required
            />

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={emailData.message}
                onChange={handleChange}
                className="input-field min-h-[200px]"
                placeholder="Enter your message..."
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This email will be sent to all candidates matching the selected
                recipient type for the chosen drive.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" icon={<IoSend />} loading={sending} disabled={sending}>
                Send Email
              </Button>
            </div>
          </form>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card title="Email Templates">
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
              <h3 className="font-semibold text-primary-900 mb-2">Interview Invitation</h3>
              <p className="text-sm text-primary-600">
                Template for inviting candidates to interview rounds
              </p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
              <h3 className="font-semibold text-primary-900 mb-2">Selection Notification</h3>
              <p className="text-sm text-primary-600">
                Template for notifying selected candidates
              </p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
              <h3 className="font-semibold text-primary-900 mb-2">Status Update</h3>
              <p className="text-sm text-primary-600">
                Template for updating candidates about their application status
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Communications;
