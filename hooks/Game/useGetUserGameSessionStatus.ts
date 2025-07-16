// src/hooks/useUserGameSessionStatus.ts
import useJwtToken from "@/hooks/useJwtToken";
import { UserGameSessionStatusResponse } from "@/types/userGameSessionStatus";
import { useQuery } from "@tanstack/react-query";

export interface UserGameSessionStatus {
	data: UserGameSessionStatusResponse;
}

const fetchUserGameSessionStatus = async (
	token: string,
	userId: number
): Promise<UserGameSessionStatus> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	if (!res.ok) {
		const text = await res.text();
		console.error(`HTTP ${res.status}`, text);
		throw new Error(`HTTP ${res.status}`);
	}
	return (await res.json()) as UserGameSessionStatus;
};

const useUserGameSessionStatus = (userId: number) => {
	const { token, loading } = useJwtToken();

	return useQuery<UserGameSessionStatus>({
		queryKey: ["UserGameSessionStatus"],
		queryFn: () => fetchUserGameSessionStatus(token!, userId),
		enabled: !loading && !!token && !!userId,
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: true,
	});
};

export default useUserGameSessionStatus;
