import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode, JwtPayload } from "jwt-decode";

// Define the structure of the decoded JWT payload
interface DecodedToken extends JwtPayload {
	id: number;
}

const getUserIdFromToken = async (): Promise<number | null> => {
	try {
		const token = await AsyncStorage.getItem("jwtToken");
		if (token) {
			const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
			return decoded.id;
		}
		return null;
	} catch (error) {
		console.error("Failed to decode token", error);
		return null;
	}
};

export default getUserIdFromToken;
