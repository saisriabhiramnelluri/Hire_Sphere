import React, { useState } from 'react';
import { IoSend, IoPeople } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import FadeIn from '../../components/animations/FadeIn';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    targetAudience: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Announcement sent successfully!');
    setAnnouncement({ title: '', message: '', targetAudience: '' });
  };

  const audienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'All Students' },
    { value: 'recruiters', label: 'All Recruiters' },
    { value: 'placed', label: 'Placed Students' },
    { value: 'unplaced', label: 'Unplaced Students' },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Announcements</h1>
          <p className="text-primary-600 mt-1">Send notifications to users</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Announcement Title"
              value={announcement.title}
              onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
              placeholder="Enter announcement title"
              required
            />

            <Dropdown
              label="Target Audience"
              value={announcement.targetAudience}
              onChange={(e) => setAnnouncement({ ...announcement, targetAudience: e.target.value })}
              options={audienceOptions}
              icon={<IoPeople size={20} />}
              required
            />

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                className="input-field min-h-[150px]"
                placeholder="Enter your announcement message..."
                required
              />
            </div>

            <Button type="submit" icon={<IoSend />} fullWidth>
              Send Announcement
            </Button>
          </form>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Announcements;
