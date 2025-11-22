import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', null, { params: { email: email } });
      setMessage('If the email exists, an OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', null, { params: { email: email, otp_code: otp } });
      setMessage('OTP verified successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', null, {
        params: {
          email: email,
          otp_code: otp,
          new_password: newPassword
        }
      });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neo-bg)]">
      <div className="neo-box p-8 w-full max-w-md">
        <h1 className="text-4xl font-black mb-8 text-center uppercase">StockMaster</h1>
        <h2 className="text-2xl font-bold mb-6 text-center">Password Reset</h2>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-2 mb-4 font-bold">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border-2 border-green-500 text-green-700 p-2 mb-4 font-bold">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full text-lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
            <div className="mt-4 text-center">
              <a href="/login" className="font-bold hover:underline">Back to Login</a>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Enter OTP Code</label>
              <Input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                required 
                maxLength={6}
                placeholder="000000"
                disabled={loading}
                className="text-center text-2xl font-bold tracking-widest"
              />
              <p className="text-sm text-gray-600 mt-2">Check your email for the 6-digit OTP code</p>
            </div>
            <Button type="submit" className="w-full text-lg" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">New Password</label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength={8}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Confirm New Password</label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                minLength={8}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full text-lg" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

