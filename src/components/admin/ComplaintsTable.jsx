import React from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { FaComments, FaExclamationTriangle, FaEye, FaUserCheck } from 'react-icons/fa';
import Pagination from '../common/Pagination';

const ComplaintsTable = ({
  complaints = [],
  departments = [],
  filters,
  onFilterChange,
  onViewDetails,
  onOpenAssignModal,
  onOpenStatusModal,
  onOpenCommentsModal,
  pagination,
}) => {
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="badge-urgent">URGENT</Badge>;
      case 'HIGH':
        return <Badge className="badge-high">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge className="badge-medium">MEDIUM</Badge>;
      case 'LOW':
        return <Badge className="badge-low">LOW</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="bg-white p-3 rounded-4 shadow-sm border">
      {/* Filter Toolbar */}
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-md-3">
          <Form.Select
            size="sm"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </Form.Select>
        </div>
        <div className="col-md-3">
          <Form.Select
            size="sm"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="WATER">Water</option>
            <option value="INTERNET_WIFI">Internet / WiFi</option>
            <option value="CLEANLINESS">Cleanliness</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="TRANSPORT">Transport</option>
            <option value="SECURITY">Security</option>
            <option value="OTHER">Other</option>
          </Form.Select>
        </div>
        <div className="col-md-3">
          <Form.Select
            size="sm"
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent (24h)</option>
            <option value="HIGH">High (48h)</option>
            <option value="MEDIUM">Medium (72h)</option>
            <option value="LOW">Low (7d)</option>
          </Form.Select>
        </div>
        <div className="col-md-3">
          <Form.Select
            size="sm"
            value={filters.departmentId}
            onChange={(e) => onFilterChange('departmentId', e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-responsive">
        <Table hover align="middle" className="mb-0 border">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Citizen</th>
              <th>Category</th>
              <th>Priority</th>
              <th>SLA Status</th>
              <th>Department</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  No complaints found matching selected criteria.
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong className="text-primary">{c.complaintNumber}</strong>
                  </td>
                  <td>
                    <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                      {c.title}
                    </div>
                    <small className="text-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</small>
                  </td>
                  <td>
                    <div className="small fw-medium">{c.userName}</div>
                    <small className="text-muted">{c.userEmail}</small>
                  </td>
                  <td>
                    <small className="fw-semibold">{c.category}</small>
                  </td>
                  <td>{getPriorityBadge(c.priority)}</td>
                  <td>
                    {c.isOverdue ? (
                      <Badge className="badge-overdue">
                        <FaExclamationTriangle /> OVERDUE
                      </Badge>
                    ) : (
                      <span className="small text-success fw-medium">On Track</span>
                    )}
                  </td>
                  <td>
                    <small>{c.departmentName || <span className="text-muted italic">Unassigned</span>}</small>
                    {c.staffName && <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Tech: {c.staffName}</div>}
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => onViewDetails(c)}
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onOpenAssignModal(c)}
                        title="Assign Department/Staff"
                      >
                        <FaUserCheck />
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => onOpenCommentsModal(c)}
                        title="Discussion Thread"
                      >
                        <FaComments />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => onOpenStatusModal(c)}
                        title="Update Status"
                      >
                        Status
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalElements={pagination.totalElements}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
};

export default ComplaintsTable;
