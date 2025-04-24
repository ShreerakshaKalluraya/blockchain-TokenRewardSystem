import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch admin password
    const fetchAdminPassword = async () => {
      try {
        const response = await axios.get('/api/admin/password');
        setAdminPassword(response.data.admin_password);
      } catch (error) {
        console.error('Error fetching admin password:', error);
      }
    };
    
    fetchAdminPassword();
    
    // Redirect if already logged in
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(username, password, role);
    
    setIsLoading(false);
    
    if (result.success) {
      navigate(`/dashboard/${role}`);
    } else {
      setError(result.message);
    }
  };
  
  return (
    <div className="auth-form">
      <h2>Login</h2>
      
      {adminPassword && (
        <Alert variant="info">
          <strong>Admin Password:</strong> {adminPassword}
        </Alert>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="customer" id="login-tabs" onSelect={(k) => setRole(k)}>
            <Tab eventKey="customer" title="Customer">
              <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="business" title="Business">
              <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="admin" title="Admin">
              <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Admin Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <Form.Text className="text-muted">
                    Use the admin password displayed above.
                  </Form.Text>
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage; 