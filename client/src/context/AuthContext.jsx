import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [expiresAt, setExpiresAt] = useState(
        parseInt(localStorage.getItem('expiresAt'), 10)
    );
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const left = Math.max(0, expiresAt - Date.now());
            setTimeLeft(left);
            if (left === 0) {
                logout();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const login = (jwtToken) => {
        const expiry = Date.now() + 30 * 60 * 1000; // 15 minutes
        setToken(jwtToken);
        setExpiresAt(expiry);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('expiresAt', expiry);
    };

    const logout = () => {
        setToken(null);
        setExpiresAt(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, timeLeft }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}