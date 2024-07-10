import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(true);

	const login = () => {
		setIsAuthenticated(true);
		// Add your authentication logic here
	};

	const logout = () => {
		setIsAuthenticated(false);
		// Cleanup or additional logout tasks
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
