import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

// Define the structure of the decoded JWT payload
interface User {
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
}

const getUserFromToken = async (): Promise<User | null> => {
	try {
		const token = await AsyncStorage.getItem("jwtToken");
		if (token) {
			const decoded: User = jwtDecode<User>(token);
			return decoded;
		}
		return null;
	} catch (error) {
		console.error("Failed to decode token", error);
		return null;
	}
};

export default getUserFromToken;
