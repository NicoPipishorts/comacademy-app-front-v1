import { useQuery } from "@tanstack/react-query";

export interface PetitesHistoiresResponse {
	data: {
		id: number;
		attributes: {
			titre: string;
			videoUri: VideoUri;
			videoId: string;
			videoLink: string;
			visible: boolean;
			createdAt: string;
			updatedAt: string;
		};
	}[];
}

export interface VideoUri {
	data: {
		id: number;
		attributes: {
			name: string;
			url: string;
		};
	};
}

const fetchCitations = async (
	token: string
): Promise<PetitesHistoiresResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/petites-histoires?sort=id:ASC&populate=*&filters[visible]=true`,
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
		console.error("Error fetching Les Cistations:", error);
		throw error;
	}
};

const useGetPetitesHistoires = (token: string) => {
	return useQuery<PetitesHistoiresResponse>({
		queryKey: ["PetitesHistoires"],
		queryFn: () => fetchCitations(token),
		enabled: !!token,
		staleTime: 5000,
	});
};

export default useGetPetitesHistoires;
