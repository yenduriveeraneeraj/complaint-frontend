import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordModal from '../../components/common/ForgotPasswordModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (res.data.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (res.data.role === 'ROLE_STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@cms.com');
    setPassword('Admin@123');
  };

  const fillDemoStaff = () => {
    setEmail('staff@cms.com');
    setPassword('Staff@123');
  };

  const fillDemoUser = () => {
    setEmail('user@cms.com');
    setPassword('User@123');
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center min-vh-100">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        <div
          className="p-4 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
        >
          <div className="fs-1 mb-2">⚖️</div>
          <h4 className="fw-bold mb-1">Welcome Back</h4>
          <p className="small text-light opacity-75 mb-0">Sign in to access your complaint portal</p>
        </div>

        <div className="card-body p-4">
          {isExpired && (
            <div className="alert alert-warning py-2 small mb-3">
              Your session has expired. Please log in again.
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-danger py-2 small mb-3">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label fw-semibold text-secondary small mb-1">Password</label>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none text-primary small mb-1"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="form-control rounded-3 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-light rounded-3 border mb-3">
            <div className="fw-semibold text-dark small mb-2 text-center">⚡ Auto-fill Demo Account:</div>
            <div className="d-flex gap-1">
              <button className="btn btn-outline-primary btn-sm flex-grow-1 rounded-2" onClick={fillDemoUser}>
                👤 Citizen
              </button>
              <button className="btn btn-outline-purple btn-sm flex-grow-1 rounded-2" onClick={fillDemoStaff}>
                👷 Staff
              </button>
              <button className="btn btn-outline-danger btn-sm flex-grow-1 rounded-2" onClick={fillDemoAdmin}>
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="text-center text-muted small">
            Don't have an account?{' '}
            <Link to="/register" className="fw-semibold text-primary text-decoration-none">
              Register now
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordModal show={showForgotModal} onHide={() => setShowForgotModal(false)} />
    </div>
  );
};

export default Login;
