// src/hooks/useGetUserPreferences.ts
import useJwtToken from "@/hooks/useJwtToken";
import { UserPreferencesResponse } from "@/types/userPreferences";
import { useQuery } from "@tanstack/react-query";

const fetchUserPreferences = async (
	token: string,
	userId: number
): Promise<UserPreferencesResponse> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-preferences/by-user/${userId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (res.status === 404) {
		return {
			data: null,
			meta: {},
		};
	}

	if (!res.ok) {
		throw new Error(`Failed to fetch user preferences, status ${res.status}`);
	}

	const json = await res.json();
	return json;
};

export const useGetUserPreferences = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<UserPreferencesResponse>({
		queryKey: ["UserPreferences"],
		queryFn: () => fetchUserPreferences(token, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetUserPreferences;
