// src/hooks/usePasswordChange.ts
import { useAuth } from "@/auth/AuthContext";
import useJwtToken from "@/hooks/useJwtToken";
import { useMutation } from "@tanstack/react-query";

interface PasswordChangeVariables {
	currentPassword: string;
	newPassword: string;
}

const changePassword = async (
	token: string,
	{ currentPassword, newPassword }: PasswordChangeVariables
): Promise<void> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/auth/password-change`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					currentPassword,
					newPassword,
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
		console.error("Error changing password:", error);
		throw error;
	}
};

const usePasswordChange = () => {
	const { token } = useJwtToken();
	const { logout } = useAuth();

	return useMutation<void, Error, PasswordChangeVariables>({
		mutationFn: (variables) => changePassword(token, variables),
		onSuccess: () => {
			console.log("Password changed successfully, logging out...");
			logout();
		},
		onError: (error) => {
			console.error("Error changing password:", error);
		},
	});
};

export default usePasswordChange;
