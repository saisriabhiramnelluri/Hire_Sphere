import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoCalendar, IoTime, IoDocumentText } from 'react-icons/io5';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const ScheduleTestModal = ({ isOpen, onClose, application, onSuccess }) => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        testId: '',
        scheduledDate: '',
        scheduledTime: '',
        expiresIn: 7, // Days until expiry
    });

    useEffect(() => {
        if (isOpen) {
            fetchTests();
        }
    }, [isOpen]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await testService.getRecruiterTests({ status: 'published' });
            if (response.success) {
                setTests(response.data.tests || []);
            }
        } catch (error) {
            toast.error('Failed to fetch tests');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.testId) {
            toast.error('Please select a test');
            return;
        }

        if (!formData.scheduledDate || !formData.scheduledTime) {
            toast.error('Please select date and time');
            return;
        }

        const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
        const expiresAt = new Date(scheduledAt);
        expiresAt.setDate(expiresAt.getDate() + formData.expiresIn);

        try {
            setSubmitting(true);
            const response = await testService.scheduleTest({
                testId: formData.testId,
                applicationId: application._id,
                scheduledAt: scheduledAt.toISOString(),
                expiresAt: expiresAt.toISOString(),
            });

            if (response.success) {
                onSuccess(response.data.submission);
                onClose();
                setFormData({
                    testId: '',
                    scheduledDate: '',
                    scheduledTime: '',
                    expiresIn: 7,
                });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to schedule test');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedTest = tests.find((t) => t._id === formData.testId);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold text-primary-900">Schedule Test</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary-100 rounded-lg"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {application && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800">
                                    Scheduling test for: <strong>{application.studentId?.firstName} {application.studentId?.lastName}</strong>
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-4">Loading tests...</div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-primary-700 mb-2">
                                        Select Test
                                    </label>
                                    <select
                                        value={formData.testId}
                                        onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Choose a test...</option>
                                        {tests.map((test) => (
                                            <option key={test._id} value={test._id}>
                                                {test.title} ({test.type}) - {test.duration} mins
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedTest && (
                                    <div className="bg-primary-50 rounded-lg p-4">
                                        <div className="flex items-center gap-4 text-sm text-primary-600">
                                            <span className="flex items-center gap-1">
                                                <IoDocumentText size={16} />
                                                {selectedTest.inlineQuestions?.length || 0} Questions
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <IoTime size={16} />
                                                {selectedTest.duration} mins
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${selectedTest.type === 'aptitude' ? 'bg-blue-100 text-blue-700' :
                                                    selectedTest.type === 'technical' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {selectedTest.type}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    <Input
                                        label="Time"
                                        type="time"
                                        value={formData.scheduledTime}
                                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary-700 mb-2">
                                        Valid for (days)
                                    </label>
                                    <select
                                        value={formData.expiresIn}
                                        onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) })}
                                        className="input-field"
                                    >
                                        <option value={1}>1 day</option>
                                        <option value={3}>3 days</option>
                                        <option value={7}>7 days</option>
                                        <option value={14}>14 days</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="secondary" type="button" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                icon={<IoCalendar />}
                                loading={submitting}
                                disabled={submitting || loading}
                            >
                                Schedule Test
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ScheduleTestModal;
