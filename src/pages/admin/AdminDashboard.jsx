import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('complaints');
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Selected Complaint for action
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // New Dept / Staff State
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDeptId, setStaffDeptId] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    if (activeTab === 'departments') fetchDepartments();
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'feedback') fetchFeedbacks();
  }, [activeTab, statusFilter, deptFilter]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getChartData(),
      ]);
      setStats(statsRes.data || null);
      
      const catData = chartsRes.data?.byCategory;
      setCategoryStats(Array.isArray(catData) ? catData : []);

      const statData = chartsRes.data?.byStatus;
      setStatusStats(Array.isArray(statData) ? statData : []);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllComplaints({
        status: statusFilter,
        departmentId: deptFilter,
      });
      const data = res.data;
      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (data && Array.isArray(data.content)) {
        setComplaints(data.content);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('Failed to fetch complaints', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await adminService.getDepartments();
      const data = res.data;
      const deptList = Array.isArray(data) ? data : [];
      setDepartments(deptList);
      return deptList;
    } catch (err) {
      console.error('Failed to fetch departments', err);
      setDepartments([]);
      return [];
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await adminService.getStaff();
      const data = res.data;
      const staffData = Array.isArray(data) ? data : [];
      setStaffList(staffData);
      return staffData;
    } catch (err) {
      console.error('Failed to fetch staff', err);
      setStaffList([]);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      const data = res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setUsers([]);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await adminService.getAllFeedbacks();
      const data = res.data;
      if (data && Array.isArray(data.feedbacks)) {
        setFeedbacks(data.feedbacks);
      } else if (Array.isArray(data)) {
        setFeedbacks(data);
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error('Failed to fetch feedback', err);
      setFeedbacks([]);
    }
  };

  // Actions
  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setRemarks(complaint.remarks || '');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateComplaintStatus(selectedComplaint.id, {
        status: newStatus,
        remarks,
      });
      setShowStatusModal(false);
      fetchComplaints();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleOpenAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    
    let currentDepts = departments;
    if (!currentDepts || currentDepts.length === 0) {
      currentDepts = await fetchDepartments();
    }
    await fetchStaff();

    const deptId = complaint.departmentId || complaint.department?.id || (currentDepts.length > 0 ? currentDepts[0].id : '');
    const staffId = complaint.staffId || complaint.assignedStaff?.id || '';

    setSelectedDeptId(deptId ? String(deptId) : '');
    setSelectedStaffId(staffId ? String(staffId) : '');
    setShowAssignModal(true);
  };

  const handleAssignStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.assignStaff(selectedComplaint.id, {
        departmentId: selectedDeptId,
        staffId: selectedStaffId || null,
        remarks: 'Assigned by Admin',
      });
      setShowAssignModal(false);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign staff.');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await adminService.createDepartment({ name: deptName, description: deptDesc });
      setShowDeptModal(false);
      setDeptName('');
      setDeptDesc('');
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await adminService.createStaff({
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
        departmentId: staffDeptId,
      });
      setShowStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff member.');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await adminService.toggleUserStatus(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Safe Arrays
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];
  const safeCategoryStats = Array.isArray(categoryStats) ? categoryStats : [];

  return (
    <div className="container py-4">
      {/* Page Title Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">🛡️ Admin Control Center</h3>
          <p className="text-muted small m-0">System-wide monitoring, complaint routing, and department management</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <span className="text-muted small fw-semibold">Total Lodged</span>
            <h3 className="fw-bold text-dark m-0 mt-1">{stats?.totalComplaints || 0}</h3>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-warning border-4">
            <span className="text-muted small fw-semibold">Pending</span>
            <h3 className="fw-bold text-warning m-0 mt-1">{stats?.pendingComplaints || 0}</h3>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-info border-4">
            <span className="text-muted small fw-semibold">In Progress</span>
            <h3 className="fw-bold text-info m-0 mt-1">{stats?.inProgressComplaints || 0}</h3>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4">
            <span className="text-muted small fw-semibold">Resolved</span>
            <h3 className="fw-bold text-success m-0 mt-1">{stats?.resolvedComplaints || 0}</h3>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-primary border-4">
            <span className="text-muted small fw-semibold">Avg Rating</span>
            <h3 className="fw-bold text-primary m-0 mt-1">⭐ {stats?.averageRating ? Number(stats.averageRating).toFixed(1) : 'N/A'}</h3>
          </div>
        </div>
      </div>

      {/* Visual Analytics Summary Bar */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">📊 Complaints by Category</h6>
            <div className="d-flex flex-column gap-2">
              {safeCategoryStats.length === 0 ? (
                <p className="text-muted small m-0 py-2">No category data yet.</p>
              ) : (
                safeCategoryStats.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between small">
                    <span className="fw-medium text-secondary">{item.name}</span>
                    <div className="d-flex align-items-center gap-2" style={{ width: '60%' }}>
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${Math.min(100, (item.value / (stats?.totalComplaints || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="fw-bold text-dark">{item.value}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">📈 Department Breakdown</h6>
            <div className="d-flex flex-column gap-2">
              {safeDepartments.length === 0 ? (
                <p className="text-muted small m-0 py-2">No departments created yet.</p>
              ) : (
                safeDepartments.slice(0, 4).map((d) => (
                  <div key={d.id} className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3">
                    <div className="fw-semibold text-dark small">{d.name}</div>
                    <span className="badge bg-secondary rounded-pill">{d.staffList?.length || 0} Staff Assigned</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills nav-fill bg-white p-2 rounded-4 shadow-sm mb-4 gap-2 border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 fw-bold ${activeTab === 'complaints' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('complaints')}
          >
            📋 All Complaints
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 fw-bold ${activeTab === 'departments' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('departments')}
          >
            🏢 Departments
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 fw-bold ${activeTab === 'staff' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('staff')}
          >
            👥 Staff Members
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 fw-bold ${activeTab === 'users' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            👤 Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 fw-bold ${activeTab === 'feedback' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('feedback')}
          >
            ⭐ Ratings
          </button>
        </li>
      </ul>

      {/* TAB 1: ALL COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h5 className="fw-bold m-0 text-dark">Complaints List ({safeComplaints.length})</h5>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm rounded-pill"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle small">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Title & Citizen</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Department & Staff</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  safeComplaints.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-bold text-primary font-monospace">{c.complaintNumber}</td>
                      <td>
                        <div className="fw-bold text-dark">{c.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          By: {c.userName || 'Citizen'} ({c.userEmail || ''})
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{c.category}</span></td>
                      <td><span className="badge bg-warning text-dark">{c.priority}</span></td>
                      <td>
                        <span className={`badge ${c.status === 'RESOLVED' ? 'bg-success' : c.status === 'IN_PROGRESS' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div>🏢 {c.departmentName || 'Not assigned'}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          👤 {c.staffName || 'No staff'}
                        </div>
                      </td>
                      <td className="text-muted">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-2.5 me-1"
                            onClick={() => handleOpenStatusModal(c)}
                          >
                            Update Status
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-pill px-2.5"
                            onClick={() => handleOpenAssignModal(c)}
                          >
                            Assign Staff
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0 text-dark">Departments Management</h5>
            <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowDeptModal(true)}>
              ➕ Add Department
            </button>
          </div>

          <div className="row g-3">
            {safeDepartments.map((d) => (
              <div key={d.id} className="col-md-6">
                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{d.name}</h6>
                    <p className="text-muted small m-0">{d.description}</p>
                  </div>
                  <span className="badge bg-success rounded-pill">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF */}
      {activeTab === 'staff' && (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0 text-dark">Department Officers & Staff</h5>
            <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowStaffModal(true)}>
              ➕ Add Staff Member
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle small">
              <thead className="table-light">
                <tr>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {safeStaffList.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-bold text-dark">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td><span className="badge bg-light text-dark border">{s.department?.name || s.departmentName || 'N/A'}</span></td>
                    <td><span className="badge bg-success rounded-pill">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS */}
      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          <h5 className="fw-bold mb-3 text-dark">User Account Governance</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle small">
              <thead className="table-light">
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Account Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {safeUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-dark">{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm rounded-pill ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleUser(u.id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          <h5 className="fw-bold mb-3 text-dark">Citizen Feedback & Ratings</h5>
          <div className="row g-3">
            {safeFeedbacks.length === 0 ? (
              <p className="text-muted small">No feedback submitted yet.</p>
            ) : (
              safeFeedbacks.map((f) => (
                <div key={f.id} className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-primary font-monospace">{f.complaintNumber}</span>
                      <span className="fw-bold text-warning fs-5">{'★'.repeat(f.rating || 5)}</span>
                    </div>
                    <p className="text-dark small m-0 mb-1">{f.comments || 'No comments left.'}</p>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      By: {f.userName} | {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && selectedComplaint && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Update Status: {selectedComplaint.complaintNumber}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">New Status *</label>
                    <select
                      className="form-select rounded-3"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Official Remarks / Resolution Notes</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Add remarks explaining status update..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowStatusModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN STAFF MODAL */}
      {showAssignModal && selectedComplaint && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Assign Department & Officer</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignStaffSubmit}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Complaint: <strong>{selectedComplaint.complaintNumber}</strong> - {selectedComplaint.title}
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Department *</label>
                    <select
                      className="form-select rounded-3"
                      value={selectedDeptId}
                      onChange={(e) => {
                        setSelectedDeptId(e.target.value);
                        setSelectedStaffId('');
                      }}
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      {safeDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Select Officer / Staff Member (Optional)</label>
                    <select
                      className="form-select rounded-3"
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                    >
                      <option value="">-- Choose Staff Member --</option>
                      {safeStaffList
                        .filter((s) => {
                          if (!selectedDeptId) return true;
                          const staffDeptId = s.department?.id || s.departmentId;
                          return staffDeptId && String(staffDeptId) === String(selectedDeptId);
                        })
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.email ? `(${s.email})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Assign Department & Officer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">➕ Add Department</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowDeptModal(false)}></button>
              </div>
              <form onSubmit={handleCreateDepartment}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Department Name *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Roads & Transport"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Scope of work..."
                      value={deptDesc}
                      onChange={(e) => setDeptDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowDeptModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Create Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showStaffModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">➕ Add Officer / Staff Member</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowStaffModal(false)}></button>
              </div>
              <form onSubmit={handleCreateStaff}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Staff Name *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Robert Vance"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email Address *</label>
                    <input
                      type="email"
                      className="form-control rounded-3"
                      placeholder="robert@cms.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Phone Number *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="9876543210"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Department *</label>
                    <select
                      className="form-select rounded-3"
                      value={staffDeptId}
                      onChange={(e) => setStaffDeptId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      {safeDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowStaffModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Add Staff Member
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

export default AdminDashboard;
