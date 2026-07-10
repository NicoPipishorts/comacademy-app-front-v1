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

type PendingPurchaseRequest = {
	sku: string;
	resolve: () => void;
	reject: (error: unknown) => void;
	timeoutId: ReturnType<typeof setTimeout>;
	startedAtMs: number;
};

type SubscriptionState = {
	products: SubscriptionProduct[];
	subscription: any;
	loading: boolean;
	refreshing: boolean;
	purchasing: boolean;
	error: string | null;
	purchase: (
		product: SubscriptionProduct,
		options?: { iosPromotionalOfferId?: string | null }
	) => Promise<void>;
	restore: () => Promise<void>;
	checkSubscription: () => Promise<any>;
	cancelSubscription: () => Promise<boolean>;
	refresh: () => Promise<void>;
	hasPremiumAccess: boolean;
	hasActiveSubscription: boolean;
};

const SubscriptionContext = createContext<SubscriptionState | undefined>(
	undefined
);
const PURCHASE_CONFIRMATION_TIMEOUT_MS = 30_000;

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
	const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const hasInitializedRef = useRef(false);
	const pendingPurchaseRef = useRef<PendingPurchaseRequest | null>(null);

	const resolvePurchaseEventSku = useCallback((purchase: any): string | undefined => {
		if (typeof purchase?.productId === "string" && purchase.productId.length > 0) {
			return purchase.productId;
		}

		if (Array.isArray(purchase?.products) && purchase.products.length > 0) {
			const first = purchase.products[0];
			if (typeof first === "string" && first.length > 0) {
				return first;
			}
			if (
				typeof first?.productId === "string" &&
				first.productId.length > 0
			) {
				return first.productId;
			}
		}

		if (typeof purchase?.sku === "string" && purchase.sku.length > 0) {
			return purchase.sku;
		}

		return undefined;
	}, []);

	const resolveTransactionReason = useCallback((purchase: any): string | undefined => {
		const candidates = [
			purchase?.transactionReasonIOS,
			purchase?.reasonIOS,
			purchase?.reasonStringRepresentationIOS,
		];

		for (const candidate of candidates) {
			if (typeof candidate === "string" && candidate.trim().length > 0) {
				return candidate.trim().toUpperCase();
			}
		}

		return undefined;
	}, []);

	const resolveTransactionDateMs = useCallback((purchase: any): number | undefined => {
		const raw = purchase?.transactionDate;
		if (typeof raw === "number" && Number.isFinite(raw)) return raw;
		if (typeof raw === "string" && raw.trim().length > 0) {
			const numeric = Number(raw);
			if (Number.isFinite(numeric)) return numeric;
			const parsed = Date.parse(raw);
			if (Number.isFinite(parsed)) return parsed;
		}
		return undefined;
	}, []);

	const matchesPendingPurchase = useCallback(
		(pending: PendingPurchaseRequest, purchase: any): boolean => {
			const purchaseSku = resolvePurchaseEventSku(purchase);
			if (purchaseSku && purchaseSku !== pending.sku) {
				return false;
			}

			// Ignore subscription renewal events for a user-initiated purchase request.
			const reason = resolveTransactionReason(purchase);
			if (reason === "RENEWAL") {
				return false;
			}

			const transactionDateMs = resolveTransactionDateMs(purchase);
			if (
				typeof transactionDateMs === "number" &&
				transactionDateMs + 5000 < pending.startedAtMs
			) {
				return false;
			}

			return true;
		},
		[resolvePurchaseEventSku, resolveTransactionDateMs, resolveTransactionReason]
	);

	const clearPendingPurchase = useCallback(() => {
		const pending = pendingPurchaseRef.current;
		if (!pending) return;
		clearTimeout(pending.timeoutId);
		pendingPurchaseRef.current = null;
	}, []);

	const resolvePendingPurchase = useCallback(
		(purchase: any): boolean => {
			const pending = pendingPurchaseRef.current;
			if (!pending) return false;
			if (!matchesPendingPurchase(pending, purchase)) return false;

			const { resolve } = pending;
			clearPendingPurchase();
			resolve();
			return true;
		},
		[clearPendingPurchase, matchesPendingPurchase]
	);

	const rejectPendingPurchase = useCallback(
		(reason: unknown, purchase?: any): boolean => {
			const pending = pendingPurchaseRef.current;
			if (!pending) return false;
			if (purchase && !matchesPendingPurchase(pending, purchase)) {
				return false;
			}

			const { reject } = pending;
			clearPendingPurchase();
			reject(reason);
			return true;
		},
		[clearPendingPurchase, matchesPendingPurchase]
	);

	const checkSubscription = useCallback(async () => {
		try {
			let currentSub = await IAPService.checkSubscriptionStatus();
			if (
				"getEntitlementsSnapshot" in IAPService &&
				typeof IAPService.getEntitlementsSnapshot === "function"
			) {
				const snapshot = await IAPService.getEntitlementsSnapshot();
				const snapshotHasPremiumAccess = Boolean(snapshot?.hasPremiumAccess);
				setHasPremiumAccess(snapshotHasPremiumAccess);
				if (!currentSub && snapshotHasPremiumAccess) {
					currentSub = snapshot?.entitlements?.[0] ?? null;
				}
			} else {
				setHasPremiumAccess(Boolean(currentSub));
			}
			setSubscription(currentSub);
			return currentSub;
		} catch (err) {
			debugIAP("Check subscription error:", err);
			return null;
		}
	}, []);

	const fetchProductsAndSubscription = useCallback(async () => {
		debugIAP("Fetching products & subscription…");

		// 1) PRODUCTS – this is what you care about now
		try {
			debugIAP("getProducts triggered");
			const availableProducts = await IAPService.getProducts();

			// Avoid JSON.stringify on the whole objects
			debugIAP(
				"Products fetched (count)",
				Array.isArray(availableProducts)
					? availableProducts.length
					: "not array"
			);

			setProducts(availableProducts);
		} catch (err: any) {
			debugIAP("getProducts error", {
				message: err?.message,
				raw: String(err),
			});
			setError(err?.message || String(err) || "Failed to fetch products");
			return; // no point continuing if products fail
		}

		// 2) ENTITLEMENTS – best-effort only, do NOT block UI
		try {
			debugIAP("checkSubscriptionStatus() triggered");
			let currentSub = await IAPService.checkSubscriptionStatus();
			let snapshotHasPremiumAccess = Boolean(currentSub);
			if (
				"getEntitlementsSnapshot" in IAPService &&
				typeof IAPService.getEntitlementsSnapshot === "function"
			) {
				const snapshot = await IAPService.getEntitlementsSnapshot();
				snapshotHasPremiumAccess = Boolean(snapshot?.hasPremiumAccess);
				if (!currentSub && snapshotHasPremiumAccess) {
					currentSub = snapshot?.entitlements?.[0] ?? null;
				}
			}
			debugIAP("Subscription status result", {
				currentSub,
				hasPremiumAccess: snapshotHasPremiumAccess,
			});
			setSubscription(currentSub);
			setHasPremiumAccess(snapshotHasPremiumAccess);
		} catch (err: any) {
			debugIAP("checkSubscriptionStatus error (ignored for now)", {
				message: err?.message,
				raw: String(err),
			});
			// Don’t call setError here – we’re focusing on products first
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
						resolvePendingPurchase(purchase);
						setPurchasing(false);
					},
					(err: PurchaseError, purchase?: any) => {
						debugIAP("Purchase error:", err);
						const didRejectPendingPurchase = rejectPendingPurchase(err, purchase);
						if (!didRejectPendingPurchase && purchase) {
							const reason = resolveTransactionReason(purchase);
							if (reason === "RENEWAL") {
								debugIAP(
									"Ignoring renewal failure for active paywall flow",
									{
										reason,
										sku: resolvePurchaseEventSku(purchase),
									}
								);
								return;
							}
						}

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
			clearPendingPurchase();
			cleanup?.();
			void IAPService.endConnection();
			hasInitializedRef.current = false;
		};
	}, [
		checkSubscription,
		clearPendingPurchase,
		fetchProductsAndSubscription,
		rejectPendingPurchase,
		resolvePurchaseEventSku,
		resolveTransactionReason,
		resolvePendingPurchase,
	]);

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
		async (
			product: SubscriptionProduct,
			options?: { iosPromotionalOfferId?: string | null }
		) => {
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

				const completionPromise = new Promise<void>((resolve, reject) => {
					clearPendingPurchase();
					const timeoutId = setTimeout(() => {
						reject(
							new Error(
								"Impossible de confirmer l'achat. Verifiez votre compte App Store Sandbox puis reessayez."
							)
						);
						pendingPurchaseRef.current = null;
					}, PURCHASE_CONFIRMATION_TIMEOUT_MS);

					pendingPurchaseRef.current = {
						sku,
						resolve,
						reject,
						timeoutId,
						startedAtMs: Date.now(),
					};
				});

				await IAPService.purchaseSubscription(product, userId, options);
				await completionPromise;
			} catch (err) {
				rejectPendingPurchase(err);
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
		[clearPendingPurchase, rejectPendingPurchase, session?.user?.id]
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
			hasPremiumAccess,
			hasActiveSubscription: hasPremiumAccess,
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
			hasPremiumAccess,
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
