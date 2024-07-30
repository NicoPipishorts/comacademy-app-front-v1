import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const useJwtToken = () => {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const storedToken = await AsyncStorage.getItem("jwtToken");
				setToken(storedToken);
			} catch (error) {
				console.error("Failed to retrieve token", error);
			} finally {
				setLoading(false);
			}
		};

		fetchToken();
	}, []);

	return { token, loading };
};

export default useJwtToken;
