import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import useJwtToken from "@/hooks/useJwtToken";
import { useMutation } from "@tanstack/react-query";
import { normalizeFeedIds } from "./normalizeFeedIds";

type MarkSeenPayload = {
	feedIds: number[];
};

export const useMarkFeedsSeen = () => {
	const { token } = useJwtToken();

	return useMutation({
		mutationFn: async ({ feedIds }: MarkSeenPayload) => {
			if (!token) {
				throw new Error("Missing authentication token");
			}

			const normalizedFeedIds = normalizeFeedIds(feedIds);

			if (!normalizedFeedIds.length) {
				return null;
			}

			const response = await fetch(buildApiUrl("/feeds/seen"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					feedIds: normalizedFeedIds,
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to mark feeds seen: ${response.status}`);
			}

			return response.json();
		},
	});
};
