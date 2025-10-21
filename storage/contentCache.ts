import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "content-cache";

export interface CacheEntry<T> {
	timestamp: number;
	data: T;
}

const keyFor = (suffix: string) => `${PREFIX}:${suffix}`;

export async function loadCacheEntry<T>(suffix: string): Promise<
	CacheEntry<T> | null
> {
	try {
		const raw = await AsyncStorage.getItem(keyFor(suffix));
		if (!raw) return null;
		return JSON.parse(raw) as CacheEntry<T>;
	} catch (error) {
		console.error("Failed to load cached content", error);
		return null;
	}
}

export async function saveCacheEntry<T>(suffix: string, entry: CacheEntry<T>) {
	try {
		await AsyncStorage.setItem(keyFor(suffix), JSON.stringify(entry));
	} catch (error) {
		console.error("Failed to persist cached content", error);
	}
}

export async function clearCacheEntry(suffix: string) {
	try {
		await AsyncStorage.removeItem(keyFor(suffix));
	} catch (error) {
		console.error("Failed to clear cached content", error);
	}
}

export async function clearCacheByPrefix(prefixSuffix: string) {
	try {
		const keys = await AsyncStorage.getAllKeys();
		if (!keys.length) return;

		const targetPrefix = keyFor(prefixSuffix);
		const matchingKeys = keys.filter((key) => key.startsWith(targetPrefix));
		if (matchingKeys.length) {
			await AsyncStorage.multiRemove(matchingKeys);
		}
	} catch (error) {
		console.error("Failed to clear cached content by prefix", error);
	}
}
