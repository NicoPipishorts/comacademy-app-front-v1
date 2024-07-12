import React, {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from "react";

// Define the type for the Auth context state and its updater functions
interface AuthContextType {
	isAuthenticated: boolean;
	login: () => void;
	logout: () => void;
}

// Create the context with an initial undefined type, which will be set in the provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider component
interface AuthProviderProps {
	children: ReactNode;
}

// AuthProvider with typed props
export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
	children,
}) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

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

// Custom hook useAuth with proper typing
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
