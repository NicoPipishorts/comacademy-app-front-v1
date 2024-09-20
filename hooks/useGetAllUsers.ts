import useJwtToken from "@/hooks/useJwtToken";
import { User, Users } from "@/types/users";
import { useQuery } from "@tanstack/react-query";

// Type for the transformed response
export type TransformedUsers = Record<number, Omit<User, "id">>;

// Fetch user info from the API
const fetchUserInfo = async (token: string): Promise<Users> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/users?fields=id&fields=username&fields=firstName&fields=lastName`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`Error fetching all users info: status: ${response.status}`,
				await response.text()
			);
			throw new Error(
				`Error fetching all users info: status: ${response.status}`
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching all users info: status:", error);
		throw error;
	}
};

// Transform the array of users into an object where id is the key
const transformUsersArray = (users: Users): TransformedUsers => {
	const transformedUsers: TransformedUsers = {};

	users.forEach((user) => {
		const { id, ...rest } = user;
		transformedUsers[id] = rest;
	});

	return transformedUsers;
};

// Hook to get all users and transform them
const useGetAllUsers = () => {
	const { token } = useJwtToken();

	return useQuery<Users, Error, TransformedUsers>({
		queryKey: ["UserInfo"],
		queryFn: () => fetchUserInfo(token!),
		enabled: !!token,
		select: (data) => transformUsersArray(data), // Transform the data here
	});
};

export default useGetAllUsers;
