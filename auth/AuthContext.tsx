import { LoginPayload } from "@/types/login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode"; // Correct import
import React, {
	createContext,
	Dispatch,
	FunctionComponent,
	ReactNode,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from "react";

// Define the type for the Auth context state and its updater functions
interface AuthContextType {
	isAuthenticated: boolean;
	login: (data: LoginPayload) => void;
	logout: () => void;
	checkLoggedIn: () => Promise<boolean>;
	isRegistering: boolean;
	setIsRegistering: Dispatch<SetStateAction<boolean>>;
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
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isRegistering, setIsRegistering] = useState<boolean>(false);

	const login = async (data: LoginPayload) => {
		setIsAuthenticated(true);
		setIsRegistering(false);
		await AsyncStorage.setItem("jwtToken", data.jwt);
	};

	const logout = async () => {
		setIsAuthenticated(false);
		setIsRegistering(false);
		await AsyncStorage.removeItem("jwtToken");
		// Cleanup or additional logout tasks
	};

	const checkLoggedIn = async (): Promise<boolean> => {
		const token = await AsyncStorage.getItem("jwtToken");
		if (token) {
			try {
				const decodedToken: { exp: number } = jwtDecode(token);
				const currentTime = Date.now() / 1000;
				if (decodedToken.exp < currentTime) {
					setIsAuthenticated(false);
					await AsyncStorage.removeItem("jwtToken");
					return false;
				}
				setIsAuthenticated(true);
				return true;
			} catch (error) {
				console.log(error);
				setIsAuthenticated(false);
				await AsyncStorage.removeItem("jwtToken");
				return false;
			}
		} else {
			setIsAuthenticated(false);
			return false;
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			await checkLoggedIn();
			setIsRegistering(false);
		};

		initializeAuth();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				login,
				logout,
				checkLoggedIn,
				isRegistering,
				setIsRegistering,
			}}>
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
