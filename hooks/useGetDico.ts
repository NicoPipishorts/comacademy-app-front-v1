import useJwtToken from "@/hooks/useJwtToken";
import { clearCollectionCache } from "@/src/utils/cacheHelpers";
import { loadCacheEntry, saveCacheEntry } from "@/storage/contentCache";
import { DicoLists, DicoPayload } from "@/types/dico";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const LEGACY_DICO_STORAGE_PREFIXES = ["dicoList", "dicosList"];

type DicoDocumentLookup = { data: { documentId?: string }[] };

type DicoListPage = DicoLists & {
	meta?: {
		pagination?: {
			page?: number;
			pageSize?: number;
			pageCount?: number;
			total?: number;
		};
	};
};

const fetchDicoById = async (
	token: string,
	id: number
): Promise<DicoPayload> => {
	const listUrl = `${process.env.EXPO_PUBLIC_API_URL}/dicos?filters[id][$eq]=${id}`;
	const listResponse = await fetch(listUrl, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!listResponse.ok) {
		throw new Error(`Failed to find dico with id ${id}`);
	}

	const listResult = (await listResponse.json()) as DicoDocumentLookup;
	const documentId = listResult.data?.[0]?.documentId;
	if (!documentId) {
		throw new Error(`Dico with id ${id} not found`);
	}

	const url = `${process.env.EXPO_PUBLIC_API_URL}/dicos/${documentId}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return (await response.json()) as DicoPayload;
};

const useDicoById = (id: number) => {
	const { token } = useJwtToken();
	const isValidId = Number.isFinite(id) && id > 0;

	return useQuery<DicoPayload>({
		queryKey: ["Dico", id],
		queryFn: () => fetchDicoById(token as string, id),
		staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		enabled: !!token && isValidId,
	});
};

const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

const DICO_CACHE_VERSION = "v2";
const DICO_PAGE_SIZE = 100;

const cacheKeyForFilter = (filterByCat: number | null) =>
	`dico:${DICO_CACHE_VERSION}:${filterByCat ?? "all"}`;

const fetchDicoIds = async (
	token: string,
	filterByCat: number | null
): Promise<DicoLists> => {
	const params = new URLSearchParams();
	params.set("fields[0]", "Word");
	params.set("filters[isActive][$eq]", "true");
	params.set("pagination[pageSize]", String(DICO_PAGE_SIZE));

	if (filterByCat !== null) {
		params.set("filters[MainCat][$eq]", String(filterByCat));
	}

	const allItems: DicoLists["data"] = [];
	let page = 1;
	let pageCount = 1;

	do {
		params.set("pagination[page]", String(page));
		const url = `${process.env.EXPO_PUBLIC_API_URL}/dicos?${params.toString()}`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = (await response.json()) as DicoListPage;
		allItems.push(...(result.data ?? []));

		pageCount = result.meta?.pagination?.pageCount ?? page;
		page += 1;
	} while (page <= pageCount);

	return { data: allItems };
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
		queryFn: () => fetchDicoIds(token as string, filterByCat),
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
