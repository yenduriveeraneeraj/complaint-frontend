import React, { useState, useEffect } from 'react';
import { complaintService, feedbackService, publicService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Selected complaint state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);

  // Create Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ELECTRICAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [departmentId, setDepartmentId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchDepartments();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getUserComplaints({ status: statusFilter });
      setComplaints(res.data.content || res.data || []);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await publicService.getPublicDepartments();
      setDepartments(res.data || []);
      if (res.data?.length > 0) {
        setDepartmentId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('priority', priority);
      if (departmentId) formData.append('departmentId', departmentId);
      if (location) formData.append('location', location);
      formData.append('description', description);
      if (file) formData.append('file', file);

      await complaintService.submitComplaint(formData);
      setShowCreateModal(false);
      resetCreateForm();
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setTitle('');
    setCategory('ELECTRICAL');
    setPriority('MEDIUM');
    setLocation('');
    setDescription('');
    setFile(null);
  };

  const handleViewDetails = async (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
    try {
      const res = await complaintService.getComplaintHistory(complaint.id);
      setStatusHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch status history', err);
    }
  };

  const handleOpenFeedback = (complaint) => {
    setSelectedComplaint(complaint);
    setRating(5);
    setComments('');
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        complaintId: selectedComplaint.id,
        rating,
        comments,
      });
      setShowFeedbackModal(false);
      fetchComplaints();
      alert('Thank you for rating our resolution!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // KPI Counter Calculation
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  const filteredComplaints = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge bg-warning text-dark rounded-pill px-3 py-1">🟡 PENDING</span>;
      case 'IN_PROGRESS':
        return <span className="badge bg-info text-dark rounded-pill px-3 py-1">🔵 IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="badge bg-success rounded-pill px-3 py-1">🟢 RESOLVED</span>;
      case 'REJECTED':
        return <span className="badge bg-danger rounded-pill px-3 py-1">🔴 REJECTED</span>;
      default:
        return <span className="badge bg-secondary rounded-pill">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="badge bg-danger">🔥 URGENT</span>;
      case 'HIGH':
        return <span className="badge bg-warning text-dark">⚡ HIGH</span>;
      case 'MEDIUM':
        return <span className="badge bg-primary">🔹 MEDIUM</span>;
      case 'LOW':
        return <span className="badge bg-secondary">🌱 LOW</span>;
      default:
        return <span className="badge bg-secondary">{priority}</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Welcome back, {user?.fullName} 👋</h3>
          <p className="text-muted small m-0">Track and manage your submitted grievances</p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm fw-semibold"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Lodge New Complaint
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <span className="text-muted small fw-semibold">Total Lodged</span>
            <h3 className="fw-bold text-dark m-0 mt-1">{totalCount}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-warning border-4">
            <span className="text-muted small fw-semibold">Pending Review</span>
            <h3 className="fw-bold text-warning m-0 mt-1">{pendingCount}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-info border-4">
            <span className="text-muted small fw-semibold">In Progress</span>
            <h3 className="fw-bold text-info m-0 mt-1">{inProgressCount}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4">
            <span className="text-muted small fw-semibold">Resolved</span>
            <h3 className="fw-bold text-success m-0 mt-1">{resolvedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="btn-group w-100" role="group">
              <button
                className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'IN_PROGRESS' ? 'btn-info text-dark' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('IN_PROGRESS')}
              >
                In Progress
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'RESOLVED' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('RESOLVED')}
              >
                Resolved
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-sm rounded-pill px-3"
              placeholder="🔍 Search by Complaint ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading your complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 bg-white">
          <div className="fs-1 text-muted mb-2">📭</div>
          <h5 className="fw-semibold text-dark">No complaints found</h5>
          <p className="text-muted small">You haven't lodged any complaint under this filter yet.</p>
          <div>
            <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={() => setShowCreateModal(true)}>
              File Complaint Now
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredComplaints.map((item) => (
            <div key={item.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white hover-shadow transition">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-primary font-monospace">{item.complaintNumber}</span>
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </div>
                  <small className="text-muted">
                    📅 {new Date(item.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <h5 className="fw-bold text-dark mb-1">{item.title}</h5>
                <p className="text-secondary small mb-3 text-truncate">{item.description}</p>

                <div className="d-flex flex-wrap justify-content-between align-items-center border-top pt-2 mt-2 gap-2">
                  <div className="d-flex gap-3 small text-muted">
                    <span>🏢 <strong>Dept:</strong> {item.departmentName || 'Unassigned'}</span>
                    <span>📍 <strong>Location:</strong> {item.location || 'N/A'}</span>
                    <span>👤 <strong>Assigned Staff:</strong> {item.assignedStaffName || 'Pending'}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={() => handleViewDetails(item)}
                    >
                      View Details & History 🔍
                    </button>
                    {item.status === 'RESOLVED' && !item.feedback && (
                      <button
                        className="btn btn-warning btn-sm rounded-pill px-3 fw-semibold text-dark"
                        onClick={() => handleOpenFeedback(item)}
                      >
                        ⭐ Rate Resolution
                      </button>
                    )}
                    {item.feedback && (
                      <span className="badge bg-light text-dark border align-self-center px-3 py-1.5">
                        ⭐ Rated: {item.feedback.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COMPLAINT MODAL */}
      {showCreateModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">➕ File a New Complaint</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Complaint Title *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Brief title of the issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Category *</label>
                      <select
                        className="form-select rounded-3"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="ELECTRICAL">ELECTRICAL</option>
                        <option value="WATER">WATER & SANITATION</option>
                        <option value="INTERNET_WIFI">INTERNET / WIFI</option>
                        <option value="CLEANLINESS">CLEANLINESS</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="TRANSPORT">TRANSPORT</option>
                        <option value="SECURITY">SECURITY</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Priority Level *</label>
                      <select
                        className="form-select rounded-3"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Department</label>
                      <select
                        className="form-select rounded-3"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                      >
                        <option value="">Auto Select</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Location / Address</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Block C, Room 204 or Sector 4 Main Road"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Detailed Description *</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      placeholder="Describe the issue in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Attachment (Optional Image / PDF)</label>
                    <input
                      type="file"
                      className="form-control rounded-3"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS & STATUS HISTORY TIMELINE MODAL */}
      {showDetailModal && selectedComplaint && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  Complaint Details: <span className="text-warning">{selectedComplaint.complaintNumber}</span>
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-8">
                    <h5 className="fw-bold text-dark">{selectedComplaint.title}</h5>
                    <p className="text-secondary">{selectedComplaint.description}</p>
                  </div>
                  <div className="col-md-4 bg-light p-3 rounded-3 border">
                    <div className="small mb-1"><strong>Status:</strong> {getStatusBadge(selectedComplaint.status)}</div>
                    <div className="small mb-1"><strong>Priority:</strong> {getPriorityBadge(selectedComplaint.priority)}</div>
                    <div className="small mb-1"><strong>Category:</strong> {selectedComplaint.category}</div>
                    <div className="small mb-1"><strong>Department:</strong> {selectedComplaint.departmentName || 'N/A'}</div>
                    <div className="small mb-1"><strong>Assigned Officer:</strong> {selectedComplaint.assignedStaffName || 'Unassigned'}</div>
                    <div className="small"><strong>Location:</strong> {selectedComplaint.location || 'N/A'}</div>
                  </div>
                </div>

                {selectedComplaint.remarks && (
                  <div className="alert alert-info py-2 small mb-4">
                    <strong>Admin Remarks:</strong> {selectedComplaint.remarks}
                  </div>
                )}

                <h6 className="fw-bold border-bottom pb-2 mb-3">⏱️ Lifecycle Status Timeline</h6>
                {statusHistory.length === 0 ? (
                  <p className="text-muted small">No history recorded yet.</p>
                ) : (
                  <div className="timeline ps-3">
                    {statusHistory.map((h, idx) => (
                      <div key={idx} className="position-relative mb-3 ps-3 border-start border-2 border-primary">
                        <div className="fw-bold text-dark small">{h.oldStatus} ➔ {h.newStatus}</div>
                        <div className="text-muted small">{h.remarks || 'Status updated by system/admin'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          By: {h.changedByName} | {new Date(h.changedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top p-3">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK RATING MODAL */}
      {showFeedbackModal && selectedComplaint && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-warning text-dark rounded-top-4">
                <h5 className="modal-title fw-bold">⭐ Rate Resolution Quality</h5>
                <button className="btn-close" onClick={() => setShowFeedbackModal(false)}></button>
              </div>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="modal-body p-4 text-center">
                  <p className="text-muted small mb-3">
                    Complaint: <strong>{selectedComplaint.complaintNumber}</strong> - {selectedComplaint.title}
                  </p>

                  <div className="mb-4">
                    <label className="form-label fw-bold d-block mb-2">Rating Star Scale (1 - 5)</label>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={`btn fs-2 p-1 ${rating >= star ? 'text-warning' : 'text-secondary opacity-25'}`}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="fw-bold text-primary mt-1 d-block">{rating} out of 5 Stars</span>
                  </div>

                  <div className="text-start mb-3">
                    <label className="form-label fw-semibold small">Comments / Feedback</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="How satisfied were you with the resolution time and officer conduct?"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowFeedbackModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning rounded-pill px-4 fw-semibold text-dark" disabled={feedbackSubmitting}>
                    {feedbackSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
