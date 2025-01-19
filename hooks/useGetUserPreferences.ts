import useJwtToken from "@/hooks/useJwtToken";
import { LoginUser } from "@/types/login";
import {
	TransformedUserPreferencesPayload,
	UserPreferencesPayload,
} from "@/types/userPreferences";
import { useQuery } from "@tanstack/react-query";

const fetchUserPreferences = async (
	token: string,
	userId: number
): Promise<UserPreferencesPayload | null> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/user-preferences?filters[user_id]=${userId}&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.status === 404) {
			return null;
		}

		if (!response.ok) {
			console.error(
				`HTTP error! status: ${response.status}`,
				await response.text()
			);
			throw new Error(
				`Error fetching > User Preferences: status: ${response.status}`
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching > User Preferences:", error);
		throw error;
	}
};

const fetchUserInfo = async (
	token: string,
	userId: number
): Promise<LoginUser> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}?populate=*`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`HTTP error! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching userInfo:", error);
		throw error;
	}
};

const transformUserInfoToPreferences = (
	userInfo: LoginUser
): TransformedUserPreferencesPayload => {
	return {
		data: [
			{
				id: userInfo.id,
				attributes: {
					avatarBackgroundColor: null, // Placeholder as LoginUser doesn't provide this
					createdAt: userInfo.createdAt,
					updatedAt: userInfo.updatedAt,
					publishedAt: null, // Placeholder as LoginUser doesn't provide this
					user_id: {
						data: {
							id: userInfo.id,
							attributes: {
								username: userInfo.username,
								email: userInfo.email,
								provider: userInfo.provider,
								confirmed: userInfo.confirmed,
								blocked: userInfo.blocked,
								createdAt: userInfo.createdAt,
								updatedAt: userInfo.updatedAt,
								firstName: userInfo.firstName,
								lastName: userInfo.lastName,
							},
						},
					},
				},
			},
		],
		meta: {}, // Placeholder for meta as it's not provided by LoginUser
	};
};

const useGetUserPreferences = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<
		UserPreferencesPayload | TransformedUserPreferencesPayload | null
	>({
		queryKey: ["UserPreferences", userId],
		queryFn: async () => {
			const preferences = await fetchUserPreferences(token, userId);

			if (preferences.data.length <= 0) {
				const userInfo = await fetchUserInfo(token, userId);
				return transformUserInfoToPreferences(userInfo);
			}

			return preferences;
		},
		enabled: !!token && !!userId,
	});
};

export default useGetUserPreferences;
