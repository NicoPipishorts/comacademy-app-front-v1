import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

if (isExpoGo) {
	console.warn(
		"⚠️ ============================================\n" +
			"⚠️  Running in Expo Go\n" +
			"⚠️  Using MOCK IAP service for UI testing\n" +
			"⚠️  Build a development build for real IAP\n" +
			"⚠️ ============================================"
	);
}

// Real IAP implementation - only imported when not in Expo Go
const RNIap = isExpoGo ? null : require("react-native-iap");

const PRODUCT_IDS = Platform.select({
	ios: ["com.comacademy.monthly", "com.comacademy.yearly"],
	android: ["monthly_subscription", "yearly_subscription"],
}) as string[];

const getApiBaseUrl = () => {
	const baseUrl = process.env.EXPO_PUBLIC_API_URL;
	if (!baseUrl) {
		throw new Error("EXPO_PUBLIC_API_URL is not configured");
	}
	return baseUrl.replace(/\/$/, "");
};

// Define the service based on environment
const createIAPService = () => {
	if (isExpoGo) {
		// Return mock service
		const { IAPService: MockIAPService } = require("./iap.service.mock");
		return MockIAPService;
	}

	// Real IAP implementation
	return {
		/**
		 * Initialize IAP connection
		 */
		async initialize() {
			try {
				await RNIap.initConnection();
			} catch (error) {
				throw error;
			}
		},

		/**
		 * Get available products
		 */
		async getProducts() {
			try {
				const products = await RNIap.fetchProducts({
					skus: PRODUCT_IDS,
					type: "subs",
				});
				return products ?? [];
			} catch (error) {
				console.error("Failed to get products:", error);
				throw error;
			}
		},

		/**
		 * Purchase a subscription
		 */
		async purchaseSubscription(productId: string, userId?: string) {
			try {
				const request: any = {};

				if (Platform.OS === "ios") {
					request.ios = {
						sku: productId,
						...(userId ? { appAccountToken: userId } : {}),
					};
				} else if (Platform.OS === "android") {
					request.android = {
						skus: [productId],
						...(userId ? { obfuscatedAccountIdAndroid: userId } : {}),
					};
				}

				if (!request.ios && !request.android) {
					throw new Error(
						`Unsupported platform for IAP purchase: ${Platform.OS}`
					);
				}

				const purchase = await RNIap.requestPurchase({
					type: "subs",
					request,
				});

				return purchase;
			} catch (error) {
				console.error("Failed to purchase subscription:", error);
				throw error;
			}
		},

		/**
		 * Complete purchase on backend
		 */
		async completePurchase(purchase: any) {
			try {
				const environment = __DEV__ ? "sandbox" : "production";
				const apiBaseUrl = getApiBaseUrl();

				let payload: Record<string, unknown>;

				if (Platform.OS === "ios") {
					const originalTransactionId =
						"originalTransactionIdentifierIOS" in purchase &&
						purchase.originalTransactionIdentifierIOS
							? purchase.originalTransactionIdentifierIOS
							: purchase.transactionId;
					const iosEnvironment =
						"environmentIOS" in purchase && purchase.environmentIOS
							? purchase.environmentIOS
							: environment;

					payload = {
						platform: "ios",
						productId: purchase.productId,
						originalTransactionId,
						environment: iosEnvironment,
					};

					if ("transactionId" in purchase && purchase.transactionId) {
						payload.transactionId = purchase.transactionId;
					}
					if ("purchaseToken" in purchase && purchase.purchaseToken) {
						payload.signedTransactionInfo = purchase.purchaseToken;
					}
					if ("appAccountToken" in purchase && purchase.appAccountToken) {
						payload.appAccountToken = purchase.appAccountToken;
					}
				} else if (Platform.OS === "android") {
					if (!purchase.purchaseToken) {
						throw new Error(
							"Missing purchase token for Android purchase verification"
						);
					}

					payload = {
						platform: "android",
						productId: purchase.productId,
						purchaseToken: purchase.purchaseToken,
						environment,
					};

					if ("transactionId" in purchase && purchase.transactionId) {
						payload.orderId = purchase.transactionId;
					}
				} else {
					throw new Error(
						`Unsupported platform for IAP purchase: ${Platform.OS}`
					);
				}

				const response = await axios.post(
					`${apiBaseUrl}/api/iap/complete`,
					payload
				);

				if (response.data.ok) {
					// Finish the transaction
					await RNIap.finishTransaction({ purchase, isConsumable: false });
					return response.data.entitlement;
				} else {
					throw new Error("Backend verification failed");
				}
			} catch (error) {
				console.error("Failed to complete purchase:", error);
				throw error;
			}
		},

		/**
		 * Get user entitlements
		 */
		async getEntitlements() {
			try {
				const apiBaseUrl = getApiBaseUrl();
				const response = await axios.get(`${apiBaseUrl}/api/me/entitlements`);
				return response.data.entitlements ?? [];
			} catch (error) {
				console.error("Failed to get entitlements:", error);
				throw error;
			}
		},

		/**
		 * Restore purchases (for iOS primarily)
		 */
		async restorePurchases() {
			try {
				const purchases = await RNIap.getAvailablePurchases();

				// Verify each purchase with backend
				const entitlements = await Promise.all(
					purchases.map((purchase: any) => this.completePurchase(purchase))
				);

				return entitlements.filter(Boolean);
			} catch (error) {
				console.error("Failed to restore purchases:", error);
				throw error;
			}
		},

		/**
		 * Check subscription status
		 */
		async checkSubscriptionStatus() {
			try {
				const entitlements = await this.getEntitlements();
				const activeSubscription = entitlements.find(
					(e: any) => e.active && e.status === "active"
				);
				return activeSubscription || null;
			} catch (error) {
				console.error("Failed to check subscription status:", error);
				return null;
			}
		},

		/**
		 * End connection (cleanup)
		 */
		async endConnection() {
			try {
				await RNIap.endConnection();
				console.log("IAP connection ended");
			} catch (error) {
				console.error("Failed to end IAP connection:", error);
			}
		},

		/**
		 * Setup purchase listener
		 */
		setupPurchaseListener(
			onPurchase: (purchase: any) => void,
			onError: (error: any) => void
		) {
			const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
				async (purchase: any) => {
					try {
						const receipt = purchase.transactionId;
						if (receipt) {
							await this.completePurchase(purchase);
							onPurchase(purchase);
						}
					} catch (error) {
						onError(error);
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
