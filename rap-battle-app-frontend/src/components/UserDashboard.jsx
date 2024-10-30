// src/components/UserDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch user details (you can customize this based on your backend)
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/user', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Assuming you're storing the token in localStorage
            });
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-4 bg-gray-800 shadow-lg">
                <h1 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">Rap Battle App</h1>
                <div className="space-x-4">
                    <a href="/" className="text-white hover:text-pink-500 transition duration-300">Home</a>
                    <a href="/dashboard" className="text-white hover:text-pink-500 transition duration-300">Dashboard</a>
                    <a href="/" className="text-white hover:text-pink-500 transition duration-300">Logout</a>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
                <h2 className="text-5xl font-bold text-white mb-4">Welcome to Your Dashboard!</h2>
                <p className="text-lg text-white mb-8">Here you can manage your account and view your details.</p>
            </div>

            {/* User Details Section */}
            <div className="flex items-center justify-center mb-16">
                <div className="w-full max-w-md p-8 rounded-lg border border-gray-700 shadow-2xl bg-gray-800 text-white">
                    <h3 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-6">
                        User Details
                    </h3>
                    {user ? (
                        <div className="space-y-4">
                            <p><span className="font-semibold">Username:</span> {user.username}</p>
                            <p><span className="font-semibold">Email:</span> {user.email}</p>
                            <p><span className="font-semibold">Phone:</span> {user.phone}</p>
                        </div>
                    ) : (
                        <p className="text-red-500">User not found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
