import { appendLog, LogLevel } from "@/logging/logStore";

const shouldStoreDeviceLogs =
	__DEV__ ||
	process.env.EXPO_PUBLIC_SHOW_DEVICE_LOGS === "1" ||
	process.env.EXPO_PUBLIC_SHOW_DEVICE_LOGS === "true";

const formatMeta = (meta: unknown): string => {
	if (meta === undefined || meta === null) return "";
	if (typeof meta === "string" || typeof meta === "number") {
		return String(meta);
	}
	try {
		return JSON.stringify(meta);
	} catch {
		return "[unserializable]";
	}
};

export const logDevice = (
	message: string,
	meta?: unknown,
	level: LogLevel = "info"
) => {
	if (!shouldStoreDeviceLogs) {
		return;
	}
	const payload = meta ? `${message} ${formatMeta(meta)}` : message;
	appendLog(payload, level);
};
