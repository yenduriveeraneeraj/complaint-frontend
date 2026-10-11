import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AnalyticsCharts = ({ chartData }) => {
  const byStatus = chartData?.byStatus || [];
  const byCategory = chartData?.byCategory || [];
  const byPriority = chartData?.byPriority || [];

  return (
    <Row className="g-3">
      <Col md={4}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <h6 className="fw-bold mb-3">Complaints by Status</h6>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <h6 className="fw-bold mb-3">Complaints by Priority</h6>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={byPriority}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <h6 className="fw-bold mb-3">Complaints by Category</h6>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={byCategory} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnalyticsCharts;
