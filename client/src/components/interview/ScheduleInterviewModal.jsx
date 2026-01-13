import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoCalendar, IoTime, IoPeople, IoAdd, IoClose } from 'react-icons/io5';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Dropdown from '../common/Dropdown';
import { interviewService } from '../../services/interviewService';
import toast from 'react-hot-toast';

const ScheduleInterviewModal = ({ isOpen, onClose, application, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'hr',
        title: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        panelMembers: [],
    });
    const [newPanelMember, setNewPanelMember] = useState({
        name: '',
        email: '',
        designation: '',
    });

    const interviewTypes = [
        { value: 'hr', label: 'HR Interview' },
        { value: 'technical', label: 'Technical Interview' },
        { value: 'managerial', label: 'Managerial Interview' },
        { value: 'final', label: 'Final Interview' },
    ];

    const durationOptions = [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddPanelMember = () => {
        if (!newPanelMember.name || !newPanelMember.email) {
            toast.error('Please enter name and email for panel member');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            panelMembers: [...prev.panelMembers, { ...newPanelMember }],
        }));
        setNewPanelMember({ name: '', email: '', designation: '' });
    };

    const handleRemovePanelMember = (index) => {
        setFormData((prev) => ({
            ...prev,
            panelMembers: prev.panelMembers.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.scheduledDate || !formData.scheduledTime) {
            toast.error('Please select date and time');
            return;
        }

        setLoading(true);
        try {
            const scheduledAt = new Date(
                `${formData.scheduledDate}T${formData.scheduledTime}`
            ).toISOString();

            const response = await interviewService.scheduleInterview({
                applicationId: application._id,
                type: formData.type,
                title: formData.title || `${formData.type.toUpperCase()} Interview`,
                scheduledAt,
                duration: formData.duration,
                panelMembers: formData.panelMembers,
            });

            if (response.success) {
                toast.success('Interview scheduled successfully');
                onSuccess?.(response.data.interview);
                onClose();
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'hr',
            title: '',
            scheduledDate: '',
            scheduledTime: '',
            duration: 30,
            panelMembers: [],
        });
    };

    // Get minimum date (today)
    const minDate = new Date().toISOString().split('T')[0];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule Interview" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Candidate Info */}
                <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-primary-600">Scheduling interview for:</p>
                    <p className="font-semibold text-primary-900">
                        {application?.studentId?.firstName} {application?.studentId?.lastName}
                    </p>
                    <p className="text-sm text-primary-600">
                        {application?.studentId?.email} | {application?.studentId?.studentId}
                    </p>
                </div>

                {/* Interview Type */}
                <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                        Interview Type <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        options={interviewTypes}
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                        Interview Title
                    </label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Technical Round 1"
                    />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="date"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            min={minDate}
                            icon={<IoCalendar />}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                            Time <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="time"
                            name="scheduledTime"
                            value={formData.scheduledTime}
                            onChange={handleChange}
                            icon={<IoTime />}
                        />
                    </div>
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                        Duration
                    </label>
                    <Dropdown
                        name="duration"
                        value={formData.duration}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))
                        }
                        options={durationOptions}
                    />
                </div>

                {/* Panel Members (for technical interviews) */}
                {(formData.type === 'technical' || formData.type === 'managerial') && (
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                            <IoPeople className="inline mr-2" />
                            Panel Members (Optional)
                        </label>

                        {/* Existing panel members */}
                        {formData.panelMembers.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {formData.panelMembers.map((member, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-primary-900">{member.name}</p>
                                            <p className="text-xs text-primary-600">
                                                {member.email} {member.designation && `• ${member.designation}`}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePanelMember(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <IoClose size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Add new panel member */}
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                placeholder="Name"
                                value={newPanelMember.name}
                                onChange={(e) =>
                                    setNewPanelMember((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                            <Input
                                placeholder="Email"
                                type="email"
                                value={newPanelMember.email}
                                onChange={(e) =>
                                    setNewPanelMember((prev) => ({ ...prev, email: e.target.value }))
                                }
                            />
                            <button
                                type="button"
                                onClick={handleAddPanelMember}
                                className="flex items-center justify-center gap-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                            >
                                <IoAdd size={18} /> Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading}>
                        Schedule Interview
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ScheduleInterviewModal;
