import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { FaEdit, FaPlus, FaToggleOff, FaToggleOn, FaUserCheck } from 'react-icons/fa';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const StaffManager = ({ departments = [] }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: '',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStaff();
      setStaffList(res.data || []);
    } catch (err) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      departmentId: departments[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStaff(st);
    setFormData({
      name: st.name,
      email: st.email,
      phone: st.phone || '',
      designation: st.designation || '',
      departmentId: st.department?.id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await adminService.updateStaff(editingStaff.id, formData);
        toast.success('Staff member updated');
      } else {
        await adminService.createStaff(formData);
        toast.success('Staff member created successfully');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save staff member');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleStaffStatus(id);
      toast.success('Staff status updated');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to toggle staff status');
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <FaUserCheck className="text-primary" /> Staff / Technician Directory
        </h6>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="d-flex align-items-center gap-1">
          <FaPlus /> Add Staff Member
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover align="middle" className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>
                    <div className="small">{s.email}</div>
                    <small className="text-muted">{s.phone}</small>
                  </td>
                  <td><small>{s.designation || '-'}</small></td>
                  <td><strong>{s.department?.name || '-'}</strong></td>
                  <td>
                    {s.isActive ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button variant="outline-secondary" size="sm" onClick={() => handleOpenEdit(s)} className="me-1">
                      <FaEdit /> Edit
                    </Button>
                    <Button
                      variant={s.isActive ? 'outline-danger' : 'outline-success'}
                      size="sm"
                      onClick={() => handleToggleStatus(s.id)}
                    >
                      {s.isActive ? <FaToggleOn /> : <FaToggleOff />} {s.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Full Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            {!editingStaff && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Phone Number</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Designation</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Senior Network Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Department</Form.Label>
              <Form.Select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Staff Member
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffManager;
