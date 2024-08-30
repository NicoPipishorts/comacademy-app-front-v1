import useJwtToken from "@/hooks/useJwtToken";
import { LoginUser } from "@/types/login";
import { useQuery } from "@tanstack/react-query";

const fetchUserInfo = async (
	token: string,
	userId: number
): Promise<LoginUser> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
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

const useGetUserInfo = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<LoginUser>({
		queryKey: ["UserInfo"],
		queryFn: () => fetchUserInfo(token, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetUserInfo;
