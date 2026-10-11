import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { FaBuilding, FaEdit, FaPlus, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDepartments({ activeOnly: false });
      setDepartments(res.data || []);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await adminService.updateDepartment(editingDept.id, formData);
        toast.success('Department updated successfully');
      } else {
        await adminService.createDepartment(formData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleDepartmentStatus(id);
      toast.success('Department status updated');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <FaBuilding className="text-primary" /> Department Management
        </h6>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="d-flex align-items-center gap-1">
          <FaPlus /> Add Department
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover align="middle" className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td><strong>{d.name}</strong></td>
                  <td className="small text-muted">{d.description || '-'}</td>
                  <td>
                    {d.isActive ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button variant="outline-secondary" size="sm" onClick={() => handleOpenEdit(d)} className="me-1">
                      <FaEdit /> Edit
                    </Button>
                    <Button
                      variant={d.isActive ? 'outline-danger' : 'outline-success'}
                      size="sm"
                      onClick={() => handleToggleStatus(d.id)}
                    >
                      {d.isActive ? <FaToggleOn /> : <FaToggleOff />} {d.isActive ? 'Deactivate' : 'Activate'}
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
            {editingDept ? 'Edit Department' : 'Create New Department'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Department Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Department
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default DepartmentManager;
