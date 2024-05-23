import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './RegisterForm.css';
import logo from './Logo/firetech.png';
import PayPalButton from './PayPalbutton'; // Adjust the path if needed

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phone_number: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:8080/twilio_balance');
      setBalance(response.data);
    } catch (error) {
      console.error('Error fetching Twilio balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const checkVerificationStatus = async (id) => {
    try {
      const verificationResponse = await axios.get(`http://localhost:8080/check_verification/${id}`);
      if (verificationResponse.data.is_verified) {
        setMessage('Congrats, you are verified!');
      } else if (verificationResponse.data.verification_attempts >= 2) {
        setMessage('Verification failed, no more attempts left.');
      } else {
        setMessage('Verification failed, please try again.');
      }
      setIsLoading(false);
    } catch (error) {
      setMessage(`Error: ${error.response ? error.response.data.detail : error.message}`);
      setIsLoading(false);
    }
  };

  const checkCallStatus = async (id) => {
    let interval = setInterval(async () => {
      try {
        const callStatusResponse = await axios.get(`http://localhost:8080/check_call_status/${id}`);
        if (callStatusResponse.data.call_status === 'completed') {
          clearInterval(interval);
          await checkVerificationStatus(id);
        } else if (["no-answer", "failed", "busy", "canceled"].includes(callStatusResponse.data.call_status)) {
          setMessage(`Call ${callStatusResponse.data.call_status}. Please try again.`);
          setIsLoading(false);
          clearInterval(interval);
        }
      } catch (error) {
        setMessage(`Error: ${error.response ? error.response.data.detail : error.message}`);
        setIsLoading(false);
        clearInterval(interval);
      }
    }, 5000);
  };

  useEffect(() => {
    if (userId) {
      checkCallStatus(userId);
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('Verification... Please wait.');
    setIsFormVisible(false);
    try {
      if (!/(?=.*\d)(?=.*[!@#$%^&*()_+=-])/.test(formData.password)) {
        setMessage('Password must include at least one number and one symbol from !@#$%^&*()_+=-');
        setIsLoading(false);
        setIsFormVisible(true);
        return;
      }

      const response = await axios.post('http://localhost:8080/register', formData);
      setUserId(response.data.id);
    } catch (error) {
      setIsLoading(false);
      setIsFormVisible(true);
      setMessage(`Error: ${error.response ? error.response.data.detail : error.message}`);
    }

    setTimeout(() => {
      if (userId) {
        checkCallStatus(userId);
      }
    }, 10000);
  };

  return (
    <div className="register-form-container">
      <div className="register-form-header">
        <img src={logo} alt="Logo" className="register-form-logo" />
        {balance && (
          <div className="balance-info">
            Balance: {balance.balance.toFixed(2)} {balance.currency}
          </div>
        )}
        {!showPaymentForm && (
          <button className="pay-here-button" onClick={() => setShowPaymentForm(true)}>
            Pay here
          </button>
        )}
        {showPaymentForm && (
          <div className="payment-section">
            <PayPalButton />
          </div>
        )}
      </div>
      {isFormVisible && (
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register now'}
          </button>
        </form>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RegisterForm;
