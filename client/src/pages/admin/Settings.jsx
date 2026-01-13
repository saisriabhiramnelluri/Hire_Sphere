import React, { useState } from 'react';
import { IoSettings, IoShield, IoMail, IoBusiness, IoTime, IoSave } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import FadeIn from '../../components/animations/FadeIn';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    collegeName: 'HireSphere College',
    placementYear: '2025-2026',
    adminEmail: 'placement@college.edu',

    // Email Settings
    emailNotifications: true,
    dailyDigest: false,

    // Approval Settings
    autoApproveRecruiters: false,
    autoApproveDrives: false,

    // Deadlines
    applicationDeadlineDays: 7,
    offerResponseDays: 5,
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: IoBusiness },
    { id: 'notifications', label: 'Notifications', icon: IoMail },
    { id: 'approvals', label: 'Approvals', icon: IoShield },
    { id: 'deadlines', label: 'Deadlines', icon: IoTime },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Settings</h1>
            <p className="text-primary-600 mt-1">Configure system settings and preferences</p>
          </div>
          <Button icon={<IoSave />} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex space-x-6">
          {/* Sidebar */}
          <div className="w-64">
            <Card>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                        ? 'bg-secondary-50 text-secondary-700 font-medium'
                        : 'text-primary-600 hover:bg-primary-50'
                      }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Card>
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary-900 border-b border-primary-200 pb-4">
                    General Settings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="College/Institution Name"
                      value={settings.collegeName}
                      onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                    />
                    <Input
                      label="Placement Year"
                      value={settings.placementYear}
                      onChange={(e) => setSettings({ ...settings, placementYear: e.target.value })}
                    />
                    <Input
                      label="Admin Email"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary-900 border-b border-primary-200 pb-4">
                    Notification Settings
                  </h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-primary-900">Email Notifications</p>
                        <p className="text-sm text-primary-600">Receive email alerts for important events</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="w-5 h-5 text-secondary-600 rounded focus:ring-secondary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-primary-900">Daily Digest</p>
                        <p className="text-sm text-primary-600">Receive a daily summary of activities</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.dailyDigest}
                        onChange={(e) => setSettings({ ...settings, dailyDigest: e.target.checked })}
                        className="w-5 h-5 text-secondary-600 rounded focus:ring-secondary-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'approvals' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary-900 border-b border-primary-200 pb-4">
                    Approval Settings
                  </h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-primary-900">Auto-approve Recruiters</p>
                        <p className="text-sm text-primary-600">Automatically approve new recruiter registrations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoApproveRecruiters}
                        onChange={(e) => setSettings({ ...settings, autoApproveRecruiters: e.target.checked })}
                        className="w-5 h-5 text-secondary-600 rounded focus:ring-secondary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-primary-900">Auto-approve Drives</p>
                        <p className="text-sm text-primary-600">Automatically approve new placement drives</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoApproveDrives}
                        onChange={(e) => setSettings({ ...settings, autoApproveDrives: e.target.checked })}
                        className="w-5 h-5 text-secondary-600 rounded focus:ring-secondary-500"
                      />
                    </label>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Enabling auto-approve will skip manual review.
                      It's recommended to keep these disabled for better control.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'deadlines' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary-900 border-b border-primary-200 pb-4">
                    Deadline Settings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Default Application Deadline (Days)"
                        type="number"
                        value={settings.applicationDeadlineDays}
                        onChange={(e) => setSettings({ ...settings, applicationDeadlineDays: parseInt(e.target.value) })}
                      />
                      <p className="text-sm text-primary-500 mt-1">
                        Days allowed for students to apply after drive is published
                      </p>
                    </div>
                    <div>
                      <Input
                        label="Offer Response Deadline (Days)"
                        type="number"
                        value={settings.offerResponseDays}
                        onChange={(e) => setSettings({ ...settings, offerResponseDays: parseInt(e.target.value) })}
                      />
                      <p className="text-sm text-primary-500 mt-1">
                        Days allowed for students to respond to offers
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default Settings;
