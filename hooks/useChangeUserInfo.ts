// src/hooks/useChangeUserInfo.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useJwtToken from "./useJwtToken";

interface Props {
	userId: number;
	firstName: string;
	lastName: string;
}

const change = async (
	token: string,
	{ firstName, lastName, userId }: Props
): Promise<void> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					firstName,
					lastName,
				}),
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
		console.error("Error changing the user info:", error);
		throw error;
	}
};

const useChangeUserInfo = () => {
	const { token } = useJwtToken();
	const queryClient = useQueryClient();

	return useMutation<void, Error, Props>({
		mutationFn: (variables) => change(token, variables),
		onSuccess: () => {
			// Invalidate the UserInfo query cache
			queryClient.invalidateQueries({ queryKey: ["UserInfo"] });
		},
		onError: (error) => {
			console.error("Error changing the user info:", error);
		},
	});
};

export default useChangeUserInfo;
