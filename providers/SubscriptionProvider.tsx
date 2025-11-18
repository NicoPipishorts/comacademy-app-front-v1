import { UseAuth } from "@/auth/AuthContext";
import { IAPService } from "@/src/services/iap.service";
import { debugIAP } from "@/src/utils/debug";
import {
	getSubscriptionProductId,
	type SubscriptionProduct,
} from "@/src/utils/iap";
import { isUserCancelledError } from "@/src/utils/iapErrors";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { PurchaseError } from "react-native-iap";

type SubscriptionState = {
	products: SubscriptionProduct[];
	subscription: any;
	loading: boolean;
	refreshing: boolean;
	purchasing: boolean;
	error: string | null;
	purchase: (product: SubscriptionProduct) => Promise<void>;
	restore: () => Promise<void>;
	checkSubscription: () => Promise<any>;
	cancelSubscription: () => Promise<boolean>;
	refresh: () => Promise<void>;
	hasActiveSubscription: boolean;
};

const SubscriptionContext = createContext<SubscriptionState | undefined>(
	undefined
);

export const SubscriptionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { session } = UseAuth();
	const [products, setProducts] = useState<SubscriptionProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [purchasing, setPurchasing] = useState(false);
	const [subscription, setSubscription] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const hasInitializedRef = useRef(false);

	const checkSubscription = useCallback(async () => {
		try {
			const currentSub = await IAPService.checkSubscriptionStatus();
			setSubscription(currentSub);
			return currentSub;
		} catch (err) {
			debugIAP("Check subscription error:", err);
			return null;
		}
	}, []);

	const fetchProductsAndSubscription = useCallback(async () => {
		try {
			debugIAP("[IAP] Fetching products & subscription…");
			const [availableProducts, currentSub] = await Promise.all([
				IAPService.getProducts(),
				IAPService.checkSubscriptionStatus(),
			]);
			debugIAP("[IAP] Fetched products:", availableProducts);
			debugIAP("[IAP] Fetched subscription:", currentSub);

			setProducts(availableProducts);
			setSubscription(currentSub);
		} catch (err: any) {
			debugIAP("[IAP] fetchProductsAndSubscription error:", err);
			setError(
				err?.message || String(err) || "Failed to fetch products/subscription"
			);
		}
	}, []);

	useEffect(() => {
		let cleanup: (() => void) | undefined;

		const init = async () => {
			if (hasInitializedRef.current) {
				return;
			}

			if (!process.env.EXPO_PUBLIC_API_URL) {
				setError(
					"Configuration manquante pour les achats (EXPO_PUBLIC_API_URL)."
				);
				setLoading(false);
				return;
			}
			// inside init()
			debugIAP("[IAP] API URL:", process.env.EXPO_PUBLIC_API_URL);
			debugIAP("[IAP] Initializing IAP…");

			hasInitializedRef.current = true;

			try {
				await IAPService.initialize();

				cleanup = IAPService.setupPurchaseListener(
					(purchase) => {
						debugIAP("Purchase successful:", purchase);
						void checkSubscription();
						setPurchasing(false);
					},
					(err: PurchaseError) => {
						debugIAP("Purchase error:", err);
						if (isUserCancelledError(err)) {
							setError(null);
						} else {
							setError(err?.message || "Purchase failed");
						}
						setPurchasing(false);
					}
				);

				await fetchProductsAndSubscription();
			} catch (err: any) {
				debugIAP("Failed to initialize IAP:", err);
				debugIAP(
					"Failed to initialize IAP – full error:",
					JSON.stringify(err, null, 2)
				);
				setError(
					err?.message || String(err) || "Failed to initialize purchases"
				);
				hasInitializedRef.current = false;
			} finally {
				setLoading(false);
			}
		};

		void init();

		return () => {
			cleanup?.();
			void IAPService.endConnection();
			hasInitializedRef.current = false;
		};
	}, [checkSubscription, fetchProductsAndSubscription]);

	useEffect(() => {
		if (!hasInitializedRef.current) return;

		void (async () => {
			try {
				await fetchProductsAndSubscription();
			} catch (err) {
				debugIAP("Failed to refresh subscriptions after session change:", err);
			}
		})();
	}, [session?.user?.id, fetchProductsAndSubscription]);

	const purchase = useCallback(
		async (product: SubscriptionProduct) => {
			const sku = getSubscriptionProductId(product);
			if (!sku) {
				const invalidError = new Error("Invalid product identifier");
				setError(invalidError.message);
				throw invalidError;
			}

			try {
				setPurchasing(true);
				setError(null);
				const userId = session?.user?.id ? String(session.user.id) : undefined;
				await IAPService.purchaseSubscription(product, userId);
			} catch (err) {
				const purchaseError = err as PurchaseError;
				if (isUserCancelledError(purchaseError)) {
					setError(null);
				} else {
					setError(purchaseError?.message || "Purchase failed");
				}
				setPurchasing(false);
				throw err;
			}
		},
		[session?.user?.id]
	);

	const refresh = useCallback(async () => {
		try {
			setRefreshing(true);
			setError(null);
			await fetchProductsAndSubscription();
		} catch (err: any) {
			debugIAP("Refresh error:", err);
			setError(err?.message || "Refresh failed");
		} finally {
			setRefreshing(false);
		}
	}, [fetchProductsAndSubscription]);

	const restore = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			await IAPService.restorePurchases();
			await checkSubscription();
		} catch (err: any) {
			debugIAP("Restore error:", err);
			setError(err?.message || "Restore failed");
		} finally {
			setLoading(false);
		}
	}, [checkSubscription]);

	const cancelSubscription = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			if (
				"resetSubscription" in IAPService &&
				typeof IAPService.resetSubscription === "function"
			) {
				await IAPService.resetSubscription();
				await checkSubscription();
				return true;
			}
			return false;
		} catch (err: any) {
			debugIAP("Cancel subscription error:", err);
			setError(err?.message || "Cancel failed");
			return false;
		} finally {
			setLoading(false);
		}
	}, [checkSubscription]);

	const value = useMemo<SubscriptionState>(
		() => ({
			products,
			subscription,
			loading,
			refreshing,
			purchasing,
			error,
			purchase,
			restore,
			checkSubscription,
			cancelSubscription,
			refresh,
			hasActiveSubscription: !!subscription,
		}),
		[
			products,
			subscription,
			loading,
			refreshing,
			purchasing,
			error,
			purchase,
			restore,
			checkSubscription,
			cancelSubscription,
			refresh,
		]
	);

	return (
		<SubscriptionContext.Provider value={value}>
			{children}
		</SubscriptionContext.Provider>
	);
};

export const useSubscriptionContext = () => {
	const context = useContext(SubscriptionContext);
	if (!context) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider"
		);
	}
	return context;
};
