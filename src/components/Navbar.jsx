import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await complaintService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await complaintService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await complaintService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark" to="/">
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            ⚖️
          </div>
          <span style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Resolver<span style={{ color: '#6366f1' }}>CMS</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1">
            <li className="nav-item">
              <Link
                className={`nav-link px-3 fw-medium ${location.pathname === '/' ? 'text-primary border-bottom border-2 border-primary' : 'text-secondary'}`}
                to="/"
              >
                Home
              </Link>
            </li>
            {isAuthenticated && !isAdmin && (
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 fw-medium ${location.pathname === '/user/dashboard' ? 'text-primary border-bottom border-2 border-primary' : 'text-secondary'}`}
                  to="/user/dashboard"
                >
                  My Complaints
                </Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 fw-medium ${location.pathname === '/admin/dashboard' ? 'text-primary border-bottom border-2 border-primary' : 'text-secondary'}`}
                  to="/admin/dashboard"
                >
                  Admin Control Center
                </Link>
              </li>
            )}
          </ul>

          {/* Right User Controls */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell for Regular Users */}
                {!isAdmin && (
                  <div className="position-relative">
                    <button
                      className="btn btn-light btn-sm rounded-circle p-2 position-relative"
                      onClick={() => setShowNotifications(!showNotifications)}
                      title="Notifications"
                      style={{ width: '40px', height: '40px' }}
                    >
                      🔔
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown Card */}
                    {showNotifications && (
                      <div
                        className="card shadow-lg position-absolute end-0 mt-2 rounded-4 border-0"
                        style={{ width: '360px', zIndex: 1050, overflow: 'hidden' }}
                      >
                        <div className="card-header bg-white d-flex justify-content-between align-items-center px-3 py-2.5 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-dark small">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                className="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold"
                                style={{ fontSize: '0.75rem' }}
                                onClick={markAllAsRead}
                              >
                                Mark all read
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-close btn-sm ms-1"
                              onClick={() => setShowNotifications(false)}
                              aria-label="Close"
                            ></button>
                          </div>
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div className="text-center py-4 text-muted small">
                              <div className="fs-4 mb-1">🔔</div>
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 border-bottom transition-all ${
                                  !n.isRead ? 'bg-light' : 'bg-white'
                                }`}
                                onClick={() => markAsRead(n.id)}
                                style={{
                                  cursor: 'pointer',
                                  borderLeft: !n.isRead ? '4px solid #4f46e5' : '4px solid transparent',
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                                  <div className="fw-semibold text-dark small">
                                    {n.complaint?.complaintNumber ? `Complaint ${n.complaint.complaintNumber}` : 'Status Update'}
                                  </div>
                                  <span className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }}>
                                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className="text-secondary small mb-0 lh-sm" style={{ wordBreak: 'break-word', fontSize: '0.82rem' }}>
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Profile Badge (Interactive) */}
                <div className="position-relative">
                  <div
                    className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border shadow-sm"
                    onClick={() => {
                      setShowProfileCard(!showProfileCard);
                      setShowNotifications(false);
                    }}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    title="Click to view citizen profile details"
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: isAdmin ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="d-none d-sm-block text-start" style={{ lineHeight: '1.2' }}>
                      <div className="fw-semibold text-dark small">{user?.fullName || 'Citizen User'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {isAdmin ? '🛡️ Administrator' : '👤 Citizen'}
                      </div>
                    </div>
                    <span className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>▼</span>
                  </div>

                  {/* Citizen Profile Details Popover */}
                  {showProfileCard && (
                    <div
                      className="card shadow-lg position-absolute end-0 mt-2 rounded-4 border-0"
                      style={{ width: '320px', zIndex: 1050, overflow: 'hidden' }}
                    >
                      <div
                        className="card-header text-white p-3 text-center"
                        style={{
                          background: isAdmin
                            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                            : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        }}
                      >
                        <div
                          className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-primary bg-white fw-bold shadow mb-2"
                          style={{ width: '52px', height: '52px', fontSize: '1.35rem' }}
                        >
                          {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h6 className="fw-bold mb-0 text-white">{user?.fullName || 'Citizen User'}</h6>
                        <span className="badge bg-white text-dark rounded-pill px-3 mt-1" style={{ fontSize: '0.7rem' }}>
                          {isAdmin ? '🛡️ System Administrator' : '👤 Registered Citizen'}
                        </span>
                      </div>

                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded-3">
                          <span className="fs-5">📧</span>
                          <div className="text-start" style={{ lineHeight: '1.2' }}>
                            <div className="text-muted extra-small" style={{ fontSize: '0.7rem' }}>Email Address</div>
                            <div className="fw-semibold text-dark small text-truncate" style={{ maxWidth: '210px' }}>
                              {user?.email || 'user@cms.com'}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded-3">
                          <span className="fs-5">📞</span>
                          <div className="text-start" style={{ lineHeight: '1.2' }}>
                            <div className="text-muted extra-small" style={{ fontSize: '0.7rem' }}>Phone Number</div>
                            <div className="fw-semibold text-dark small">
                              {user?.phone || '9876543210'}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded-3">
                          <span className="fs-5">🛡️</span>
                          <div className="text-start" style={{ lineHeight: '1.2' }}>
                            <div className="text-muted extra-small" style={{ fontSize: '0.7rem' }}>Account Status</div>
                            <div className="fw-semibold text-success small">
                              ● Active & Authenticated
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm w-100 rounded-pill"
                            onClick={() => setShowProfileCard(false)}
                          >
                            Close
                          </button>
                          <button
                            className="btn btn-danger btn-sm w-100 rounded-pill shadow-sm"
                            onClick={() => {
                              setShowProfileCard(false);
                              handleLogout();
                            }}
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-4">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
