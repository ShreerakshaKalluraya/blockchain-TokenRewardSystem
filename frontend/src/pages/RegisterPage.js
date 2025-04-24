import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Web3 from 'web3';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [web3, setWeb3] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerCustomer, registerBusiness, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);
          
          // Get user's Ethereum address
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } else {
        alert('Please install MetaMask to use this application');
      }
    };
    
    initWeb3();
    
    // Redirect if already logged in
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!address) {
      setError('Ethereum address is required. Please connect with MetaMask.');
      setIsLoading(false);
      return;
    }
    
    let result;
    
    if (role === 'customer') {
      result = await registerCustomer(username, password, address);
    } else if (role === 'business') {
      if (!businessName) {
        setError('Business name is required');
        setIsLoading(false);
        return;
      }
      result = await registerBusiness(username, password, address, businessName);
    }
    
    setIsLoading(false);
    
    if (result.success) {
      setSuccess('Registration successful. You can now login.');
      // Reset form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setBusinessName('');
    } else {
      setError(result.message);
    }
  };
  
  return (
    <div className="auth-form">
      <h2>Register</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="customer" id="register-tabs" onSelect={(k) => setRole(k)}>
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ethereum Address</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    readOnly 
                    disabled 
                  />
                  <Form.Text className="text-muted">
                    Connect with MetaMask to provide your address
                  </Form.Text>
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Business Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)} 
                    required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ethereum Address</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    readOnly 
                    disabled 
                  />
                  <Form.Text className="text-muted">
                    Connect with MetaMask to provide your address
                  </Form.Text>
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterPage; 