import React, { useState } from 'react';
import { Badge, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
import { FaClock, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { publicService } from '../../services/api';
import TimelineView from '../common/TimelineView';
import { toast } from 'react-toastify';

const TrackWidget = () => {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!complaintNumber.trim()) {
      toast.error('Please enter a valid complaint ID.');
      return;
    }

    try {
      setLoading(true);
      const res = await publicService.trackComplaint(complaintNumber.trim());
      setResult(res.data);
      setShowModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Complaint number not found. Check ID and try again.');
    } finally {
      setLoading(false);
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
    <>
      <Card className="shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
        <Card.Body>
          <div className="text-center mb-3">
            <h4 className="fw-bold mb-1">Track Your Complaint Status</h4>
            <p className="text-muted small">No login required. Input your Complaint ID (e.g. CMP-2026-00001) below.</p>
          </div>
          <Form onSubmit={handleTrack} className="d-flex flex-column flex-sm-row gap-2">
            <Form.Control
              type="text"
              placeholder="Enter Complaint ID (CMP-2026-00001)"
              value={complaintNumber}
              onChange={(e) => setComplaintNumber(e.target.value)}
              size="lg"
              className="rounded-3"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="rounded-3 px-4 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <FaSearch />}
              Track
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
            Complaint Progress: {result?.complaintNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {result && (
            <div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-bold mb-1">{result.title}</h6>
                  <div className="small text-muted">
                    Category: <strong>{result.category}</strong> | Priority: <strong>{result.priority}</strong>
                  </div>
                </div>
                <div className="text-end">
                  <div className="mb-1">{getStatusBadge(result.status)}</div>
                  {result.isOverdue && (
                    <Badge className="badge-overdue me-1">
                      <FaExclamationTriangle /> OVERDUE
                    </Badge>
                  )}
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Department</small>
                  <strong>{result.departmentName || 'Pending Assignment'}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Submitted On</small>
                  <strong>{result.createdAt ? new Date(result.createdAt).toLocaleString() : ''}</strong>
                </div>
                {result.slaDeadline && (
                  <div className="col-md-6">
                    <small className="text-muted d-block">SLA Target Deadline</small>
                    <strong className={result.isOverdue ? 'text-danger' : 'text-dark'}>
                      <FaClock className="me-1" />
                      {new Date(result.slaDeadline).toLocaleString()}
                    </strong>
                  </div>
                )}
                {result.resolvedAt && (
                  <div className="col-md-6">
                    <small className="text-muted d-block">Resolved On</small>
                    <strong className="text-success">{new Date(result.resolvedAt).toLocaleString()}</strong>
                  </div>
                )}
              </div>

              <h6 className="fw-bold border-bottom pb-2 mb-3">Progress Timeline</h6>
              <TimelineView history={result.timeline} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TrackWidget;
