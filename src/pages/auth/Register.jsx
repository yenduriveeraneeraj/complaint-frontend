import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const userData = { fullName, email, phone, password, confirmPassword };
    const res = await register(userData);

    if (res.success) {
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center min-vh-100">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '480px', width: '100%' }}>
        <div
          className="p-4 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <div className="fs-1 mb-2">📝</div>
          <h4 className="fw-bold mb-1">Create Citizen Account</h4>
          <p className="small text-light opacity-75 mb-0">Join the Online Complaint Management System</p>
        </div>

        <div className="card-body p-4">
          {errorMessage && <div className="alert alert-danger py-2 small mb-3">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success py-2 small mb-3">{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Full Name</label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Email Address</label>
              <input
                type="email"
                className="form-control rounded-3 py-2"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Phone Number (10 digits)</label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold text-secondary small">Password</label>
                <input
                  type="password"
                  className="form-control rounded-3 py-2"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold text-secondary small">Confirm Password</label>
                <input
                  type="password"
                  className="form-control rounded-3 py-2"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 py-2.5 rounded-3 fw-semibold shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                'Register Account'
              )}
            </button>
          </form>

          <div className="text-center text-muted small">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-success text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
