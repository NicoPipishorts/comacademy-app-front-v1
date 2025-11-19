export const __iapLogs: string[] = [];

export function debugIAP(message: string, data?: any) {
	let formatted = message;

	if (data !== undefined) {
		try {
			const safe =
				typeof data === "string" || typeof data === "number"
					? data
					: JSON.stringify(data);
			formatted += " " + String(safe);
		} catch {
			formatted += " [unserializable data]";
		}
	}

	__iapLogs.push(formatted);
	console.log("[IAP-DEBUG]", formatted);
}
