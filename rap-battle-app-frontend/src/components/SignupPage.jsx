// src/components/SignupPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaFacebook, FaGithub, FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSignup = async (e) => {
        e.preventDefault();
        const signupData = { email, phone, username, password };

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', signupData);
            console.log('Signup Successful:', response.data);
            login(); // set isAuthenticated to true
            navigate('/dashboard');
        } catch (error) {
            console.error('Signup Error:', error.response?.data || error.message);
            setErrorMessage(error.response?.data?.message || 'An error occurred');
        }

        // Clear form fields
        setEmail('');
        setPhone('');
        setUsername('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
            <div className="w-full max-w-md p-8 rounded-lg border border-gray-700 shadow-2xl bg-gray-800 text-white">
                <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-6">
                    Sign Up
                </h2>
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative flex items-center bg-gray-700 rounded-lg p-3 shadow-inner border border-cyan-500">
                        <FaEnvelope className="text-cyan-400 mr-3" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                    </div>
                    <div className="relative flex items-center bg-gray-700 rounded-lg p-3 shadow-inner border border-cyan-500">
                        <FaPhone className="text-cyan-400 mr-3" />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                    </div>
                    <div className="relative flex items-center bg-gray-700 rounded-lg p-3 shadow-inner border border-cyan-500">
                        <FaUser className="text-cyan-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                    </div>
                    <div className="relative flex items-center bg-gray-700 rounded-lg p-3 shadow-inner border border-cyan-500">
                        <FaLock className="text-cyan-400 mr-3" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 mt-6 bg-pink-500 text-white font-bold rounded-lg transition-all duration-300 hover:bg-pink-600 shadow-lg shadow-pink-500/50"
                    >
                        Sign Up
                    </button>

                    <div className="text-center mt-8">
                        <p className="text-gray-400 mb-4">Or sign up with</p>
                        <div className="flex items-center justify-center space-x-6">
                            <FaGoogle className="text-3xl text-cyan-400 cursor-pointer transition-all duration-300 hover:scale-110" />
                            <FaFacebook className="text-3xl text-pink-400 cursor-pointer transition-all duration-300 hover:scale-110" />
                            <FaGithub className="text-3xl text-purple-400 cursor-pointer transition-all duration-300 hover:scale-110" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
