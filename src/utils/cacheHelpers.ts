import AsyncStorage from "@react-native-async-storage/async-storage";
import { queryClient } from "@/hooks/reactQueryConfig";
import { clearCacheByPrefix, clearCacheEntry } from "@/storage/contentCache";

type ClearCollectionCacheOptions = {
	queryKey: string;
	storagePrefix: string;
	buildCacheKey: (filter: number | null) => string;
	legacyPrefixes?: string[];
	filter?: number | null;
};

const clearLegacyStorageKeys = async (prefixes?: string[]) => {
	if (!prefixes || prefixes.length === 0) {
		return;
	}

	try {
		const keys = await AsyncStorage.getAllKeys();
		if (!keys.length) return;

		const targets = keys.filter((key) =>
			prefixes.some((prefix) => key.startsWith(prefix))
		);

		if (targets.length) {
			await AsyncStorage.multiRemove(targets);
		}
	} catch (error) {
		console.error("Failed to clear legacy cache entries", error);
	}
};

export const clearCollectionCache = async ({
	queryKey,
	storagePrefix,
	buildCacheKey,
	legacyPrefixes,
	filter,
}: ClearCollectionCacheOptions) => {
	await clearLegacyStorageKeys(legacyPrefixes);

	if (filter === undefined) {
		await clearCacheByPrefix(storagePrefix);
		queryClient.removeQueries({ queryKey: [queryKey] });
		queryClient.invalidateQueries({ queryKey: [queryKey] });
		return;
	}

	await clearCacheEntry(buildCacheKey(filter));
	queryClient.removeQueries({ queryKey: [queryKey, filter] });
	queryClient.invalidateQueries({ queryKey: [queryKey, filter] });
};
