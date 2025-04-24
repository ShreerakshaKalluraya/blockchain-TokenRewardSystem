import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get('/api/admin/businesses');
        setBusinesses(response.data);
      } catch (error) {
        setError('Error fetching businesses: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, []);
  
  const handleApproveBusiness = async (businessAddress) => {
    try {
      setError('');
      setSuccess('');
      
      await axios.post('/api/admin/approve-business', { address: businessAddress });
      
      // Refresh businesses list
      const response = await axios.get('/api/admin/businesses');
      setBusinesses(response.data);
      
      setSuccess('Business approved successfully!');
    } catch (error) {
      setError('Error approving business: ' + (error.response?.data?.message || error.message));
    }
  };
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading admin dashboard...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Admin Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Registered Businesses</Card.Title>
              
              {businesses.length === 0 ? (
                <Alert variant="info" className="mt-3">
                  No businesses registered yet.
                </Alert>
              ) : (
                <Table striped bordered hover responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Business Name</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((business, index) => (
                      <tr key={index}>
                        <td>{business.username}</td>
                        <td>{business.name}</td>
                        <td>
                          <small className="text-muted">
                            {business.address.substring(0, 6)}...{business.address.substring(business.address.length - 4)}
                          </small>
                        </td>
                        <td>
                          <Badge bg="primary">Registered</Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleApproveBusiness(business.address)}
                          >
                            Approve
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>System Information</Card.Title>
              <Card.Text>
                <strong>Admin Address:</strong> {user.address}
              </Card.Text>
              
              <Alert variant="warning">
                <h5>Important:</h5>
                <p>
                  As the admin, you have the authority to approve businesses to participate in the loyalty token system.
                  Once approved, businesses can create vouchers for customers to redeem with their loyalty tokens.
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 