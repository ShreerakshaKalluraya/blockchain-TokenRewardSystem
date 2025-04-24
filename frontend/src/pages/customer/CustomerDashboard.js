import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch balance
        const balanceResponse = await axios.get('/api/customer/balance');
        setBalance(balanceResponse.data.balance);
        
        // Fetch available vouchers
        const vouchersResponse = await axios.get('/api/customer/available-vouchers');
        setAvailableVouchers(vouchersResponse.data);
        
        // Fetch customer's redemptions
        const redemptionsResponse = await axios.get('/api/customer/redemptions');
        setMyRedemptions(redemptionsResponse.data);
        
      } catch (error) {
        setError('Error fetching data: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleRedeemVoucher = async (voucherId) => {
    try {
      setError('');
      setRedeemSuccess('');
      
      const response = await axios.post(`/api/customer/redeem-voucher/${voucherId}`);
      
      // Refresh data after redemption
      const balanceResponse = await axios.get('/api/customer/balance');
      setBalance(balanceResponse.data.balance);
      
      const redemptionsResponse = await axios.get('/api/customer/redemptions');
      setMyRedemptions(redemptionsResponse.data);
      
      setRedeemSuccess(`Voucher redeemed successfully! Redemption ID: ${response.data.redemption_id}`);
    } catch (error) {
      setError('Error redeeming voucher: ' + (error.response?.data?.message || error.message));
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
  
  return (
    <div>
      <h2>Customer Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {redeemSuccess && <Alert variant="success">{redeemSuccess}</Alert>}
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Your Token Balance</Card.Title>
              <div className="token-balance">{balance} LTY</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <h3>Available Vouchers</h3>
      <Row>
        {availableVouchers.length === 0 ? (
          <Col>
            <Alert variant="info">No vouchers available at the moment.</Alert>
          </Col>
        ) : (
          availableVouchers.map(voucher => (
            <Col key={voucher.id} md={4} className="mb-3">
              <Card className="voucher-card">
                <Card.Body>
                  <Card.Title>{voucher.title}</Card.Title>
                  <Card.Text>{voucher.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg="info">{voucher.pointCost} points</Badge>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleRedeemVoucher(voucher.id)}
                      disabled={balance < voucher.pointCost}
                    >
                      Redeem
                    </Button>
                  </div>
                  {balance < voucher.pointCost && (
                    <small className="text-danger d-block mt-2">Insufficient balance</small>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      
      <h3 className="mt-4">Your Redemptions</h3>
      <Row>
        {myRedemptions.length === 0 ? (
          <Col>
            <Alert variant="info">You haven't redeemed any vouchers yet.</Alert>
          </Col>
        ) : (
          myRedemptions.map(redemption => (
            <Col key={redemption.id} md={4} className="mb-3">
              <Card className="voucher-card">
                <Card.Body>
                  <Card.Title>{redemption.voucherTitle}</Card.Title>
                  <Card.Text>{redemption.voucherDescription}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg="info">{redemption.pointCost} points</Badge>
                    <Badge bg={redemption.isRedeemed ? "success" : "warning"}>
                      {redemption.isRedeemed ? "Fulfilled" : "Pending"}
                    </Badge>
                  </div>
                  <small className="text-muted d-block mt-2">
                    Redeemed on: {new Date(redemption.redemptionTime * 1000).toLocaleString()}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default CustomerDashboard; 