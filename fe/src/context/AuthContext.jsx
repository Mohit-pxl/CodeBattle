import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Mock user state
    // To test different states, change these values.
    const [user, setUser] = useState({
        isLoggedIn: true,
        role: 'admin', // 'user' or 'admin'
        username: 'coder_123',
    });

    const login = (userData) => setUser({ ...userData, isLoggedIn: true });
    const logout = () => setUser({ isLoggedIn: false, role: 'user', username: '' });

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
