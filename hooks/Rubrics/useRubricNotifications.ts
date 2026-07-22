import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import {
	EMPTY_RUBRIC_NOTIFICATIONS,
	RubricKey,
	RubricNotificationsResponse,
} from "@/types/rubricNotifications";
import { useFocusEffect } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const RUBRIC_NOTIFICATIONS_QUERY_KEY = ["RubricNotifications", "me"];

const fetchRubricNotifications = async (
	token: string
): Promise<RubricNotificationsResponse> => {
	try {
		const response = await fetch(buildApiUrl("/rubric-notifications/me"), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			console.warn(
				`Failed to fetch rubric notifications: ${response.status}. Falling back to empty badges.`
			);
			return EMPTY_RUBRIC_NOTIFICATIONS;
		}

		return (await response.json()) as RubricNotificationsResponse;
	} catch (error) {
		console.warn(
			"Rubric notifications unavailable. Falling back to empty badges.",
			error
		);
		return EMPTY_RUBRIC_NOTIFICATIONS;
	}
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
		retry: false,
		placeholderData: EMPTY_RUBRIC_NOTIFICATIONS,
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
