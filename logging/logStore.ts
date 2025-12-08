export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
	id: number;
	timestamp: string;
	message: string;
	level: LogLevel;
}

const MAX_LOG_ENTRIES = 300;
const logs: LogEntry[] = [];
const subscribers = new Set<(entries: LogEntry[]) => void>();

const notifySubscribers = () => {
	const snapshot = [...logs];
	for (const subscriber of subscribers) {
		subscriber(snapshot);
	}
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
	return entry;
};

export const clearLogs = () => {
	if (!logs.length) return;
	logs.length = 0;
	notifySubscribers();
};

export const subscribeLogs = (subscriber: (entries: LogEntry[]) => void) => {
	subscriber([...logs]);
	subscribers.add(subscriber);
	return () => {
		subscribers.delete(subscriber);
	};
};
