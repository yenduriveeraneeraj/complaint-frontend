import React, { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { authService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaKey, FaPaperPlane } from 'react-icons/fa';

const ForgotPasswordModal = ({ show, onHide }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword({ email: email.trim() });
      toast.success(res.data || 'OTP code sent to your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      toast.success(res.data || 'Password reset successfully!');
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
          <FaKey className="text-primary" /> Forgot & Reset Password
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 ? (
          <Form onSubmit={handleRequestOtp}>
            <p className="small text-muted mb-3">
              Enter your registered email address below. We will dispatch a 6-digit verification OTP code to your inbox.
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Registered Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="e.g. citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
              Send Reset OTP
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleResetPassword}>
            <p className="small text-muted mb-3">
              An OTP code was sent to <strong>{email}</strong>. Enter the OTP and your new password below.
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">6-Digit Verification OTP</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
              <Button type="submit" variant="success" className="flex-grow-1" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Reset Password'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;
