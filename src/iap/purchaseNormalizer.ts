import { Platform } from "react-native";
import type { Purchase } from "react-native-iap";

export type NormalizedPurchase = {
	platform: "ios" | "android";
	productId: string;
	purchaseToken?: string;
	orderId?: string;
	transactionId?: string;
	originalTransactionId?: string;
	raw: Purchase;
};

const resolveProductId = (purchase: Purchase): string => {
	const anyPurchase = purchase as unknown as {
		productId?: string;
		products?: ({ productId?: string } | string)[];
		sku?: string;
	};

	if (anyPurchase.productId) return anyPurchase.productId;

	if (Array.isArray(anyPurchase.products) && anyPurchase.products.length > 0) {
		const first = anyPurchase.products[0];
		if (typeof first === "string") return first;
		if (first?.productId) return first.productId;
	}

	if (anyPurchase.sku) return anyPurchase.sku;

	return "unknown";
};

export const normalizePurchase = (purchase: Purchase): NormalizedPurchase => {
	const anyPurchase = purchase as unknown as {
		platform?: "ios" | "android";
		id?: string;
		orderId?: string;
		transactionId?: string;
		purchaseToken?: string;
		transactionReceipt?: string;
		originalTransactionIdentifierIOS?: string;
		originalTransactionIdentifier?: string;
		originalTransactionId?: string;
	};

	const platform =
		anyPurchase.platform ??
		(Platform.OS === "ios" ? "ios" : "android");

	const productId = resolveProductId(purchase);

	if (platform === "android") {
		return {
			platform,
			productId,
			purchaseToken: anyPurchase.purchaseToken || anyPurchase.transactionReceipt,
			orderId: anyPurchase.orderId,
			transactionId: anyPurchase.transactionId,
			raw: purchase,
		};
	}

	const originalTransactionId =
		anyPurchase.originalTransactionIdentifierIOS ??
		anyPurchase.originalTransactionIdentifier ??
		anyPurchase.originalTransactionId ??
		anyPurchase.transactionId;

	return {
		platform,
		productId,
		transactionId: anyPurchase.transactionId ?? anyPurchase.id,
		originalTransactionId: originalTransactionId ?? undefined,
		raw: purchase,
	};
};
