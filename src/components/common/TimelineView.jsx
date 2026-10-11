import React from 'react';
import { FaCheckCircle, FaClock, FaExchangeAlt, FaTimesCircle } from 'react-icons/fa';

const TimelineView = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p className="text-muted small">No history recorded yet.</p>;
  }

  const getIcon = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <FaCheckCircle className="text-success" />;
      case 'REJECTED':
        return <FaTimesCircle className="text-danger" />;
      case 'IN_PROGRESS':
        return <FaExchangeAlt className="text-primary" />;
      default:
        return <FaClock className="text-warning" />;
    }
  };

  return (
    <div className="timeline-container ps-2 py-2">
      {history.map((item, idx) => (
        <div key={item.id || idx} className="timeline-item">
          <div className="timeline-dot bg-light border shadow-sm">
            {getIcon(item.status)}
          </div>
          <div className="timeline-content">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-semibold text-dark">
                {item.status ? item.status.replace('_', ' ') : 'UPDATE'}
              </span>
              <small className="text-muted">
                {item.changedAt ? new Date(item.changedAt).toLocaleString() : ''}
              </small>
            </div>
            <p className="text-muted small mb-1">{item.message}</p>
            {item.changedBy && (
              <small className="text-secondary fst-italic">By: {item.changedBy}</small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
