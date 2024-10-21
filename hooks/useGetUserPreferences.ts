import useJwtToken from "@/hooks/useJwtToken";
import { UserPreferencesPayload } from "@/types/userPreferences";
import { useQuery } from "@tanstack/react-query";

const fetchPayload = async (
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

const useGetUserPreferences = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<UserPreferencesPayload | null>({
		queryKey: ["UserPreferences"],
		queryFn: () => fetchPayload(token, userId),
		enabled: !!token,
	});
};

export default useGetUserPreferences;
