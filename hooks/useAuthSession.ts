import { AuthResponse } from "@/types/credentials/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function useAuthSession() {
	const [auth, setAuth] = useState<AuthResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const raw = await AsyncStorage.getItem("auth");
				if (!mounted) return;
				setAuth(raw ? (JSON.parse(raw) as AuthResponse) : null);
			} catch (e) {
				console.error("Failed to read `auth` from storage", e);
				setAuth(null);
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	return { auth, loading };
}
