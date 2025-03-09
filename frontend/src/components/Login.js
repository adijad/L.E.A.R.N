import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/api/auth/login', { email, password })
            .then(response => {
                // Handle login success
                console.log('Login successful:', response.data);
            })
            .catch(error => {
                console.error('Error during login:', error);
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <img src="/path/to/your/image.jpg" alt="Background" />
            </div>
            <div className="auth-right">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
