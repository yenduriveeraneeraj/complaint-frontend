import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TrackWidget from '../components/public/TrackWidget';

const LandingPage = () => {
  const { login, isAuthenticated, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  const handleDemoAdmin = async () => {
    const res = await login('admin@cms.com', 'Admin@123');
    if (res.success) {
      navigate('/admin/dashboard');
    }
  };

  const handleDemoStaff = async () => {
    const res = await login('staff@cms.com', 'Staff@123');
    if (res.success) {
      navigate('/staff/dashboard');
    }
  };

  const handleDemoUser = async () => {
    const res = await login('user@cms.com', 'User@123');
    if (res.success) {
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">

      {/* Hero Section */}
      <section
        className="py-5 text-white text-center position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          paddingTop: '4rem',
          paddingBottom: '5rem',
        }}
      >
        <div className="container position-relative z-1 py-3">
          <span className="badge rounded-pill bg-white text-dark px-3 py-2 mb-3 shadow-sm fw-medium">
            ⚡ Powered by Spring Boot 3 & React 18
          </span>
          <h1 className="display-4 fw-bold mb-3 text-white" style={{ letterSpacing: '-0.03em' }}>
            Empowering Citizens, Elevating Accountability
          </h1>
          <p className="lead mx-auto mb-4 text-light opacity-90" style={{ maxWidth: '720px' }}>
            A unified, transparent, and intelligent platform for lodging grievances, tracking resolution lifecycles in real-time, and evaluating service delivery.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : isStaff ? '/staff/dashboard' : '/user/dashboard'}
                className="btn btn-warning btn-lg px-4 py-2.5 rounded-pill shadow fw-bold text-dark"
              >
                Go to Dashboard 🚀
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg px-4 py-2.5 rounded-pill shadow-sm fw-semibold">
                  File a Complaint
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4 py-2.5 rounded-pill fw-semibold">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Access Bar */}
          <div
            className="card mx-auto p-3 border-0 rounded-4 shadow-lg text-dark mb-4"
            style={{ maxWidth: '680px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <span className="fw-semibold text-secondary small">⚡ Quick Demo Access:</span>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={handleDemoUser}>
                  👤 Citizen
                </button>
                <button className="btn btn-sm btn-outline-purple rounded-pill px-3" onClick={handleDemoStaff}>
                  👷 Staff
                </button>
                <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={handleDemoAdmin}>
                  🛡️ Admin
                </button>
              </div>
            </div>
          </div>

          {/* Public Track Complaint Widget */}
          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <TrackWidget />
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="container mt-n4 position-relative z-2">
        <div className="row g-4 text-center">
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
              <h2 className="fw-bold text-primary mb-1">99.4%</h2>
              <span className="text-muted small">Resolution SLA Compliance</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
              <h2 className="fw-bold text-success mb-1">&lt; 24 Hrs</h2>
              <span className="text-muted small">Avg Response Time</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
              <h2 className="fw-bold text-warning mb-1">4.8 / 5</h2>
              <span className="text-muted small">Citizen Satisfaction</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
              <h2 className="fw-bold text-purple mb-1" style={{ color: '#7c3aed' }}>100%</h2>
              <span className="text-muted small">Digital Transparency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container py-5 mt-4">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Engineered for Rapid Resolution</h2>
          <p className="text-muted">Designed to streamline communication between citizens, technicians, and administrators.</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 p-4 rounded-4 bg-white">
              <div
                className="rounded-3 p-3 text-white mb-3 d-inline-block"
                style={{ width: '50px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
              >
                📁
              </div>
              <h5 className="fw-bold">Easy File Submission</h5>
              <p className="text-muted small">
                Submit complaints with location tags, detailed descriptions, priority markers, and image/document attachments.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 p-4 rounded-4 bg-white">
              <div
                className="rounded-3 p-3 text-white mb-3 d-inline-block"
                style={{ width: '50px', background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                🎯
              </div>
              <h5 className="fw-bold">Smart Department Routing</h5>
              <p className="text-muted small">
                Complaints are automatically grouped by category and assigned to specific department officers for swift action.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 p-4 rounded-4 bg-white">
              <div
                className="rounded-3 p-3 text-white mb-3 d-inline-block"
                style={{ width: '50px', background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
              >
                📊
              </div>
              <h5 className="fw-bold">Live Status Timelines & PDF Receipts</h5>
              <p className="text-muted small">
                Track status updates from PENDING → IN PROGRESS → RESOLVED with audit timestamps, officer remarks, and downloadable PDF receipts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
