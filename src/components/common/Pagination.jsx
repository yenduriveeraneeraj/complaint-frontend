import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const handlePrev = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
  };

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
      <div className="text-muted small">
        Showing Page <strong>{currentPage + 1}</strong> of <strong>{totalPages || 1}</strong> ({totalElements} total items)
      </div>

      <div className="d-flex align-items-center gap-3">
        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Per page:</span>
            <Form.Select
              size="sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ width: '75px' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>
        )}

        <div className="d-flex gap-1">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="d-flex align-items-center gap-1"
          >
            <FaChevronLeft size={10} /> Prev
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className="d-flex align-items-center gap-1"
          >
            Next <FaChevronRight size={10} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
