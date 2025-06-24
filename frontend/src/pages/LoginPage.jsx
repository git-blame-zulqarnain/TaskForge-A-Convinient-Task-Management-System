import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');         
  const [password, setPassword] = useState('');   
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);


    const credentials = {
      email: email.trim(),
      password: password.trim()
    };

    console.log("LOGIN_PAGE: Submitting credentials:", credentials); 

    try {

      await login(credentials);
      navigate('/'); 
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error("LOGIN_PAGE: Login error caught in component:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container glass-card">
      <h1 className="auth-title">Login</h1>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            disabled={isLoading}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            disabled={isLoading}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="button button-primary auth-button" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="auth-switch-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;