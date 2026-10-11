import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Modal, Nav, Row, Spinner } from 'react-bootstrap';
import { FaChartBar, FaDownload, FaFileCsv, FaFilePdf, FaShieldAlt } from 'react-icons/fa';
import ComplaintsTable from '../../components/admin/ComplaintsTable';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
import DepartmentManager from '../../components/admin/DepartmentManager';
import StaffManager from '../../components/admin/StaffManager';
import TimelineView from '../../components/common/TimelineView';
import CommentThread from '../../components/common/CommentThread';
import { adminService, complaintService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('complaints');
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state for Complaints
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    departmentId: '',
  });

  // Modal States
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [timeline, setTimeline] = useState([]);

  // Form states for Assign / Status update
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignStaffId, setAssignStaffId] = useState('');
  const [updateStatus, setUpdateStatus] = useState('IN_PROGRESS');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getChartData(),
      ]);
      setStats(statsRes.data || {});
      setChartData(chartsRes.data || {});
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await adminService.getDepartments({ activeOnly: false });
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await adminService.getStaff();
      setStaffList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllComplaints({
        ...filters,
        page,
        size: pageSize,
      });

      if (res.data && res.data.content) {
        setComplaints(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        setComplaints(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await adminService.getAllFeedbacks();
      setFeedbacks(res.data?.feedbacks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchDepartments();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab, page, pageSize, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // Export handlers
  const handleExportCsv = async () => {
    try {
      toast.info('Generating CSV report...');
      const res = await adminService.exportCsvBlob(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export CSV report');
    }
  };

  const handleExportPdf = async () => {
    try {
      toast.info('Generating PDF summary report...');
      const res = await adminService.exportPdfBlob(filters);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints-summary-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export PDF report');
    }
  };

  const handleViewDetails = async (c) => {
    setSelectedComplaint(c);
    setShowDetailModal(true);
    try {
      const res = await complaintService.getComplaintHistory(c.id);
      setTimeline(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssignModal = (c) => {
    setSelectedComplaint(c);
    setAssignDeptId(c.departmentId ? String(c.departmentId) : '');
    setAssignStaffId(c.staffId ? String(c.staffId) : '');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignDeptId) {
      toast.error('Please select a department.');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.assignStaff(selectedComplaint.id, {
        departmentId: assignDeptId,
        staffId: assignStaffId || null,
        remarks: 'Department assigned by Admin',
      });
      toast.success('Department & staff assigned successfully!');
      setShowAssignModal(false);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusModal = (c) => {
    setSelectedComplaint(c);
    setUpdateStatus(c.status);
    setUpdateRemarks(c.remarks || '');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.updateComplaintStatus(selectedComplaint.id, {
        status: updateStatus,
        remarks: updateRemarks,
      });
      toast.success('Status updated successfully!');
      setShowStatusModal(false);
      fetchComplaints();
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCommentsModal = (c) => {
    setSelectedComplaint(c);
    setShowCommentsModal(true);
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      toast.success('User account status updated!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">

      <Container className="py-4">
        <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-primary" /> Admin Control Center
            </h3>
            <p className="text-muted mb-0 small">
              Executive dashboard for managing complaints, department routing, staff allocation, and report exports.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-success" size="sm" onClick={handleExportCsv} className="d-flex align-items-center gap-1">
              <FaFileCsv /> Export CSV Log
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleExportPdf} className="d-flex align-items-center gap-1">
              <FaFilePdf /> Export PDF Report
            </Button>
          </div>
        </div>

        {/* Dashboard Analytics Charts */}
        <div className="mb-4">
          <AnalyticsCharts chartData={chartData} />
        </div>

        {/* Navigation Tabs */}
        <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="bg-white p-2 rounded-4 shadow-sm mb-4 border gap-1">
          <Nav.Item>
            <Nav.Link eventKey="complaints" className="fw-bold">Complaints Management</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="departments" className="fw-bold">Departments</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="staff" className="fw-bold">Staff Directory</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="users" className="fw-bold">User Governance</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Tab 1: Complaints Management */}
        {activeTab === 'complaints' && (
          <ComplaintsTable
            complaints={complaints}
            departments={departments}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewDetails={handleViewDetails}
            onOpenAssignModal={handleOpenAssignModal}
            onOpenStatusModal={handleOpenStatusModal}
            onOpenCommentsModal={handleOpenCommentsModal}
            pagination={{
              currentPage: page,
              totalPages,
              pageSize,
              totalElements,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        )}

        {/* Tab 2: Departments */}
        {activeTab === 'departments' && (
          <DepartmentManager />
        )}

        {/* Tab 3: Staff */}
        {activeTab === 'staff' && (
          <StaffManager departments={departments} />
        )}

        {/* Tab 4: User Governance */}
        {activeTab === 'users' && (
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-white py-3">
              <h6 className="fw-bold mb-0">Registered Citizens & User Accounts</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td><strong>{u.fullName}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>
                          {u.isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Disabled</span>
                          )}
                        </td>
                        <td className="text-end">
                          <Button
                            variant={u.isActive ? 'outline-danger' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleUser(u.id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">Complaint Details: {selectedComplaint?.complaintNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <div>
              <div className="p-3 bg-light rounded border mb-3">
                <h6 className="fw-bold mb-1">{selectedComplaint.title}</h6>
                <p className="text-muted small mb-2">{selectedComplaint.description}</p>
                <div className="d-flex flex-wrap gap-3 small">
                  <div>Citizen: <strong>{selectedComplaint.userName} ({selectedComplaint.userEmail})</strong></div>
                  <div>Category: <strong>{selectedComplaint.category}</strong></div>
                  <div>Priority: <strong>{selectedComplaint.priority}</strong></div>
                </div>
              </div>
              <h6 className="fw-bold border-bottom pb-2 mb-3">Audit Trail / History</h6>
              <TimelineView history={timeline} />
              <CommentThread complaintId={selectedComplaint.id} />
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">Assign Department & Staff</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAssignSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Department *</Form.Label>
              <Form.Select
                value={assignDeptId}
                onChange={(e) => {
                  setAssignDeptId(e.target.value);
                  setAssignStaffId('');
                }}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Assign Technician Staff (Optional)</Form.Label>
              <Form.Select
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
              >
                <option value="">Select Staff Member</option>
                {staffList
                  .filter((s) => !assignDeptId || String(s.department?.id || s.departmentId) === String(assignDeptId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.designation || 'Technician'})</option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Assigning...' : 'Assign'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">Update Status: {selectedComplaint?.complaintNumber}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">New Status</Form.Label>
              <Form.Select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={updateRemarks}
                onChange={(e) => setUpdateRemarks(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Discussion Thread Modal */}
      <Modal show={showCommentsModal} onHide={() => setShowCommentsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">Discussion: {selectedComplaint?.complaintNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && <CommentThread complaintId={selectedComplaint.id} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
