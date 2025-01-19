import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const useUserId = () => {
	const [userId, setUserId] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserId = async () => {
			try {
				const storedUserId = await AsyncStorage.getItem("userId");
				setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
			} catch (error) {
				console.error("Failed to retrieve userId:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserId();
	}, []);

	return { userId, loading };
};

export default useUserId;
