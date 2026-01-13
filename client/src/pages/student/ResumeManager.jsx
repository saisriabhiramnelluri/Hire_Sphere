import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IoCloudUpload, 
  IoDocument, 
  IoTrash, 
  IoDownload,
  IoCheckmarkCircle,
  IoEye
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useModal } from '../../hooks/useModal';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const { isOpen: isUploadModalOpen, open: openUploadModal, close: closeUploadModal } = useModal();
  const { isOpen: isDeleteModalOpen, open: openDeleteModal, close: closeDeleteModal } = useModal();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      if (response.success && response.data.profile?.resumes) {
        setResumes(response.data.profile.resumes);
      }
    } catch (error) {
      toast.error('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
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
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await userService.uploadResume(formData);
      if (response.success) {
        toast.success('Resume uploaded successfully');
        closeUploadModal();
        setSelectedFile(null);
        fetchResumes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await userService.deleteResume(selectedResume._id);
      if (response.success) {
        toast.success('Resume deleted successfully');
        closeDeleteModal();
        fetchResumes();
      }
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Resume Manager</h1>
            <p className="text-primary-600 mt-1">Manage your resumes for job applications</p>
          </div>
          <Button icon={<IoCloudUpload />} onClick={openUploadModal}>
            Upload Resume
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <IoDocument className="mx-auto text-primary-300 mb-4" size={64} />
              <p className="text-primary-600 mb-4">No resumes uploaded yet</p>
              <Button icon={<IoCloudUpload />} onClick={openUploadModal}>
                Upload Your First Resume
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative border border-primary-200 rounded-lg p-6 hover:shadow-lg transition-all"
                >
                  {resume.isDefault && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                        <IoCheckmarkCircle className="mr-1" size={12} />
                        Default
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-20 h-20 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                      <IoDocument className="text-secondary-600" size={40} />
                    </div>
                    <h3 className="font-semibold text-primary-900 mb-1 truncate w-full">
                      {resume.filename}
                    </h3>
                    <p className="text-xs text-primary-500">
                      {resume.filesize ? formatFileSize(resume.filesize) : 'N/A'}
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      Uploaded {formatDate(resume.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full inline-flex items-center justify-center"
                    >
                      <IoEye className="mr-2" size={18} />
                      View
                    </a>
                    <a
                      href={resume.url}
                      download
                      className="btn-secondary w-full inline-flex items-center justify-center"
                    >
                      <IoDownload className="mr-2" size={18} />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        setSelectedResume(resume);
                        openDeleteModal();
                      }}
                      className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                    >
                      <IoTrash className="mr-2" size={18} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>

      <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} title="Upload Resume">
        <div className="space-y-6">
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="resume-file-input"
            />
            <label
              htmlFor="resume-file-input"
              className="flex flex-col items-center justify-center border-2 border-dashed border-primary-300 rounded-lg p-12 cursor-pointer hover:border-secondary-500 hover:bg-primary-50 transition-all"
            >
              <IoCloudUpload className="text-primary-400 mb-4" size={64} />
              <p className="text-primary-700 font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Click to upload resume'}
              </p>
              <p className="text-sm text-primary-500">PDF only, max 5MB</p>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tips for a good resume:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Keep it concise (1-2 pages)</li>
              <li>Use clear headings and bullet points</li>
              <li>Highlight relevant skills and experience</li>
              <li>Include contact information</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeUploadModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              loading={uploading} 
              disabled={!selectedFile || uploading}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Resume">
        <div className="space-y-4">
          <p className="text-primary-700">
            Are you sure you want to delete <strong>{selectedResume?.filename}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              This action cannot be undone. The resume will be permanently deleted.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResumeManager;
