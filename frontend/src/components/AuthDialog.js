import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // Create this CSS file

const AuthDialog = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        axios.post(`http://localhost:8080${endpoint}`, { email, password })
            .then(response => {
                console.log(`${isLogin ? 'Login' : 'Registration'} successful:`, response.data);
                // Handle success (redirect/store token)
            })
            .catch(error => {
                console.error(`Error during ${isLogin ? 'login' : 'registration'}:`, error);
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-glassmorphism">
                    <div className="auth-content">
                        <div className="auth-tabs">
                            <button
                                className={`tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-button">
                                {isLogin ? 'Login' : 'Create Account'}
                            </button>
                        </form>

                        {isLogin && (
                            <div className="auth-options">
                                <a href="/forgot-password">Forgot password?</a>
                                <div className="social-login">
                                    <button className="google-btn">
                                        Continue with Google
                                    </button>
                                    <button className="github-btn">
                                        Continue with GitHub
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthDialog;