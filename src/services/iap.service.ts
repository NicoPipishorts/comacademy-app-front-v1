// iap.service.ts
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type {
	Purchase,
	RequestSubscriptionAndroidProps,
	RequestSubscriptionPropsByPlatforms,
} from "react-native-iap";

import {
	normalizePurchase,
	type NormalizedPurchase,
} from "../iap/purchaseNormalizer";
import { debugIAP } from "../utils/debug";
import {
	getAndroidOfferToken,
	getSubscriptionProductId,
	type SubscriptionProduct,
} from "../utils/iap";
import type {
	PendingPurchaseMetadata,
	PurchaseValidationPayload,
} from "./iap.types";
import {
	enqueuePendingPurchase,
	getPendingPurchases,
	removeMatchingPendingPurchase,
	removePendingPurchase,
} from "./iapReceiptQueue";

// Detect Expo Go (real IAP doesn't work there)
const isExpoGo = Constants.appOwnership === "expo";

// iap.service.ts (top of file, after isExpoGo)
type RNIapModule = any; // keep it loose while we debug Nitro exports

let cachedIapModule: RNIapModule | null = null;

const ensureIapModule = async (): Promise<RNIapModule> => {
	if (isExpoGo) {
		throw new Error("react-native-iap is unavailable in Expo Go");
	}

	if (!cachedIapModule) {
		const mod = await import("react-native-iap");

		// In v14 the actual functions usually live on the default export
		// so unwrap it if present.
		cachedIapModule = (mod as any).default ?? mod;
	}

	return cachedIapModule!;
};

const getIapModuleSync = (): RNIapModule => {
	if (!cachedIapModule) {
		throw new Error(
			"react-native-iap module not initialised. Call IAPService.initialize() first."
		);
	}
	return cachedIapModule!;
};

// Keep identical IDs on both platforms (must match App Store / Play Console)
const PRODUCT_IDS = Platform.select({
	ios: ["fullAccess100", "fullAccess1200"], // both iOS products
	android: ["comacademy_monthly_full"], // Android subscription *product* ID
}) as string[];

const getApiBaseUrl = () => {
	const baseUrl = process.env.EXPO_PUBLIC_API_URL;
	if (!baseUrl) throw new Error("EXPO_PUBLIC_API_URL is not configured");
	return baseUrl.replace(/\/$/, "");
};

const createPendingMetadata = (
	normalized: NormalizedPurchase
): PendingPurchaseMetadata => ({
	platform: normalized.platform,
	productId: normalized.productId,
	purchaseToken: normalized.purchaseToken,
	orderId: normalized.orderId,
	transactionId: normalized.transactionId,
	originalTransactionId: normalized.originalTransactionId,
});

const buildValidationPayload = (
	normalized: NormalizedPurchase,
	purchase: Purchase,
	defaultEnvironment: string
): PurchaseValidationPayload => {
	const rawPurchase = purchase as unknown as Record<string, unknown>;

	if (normalized.platform === "android") {
		const purchaseToken =
			normalized.purchaseToken ||
			(rawPurchase.purchaseToken as string | undefined) ||
			(rawPurchase.transactionReceipt as string | undefined);

		if (!purchaseToken) {
			throw new Error("Missing purchaseToken for Android verification");
		}

		return {
			platform: "android",
			productId: normalized.productId,
			environment: defaultEnvironment,
			purchaseToken,
			orderId:
				normalized.orderId ||
				(rawPurchase.orderId as string | undefined) ||
				(rawPurchase.transactionId as string | undefined),
			transactionId:
				normalized.transactionId ||
				(rawPurchase.transactionId as string | undefined),
		};
	}

	const environmentIOS =
		(rawPurchase.environmentIOS as string | undefined) || defaultEnvironment;

	const payload: PurchaseValidationPayload = {
		platform: "ios",
		productId: normalized.productId,
		environment: environmentIOS,
		originalTransactionId:
			normalized.originalTransactionId ||
			(rawPurchase.originalTransactionIdentifierIOS as string | undefined) ||
			(rawPurchase.originalTransactionIdentifier as string | undefined) ||
			(rawPurchase.originalTransactionId as string | undefined) ||
			(rawPurchase.transactionId as string | undefined),
		transactionId:
			normalized.transactionId ||
			(rawPurchase.transactionId as string | undefined),
	};

	const signedTransactionInfo = rawPurchase.signedTransactionInfo as
		| string
		| undefined;
	if (signedTransactionInfo) {
		payload.signedTransactionInfo = signedTransactionInfo;
	}

	const transactionReceipt = rawPurchase.transactionReceipt as
		| string
		| undefined;
	if (transactionReceipt) {
		payload.transactionReceipt = transactionReceipt;
	}

	const appAccountToken = rawPurchase.appAccountToken as string | undefined;
	if (appAccountToken) {
		payload.appAccountToken = appAccountToken;
	}

	if (!payload.originalTransactionId) {
		throw new Error("Missing originalTransactionId for iOS verification");
	}

	return payload;
};

const shouldEnqueueError = (error: unknown): boolean => {
	if (!axios.isAxiosError(error)) return false;

	if (!error.response) {
		return true;
	}

	return error.response.status >= 500;
};

const purchaseMatchesMetadata = (
	metadata: PendingPurchaseMetadata,
	purchase: Purchase
): boolean => {
	const normalized = normalizePurchase(purchase);

	if (
		metadata.purchaseToken &&
		metadata.purchaseToken === normalized.purchaseToken
	) {
		return true;
	}

	if (
		metadata.transactionId &&
		metadata.transactionId === normalized.transactionId
	) {
		return true;
	}

	if (
		metadata.originalTransactionId &&
		metadata.originalTransactionId === normalized.originalTransactionId
	) {
		return true;
	}

	return false;
};

const createIAPService = () => {
	if (isExpoGo) {
		// Mocked service for UI/dev in Expo Go
		const { IAPService: MockIAPService } = require("./iap.service.mock");
		return MockIAPService;
	}

	const processPendingPurchases = async () => {
		const pending = await getPendingPurchases();
		if (!pending.length) return;

		const apiBaseUrl = getApiBaseUrl();
		const iap = await ensureIapModule();

		let cachedAvailablePurchases: Purchase[] | null = null;

		const getAvailablePurchases = async () => {
			if (!cachedAvailablePurchases) {
				try {
					cachedAvailablePurchases = await iap.getAvailablePurchases();
				} catch (error) {
					console.warn(
						"Failed to fetch available purchases while retrying queue:",
						error
					);
					cachedAvailablePurchases = [];
				}
			}
			return cachedAvailablePurchases;
		};

		for (const pendingItem of pending) {
			try {
				const res = await axios.post(
					`${apiBaseUrl}/iap/complete`,
					pendingItem.payload
				);

				if (res.data?.ok) {
					await removePendingPurchase(pendingItem.id).catch((error) => {
						console.warn("Failed to drop purchase from retry queue:", error);
					});

					try {
						const available = await getAvailablePurchases();
						const matchIndex = available.findIndex((purchase) =>
							purchaseMatchesMetadata(pendingItem.metadata, purchase)
						);

						if (matchIndex >= 0) {
							const [matchedPurchase] = available.splice(matchIndex, 1);
							await iap.finishTransaction({
								purchase: matchedPurchase,
								isConsumable: false,
							});
						}
					} catch (finishError) {
						console.warn(
							"Failed to finish transaction after retry validation:",
							finishError
						);
					}
				} else {
					console.warn(
						"Pending purchase validation returned non-ok response",
						res.data
					);
				}
			} catch (error) {
				console.error("Pending purchase retry failed:", error);
			}
		}
	};

	return {
		/**
		 * Initialize the IAP connection and clean pending purchases (Android)
		 */
		async initialize() {
			debugIAP("Initializing IAP…");
			debugIAP("Running on platform", Platform.OS);
			debugIAP("isExpoGo", isExpoGo);

			try {
				const iap = await ensureIapModule();
				debugIAP("IAP module loaded successfully");
				debugIAP("IAP module type", typeof iap);

				await iap.initConnection();
				debugIAP("initConnection success");

				await processPendingPurchases().catch((error) => {
					debugIAP("processPendingPurchases error", error);
				});
			} catch (error) {
				debugIAP("IAP init failed", {
					message: (error as any)?.message,
					code: (error as any)?.code,
					raw: String(error),
				});
				console.error("IAP initialization error:", error);
				throw error;
			}
		},

		async processPendingPurchases() {
			await processPendingPurchases();
		},

		// iap.service.ts
		async getProducts() {
			debugIAP("getProducts triggered");
			debugIAP("Platform", Platform.OS);
			debugIAP("PRODUCT_IDS to fetch", PRODUCT_IDS);
			debugIAP("App bundle ID", Constants.expoConfig?.ios?.bundleIdentifier || Constants.expoConfig?.android?.package || "unknown");
			debugIAP("Build type", __DEV__ ? "development" : "production");

			try {
				const iap = await ensureIapModule();

				debugIAP("RNIap keys", Object.keys(iap as any));
				debugIAP("typeof iap.fetchProducts", typeof (iap as any).fetchProducts);

				debugIAP("Calling fetchProducts with params", {
					skus: PRODUCT_IDS,
					type: "subs",
				});

				const products = await (iap as any).fetchProducts({
					skus: PRODUCT_IDS,
					type: "subs",
				});

				debugIAP("fetchProducts result count", products?.length ?? 0);

				if (products && products.length > 0) {
					debugIAP("Products received successfully");
					products.forEach((p: any, idx: number) => {
						debugIAP(`Product ${idx + 1}`, {
							productId: p.productId,
							title: p.title,
							price: p.price,
						});
					});
				} else {
					debugIAP("fetchProducts full result", products);
				}

				if (!products || products.length === 0) {
					debugIAP("⚠️ WARNING: No products returned from App Store");
					debugIAP("Troubleshooting checklist:");
					debugIAP("1. Product IDs in code match App Store Connect exactly");
					debugIAP(`   Expected: ${PRODUCT_IDS.join(", ")}`);
					debugIAP("2. Products status is 'Ready to Submit' or approved");
					debugIAP("3. Bundle ID matches: com.nicopipishorts.comacademy");
					debugIAP("4. Paid Applications Agreement is signed");
					debugIAP("5. For TestFlight: Products must be in 'Ready to Submit' status");
					debugIAP("6. Wait 2-24 hours after product creation/approval");
				}

				return products ?? [];
			} catch (error) {
				debugIAP("getProducts error", {
					message: (error as any)?.message,
					code: (error as any)?.code,
					raw: String(error),
				});
				console.error("IAP getProducts error:", error);
				throw error;
			}
		},

		/**
		 * Request a subscription purchase
		 */
		async purchaseSubscription(product: SubscriptionProduct, userId?: string) {
			debugIAP("purchaseSubscription called", product);
			try {
				const sku = getSubscriptionProductId(product);
				if (!sku) throw new Error("Invalid product identifier");

				const iap = await ensureIapModule();
				const request: RequestSubscriptionPropsByPlatforms = {};
				if (Platform.OS === "ios") {
					debugIAP("iOS subscription request", request);
					request.ios = {
						sku,
						...(userId ? { appAccountToken: userId } : {}),
					};
				} else if (Platform.OS === "android") {
					debugIAP("Android subscription request", request);
					const androidReq: RequestSubscriptionAndroidProps = {
						skus: [sku],
						// Policy: obfuscate your account ID; do not send raw PII
						...(userId ? { obfuscatedAccountIdAndroid: userId } : {}),
					};

					const offerToken = getAndroidOfferToken(product);
					if (offerToken) {
						androidReq.subscriptionOffers = [{ sku, offerToken }];
					}

					request.android = androidReq;
				}

				// Use requestSubscription (not requestPurchase)
				debugIAP("Calling requestSubscription()", sku);
				const purchase: Purchase = await iap.requestSubscription(request);
				debugIAP("requestSubscription success", purchase);
				return purchase;
			} catch (error) {
				debugIAP("requestSubscription failed", error);
				console.error("Failed to purchase subscription:", error);
				throw error;
			}
		},

		/**
		 * Verify and complete a purchase with your backend
		 * - iOS: prefer StoreKit 2 (signedTransactionInfo), fallback to legacy receipt
		 * - Android: use purchaseToken
		 */
		async completePurchase(purchase: Purchase) {
			debugIAP("Calling completePurchase from listener");
			debugIAP("completePurchase called", purchase);
			const environment = __DEV__ ? "sandbox" : "production";
			const apiBaseUrl = getApiBaseUrl();
			const iap = await ensureIapModule();

			const normalized = normalizePurchase(purchase);
			debugIAP("Normalized purchase", normalized);
			const metadata = createPendingMetadata(normalized);

			let payload: PurchaseValidationPayload;
			try {
				payload = buildValidationPayload(normalized, purchase, environment);
			} catch (prepError) {
				console.error("Failed to build purchase payload:", prepError);
				throw prepError;
			}
			debugIAP("Sending validation payload", payload);
			try {
				const res = await axios.post(`${apiBaseUrl}/iap/complete`, payload);

				if (res.data?.ok) {
					debugIAP("Backend validation response", res.data);
					await removeMatchingPendingPurchase(metadata).catch((error) => {
						console.warn(
							"Failed to remove purchase from retry queue after success:",
							error
						);
					});

					try {
						await iap.finishTransaction({ purchase, isConsumable: false });
					} catch (finishErr) {
						console.warn("finishTransaction failed:", finishErr);
					}

					return res.data.entitlement;
				}

				throw new Error("Backend verification failed");
			} catch (error) {
				debugIAP("completePurchase failed", error);
				if (shouldEnqueueError(error)) {
					await enqueuePendingPurchase(payload, metadata);
				}

				console.error("Failed to complete purchase:", error);
				throw error;
			}
		},

		/**
		 * Get user entitlements from your API
		 */
		async getEntitlements(retryCount = 0) {
			debugIAP("Fetching entitlements", { attempt: retryCount + 1 });
			try {
				const apiBaseUrl = getApiBaseUrl();
				const res = await axios.get(`${apiBaseUrl}/me/entitlements`);
				debugIAP("Entitlements API response", res.data);
				return res.data?.entitlements ?? [];
			} catch (error) {
				debugIAP("getEntitlements error", error);

				// Retry once on 403 errors (may be a timing issue after login)
				if (axios.isAxiosError(error) && error.response?.status === 403 && retryCount === 0) {
					debugIAP("Retrying entitlements fetch after 403 (attempt 2)");
					await new Promise(resolve => setTimeout(resolve, 1000));
					return this.getEntitlements(1);
				}

				console.error("Failed to get entitlements:", error);
				throw error;
			}
		},

		/**
		 * Restore purchases (iOS primary; Android returns active)
		 * Verifies each with backend and returns entitlements that are active
		 */
		async restorePurchases() {
			try {
				const RNIap = await ensureIapModule();
				const purchases = await RNIap.getAvailablePurchases();

				const entitlements = await Promise.all(
					purchases.map((p: any) =>
						this.completePurchase(p).catch((e: any) => {
							console.warn("restore single purchase failed:", e);
							return null;
						})
					)
				);

				return entitlements.filter(Boolean);
			} catch (error) {
				console.error("Failed to restore purchases:", error);
				throw error;
			}
		},

		/**
		 * Quick check: is there an active subscription entitlement?
		 */
		async checkSubscriptionStatus() {
			debugIAP("checkSubscriptionStatus() triggered");
			try {
				const entitlements = await this.getEntitlements();
				debugIAP("Entitlements fetched", entitlements);
				return (
					entitlements.find((e: any) => e?.active && e?.status === "active") ||
					null
				);
			} catch (error) {
				console.error("Failed to check subscription status:", error);
				return null;
			}
		},

		/**
		 * Cleanup
		 */
		async endConnection() {
			try {
				const RNIap = getIapModuleSync();
				await RNIap.endConnection();
			} catch (error) {
				console.error("Failed to end IAP connection:", error);
			}
		},

		/**
		 * Purchase listeners
		 * - Verifies with backend then (inside completePurchase) finishes transaction
		 */
		setupPurchaseListener(
			onPurchase: (purchase: any) => void,
			onError: (error: any) => void
		) {
			debugIAP("Setting up purchase listeners");
			const RNIap = getIapModuleSync();
			const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
				async (purchase: any) => {
					debugIAP("Setting up purchase listeners");
					try {
						await this.completePurchase(purchase);
						onPurchase(purchase);
					} catch (err) {
						onError(err);
					}
				}
			);

			const purchaseErrorSubscription = RNIap.purchaseErrorListener(
				(error: any) => {
					debugIAP("purchaseErrorListener", error);
					console.warn("Purchase error:", error);
					onError(error);
				}
			);

			return () => {
				purchaseUpdateSubscription.remove();
				purchaseErrorSubscription.remove();
			};
		},
	};
};

export const IAPService = createIAPService();
