import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoClose,
    IoCalendar,
    IoTime,
    IoPeople,
    IoCheckmarkCircle,
    IoBriefcase,
    IoSearch,
} from 'react-icons/io5';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { testService } from '../../services/testService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AssignTestModal = ({ isOpen, onClose, test, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Select Drive, 2: Select Applicants, 3: Schedule, 4: Results
    const [drives, setDrives] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [expiryDays, setExpiryDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchDrives();
        }
    }, [isOpen]);

    const fetchDrives = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recruiter/drives');
            if (response.success) {
                setDrives(response.data.drives || []);
            }
        } catch (error) {
            toast.error('Failed to fetch drives');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (driveId) => {
        try {
            setLoading(true);
            const response = await api.get(`/recruiter/drives/${driveId}/applicants`);
            if (response.success) {
                // Filter out applicants already assigned to this test
                const apps = response.data.applications || [];
                setApplicants(apps);
                setSelectedApplicants([]);
            }
        } catch (error) {
            toast.error('Failed to fetch applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleDriveSelect = (drive) => {
        setSelectedDrive(drive);
        fetchApplicants(drive._id);
        setStep(2);
    };

    const toggleApplicant = (appId) => {
        setSelectedApplicants(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    const toggleAll = () => {
        if (selectedApplicants.length === filteredApplicants.length) {
            setSelectedApplicants([]);
        } else {
            setSelectedApplicants(filteredApplicants.map(a => a._id));
        }
    };

    const handleSubmit = async () => {
        if (selectedApplicants.length === 0) {
            toast.error('Please select at least one applicant');
            return;
        }

        if (!scheduledDate || !scheduledTime) {
            toast.error('Please select date and time');
            return;
        }

        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
        const expiresAt = new Date(scheduledAt);
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        try {
            setLoading(true);
            const response = await testService.assignTestToApplicants({
                testId: test._id,
                applicationIds: selectedApplicants,
                scheduledAt: scheduledAt.toISOString(),
                expiresAt: expiresAt.toISOString(),
            });

            if (response.success) {
                setResults(response.data);
                setStep(4);
                toast.success(`Test assigned to ${response.data.successCount || 0} students`);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign test');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setSelectedDrive(null);
        setApplicants([]);
        setSelectedApplicants([]);
        setScheduledDate('');
        setScheduledTime('');
        setExpiryDays(7);
        setResults(null);
        setSearchTerm('');
        onClose();
    };

    const filteredApplicants = applicants.filter(app => {
        const student = app.studentId;
        const searchLower = searchTerm.toLowerCase();
        return (
            student?.firstName?.toLowerCase().includes(searchLower) ||
            student?.lastName?.toLowerCase().includes(searchLower) ||
            student?.email?.toLowerCase().includes(searchLower)
        );
    });

    if (!isOpen) return null;

    const now = new Date();
    const minDate = now.toISOString().split('T')[0];

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={resetAndClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Assign Test to Students</h2>
                            <p className="text-secondary-200 text-sm">{test?.title}</p>
                        </div>
                        <button
                            onClick={resetAndClose}
                            className="p-2 hover:bg-white/20 rounded-lg"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex border-b bg-primary-50">
                        {['Select Drive', 'Select Students', 'Schedule', 'Done'].map((label, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 py-3 text-center text-sm font-medium ${step > idx + 1 ? 'text-green-600' :
                                    step === idx + 1 ? 'text-secondary-600 bg-white border-b-2 border-secondary-500' :
                                        'text-primary-400'
                                    }`}
                            >
                                {step > idx + 1 ? <IoCheckmarkCircle className="inline mr-1" /> : null}
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {loading && step !== 4 ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                {/* Step 1: Select Drive */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-primary-900 flex items-center gap-2">
                                            <IoBriefcase /> Select a Drive
                                        </h3>
                                        <p className="text-sm text-primary-500">
                                            Choose a drive to see its applicants
                                        </p>

                                        {drives.length === 0 ? (
                                            <div className="text-center py-8 text-primary-500">
                                                No drives found. Create a drive first.
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                {drives.map((drive) => (
                                                    <button
                                                        key={drive._id}
                                                        onClick={() => handleDriveSelect(drive)}
                                                        className="text-left p-4 border rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-colors"
                                                    >
                                                        <div className="font-medium text-primary-900">{drive.jobTitle}</div>
                                                        <div className="text-sm text-primary-500">
                                                            {drive.applicationsCount || 0} applicants • {drive.status}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 2: Select Applicants */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-primary-900 flex items-center gap-2">
                                                    <IoPeople /> Select Students
                                                </h3>
                                                <p className="text-sm text-primary-500">
                                                    {selectedDrive?.jobTitle} • {applicants.length} applicants
                                                </p>
                                            </div>
                                            <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                                                Change Drive
                                            </Button>
                                        </div>

                                        {/* Search */}
                                        <div className="relative">
                                            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                                            <input
                                                type="text"
                                                placeholder="Search students..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="input-field pl-10"
                                            />
                                        </div>

                                        {/* Select All */}
                                        <div className="flex items-center justify-between p-2 bg-primary-50 rounded-lg">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
                                                    onChange={toggleAll}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <span className="font-medium">Select All ({filteredApplicants.length})</span>
                                            </label>
                                            <span className="text-sm text-secondary-600 font-medium">
                                                {selectedApplicants.length} selected
                                            </span>
                                        </div>

                                        {/* Applicant List */}
                                        <div className="max-h-64 overflow-auto border rounded-lg divide-y">
                                            {filteredApplicants.length === 0 ? (
                                                <div className="text-center py-8 text-primary-500">
                                                    No applicants found
                                                </div>
                                            ) : (
                                                filteredApplicants.map((app) => {
                                                    const student = app.studentId;
                                                    const isSelected = selectedApplicants.includes(app._id);

                                                    return (
                                                        <label
                                                            key={app._id}
                                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-secondary-50' : 'hover:bg-primary-50'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleApplicant(app._id)}
                                                                className="w-5 h-5 rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-primary-900">
                                                                    {student?.firstName} {student?.lastName}
                                                                </div>
                                                                <div className="text-sm text-primary-500">
                                                                    {student?.email}
                                                                </div>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded ${app.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                                                                app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {app.status}
                                                            </span>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                                                Back
                                            </Button>
                                            <Button
                                                onClick={() => setStep(3)}
                                                className="flex-1"
                                                disabled={selectedApplicants.length === 0}
                                            >
                                                Next ({selectedApplicants.length} selected)
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Schedule */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <h3 className="font-semibold text-primary-900 flex items-center gap-2">
                                            <IoCalendar /> Schedule Test
                                        </h3>
                                        <p className="text-sm text-primary-500">
                                            Assigning to {selectedApplicants.length} students from {selectedDrive?.jobTitle}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                                                    <IoCalendar size={18} /> Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={scheduledDate}
                                                    onChange={(e) => setScheduledDate(e.target.value)}
                                                    min={minDate}
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                                                    <IoTime size={18} /> Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={scheduledTime}
                                                    onChange={(e) => setScheduledTime(e.target.value)}
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-primary-700 mb-2 block">
                                                Test expires in
                                            </label>
                                            <select
                                                value={expiryDays}
                                                onChange={(e) => setExpiryDays(Number(e.target.value))}
                                                className="input-field w-48"
                                            >
                                                <option value={1}>1 day</option>
                                                <option value={3}>3 days</option>
                                                <option value={7}>7 days</option>
                                                <option value={14}>14 days</option>
                                                <option value={30}>30 days</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                                                Back
                                            </Button>
                                            <Button onClick={handleSubmit} loading={loading} className="flex-1">
                                                Assign Test
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Results */}
                                {step === 4 && results && (
                                    <div className="space-y-6 text-center">
                                        <div className={`w-16 h-16 ${results.successCount > 0 ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto`}>
                                            <IoCheckmarkCircle className={results.successCount > 0 ? 'text-green-600' : 'text-yellow-600'} size={40} />
                                        </div>
                                        <div>
                                            {results.successCount > 0 ? (
                                                <>
                                                    <h3 className="text-xl font-bold text-primary-900">Test Assigned!</h3>
                                                    <p className="text-primary-500">
                                                        Successfully assigned to {results.successCount} students
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="text-xl font-bold text-yellow-700">No New Assignments</h3>
                                                    <p className="text-primary-500">
                                                        All selected students were already assigned to this test
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {results.failCount > 0 && results.successCount > 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                                                <p className="font-medium text-yellow-700">
                                                    {results.failCount} students were already assigned to this test
                                                </p>
                                            </div>
                                        )}

                                        <Button onClick={resetAndClose} className="w-full">
                                            Done
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AssignTestModal;
