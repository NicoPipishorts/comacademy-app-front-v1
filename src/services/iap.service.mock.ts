import { Platform } from "react-native";
import {
	getSubscriptionProductId,
	type SubscriptionProduct,
} from "../utils/iap";

/**
 * Mock IAP Service for Expo Go Testing
 *
 * This mock service allows you to test the subscription UI
 * without native IAP functionality (which isn't available in Expo Go).
 *
 * Use this ONLY in Expo Go for UI testing.
 * For real IAP testing, use a development build.
 */

// Mock product data
const YEARLY_SKU = Platform.select({
	ios: "com.comacademy.yearly",
	android: "yearly_subscription",
}) as string;
const MONTHLY_SKU = Platform.select({
	ios: "com.comacademy.monthly",
	android: "monthly_subscription",
}) as string;

const MOCK_PRODUCTS = [
	{
		id: YEARLY_SKU,
		productId: YEARLY_SKU,
		title: "Abonnement Annuel",
		description: "Accès premium pendant 1 an",
		price: "29.99",
		localizedPrice: "29,99 €",
		displayPrice: "29,99 €",
		currency: "EUR",
		type: "subs" as const,
	},
	{
		id: MONTHLY_SKU,
		productId: MONTHLY_SKU,
		title: "Abonnement Mensuel",
		description: "Accès premium pendant 1 mois",
		price: "4.99",
		localizedPrice: "4,99 €",
		displayPrice: "4,99 €",
		currency: "EUR",
		type: "subs" as const,
	},
];

// Simulate delay for realistic behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Store mock subscription state
let mockSubscriptionState: any = null;

export const IAPService = {
	/**
	 * Initialize IAP connection (mock)
	 */
	async initialize() {
		console.log("📱 [Mock IAP] Initializing connection...");
		await delay(500);
		console.log("✅ [Mock IAP] Connection initialized");
	},

	async processPendingPurchases() {
		console.log("📱 [Mock IAP] No pending purchases to process.");
	},

	/**
	 * Get available products (mock)
	 */
	async getProducts() {
		console.log("📱 [Mock IAP] Fetching products...");
		await delay(800);
		console.log("✅ [Mock IAP] Products fetched:", MOCK_PRODUCTS.length);
		return MOCK_PRODUCTS;
	},

	/**
	 * Purchase a subscription (mock)
	 */
	async purchaseSubscription(product: SubscriptionProduct, userId?: string) {
		const productId = getSubscriptionProductId(product);
		if (!productId) {
			throw new Error("Invalid product identifier");
		}

		console.log("📱 [Mock IAP] Starting purchase:", { productId, userId });
		await delay(1500);

		const mockPurchase = {
			productId,
			transactionId: `mock-txn-${Date.now()}`,
			transactionDate: Date.now(),
			transactionReceipt: `mock-receipt-${Date.now()}`,
			purchaseToken: `mock-token-${Date.now()}`,
		};

		console.log("✅ [Mock IAP] Purchase completed:", mockPurchase);

		// Simulate the purchase listener callback
		// This mimics the real IAP behavior where the listener is triggered
		setTimeout(async () => {
			try {
				// Complete the purchase (verify with backend)
				await this.completePurchase(mockPurchase);

				// Trigger the onPurchase callback if it exists
				// @ts-ignore
				if (IAPService._mockPurchaseCallback) {
					// @ts-ignore
					IAPService._mockPurchaseCallback(mockPurchase);
				}
			} catch (error) {
				// @ts-ignore
				if (IAPService._mockErrorCallback) {
					// @ts-ignore
					IAPService._mockErrorCallback(error);
				}
			}
		}, 100);

		return mockPurchase;
	},

	/**
	 * Complete purchase on backend (mock)
	 */
	async completePurchase(purchase: any) {
		console.log("📱 [Mock IAP] Verifying purchase with backend...", purchase);
		await delay(1000);

		const mockEntitlement = {
			id: Math.floor(Math.random() * 10000),
			active: true,
			status: "active" as const,
			productId: purchase.productId,
			expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
		};

		// Store the subscription state for future checks
		mockSubscriptionState = mockEntitlement;

		console.log("✅ [Mock IAP] Purchase verified:", mockEntitlement);
		console.log("🎉 [Mock IAP] Premium access activated!");
		return mockEntitlement;
	},

	/**
	 * Get user entitlements (mock)
	 */
	async getEntitlements() {
		console.log("📱 [Mock IAP] Fetching entitlements...");
		await delay(500);

		// Return the active subscription if a purchase was completed
		const mockEntitlements: any[] = mockSubscriptionState ? [mockSubscriptionState] : [];

		console.log("✅ [Mock IAP] Entitlements fetched:", mockEntitlements.length);
		if (mockEntitlements.length > 0) {
			console.log("✨ [Mock IAP] User has premium access!");
		}
		return mockEntitlements;
	},

	/**
	 * Restore purchases (mock)
	 */
	async restorePurchases() {
		console.log("📱 [Mock IAP] Restoring purchases...");
		await delay(1500);

		// Simulate no previous purchases
		const mockPurchases: any[] = [];

		console.log("✅ [Mock IAP] Purchases restored:", mockPurchases.length);
		return mockPurchases;
	},

	/**
	 * Check subscription status (mock)
	 */
	async checkSubscriptionStatus() {
		console.log("📱 [Mock IAP] Checking subscription status...");
		await delay(500);

		// Return the active subscription if one exists
		const mockSubscription = mockSubscriptionState;

		console.log("✅ [Mock IAP] Subscription status:", mockSubscription);
		if (mockSubscription) {
			console.log("🔓 [Mock IAP] Premium subscription is active!");
		}
		return mockSubscription;
	},

	/**
	 * End connection (mock)
	 */
	async endConnection() {
		console.log("📱 [Mock IAP] Ending connection...");
		await delay(200);
		console.log("✅ [Mock IAP] Connection ended");
	},

	/**
	 * Setup purchase listener (mock)
	 */
	setupPurchaseListener(
		onPurchase: (purchase: any) => void,
		onError: (error: any) => void
	) {
		console.log("📱 [Mock IAP] Setting up purchase listeners...");

		// Store the callbacks so purchaseSubscription can use them
		// @ts-ignore - adding callbacks to the service for mock purposes
		IAPService._mockPurchaseCallback = onPurchase;
		// @ts-ignore
		IAPService._mockErrorCallback = onError;

		console.log("✅ [Mock IAP] Purchase listener ready");

		// Return cleanup function
		return () => {
			console.log("📱 [Mock IAP] Removing purchase listeners");
			// @ts-ignore
			delete IAPService._mockPurchaseCallback;
			// @ts-ignore
			delete IAPService._mockErrorCallback;
		};
	},

	/**
	 * Reset subscription state (MOCK ONLY - for testing)
	 * This simulates canceling a subscription to test the free → premium → free flow
	 */
	async resetSubscription() {
		console.log("📱 [Mock IAP] Resetting subscription state...");
		await delay(500);

		mockSubscriptionState = null;

		console.log("✅ [Mock IAP] Subscription reset - user is now free tier");
		console.log("⚠️  This is MOCK ONLY - use for testing the UI flow");
		return true;
	},
};

// Log warning that mock is being used
console.warn(
	"⚠️ ============================================\n" +
		"⚠️  MOCK IAP SERVICE ACTIVE\n" +
		"⚠️  This is for UI testing in Expo Go only.\n" +
		"⚠️  Use a development build for real IAP.\n" +
		"⚠️ ============================================"
);
