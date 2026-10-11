import React, { useEffect, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { commentService } from '../../services/api';
import { toast } from 'react-toastify';

const CommentThread = ({ complaintId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentService.getComments(complaintId);
      setComments(res.data || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchComments();
    }
  }, [complaintId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await commentService.addComment(complaintId, { commentText: newComment });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="badge bg-danger ms-2">Admin</span>;
      case 'ROLE_STAFF':
        return <span className="badge bg-info text-dark ms-2">Technician</span>;
      default:
        return <span className="badge bg-secondary ms-2">Citizen</span>;
    }
  };

  return (
    <div className="comment-thread mt-4 border-top pt-3">
      <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
        <span>Activity & Discussion Thread</span>
        <small className="text-muted fw-normal">{comments.length} comments</small>
      </h6>

      {loading ? (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted small text-center py-3 bg-light rounded">
          No discussion messages yet. Start the conversation below.
        </p>
      ) : (
        <div className="comments-list mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {comments.map((c) => (
            <div key={c.id} className="comment-card bg-light p-2 mb-2 rounded border">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-1">
                  <FaUserCircle className="text-primary" />
                  <strong className="small">{c.authorName}</strong>
                  {getRoleBadge(c.authorRole)}
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                </small>
              </div>
              <p className="mb-0 small text-dark ps-3">{c.commentText}</p>
            </div>
          ))}
        </div>
      )}

      <Form onSubmit={handleSubmit} className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Type a message / clarification note..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          size="sm"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={submitting || !newComment.trim()}
          className="d-flex align-items-center gap-1"
        >
          {submitting ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
          Send
        </Button>
      </Form>
    </div>
  );
};

export default CommentThread;
