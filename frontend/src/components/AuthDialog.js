import React, { useState } from 'react';
import axios from 'axios';
import '../css/Auth.css';

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
                localStorage.setItem("userEmail", email); // store email for tracking
                console.log(localStorage.getItem("userEmail"));
                setIsAuthenticated(true); // Set user as authenticated
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
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <>
                            <a href="/forgot-password">Forgot password?</a>
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
