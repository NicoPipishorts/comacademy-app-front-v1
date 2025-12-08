import { appendLog, LogLevel } from "@/logging/logStore";

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
	const payload = meta ? `${message} ${formatMeta(meta)}` : message;
	appendLog(payload, level);
	console.log(`[DeviceLog] ${payload}`);
};
