import { router } from "expo-router";
import { useEffect } from "react";

export default function OpenLeaderBoard() {
	useEffect(() => {
		router.push("/user/leaderBoard");
	}, []);

	return null;
}
