// src/hooks/useGetMediaList.ts
import { useQuery } from "@tanstack/react-query";

export type MediaRoute =
	| "capsules"
	| "petites-histoires"
	| "trentes-secondes"
	| "TrenteSecondes"
	| "top-des-flops";

export interface VideoUri {
	data: {
		id: number;
		attributes: {
			name: string;
			url: string;
		};
	};
}

export interface MediaItem {
	id: number;
	titre?: string;
	videoUri?: {
		url?: string;
	};
	videoLink?: string | null;
	coverPhoto?: {
		url?: string;
		formats?: {
			large?: { url?: string };
			medium?: { url?: string };
			small?: { url?: string };
			thumbnail?: { url?: string };
		};
	} | null;
	attributes: {
		titre: string;
		videoUri: VideoUri;
		videoId: string | null;
		videoLink: string | null;
		visible: boolean | null;
		createdAt: string;
		updatedAt: string;
	};
}

export interface MediaListResponse {
	data: MediaItem[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

const fetchMediaList = async (
	route: MediaRoute,
	token: string
): Promise<MediaListResponse> => {
	const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}/${route}`);

	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		const message = `Failed to fetch ${route}: ${res.status}`;
		const error = new Error(message);
		(error as any).status = res.status;
		try {
			(error as any).body = await res.text();
		} catch {
			// ignore
		}
		throw error;
	}

	return (await res.json()) as MediaListResponse;
};

export const useGetMediaList = (route: MediaRoute, token: string) => {
	return useQuery<MediaListResponse>({
		queryKey: ["mediaList", route, Boolean(token)],
		queryFn: () => fetchMediaList(route, token),
		enabled: !!token && !!route,
		staleTime: 24 * 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
	});
};

export default useGetMediaList;
