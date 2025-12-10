import useJwtToken from "@/hooks/useJwtToken";
import { loadCacheEntry, saveCacheEntry } from "@/storage/contentCache";
import { clearCollectionCache } from "@/src/utils/cacheHelpers";
import { DicoLists, DicoPayload } from "@/types/dico";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const LEGACY_DICO_STORAGE_PREFIXES = ["dicoList", "dicosList"];

const fetchDicoById = async (token: string, id: number): Promise<any> => {
	try {
		// First get the list to find the documentId
		const listUrl = `${process.env.EXPO_PUBLIC_API_URL}/dicos?filters[id][$eq]=${id}`;
		const listResponse = await fetch(listUrl, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!listResponse.ok) {
			throw new Error(`Failed to find dico with id ${id}`);
		}

		const listResult = await listResponse.json() as { data: any[] };

		if (!listResult.data || listResult.data.length === 0) {
			throw new Error(`Dico with id ${id} not found`);
		}

		const documentId = listResult.data[0].documentId;

		// Now fetch the full details using documentId
		const url = `${process.env.EXPO_PUBLIC_API_URL}/dicos/${documentId}`;
		console.log("Fetching Dico by documentId from:", url);

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const text = await response.text();
			console.error(
				`Dico by ID HTTP error! status: ${response.status}`,
				text
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		console.log("Dico by ID Response:", result);

		return result;
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
		const params = new URLSearchParams({
			"fields[0]": "Word",
		});

		if (filterByCat !== null) {
			params.set("filters[MainCat][$eq]", String(filterByCat));
		}

		const url = `${process.env.EXPO_PUBLIC_API_URL}/dicos?${params.toString()}`;
		console.log("Fetching Dicos from:", url);

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const text = await response.text();
			console.error(
				`Dicos HTTP error! status: ${response.status}`,
				text
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as DicoLists;
		console.log("Dicos Response:", data?.data?.length || 0, "items");
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

export const clearDicoCache = (filterByCat?: number | null) =>
	clearCollectionCache({
		filter: filterByCat,
		queryKey: "DicoIds",
		storagePrefix: "dico",
		buildCacheKey: cacheKeyForFilter,
		legacyPrefixes: LEGACY_DICO_STORAGE_PREFIXES,
	});
