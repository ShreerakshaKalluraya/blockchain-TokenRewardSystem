import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, Spinner, Badge, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BusinessDashboard = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New voucher form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointCost, setPointCost] = useState(100);
  const [formError, setFormError] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchBusinessStatus = async () => {
      setLoading(true);
      setError('');
      
      try {
        // We'll simulate this check with our in-memory business store
        // In a real app, you'd query the blockchain
        try {
          // Check if the business is registered on-chain
          const response = await axios.get(`/api/voucher/1`);
          if (response.status === 200) {
            setIsRegistered(true);
            setIsApproved(true);
            fetchVouchers();
          }
        } catch (error) {
          // If fetching vouchers fails, it could be because the business is not registered or approved
          // Register the business on-chain
          setIsRegistered(false);
          setIsApproved(false);
          setLoading(false);
        }
      } catch (error) {
        setError('Error checking business status: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };
    
    const fetchVouchers = async () => {
      try {
        const response = await axios.get('/api/business/vouchers');
        setVouchers(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching vouchers: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };
    
    fetchBusinessStatus();
  }, []);
  
  const handleRegisterBusiness = async () => {
    try {
      setError('');
      setSuccess('');
      
      const businessName = user.username; // Using username as business name for simplicity
      
      await axios.post('/api/business/register-on-chain', { name: businessName });
      
      setSuccess('Business registered on-chain. Waiting for admin approval.');
      setIsRegistered(true);
    } catch (error) {
      setError('Error registering business: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    
    try {
      setFormError('');
      
      if (!title || !description || !pointCost) {
        setFormError('All fields are required');
        return;
      }
      
      const response = await axios.post('/api/business/create-voucher', {
        title,
        description,
        pointCost
      });
      
      // Refresh vouchers list
      const vouchersResponse = await axios.get('/api/business/vouchers');
      setVouchers(vouchersResponse.data);
      
      // Clear form and close modal
      setTitle('');
      setDescription('');
      setPointCost(100);
      setShowCreateModal(false);
      
      setSuccess('Voucher created successfully!');
    } catch (error) {
      setFormError('Error creating voucher: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleToggleVoucher = async (voucherId) => {
    try {
      setError('');
      setSuccess('');
      
      await axios.post(`/api/business/toggle-voucher/${voucherId}`);
      
      // Refresh vouchers list
      const response = await axios.get('/api/business/vouchers');
      setVouchers(response.data);
      
      setSuccess('Voucher status updated successfully!');
    } catch (error) {
      setError('Error updating voucher: ' + (error.response?.data?.message || error.message));
    }
  };
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }
  
  if (!isRegistered) {
    return (
      <div>
        <h2>Business Dashboard</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="dashboard-card">
          <Card.Body>
            <Card.Title>Welcome to the Loyalty Token System</Card.Title>
            <Card.Text>
              Your business needs to be registered on the blockchain before you can create vouchers.
            </Card.Text>
            <Button variant="primary" onClick={handleRegisterBusiness}>
              Register Business on Blockchain
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }
  
  if (!isApproved) {
    return (
      <div>
        <h2>Business Dashboard</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="dashboard-card">
          <Card.Body>
            <Card.Title>Waiting for Approval</Card.Title>
            <Card.Text>
              Your business has been registered on the blockchain, but it needs to be approved by the admin before you can create vouchers.
              Please wait for approval.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Business Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title>Your Vouchers</Card.Title>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create New Voucher
                </Button>
              </div>
              
              {vouchers.length === 0 ? (
                <Alert variant="info" className="mt-3">
                  You haven't created any vouchers yet. Create your first voucher to start!
                </Alert>
              ) : (
                <Row className="mt-3">
                  {vouchers.map(voucher => (
                    <Col key={voucher.id} md={4} className="mb-3">
                      <Card className="voucher-card">
                        <Card.Body>
                          <Card.Title>{voucher.title}</Card.Title>
                          <Card.Text>{voucher.description}</Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="info">{voucher.pointCost} points</Badge>
                            <Badge bg={voucher.isActive ? "success" : "danger"}>
                              {voucher.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <Button 
                              variant={voucher.isActive ? "outline-danger" : "outline-success"} 
                              size="sm"
                              onClick={() => handleToggleVoucher(voucher.id)}
                            >
                              {voucher.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Create Voucher Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          <Form onSubmit={handleCreateVoucher}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Point Cost</Form.Label>
              <Form.Control 
                type="number" 
                value={pointCost} 
                onChange={(e) => setPointCost(parseInt(e.target.value))} 
                min="1" 
                required 
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Create Voucher
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BusinessDashboard; 