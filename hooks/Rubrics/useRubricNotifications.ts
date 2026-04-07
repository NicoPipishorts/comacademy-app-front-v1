import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import {
	RubricKey,
	RubricNotificationsResponse,
} from "@/types/rubricNotifications";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const RUBRIC_NOTIFICATIONS_QUERY_KEY = ["RubricNotifications", "me"];

const fetchRubricNotifications = async (
	token: string
): Promise<RubricNotificationsResponse> => {
	const response = await fetch(buildApiUrl("/rubric-notifications/me"), {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch rubric notifications: ${response.status}`
		);
	}

	return (await response.json()) as RubricNotificationsResponse;
};

const postRubricOpened = async ({
	token,
	rubricKey,
}: {
	token: string;
	rubricKey: RubricKey;
}) => {
	const response = await fetch(buildApiUrl("/rubric-notifications/me/open"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ rubricKey }),
	});

	if (!response.ok) {
		throw new Error(`Failed to mark rubric opened: ${response.status}`);
	}

	return response.json();
};

export const useGetRubricNotifications = () => {
	const { token } = useJwtToken();

	return useQuery<RubricNotificationsResponse>({
		queryKey: RUBRIC_NOTIFICATIONS_QUERY_KEY,
		queryFn: () => fetchRubricNotifications(token as string),
		enabled: !!token,
		staleTime: 60 * 1000,
	});
};

export const useMarkRubricOpened = () => {
	const { token } = useJwtToken();

	return useMutation({
		mutationFn: (rubricKey: RubricKey) =>
			postRubricOpened({ token: token as string, rubricKey }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: RUBRIC_NOTIFICATIONS_QUERY_KEY,
			});
		},
	});
};

export const useTrackRubricOpened = (rubricKey: RubricKey) => {
	const { mutate } = useMarkRubricOpened();

	useFocusEffect(
		useCallback(() => {
			mutate(rubricKey);
		}, [mutate, rubricKey])
	);
};
