import { useRouter } from "expo-router";
import { useEffect } from "react";

const HomeScreen = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace("/feed");
	}, [router]);

	return null;
};

export default HomeScreen;
