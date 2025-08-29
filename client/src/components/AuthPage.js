import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AuthPage = ({ onLogin }) => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/request-otp', {
        email: formData.email,
        name: formData.name
      });

      if (response.data.devNote) {
        // Extract OTP from devNote
        const otpMatch = response.data.devNote.match(/OTP: (\d+)/);
        const otpCode = otpMatch ? otpMatch[1] : 'Check console';
        
        toast.success(`🔧 DEV MODE - Your OTP: ${otpCode}`, {
          duration: 10000,
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#10B981',
            color: 'white',
          }
        });
        console.log('🔧 Development Mode - OTP Code:', response.data.devNote);
      } else {
        toast.success('OTP sent to your email!');
      }
      setStep('otp');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });

      toast.success('Successfully authenticated!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.3 }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="glass p-8 rounded-2xl w-full max-w-md"
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">🗳️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Digital Voting System
          </h1>
          <p className="text-gray-600 text-sm">
            Secure Authentication Portal
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form
              key="email-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleRequestOTP}
              className="space-y-6"
            >
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  <User className="inline w-4 h-4 mr-2 text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 rounded-lg bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  <Mail className="inline w-4 h-4 mr-2 text-blue-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 rounded-lg bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <>
                    <Shield className="inline w-5 h-5 mr-2" />
                    Send OTP
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Verification Code Sent
                </h3>
                <p className="text-gray-600 text-sm">
                  Please check your email for the verification code<br />
                  <span className="font-medium text-blue-600">{formData.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-4 rounded-lg bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setStep('email')}
                  className="btn-secondary flex-1 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="btn-primary flex-1 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Verify'
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-500 text-xs flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            Secure & Confidential Authentication
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;