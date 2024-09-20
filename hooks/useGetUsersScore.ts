import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

const fetchPayload = async (token: string): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/game-questions?filters[answer][$eq]=true&fields[0]=answer&fields[1]=userId`,
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
		console.error("Error fetching Fav Questions:", error);
		throw error;
	}
};

const useGetUsersScore = () => {
	const { token } = useJwtToken();

	return useQuery<any>({
		queryKey: ["UsersScore"],
		queryFn: () => fetchPayload(token!),
		enabled: !!token,
	});
};

export default useGetUsersScore;
