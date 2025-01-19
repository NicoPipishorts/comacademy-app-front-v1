import AsyncStorage from "@react-native-async-storage/async-storage";
import { JwtPayload, jwtDecode } from "jwt-decode";

// Extend JwtPayload for Strapi-specific user details
interface User extends JwtPayload {
	id: number;
	username: string;
	email: string;
	provider: string;
	confirmed: boolean;
	blocked: boolean;
	createdAt: string;
	updatedAt: string;
	firstName: string;
	lastName: string;
	profile: number;
}

const getUserFromToken = async (): Promise<User | null> => {
	try {
		const token = await AsyncStorage.getItem("jwtToken");
		if (!token) {
			console.warn("No token found in AsyncStorage");
			return null;
		}

		const decoded: User = jwtDecode<User>(token);

		// Optional: Add validation checks for important fields
		if (!decoded.id || !decoded.email) {
			console.error("Invalid token: missing required user fields");
			return null;
		}

		return decoded;
	} catch (error) {
		console.error(
			"Failed to decode token:",
			error instanceof Error ? error.message : error
		);
		return null;
	}
};

export default getUserFromToken;
