import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PendingPurchase, PendingPurchaseMetadata, PurchaseValidationPayload } from "./iap.types";

const STORAGE_KEY = "iap.pendingPurchases";

const readQueue = async (): Promise<PendingPurchase[]> => {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as PendingPurchase[];
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch (error) {
		console.warn("[IAPPurchaseQueue] Failed to read queue", error);
		return [];
	}
};

const writeQueue = async (queue: PendingPurchase[]) => {
	try {
		if (!queue.length) {
			await AsyncStorage.removeItem(STORAGE_KEY);
			return;
		}

		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
	} catch (error) {
		console.warn("[IAPPurchaseQueue] Failed to persist queue", error);
	}
};

const dedupePredicate =
	(newItem: PendingPurchase) => (existing: PendingPurchase) =>
		(existing.metadata.purchaseToken &&
			existing.metadata.purchaseToken === newItem.metadata.purchaseToken) ||
		(existing.metadata.transactionId &&
			existing.metadata.transactionId === newItem.metadata.transactionId) ||
		(existing.metadata.originalTransactionId &&
			existing.metadata.originalTransactionId ===
				newItem.metadata.originalTransactionId);

export const getPendingPurchases = async (): Promise<PendingPurchase[]> =>
	readQueue();

export const clearPendingPurchases = async (): Promise<void> =>
	writeQueue([]);

export const removePendingPurchase = async (id: string): Promise<void> => {
	const queue = await readQueue();
	const filtered = queue.filter((item) => item.id !== id);
	await writeQueue(filtered);
};

export const enqueuePendingPurchase = async (
	payload: PurchaseValidationPayload,
	metadata: PendingPurchaseMetadata
): Promise<PendingPurchase | null> => {
	const queue = await readQueue();

	const idSeed =
		metadata.purchaseToken ||
		metadata.transactionId ||
		metadata.originalTransactionId ||
		`${metadata.productId ?? "unknown"}-${Date.now()}`;

	const item: PendingPurchase = {
		id: idSeed,
		payload,
		metadata,
		timestamp: Date.now(),
	};

	if (queue.some(dedupePredicate(item))) {
		return null;
	}

	queue.push(item);
	await writeQueue(queue);
	return item;
};

export const removeMatchingPendingPurchase = async (
	metadata: PendingPurchaseMetadata
): Promise<void> => {
	const queue = await readQueue();
	const filtered = queue.filter((item) => {
		if (
			metadata.purchaseToken &&
			item.metadata.purchaseToken === metadata.purchaseToken
		) {
			return false;
		}

		if (
			metadata.transactionId &&
			item.metadata.transactionId === metadata.transactionId
		) {
			return false;
		}

		if (
			metadata.originalTransactionId &&
			item.metadata.originalTransactionId === metadata.originalTransactionId
		) {
			return false;
		}

		return true;
	});

	if (filtered.length !== queue.length) {
		await writeQueue(filtered);
	}
};
