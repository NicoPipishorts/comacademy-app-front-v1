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
		await delay(500);
	},

	async processPendingPurchases() {
	},

	/**
	 * Get available products (mock)
	 */
	async getProducts() {
		await delay(800);
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

		await delay(1500);

		const mockPurchase = {
			productId,
			transactionId: `mock-txn-${Date.now()}`,
			transactionDate: Date.now(),
			transactionReceipt: `mock-receipt-${Date.now()}`,
			purchaseToken: `mock-token-${Date.now()}`,
		};
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

		return mockEntitlement;
	},

	/**
	 * Get user entitlements (mock)
	 */
	async getEntitlementsSnapshot() {
		await delay(500);
		const entitlements: any[] = mockSubscriptionState ? [mockSubscriptionState] : [];
		return {
			entitlements,
			hasPremiumAccess: entitlements.length > 0,
		};
	},

	async getEntitlements() {
		const snapshot = await this.getEntitlementsSnapshot();
		return snapshot.entitlements;
	},

	/**
	 * Restore purchases (mock)
	 */
	async restorePurchases() {
		await delay(1500);

		// Simulate no previous purchases
		const mockPurchases: any[] = [];

		return mockPurchases;
	},

	/**
	 * Check subscription status (mock)
	 */
	async checkSubscriptionStatus() {
		await delay(500);

		// Return the active subscription if one exists
		const mockSubscription = mockSubscriptionState;

		return mockSubscription;
	},

	/**
	 * End connection (mock)
	 */
	async endConnection() {
		await delay(200);
	},

	/**
	 * Setup purchase listener (mock)
	 */
	setupPurchaseListener(
		onPurchase: (purchase: any) => void,
		onError: (error: any) => void
	) {

		// Store the callbacks so purchaseSubscription can use them
		// @ts-ignore - adding callbacks to the service for mock purposes
		IAPService._mockPurchaseCallback = onPurchase;
		// @ts-ignore
		IAPService._mockErrorCallback = onError;


		// Return cleanup function
		return () => {
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
		await delay(500);

		mockSubscriptionState = null;

		return true;
	},
};
