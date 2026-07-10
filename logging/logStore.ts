import AsyncStorage from "@react-native-async-storage/async-storage";

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
	id: number;
	timestamp: string;
	message: string;
	level: LogLevel;
}

const MAX_LOG_ENTRIES = 300;
const STORAGE_KEY = "device-logs-v1";
const logs: LogEntry[] = [];
const subscribers = new Set<(entries: LogEntry[]) => void>();
let hydrated = false;
let persistPromise: Promise<void> | null = null;

const notifySubscribers = () => {
	const snapshot = [...logs];
	for (const subscriber of subscribers) {
		subscriber(snapshot);
	}
};

const persistLogs = () => {
	persistPromise = AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs)).catch(() => {
		// Silent fail: logging should never break the app.
	}).finally(() => {
		persistPromise = null;
	});
	return persistPromise;
};

const hydrateLogs = async () => {
	if (hydrated) return;
	hydrated = true;
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw) as LogEntry[];
		if (!Array.isArray(parsed)) return;
		logs.splice(0, logs.length, ...parsed.slice(-MAX_LOG_ENTRIES));
	} catch {
		// Silent fail: logging should never break the app.
	}
	notifySubscribers();
};

export const appendLog = (message: string, level: LogLevel = "info"): LogEntry => {
	const entry: LogEntry = {
		id: Date.now() + logs.length,
		timestamp: new Date().toISOString(),
		message,
		level,
	};

	logs.push(entry);
	if (logs.length > MAX_LOG_ENTRIES) {
		logs.splice(0, logs.length - MAX_LOG_ENTRIES);
	}

	notifySubscribers();
	void persistLogs();
	return entry;
};

export const clearLogs = () => {
	if (!logs.length) return;
	logs.length = 0;
	notifySubscribers();
	void AsyncStorage.removeItem(STORAGE_KEY).catch(() => {
		// Silent fail: logging should never break the app.
	});
};

export const subscribeLogs = (subscriber: (entries: LogEntry[]) => void) => {
	void hydrateLogs();
	subscriber([...logs]);
	subscribers.add(subscriber);
	return () => {
		subscribers.delete(subscriber);
	};
};

export const ensureLogsHydrated = async () => {
	await hydrateLogs();
	if (persistPromise) {
		await persistPromise;
	}
};
