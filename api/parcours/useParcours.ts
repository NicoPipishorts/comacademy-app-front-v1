import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import { QK } from "@/helpers/api/queryKeys";
import { loadCacheEntry, saveCacheEntry } from "@/storage/contentCache";
import {
	ParcoursDayDetail,
	ParcoursDayProgressPayload,
	ParcoursResponse,
	ParcoursTimelineWeek,
	ParcoursUserBonus,
	ParcoursWeekDetail,
} from "@/types/parcours";
import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

const authHeader = (token?: string | null) =>
	token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {};

const requestJson = async <T>(
	path: string,
	token: string | null,
	init?: RequestInit
): Promise<T> => {
	const response = await fetch(buildApiUrl(path), {
		...init,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			...authHeader(token),
			...(init?.headers || {}),
		},
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP ${response.status}: ${text || "Request failed"}`);
	}

	return (await response.json()) as T;
};

const dayCacheKey = (dayId: number) => `parcours-day:${dayId}`;

export const useParcoursTimeline = (
	token: string | null,
	loadingToken: boolean
) => {
	return useQuery<ParcoursResponse<ParcoursTimelineWeek[]>>({
		queryKey: QK.parcoursTimeline(),
		enabled: !!token && !loadingToken,
		queryFn: () =>
			requestJson<ParcoursResponse<ParcoursTimelineWeek[]>>(
				"/parcours/timeline",
				token
			),
	});
};

export const useParcoursWeek = (
	weekId: number | null,
	token: string | null,
	loadingToken: boolean
) => {
	return useQuery<ParcoursResponse<ParcoursWeekDetail>>({
		queryKey: QK.parcoursWeek(weekId ?? 0),
		enabled: !!weekId && !!token && !loadingToken,
		queryFn: () =>
			requestJson<ParcoursResponse<ParcoursWeekDetail>>(
				`/parcours/weeks/${weekId}`,
				token
			),
	});
};

export const useParcoursBonuses = (
	token: string | null,
	loadingToken: boolean
) =>
	useQuery<ParcoursResponse<ParcoursUserBonus[]>>({
		queryKey: QK.parcoursBonuses(),
		enabled: !!token && !loadingToken,
		queryFn: () =>
			requestJson<ParcoursResponse<ParcoursUserBonus[]>>(
				"/parcours/bonuses",
				token
			),
	});

export const useMarkParcoursBonusViewed = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			bonusId,
			token,
		}: {
			bonusId: number;
			token: string | null;
		}) =>
			requestJson<ParcoursResponse<ParcoursUserBonus>>(
				`/parcours/bonuses/${bonusId}/view`,
				token,
				{ method: "POST" }
			),
		onSuccess: ({ data }) => {
			queryClient.setQueryData<ParcoursResponse<ParcoursUserBonus[]>>(
				QK.parcoursBonuses(),
				(current) =>
					current
						? {
								...current,
								data: current.data.map((bonus) =>
									bonus.id === data.id ? data : bonus
								),
						  }
						: current
			);
		},
	});
};

export const useParcoursDay = (
	dayId: number | null,
	token: string | null,
	loadingToken: boolean
) => {
	return useQuery<ParcoursResponse<ParcoursDayDetail>>({
		queryKey: QK.parcoursDay(dayId ?? 0),
		enabled: !!dayId && !!token && !loadingToken,
		queryFn: async () => {
			if (!dayId) {
				throw new Error("Missing dayId");
			}

			try {
				const payload = await requestJson<ParcoursResponse<ParcoursDayDetail>>(
					`/parcours/days/${dayId}`,
					token
				);
				await saveCacheEntry(dayCacheKey(dayId), {
					timestamp: Date.now(),
					data: payload,
				});
				return payload;
			} catch (error) {
				const cached = await loadCacheEntry<ParcoursResponse<ParcoursDayDetail>>(
					dayCacheKey(dayId)
				);
				if (cached?.data) {
					return cached.data;
				}
				throw error;
			}
		},
	});
};

const postDayMutation = async (
	path: string,
	token: string | null,
	body?: Record<string, unknown>
) =>
	requestJson<ParcoursResponse<ParcoursDayDetail>>(path, token, {
		method: "POST",
		body: JSON.stringify(body || {}),
	});

export const useStartParcoursDay = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			dayId,
			token,
		}: {
			dayId: number;
			token: string | null;
		}) => postDayMutation(`/parcours/days/${dayId}/start`, token),
		onSuccess: (data, vars) => {
			queryClient.setQueryData(QK.parcoursDay(vars.dayId), data);
			void queryClient.invalidateQueries({ queryKey: QK.parcoursTimeline() });
			if (data.data.week?.id) {
				void queryClient.invalidateQueries({
					queryKey: QK.parcoursWeek(data.data.week.id),
				});
			}
		},
	});
};

export const useUpdateParcoursDayProgress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			dayId,
			token,
			payload,
		}: {
			dayId: number;
			token: string | null;
			payload: ParcoursDayProgressPayload;
		}) =>
			postDayMutation(`/parcours/days/${dayId}/progress`, token, payload),
		onSuccess: async (data, vars) => {
			queryClient.setQueryData(QK.parcoursDay(vars.dayId), data);
			await saveCacheEntry(dayCacheKey(vars.dayId), {
				timestamp: Date.now(),
				data,
			});
			void queryClient.invalidateQueries({ queryKey: QK.parcoursTimeline() });
			if (data.data.week?.id) {
				void queryClient.invalidateQueries({
					queryKey: QK.parcoursWeek(data.data.week.id),
				});
			}
		},
	});
};

export const useCompleteParcoursDay = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			dayId,
			token,
			payload,
		}: {
			dayId: number;
			token: string | null;
			payload: ParcoursDayProgressPayload;
		}) =>
			postDayMutation(`/parcours/days/${dayId}/complete`, token, payload),
		onSuccess: async (data, vars) => {
			queryClient.setQueryData(QK.parcoursDay(vars.dayId), data);
			await saveCacheEntry(dayCacheKey(vars.dayId), {
				timestamp: Date.now(),
				data,
			});
			void queryClient.invalidateQueries({ queryKey: QK.parcoursTimeline() });
			if (data.data.week?.id) {
				void queryClient.invalidateQueries({
					queryKey: QK.parcoursWeek(data.data.week.id),
				});
			}
		},
	});
};
