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
	getAndroidOfferToken,
	getSubscriptionProductId,
	type SubscriptionProduct,
} from "../utils/iap";

// Detect Expo Go (real IAP doesn't work there)
const isExpoGo = Constants.appOwnership === "expo";
if (isExpoGo) {
	console.warn(
		"⚠️ Running in Expo Go — using MOCK IAP service. Build a dev/TestFlight build for real IAP."
	);
}

// Import react-native-iap only in non-Expo-Go context
const RNIap = isExpoGo ? null : require("react-native-iap");

// Keep identical IDs on both platforms (must match App Store / Play Console)
const PRODUCT_IDS = Platform.select({
	ios: ["fullAccess100"],
	android: ["monthly-unlimited", "yearly-unlimited"],
}) as string[];

const getApiBaseUrl = () => {
	const baseUrl = process.env.EXPO_PUBLIC_API_URL;
	if (!baseUrl) throw new Error("EXPO_PUBLIC_API_URL is not configured");
	return baseUrl.replace(/\/$/, "");
};

const createIAPService = () => {
	if (isExpoGo) {
		// Mocked service for UI/dev in Expo Go
		const { IAPService: MockIAPService } = require("./iap.service.mock");
		return MockIAPService;
	}

	return {
		/**
		 * Initialize the IAP connection and clean pending purchases (Android)
		 */
		async initialize() {
			try {
				await RNIap.initConnection();

				if (Platform.OS === "android") {
					// Avoid stuck purchases during dev
					try {
						await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
					} catch {
						/* noop */
					}
				}
			} catch (error) {
				console.error("IAP init failed:", error);
				throw error;
			}
		},

		/**
		 * Fetch subscription products (NOT getProducts)
		 */
		async getProducts() {
			try {
				const subs = await RNIap.getSubscriptions(PRODUCT_IDS);
				return subs ?? [];
			} catch (error) {
				console.error("Failed to get subscriptions:", error);
				throw error;
			}
		},

		/**
		 * Request a subscription purchase
		 */
		async purchaseSubscription(product: SubscriptionProduct, userId?: string) {
			try {
				const sku = getSubscriptionProductId(product);
				if (!sku) throw new Error("Invalid product identifier");

				const request: RequestSubscriptionPropsByPlatforms = {};

				if (Platform.OS === "ios") {
					request.ios = {
						sku,
						// Optional: used for App Store Server notifications linkage
						...(userId ? { appAccountToken: userId } : {}),
					};
				} else if (Platform.OS === "android") {
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
				const purchase: Purchase = await RNIap.requestSubscription(request);

				return purchase;
			} catch (error) {
				console.error("Failed to purchase subscription:", error);
				throw error;
			}
		},

		/**
		 * Verify and complete a purchase with your backend
		 * - iOS: prefer StoreKit 2 (signedTransactionInfo), fallback to legacy receipt
		 * - Android: use purchaseToken
		 */
		async completePurchase(purchase: any) {
			try {
				const environment = __DEV__ ? "sandbox" : "production";
				const apiBaseUrl = getApiBaseUrl();

				let payload: Record<string, unknown>;

				if (Platform.OS === "ios") {
					const originalTransactionId =
						purchase?.originalTransactionIdentifierIOS ??
						purchase?.transactionId;

					payload = {
						platform: "ios",
						productId: purchase?.productId,
						originalTransactionId,
						environment: purchase?.environmentIOS ?? environment,
					};

					if (purchase?.transactionId) {
						payload.transactionId = purchase.transactionId;
					}

					// StoreKit 2 signed JWS (preferred)
					if (purchase?.signedTransactionInfo) {
						payload.signedTransactionInfo = purchase.signedTransactionInfo;
					}

					// Legacy base64 receipt (fallback)
					if (purchase?.transactionReceipt) {
						payload.transactionReceipt = purchase.transactionReceipt;
					}

					if (purchase?.appAccountToken) {
						payload.appAccountToken = purchase.appAccountToken;
					}
				} else if (Platform.OS === "android") {
					if (!purchase?.purchaseToken) {
						throw new Error("Missing purchaseToken for Android verification");
					}

					payload = {
						platform: "android",
						productId: purchase?.productId,
						purchaseToken: purchase.purchaseToken,
						environment,
					};

					if (purchase?.transactionId) {
						payload.orderId = purchase.transactionId;
					}
				} else {
					throw new Error(`Unsupported platform: ${Platform.OS}`);
				}

				const res = await axios.post(`${apiBaseUrl}/api/iap/complete`, payload);

				if (res.data?.ok) {
					// Only finish the transaction when backend says OK
					try {
						await RNIap.finishTransaction({ purchase, isConsumable: false });
					} catch (finishErr) {
						// Don't block entitlement return if finish fails; log instead
						console.warn("finishTransaction failed:", finishErr);
					}

					return res.data.entitlement;
				}

				// Backend said not OK
				throw new Error("Backend verification failed");
			} catch (error) {
				console.error("Failed to complete purchase:", error);
				throw error;
			}
		},

		/**
		 * Get user entitlements from your API
		 */
		async getEntitlements() {
			try {
				const apiBaseUrl = getApiBaseUrl();
				const res = await axios.get(`${apiBaseUrl}/api/me/entitlements`);
				return res.data?.entitlements ?? [];
			} catch (error) {
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
			try {
				const entitlements = await this.getEntitlements();
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
			const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
				async (purchase: any) => {
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
