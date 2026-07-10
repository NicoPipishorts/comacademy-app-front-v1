import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import useJwtToken from "@/hooks/useJwtToken";
import { LoginUser } from "@/types/login";
import { useQuery } from "@tanstack/react-query";
import { normalizeLoginUser } from "@/helpers/strapi";

const fetchUserInfo = async (
	token: string,
	userId: number
): Promise<LoginUser> => {
	try {
		const response = await fetch(buildApiUrl(`/users/${userId}?populate=*`), {
			headers: {
				Authorization: `Bearer ${token}`,
			}
		});

		if (!response.ok) {
			console.error(
				`HTTP error! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return normalizeLoginUser(data);
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
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24,
	});
};

export default useGetUserInfo;
