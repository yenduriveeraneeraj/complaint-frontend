import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { FaCheckCircle, FaClock, FaComments, FaExclamationTriangle, FaEye, FaTools } from 'react-icons/fa';
import { staffPortalService, complaintService } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import TimelineView from '../../components/common/TimelineView';
import CommentThread from '../../components/common/CommentThread';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Selected complaint details modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Status update modal
  const [statusModalComplaint, setStatusModalComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [technicianRemarks, setTechnicianRemarks] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const res = await staffPortalService.getDashboardStats();
      setStats(res.data || {});
    } catch (err) {
      console.error('Failed to load staff stats', err);
    }
  };

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await staffPortalService.getMyComplaints({ page, size: pageSize });
      if (res.data && res.data.content) {
        setComplaints(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        setComplaints(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchMyComplaints();
  }, [page, pageSize]);

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

  const handleOpenStatusModal = (c) => {
    setStatusModalComplaint(c);
    setNewStatus(c.status === 'PENDING' ? 'IN_PROGRESS' : c.status);
    setTechnicianRemarks(c.remarks || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalComplaint) return;

    try {
      setSubmittingStatus(true);
      await staffPortalService.updateComplaintStatus(statusModalComplaint.id, {
        status: newStatus,
        remarks: technicianRemarks,
      });
      toast.success('Complaint status and technician remarks updated!');
      setStatusModalComplaint(null);
      fetchMyComplaints();
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="badge-pending">PENDING</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="badge-progress">IN PROGRESS</Badge>;
      case 'RESOLVED':
        return <Badge className="badge-resolved">RESOLVED</Badge>;
      case 'REJECTED':
        return <Badge className="badge-rejected">REJECTED</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">

      <Container className="py-4">
        <div className="page-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaTools className="text-primary" /> Technician Staff Portal
            </h3>
            <p className="text-muted mb-0 small">
              Manage your assigned field tickets, record resolution notes, and update ticket statuses.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <div className="stat-card border-start border-4 border-primary">
              <div className="text-muted small fw-bold">TOTAL ASSIGNED</div>
              <h2 className="fw-bold my-1 text-primary">{stats.myTotalComplaints || 0}</h2>
              <small className="text-muted">Tickets in your queue</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card border-start border-4 border-warning">
              <div className="text-muted small fw-bold">PENDING REVIEW</div>
              <h2 className="fw-bold my-1 text-warning">{stats.myPendingComplaints || 0}</h2>
              <small className="text-muted">Awaiting start</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card border-start border-4 border-info">
              <div className="text-muted small fw-bold">IN PROGRESS</div>
              <h2 className="fw-bold my-1 text-info">{stats.myInProgressComplaints || 0}</h2>
              <small className="text-muted">Active field work</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card border-start border-4 border-success">
              <div className="text-muted small fw-bold">RESOLVED</div>
              <h2 className="fw-bold my-1 text-success">{stats.myResolvedComplaints || 0}</h2>
              <small className="text-muted">Completed tickets</small>
            </div>
          </Col>
        </Row>

        {/* Complaints List */}
        <Card className="shadow-sm border-0 rounded-4 p-3">
          <Card.Header className="bg-white py-3 border-0">
            <h5 className="fw-bold mb-0">My Assigned Complaints</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover align="middle" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Complaint ID</th>
                    <th>Title & Location</th>
                    <th>Citizen Details</th>
                    <th>Priority</th>
                    <th>SLA Deadline</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No assigned complaints found.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong className="text-primary">{c.complaintNumber}</strong>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{c.title}</div>
                          <small className="text-muted">{c.location || 'Location not specified'}</small>
                        </td>
                        <td>
                          <div className="small fw-medium">{c.userName}</div>
                          <small className="text-muted">{c.userEmail}</small>
                        </td>
                        <td>
                          <Badge bg="outline-secondary" className={`badge-${c.priority?.toLowerCase()}`}>
                            {c.priority}
                          </Badge>
                        </td>
                        <td>
                          {c.isOverdue ? (
                            <Badge className="badge-overdue">
                              <FaExclamationTriangle /> OVERDUE
                            </Badge>
                          ) : c.slaDeadline ? (
                            <small className="text-dark">
                              <FaClock className="me-1 text-muted" />
                              {new Date(c.slaDeadline).toLocaleString()}
                            </small>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{getStatusBadge(c.status)}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleViewDetails(c)}
                            className="me-1"
                          >
                            <FaEye /> View
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenStatusModal(c)}
                            className="d-inline-flex align-items-center gap-1"
                          >
                            <FaTools size={12} /> Update Work
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalElements={totalElements}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </Card.Body>
        </Card>
      </Container>

      {/* Details & Discussion Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">
            Complaint Details: {selectedComplaint?.complaintNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <div>
              <div className="p-3 bg-light rounded border mb-3">
                <h6 className="fw-bold mb-1">{selectedComplaint.title}</h6>
                <p className="text-muted small mb-2">{selectedComplaint.description}</p>
                <div className="d-flex flex-wrap gap-3 small">
                  <div>Category: <strong>{selectedComplaint.category}</strong></div>
                  <div>Priority: <strong>{selectedComplaint.priority}</strong></div>
                  <div>Location: <strong>{selectedComplaint.location || 'N/A'}</strong></div>
                </div>
              </div>

              {selectedComplaint.remarks && (
                <div className="alert alert-info py-2 px-3 small mb-3">
                  <strong>Technician Remarks:</strong> {selectedComplaint.remarks}
                </div>
              )}

              <h6 className="fw-bold border-bottom pb-2 mb-3">Audit Trail / History</h6>
              <TimelineView history={timeline} />

              <CommentThread complaintId={selectedComplaint.id} />
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={!!statusModalComplaint} onHide={() => setStatusModalComplaint(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">
            Update Technician Progress: {statusModalComplaint?.complaintNumber}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateStatus}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Status Transition</Form.Label>
              <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="IN_PROGRESS">IN PROGRESS (Work Started)</option>
                <option value="RESOLVED">RESOLVED (Work Completed)</option>
                <option value="REJECTED">REJECTED (Invalid / Duplicate)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Technician Remarks & Completion Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe actions taken, replaced components, or resolution details..."
                value={technicianRemarks}
                onChange={(e) => setTechnicianRemarks(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setStatusModalComplaint(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submittingStatus}>
              {submittingStatus ? 'Saving...' : 'Save & Notify Citizen'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffDashboard;
