import React, { useState } from 'react';
import axios from 'axios';
import '../css/Auth.css';
import { FaUser, FaLock } from "react-icons/fa"; // Added icons

const AuthDialog = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { fullName, email, password };

        axios.post(`http://localhost:8080${endpoint}`, payload)
            .then(response => {
                console.log(`${isLogin ? 'Login' : 'Registration'} successful:`, response.data);
                localStorage.setItem("userEmail", email);
                setIsAuthenticated(true);
            })
            .catch(error => {
                setError(error.response?.data?.message || 'An error occurred');
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Join L.E.A.R.N'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className={fullName ? 'filled' : ''}
                            />
                            <label htmlFor="fullName">Full Name</label>
                            <FaUser className="input-icon" />
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={email ? 'filled' : ''}
                        />
                        <label htmlFor="email">Email</label>
                        <FaUser className="input-icon" />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={password ? 'filled' : ''}
                        />
                        <label htmlFor="password">Password</label>
                        <FaLock className="input-icon" />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={confirmPassword ? 'filled' : ''}
                            />
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <FaLock className="input-icon" />
                        </div>
                    )}
<div className="remember-forgot">
  <label className="remember-label">
    <input type="checkbox" />
    Remember me
  </label>
  <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
</div>



                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button">
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <>

                            <p>Don't have an account? <span onClick={() => setIsLogin(false)} className="auth-link">Sign up</span></p>
                        </>
                    ) : (
                        <p>Already have an account? <span onClick={() => setIsLogin(true)} className="auth-link">Sign in</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthDialog;
