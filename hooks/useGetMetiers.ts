import useJwtToken from "@/hooks/useJwtToken";
import { clearCollectionCache } from "@/src/utils/cacheHelpers";
import { loadCacheEntry, saveCacheEntry } from "@/storage/contentCache";
import { MetierPayload, MetiersList } from "@/types/metiers";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const LEGACY_METIER_STORAGE_PREFIXES = ["metierList", "metiersList"];
type MetierDocumentLookup = { data: { documentId?: string }[] };

const fetchMetierById = async (
	token: string,
	id: number
): Promise<MetierPayload> => {
	if (!Number.isFinite(id) || id <= 0) {
		throw new Error(`Invalid metier id "${id}"`);
	}

	const listUrl = `${process.env.EXPO_PUBLIC_API_URL}/metiers?filters[id][$eq]=${id}`;
	const listResponse = await fetch(listUrl, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!listResponse.ok) {
		throw new Error(`Failed to find metier with id ${id}`);
	}

	const listResult = (await listResponse.json()) as MetierDocumentLookup;
	const documentId = listResult.data?.[0]?.documentId;
	if (!documentId) {
		throw new Error(`Metier with id ${id} not found`);
	}

	const url = `${process.env.EXPO_PUBLIC_API_URL}/metiers/${documentId}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return (await response.json()) as MetierPayload;
};

const useGetMetierById = (id?: number | null) => {
	const { token } = useJwtToken();
	const isValidId = Number.isFinite(id as number) && (id as number) > 0;

	return useQuery<MetierPayload>({
		queryKey: ["Metier", id ?? null],
		queryFn: () => fetchMetierById(token as string, id as number),
		staleTime: 1000 * 60 * 60 * 24 * 7,
		gcTime: 1000 * 60 * 60 * 24 * 7,
		enabled: !!token && isValidId,
	});
};

const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

const metierCacheKeyForFilter = (filterByCat: number | null) =>
	`metiers:${filterByCat ?? "all"}`;

const fetchMetiers = async (
	token: string,
	filterByCat: number | null
): Promise<MetiersList> => {
	const params = new URLSearchParams({
		"fields[0]": "METIER",
	});

	if (filterByCat !== null) {
		params.set("filters[MainCat][$eq]", String(filterByCat));
	}

	const url = `${process.env.EXPO_PUBLIC_API_URL}/metiers?${params.toString()}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return (await response.json()) as MetiersList;
};

const useGetMetiers = (filterByCat: number | null) => {
	const { token } = useJwtToken();
	const cacheKey = useMemo(
		() => metierCacheKeyForFilter(filterByCat),
		[filterByCat]
	);
	const [cachedData, setCachedData] = useState<MetiersList | null>(null);
	const [cachedTimestamp, setCachedTimestamp] = useState<number | null>(null);
	const [hydrated, setHydrated] = useState(false);
	const [shouldSync, setShouldSync] = useState(false);

	useEffect(() => {
		let mounted = true;
		setHydrated(false);
		(async () => {
			const cached = await loadCacheEntry<MetiersList>(cacheKey);
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

	const query = useQuery<MetiersList>({
		queryKey: ["metiersList", filterByCat],
		queryFn: () => fetchMetiers(token as string, filterByCat),
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

export { useGetMetierById, useGetMetiers };

export const clearMetiersCache = (filterByCat?: number | null) =>
	clearCollectionCache({
		filter: filterByCat,
		queryKey: "metiersList",
		storagePrefix: "metiers",
		buildCacheKey: metierCacheKeyForFilter,
		legacyPrefixes: LEGACY_METIER_STORAGE_PREFIXES,
	});
