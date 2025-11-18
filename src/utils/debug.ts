export const __iapLogs: string[] = [];

export function debugIAP(message: string, data?: any) {
	const formatted = data ? `${message} ${JSON.stringify(data)}` : message;

	__iapLogs.push(formatted);

	// Also send to console for dev
	console.log("[IAP-DEBUG]", formatted);
}
