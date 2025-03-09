import React, { useState } from 'react';
import axios from 'axios';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/api/auth/register', { email, password })
            .then(response => {
                // Handle registration success
                console.log('Registration successful:', response.data);
            })
            .catch(error => {
                console.error('Error during registration:', error);
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <img src="/path/to/your/image.jpg" alt="Background" />
            </div>
            <div className="auth-right">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
