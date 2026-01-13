import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoMail, IoArrowBack } from 'react-icons/io5';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FadeIn from '../../components/animations/FadeIn';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validators';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSubmitted(true);
        toast.success('Password reset link sent to your email');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-accent-50 px-4">
        <FadeIn>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoMail className="text-accent-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-primary-900 mb-2">Check Your Email</h2>
            <p className="text-primary-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-primary-500 mb-6">
              Please check your inbox and click the link to reset your password.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Back to Login
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-accent-50 px-4">
      <FadeIn>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-2xl mb-4">
                <span className="text-white font-bold text-2xl">H</span>
              </div>
              <h2 className="text-3xl font-bold text-primary-900">Forgot Password?</h2>
              <p className="text-primary-600 mt-2">
                No worries, we'll send you reset instructions
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                icon={<IoMail size={20} />}
                error={error}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-700 font-medium"
              >
                <IoArrowBack className="mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </FadeIn>
    </div>
  );
};

export default ForgotPassword;
