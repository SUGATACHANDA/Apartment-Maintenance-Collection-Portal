// client/src/components/ProtectedAdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/" replace />;

    try {
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') return <Navigate to="/" replace />;
        return children;
    } catch (err) {
        console.log(err)
        return <Navigate to="/" replace />;
    }
};

export default ProtectedAdminRoute;
