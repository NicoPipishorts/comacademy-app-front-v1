// src/hooks/useGetUserPreferences.ts
import useJwtToken from "@/hooks/useJwtToken";
import {
	UserPreferenceData,
	UserPreferencesResponse,
} from "@/types/userPreferences";
import { useQuery } from "@tanstack/react-query";

const fetchUserPreferences = async (
	token: string,
	userId: number
): Promise<UserPreferencesResponse> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-preferences/me`,
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
	const maybeWrapped = json as UserPreferencesResponse;
	if (maybeWrapped && typeof maybeWrapped === "object" && "data" in maybeWrapped) {
		return maybeWrapped;
	}

	return {
		data: json as UserPreferenceData,
		meta: {},
	};
};

export const useGetUserPreferences = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<UserPreferencesResponse>({
		queryKey: ["UserPreferences", "me", userId],
		queryFn: () => fetchUserPreferences(token, userId),
		enabled: !!token && !!userId,
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24,
	});
};

export default useGetUserPreferences;
