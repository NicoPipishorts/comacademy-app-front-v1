import { useRouter } from "expo-router";
import { useEffect } from "react";

const HomeScreen = () => {
	const router = useRouter();

	useEffect(() => {
		console.log("navigating to feed");
		router.replace("/feed"); // Use the correct path to navigate
	}, [router]);

	return null; // Optionally, display a loader or splash screen here
};

export default HomeScreen;
