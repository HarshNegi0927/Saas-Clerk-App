import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';

const LoginPage = () => {
    const [userType, setUserType] = useState('Student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (userType === 'Student' && username && password) {
            navigate('/student-dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">EDUVERSE</h1>
                <p className="text-lg text-gray-600">Best Teacher | Affordable Pricing | Exclusive Notes</p>
            </header>
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                {/* User Type Selection */}
                <div className="flex justify-around mb-4">
                    <button
                        onClick={() => setUserType('Student')}
                        className={`py-2 px-4 rounded-lg ${userType === 'Student' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Student
                    </button>
                    <button
                        onClick={() => setUserType('Instructor')}
                        className={`py-2 px-4 rounded-lg ${userType === 'Instructor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Instructor
                    </button>
                </div>

                {/* Login Form */}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">Login</button>
                </form>

                {/* Other Login Options */}
                <div className="mt-4 text-center">
                    <p className="text-sm">Other login options</p>
                    <div className="flex justify-center space-x-4 mt-2">
                        <FaGoogle className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-500" />
                        <FaFacebook className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-600" />
                        <FaGithub className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                    </div>
                </div>

                <Link to="/forgot-password" className="block text-center mt-4 text-sm text-blue-500 hover:underline">
                    Forgot Password?
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
