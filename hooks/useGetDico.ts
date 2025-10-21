import useJwtToken from "@/hooks/useJwtToken";
import { loadCacheEntry, saveCacheEntry } from "@/storage/contentCache";
import { DicoLists, DicoPayload } from "@/types/dico";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const fetchDicoById = async (token: string, id: number): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/dicos/${id}`,
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
		console.error("Error fetching Dico by Id:", error);
		throw error;
	}
};

const useDicoById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<DicoPayload>({
		queryKey: ["Dico", id],
		queryFn: () => fetchDicoById(token, id),
		staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		enabled: !!token,
	});
};

const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

const cacheKeyForFilter = (filterByCat: number | null) =>
	`dico:${filterByCat ?? "all"}`;

const fetchDicoIds = async (
	token: string,
	filterByCat: number | null
): Promise<DicoLists> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/dicos?${
				filterByCat === null
					? "fields[0]=Word&_fields=id,Word&pagination[limit]=2500"
					: `fields[0]=Word&_fields=id,Word&pagination[limit]=2500&filters[MainCat]=${filterByCat}`
			}`,
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

		const data = (await response.json()) as DicoLists;
		return data;
	} catch (error) {
		console.error("Error fetching Dicos:", error);
		throw error;
	}
};

const useDicoIds = (filterByCat: number | null) => {
	const { token } = useJwtToken();
	const cacheKey = useMemo(() => cacheKeyForFilter(filterByCat), [filterByCat]);
	const [cachedData, setCachedData] = useState<DicoLists | null>(null);
	const [cachedTimestamp, setCachedTimestamp] = useState<number | null>(null);
	const [hydrated, setHydrated] = useState(false);
	const [shouldSync, setShouldSync] = useState(false);

	useEffect(() => {
		let mounted = true;
		setHydrated(false);
		(async () => {
			const cached = await loadCacheEntry<DicoLists>(cacheKey);
			if (!mounted) return;
			if (cached) {
				setCachedData(cached.data);
				setCachedTimestamp(cached.timestamp);
				const expired = Date.now() - cached.timestamp > CACHE_TTL;
				setShouldSync(expired);
			} else {
				setCachedData(null);
				setCachedTimestamp(null);
				setShouldSync(true);
			}
			setHydrated(true);
		})();
		return () => {
			mounted = false;
		};
	}, [cacheKey]);

	useEffect(() => {
		if (!cachedTimestamp) return;
		const expired = Date.now() - cachedTimestamp > CACHE_TTL;
		if (expired && !shouldSync) {
			setShouldSync(true);
		}
	}, [cachedTimestamp, shouldSync]);

	const query = useQuery<DicoLists>({
		queryKey: ["DicoIds", filterByCat],
		queryFn: () => fetchDicoIds(token, filterByCat),
		enabled: !!token && hydrated && shouldSync,
		staleTime: CACHE_TTL,
		gcTime: CACHE_TTL,
		meta: { source: "network" },
	});

	useEffect(() => {
		if (query.data) {
			setCachedData(query.data);
			const timestamp = Date.now();
			setCachedTimestamp(timestamp);
			saveCacheEntry(cacheKey, { data: query.data, timestamp });
			setShouldSync(false);
		}
	}, [cacheKey, query.data]);

	const data = query.data ?? cachedData;
	const isLoading =
		(!hydrated && !cachedData) || (query.isLoading && !cachedData);
	const isFetching = query.isFetching;

	const refetch = useCallback(() => {
		setShouldSync(true);
		return query.refetch();
	}, [query]);

	return {
		data,
		isLoading,
		isFetching,
		error: query.error,
		refetch,
	};
};

export { useDicoById, useDicoIds };
