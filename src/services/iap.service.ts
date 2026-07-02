// iap.service.ts
import axios from "axios";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { jwtDecode } from "jwt-decode";
import { Platform } from "react-native";
import type {
	DiscountOfferInputIOS,
	Purchase,
	RequestPurchaseProps,
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
	IosPromotionalOfferSignature,
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
let isIapConnected = false;
let initConnectionPromise: Promise<void> | null = null;

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

const ensureConnection = async (): Promise<RNIapModule> => {
	const iap = await ensureIapModule();

	if (isIapConnected) {
		return iap;
	}

	if (!initConnectionPromise) {
		initConnectionPromise = (async () => {
			debugIAP("initConnection requested");
			await iap.initConnection();
			isIapConnected = true;
			debugIAP("initConnection success");
		})().finally(() => {
			initConnectionPromise = null;
		});
	}

	await initConnectionPromise;
	return iap;
};

// Keep identical IDs on both platforms (must match App Store / Play Console)
const PRODUCT_IDS = Platform.select({
	ios: ["fullAccess100", "fullAccess1200"], // both iOS products
	android: ["full.access"], // Android subscription *product* ID with monthly-full and yearly-full base plans
}) as string[];

type BackendCatalogProduct = {
	id?: string;
	type?: string;
};

type EntitlementRecord = {
	productId?: string;
	status?: string;
	expiresAt?: string | null;
	platform?: string;
	provider?: string;
	[key: string]: unknown;
};

type EntitlementsSnapshot = {
	entitlements: EntitlementRecord[];
	hasPremiumAccess: boolean;
};

type StoreKitTransactionClaims = {
	transactionId?: string;
	originalTransactionId?: string;
};

const ACTIVE_PREMIUM_STATUSES = new Set([
	"active",
	"grace_period",
	"billing_retry",
	"granted",
]);

let cachedCatalogProductIds: string[] | null = null;
let lastCatalogFetchMs = 0;
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;

const normalizeEnvironmentValue = (value?: string | null): string | null => {
	if (!value) return null;

	const normalized = value.trim().toLowerCase();
	if (normalized === "sandbox" || normalized === "production") {
		return normalized;
	}

	return null;
};

const resolveDefaultValidationEnvironment = (
	platform: "ios" | "android"
): string => {
	const envOverride = normalizeEnvironmentValue(process.env.EXPO_PUBLIC_IAP_ENV);
	if (envOverride) {
		return envOverride;
	}

	if (__DEV__) {
		return "sandbox";
	}

	if (platform === "ios") {
		const channel =
			typeof Updates.channel === "string"
				? Updates.channel.trim().toLowerCase()
				: "";
		if (channel && channel !== "production") {
			return "sandbox";
		}
	}

	return "production";
};

const fnv1a32 = (input: string): number => {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i += 1) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
};

const toHex32 = (value: number): string => value.toString(16).padStart(8, "0");

const createDeterministicUuid = (rawValue: string): string => {
	const seed = rawValue.trim();
	const hex =
		toHex32(fnv1a32(`${seed}:1`)) +
		toHex32(fnv1a32(`${seed}:2`)) +
		toHex32(fnv1a32(`${seed}:3`)) +
		toHex32(fnv1a32(`${seed}:4`));

	const chars = hex.split("");
	chars[12] = "4";
	const variant = (parseInt(chars[16], 16) & 0x3) | 0x8;
	chars[16] = variant.toString(16);
	const normalizedHex = chars.join("");

	return `${normalizedHex.slice(0, 8)}-${normalizedHex.slice(8, 12)}-${normalizedHex.slice(12, 16)}-${normalizedHex.slice(16, 20)}-${normalizedHex.slice(20, 32)}`;
};

const createObfuscatedAccountId = (rawValue: string): string =>
	`${toHex32(fnv1a32(`comacademy:${rawValue}:a`))}${toHex32(fnv1a32(`comacademy:${rawValue}:b`))}`;

const normalizeCatalogResponse = (
	payload: unknown
): BackendCatalogProduct[] => {
	if (Array.isArray(payload)) {
		return payload as BackendCatalogProduct[];
	}

	if (
		payload &&
		typeof payload === "object" &&
		Array.isArray((payload as { products?: unknown[] }).products)
	) {
		return (payload as { products: BackendCatalogProduct[] }).products;
	}

	return [];
};

const fetchBackendCatalogIds = async (forceRefresh = false): Promise<string[]> => {
	const now = Date.now();
	if (
		!forceRefresh &&
		cachedCatalogProductIds &&
		now - lastCatalogFetchMs < CATALOG_CACHE_TTL_MS
	) {
		return cachedCatalogProductIds;
	}

	const apiBaseUrl = getApiBaseUrl();
	const response = await axios.get(`${apiBaseUrl}/iap/products`);
	const catalog = normalizeCatalogResponse(response.data);
	const ids = catalog
		.map((item) => (typeof item?.id === "string" ? item.id.trim() : ""))
		.filter((id): id is string => id.length > 0);

	if (!ids.length) {
		throw new Error("Backend returned an empty IAP products allowlist");
	}

	cachedCatalogProductIds = Array.from(new Set(ids));
	lastCatalogFetchMs = now;
	return cachedCatalogProductIds;
};

const getPlatformAllowedIds = async (): Promise<string[]> => {
	const catalogIds = await fetchBackendCatalogIds();
	const allowed = PRODUCT_IDS.filter((id) => catalogIds.includes(id));

	if (!allowed.length) {
		throw new Error(
			`No backend-allowed IAP products for ${Platform.OS}. Expected one of: ${PRODUCT_IDS.join(", ")}`
		);
	}

	return allowed;
};

const isPremiumEntitlementActive = (entitlement: EntitlementRecord): boolean => {
	const status = String(entitlement?.status ?? "").toLowerCase();
	if (!ACTIVE_PREMIUM_STATUSES.has(status)) {
		return false;
	}

	if (!entitlement?.expiresAt) {
		return true;
	}

	const expiry = new Date(entitlement.expiresAt).getTime();
	if (Number.isNaN(expiry)) {
		return true;
	}

	return expiry > Date.now();
};

const parseStoreKitTransactionClaims = (
	signedTransactionInfo?: string
): StoreKitTransactionClaims => {
	if (!signedTransactionInfo) return {};

	try {
		const decoded = jwtDecode<Record<string, unknown>>(signedTransactionInfo);
		const resolveString = (...candidates: unknown[]): string | undefined => {
			for (const candidate of candidates) {
				if (typeof candidate === "string" && candidate.trim().length > 0) {
					return candidate.trim();
				}
				if (typeof candidate === "number" && Number.isFinite(candidate)) {
					return String(candidate);
				}
			}
			return undefined;
		};

		const transactionId = resolveString(
			decoded.transactionId,
			decoded.transaction_id,
			decoded.id
		);
		const originalTransactionId = resolveString(
			decoded.originalTransactionId,
			decoded.original_transaction_id,
			decoded.originalTransactionIdentifier
		);

		return {
			transactionId,
			originalTransactionId,
		};
	} catch {
		return {};
	}
};

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

const fetchIosPromotionalOfferSignature = async (
	productId: string,
	offerId: string
): Promise<IosPromotionalOfferSignature> => {
	const apiBaseUrl = getApiBaseUrl();
	const response = await axios.post(
		`${apiBaseUrl}/iap/apple/promotional-offer-signature`,
		{
			productId,
			offerId,
		}
	);

	return response.data;
};

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
		normalizeEnvironmentValue(rawPurchase.environmentIOS as string | undefined) ||
		defaultEnvironment;

	const fallbackSignedTransactionInfo =
		(rawPurchase.signedTransactionInfo as string | undefined) ||
		(rawPurchase.purchaseToken as string | undefined);
	const parsedClaims = parseStoreKitTransactionClaims(fallbackSignedTransactionInfo);
	const fallbackTransactionId =
		(rawPurchase.transactionId as string | undefined) ||
		(rawPurchase.id as string | undefined) ||
		parsedClaims.transactionId;
	const fallbackOriginalTransactionId =
		(rawPurchase.originalTransactionIdentifierIOS as string | undefined) ||
		(rawPurchase.originalTransactionIdentifier as string | undefined) ||
		(rawPurchase.originalTransactionId as string | undefined) ||
		parsedClaims.originalTransactionId ||
		fallbackTransactionId;

	const payload: PurchaseValidationPayload = {
		platform: "ios",
		productId: normalized.productId,
		environment: environmentIOS,
		originalTransactionId:
			normalized.originalTransactionId || fallbackOriginalTransactionId,
		transactionId: normalized.transactionId || fallbackTransactionId,
	};

	const signedTransactionInfo = fallbackSignedTransactionInfo;
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

	if (!payload.transactionId) {
		throw new Error("Missing transactionId for iOS verification");
	}

	if (!payload.signedTransactionInfo) {
		throw new Error(
			"Missing signedTransactionInfo for iOS verification payload"
		);
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

const extractAxiosErrorDetails = (error: unknown) => {
	if (!axios.isAxiosError(error)) return null;

	return {
		status: error.response?.status,
		url: error.config?.url,
		method: error.config?.method,
		data: error.response?.data,
		message: error.message,
	};
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
		const iap = await ensureConnection();

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
				const iap = await ensureConnection();
				debugIAP("IAP module loaded successfully");
				debugIAP("IAP module type", typeof iap);

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
			debugIAP(
				"App bundle ID",
				Constants.expoConfig?.ios?.bundleIdentifier ||
					Constants.expoConfig?.android?.package ||
					"unknown"
			);
			debugIAP("Build type", __DEV__ ? "development" : "production");

			try {
				const iap = await ensureConnection();
				const allowedProductIds = await getPlatformAllowedIds();

				debugIAP("RNIap keys", Object.keys(iap as any));
				debugIAP("typeof iap.getSubscriptions", typeof iap.getSubscriptions);
				debugIAP("typeof iap.fetchProducts", typeof iap.fetchProducts);

				debugIAP("Calling subscription product fetch with params", {
					skus: allowedProductIds,
				});

				let products: any[] | null = null;
				if (typeof iap.fetchProducts === "function") {
					products = await iap.fetchProducts({
						skus: allowedProductIds,
						type: "subs",
					});
				} else if (typeof iap.getSubscriptions === "function") {
					// Backward compatibility for older react-native-iap versions.
					products = await iap.getSubscriptions({
						skus: allowedProductIds,
					});
				} else {
					throw new Error(
						"IAP module does not expose fetchProducts/getSubscriptions"
					);
				}

				debugIAP("Subscription fetch result count", products?.length ?? 0);

				// For Android, expand subscription offers into separate product objects
				let expandedProducts = products ?? [];
				if (Platform.OS === "android" && products && products.length > 0) {
					const expanded: any[] = [];

					products.forEach((product: any) => {
						const offers = product.subscriptionOfferDetailsAndroid;

						if (offers && Array.isArray(offers) && offers.length > 0) {
							debugIAP(`Product ${product.id} has ${offers.length} offers`);

							// Create a separate product object for each offer/base plan
							offers.forEach((offer: any, offerIndex: number) => {
								const phase = offer.pricingPhases?.pricingPhaseList?.[0];

								if (phase) {
									const offerSuffix =
										offer.offerId || offer.basePlanId || String(offerIndex);
									const expandedProduct = {
										...product,
										// Create unique ID for each offer
										id: `${product.id}_${offerSuffix}`,
										productId: `${product.id}_${offerSuffix}`,
										// Store original product ID for purchase
										originalProductId: product.id,
										// Store the specific offer details
										selectedOffer: offer,
										offerToken: offer.offerToken,
										basePlanId: offer.basePlanId,
										offerId: offer.offerId ?? null,
										offerTags: Array.isArray(offer.offerTags)
											? offer.offerTags
											: [],
										// Update pricing from this specific offer
										price: phase.formattedPrice,
										displayPrice: phase.formattedPrice,
										subscriptionPeriodAndroid: phase.billingPeriod,
										// Keep original offers array for purchase
										subscriptionOfferDetailsAndroid: [offer],
									};

									expanded.push(expandedProduct);

									debugIAP(`Expanded offer ${offerIndex + 1}`, {
										id: expandedProduct.id,
										basePlanId: offer.basePlanId,
										offerId: offer.offerId ?? null,
										price: phase.formattedPrice,
										period: phase.billingPeriod,
										offerToken: offer.offerToken,
									});
								}
							});
						} else {
							// No offers found, use product as-is
							expanded.push(product);
						}
					});

					expandedProducts = expanded;
					debugIAP("Total expanded products", expandedProducts.length);
				} else if (products && products.length > 0) {
					debugIAP("Products received successfully (iOS)");
					products.forEach((p: any, idx: number) => {
						debugIAP(`Product ${idx + 1}`, {
							productId: p.productId || p.id,
							title: p.title,
							price: p.price,
						});
					});
				}

				const allowedSet = new Set(allowedProductIds);
				expandedProducts = expandedProducts.filter((product: any) => {
					const backendId = String(
						product?.originalProductId ?? product?.id ?? product?.productId ?? ""
					);
					return allowedSet.has(backendId);
				});

				if (!expandedProducts || expandedProducts.length === 0) {
					debugIAP("⚠️ WARNING: No products returned from store");
					debugIAP("Troubleshooting checklist:");
					debugIAP("1. Product IDs in code match App Store Connect exactly");
					debugIAP(`   Expected: ${allowedProductIds.join(", ")}`);
					debugIAP(
						"2. Subscriptions are 'Ready for Sale' and attached to this app version"
					);
					debugIAP("3. Package ID matches: com.nicopipishorts.comacademy");
					debugIAP(
						"4. Test on a real build (TestFlight/dev client), not Expo Go"
					);
					debugIAP(
						"5. Test account must be a Sandbox tester on iOS (Settings > App Store > Sandbox Account)"
					);
					debugIAP("6. Wait up to 24 hours after product creation/approval");
				}

				return expandedProducts;
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
		async purchaseSubscription(
			product: SubscriptionProduct,
			userId?: string,
			options?: {
				iosPromotionalOfferId?: string | null;
			}
		) {
			debugIAP("purchaseSubscription called", product);
			try {
				// For expanded Android products, use the original product ID
				const productAny = product as any;
				const sku = productAny.originalProductId || getSubscriptionProductId(product);
				if (!sku) throw new Error("Invalid product identifier");
				const allowedProductIds = await getPlatformAllowedIds();
				if (!allowedProductIds.includes(sku)) {
					throw new Error(
						`Product ${sku} is not allowed by backend catalog for ${Platform.OS}`
					);
				}

				const iap = await ensureConnection();
				const request: RequestSubscriptionPropsByPlatforms = {};
				if (Platform.OS === "ios") {
					const appAccountToken = userId
						? createDeterministicUuid(String(userId))
						: undefined;
					let withOffer: DiscountOfferInputIOS | undefined;
					if (options?.iosPromotionalOfferId) {
						withOffer = await fetchIosPromotionalOfferSignature(
							sku,
							options.iosPromotionalOfferId
						);
					}

					request.ios = {
						sku,
						...(appAccountToken ? { appAccountToken } : {}),
						...(withOffer ? { withOffer } : {}),
					};
					debugIAP("iOS subscription request", {
						sku,
						hasAppAccountToken: Boolean(appAccountToken),
						promotionalOfferId: withOffer?.identifier ?? null,
					});
				} else if (Platform.OS === "android") {
					const obfuscatedAccountId = userId
						? createObfuscatedAccountId(String(userId))
						: undefined;
					debugIAP("Android subscription request");
					const androidReq: RequestSubscriptionAndroidProps = {
						skus: [sku],
						// Policy: obfuscate your account ID; do not send raw PII
						...(obfuscatedAccountId
							? { obfuscatedAccountIdAndroid: obfuscatedAccountId }
							: {}),
					};

					// Use the offer token from the expanded product
					const offerToken = productAny.offerToken || getAndroidOfferToken(product);
					if (offerToken) {
						androidReq.subscriptionOffers = [{ sku, offerToken }];
						debugIAP("Using offer token", {
							sku,
							offerToken,
							basePlanId: productAny.basePlanId,
						});
					} else {
						debugIAP("⚠️ WARNING: No offer token found for subscription");
					}

					request.android = androidReq;
				}

				const purchaseRequest: RequestPurchaseProps = {
					type: "subs",
					request,
				};

				debugIAP("typeof iap.requestPurchase", typeof iap.requestPurchase);
				debugIAP(
					"typeof iap.requestSubscription",
					typeof iap.requestSubscription
				);

				let purchase: Purchase;
				if (typeof iap.requestPurchase === "function") {
					debugIAP("Calling requestPurchase({ type: 'subs' })", {
						sku,
						request,
					});
					purchase = await iap.requestPurchase(purchaseRequest);
					if (Array.isArray(purchase) && purchase.length === 0) {
						debugIAP(
							"requestPurchase returned an empty array; waiting for purchaseUpdatedListener event"
						);
					}
				} else if (typeof iap.requestSubscription === "function") {
					// Backward compatibility for older react-native-iap versions.
					debugIAP("Calling requestSubscription() fallback", { sku, request });
					purchase = await iap.requestSubscription(request);
				} else {
					throw new Error(
						"IAP module does not expose requestPurchase/requestSubscription"
					);
				}

				debugIAP("requestPurchase success", purchase);
				return purchase;
			} catch (error) {
				debugIAP("requestPurchase failed", error);
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
			const apiBaseUrl = getApiBaseUrl();
			const iap = await ensureConnection();

			const normalized = normalizePurchase(purchase);
			const environment = resolveDefaultValidationEnvironment(normalized.platform);
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
				const axiosDetails = extractAxiosErrorDetails(error);
				if (axiosDetails) {
					debugIAP("completePurchase axios error", axiosDetails);
				}

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
		async getEntitlementsSnapshot(retryCount = 0): Promise<EntitlementsSnapshot> {
			debugIAP("Fetching entitlements", { attempt: retryCount + 1 });
			try {
				const apiBaseUrl = getApiBaseUrl();
				const res = await axios.get(`${apiBaseUrl}/me/entitlements`);
				debugIAP("Entitlements API response", res.data);
				const rawEntitlements = Array.isArray(res.data?.entitlements)
					? (res.data.entitlements as EntitlementRecord[])
					: [];
				const backendHasPremiumAccess =
					typeof res.data?.hasPremiumAccess === "boolean"
						? res.data.hasPremiumAccess
						: rawEntitlements.some(isPremiumEntitlementActive);

				return {
					entitlements: rawEntitlements,
					hasPremiumAccess: backendHasPremiumAccess,
				};
			} catch (error) {
				const axiosDetails = extractAxiosErrorDetails(error);
				if (axiosDetails) {
					debugIAP("getEntitlements axios error", axiosDetails);
				}

				debugIAP("getEntitlements error", error);

				// Retry once on 403 errors (may be a timing issue after login)
				if (
					axios.isAxiosError(error) &&
					error.response?.status === 403 &&
					retryCount === 0
				) {
					debugIAP("Retrying entitlements fetch after 403 (attempt 2)");
					await new Promise((resolve) => setTimeout(resolve, 1000));
					return this.getEntitlementsSnapshot(1);
				}

				console.error("Failed to get entitlements:", error);
				throw error;
			}
		},

		async getEntitlements(retryCount = 0) {
			const snapshot = await this.getEntitlementsSnapshot(retryCount);
			return snapshot.entitlements;
		},

		/**
		 * Restore purchases (iOS primary; Android returns active)
		 * Verifies each with backend and returns entitlements that are active
		 */
		async restorePurchases() {
			try {
				const RNIap = await ensureConnection();
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
				const snapshot = await this.getEntitlementsSnapshot();
				const entitlements = snapshot.entitlements;
				debugIAP("Entitlements fetched", entitlements);
				return (
					entitlements.find((entitlement) =>
						isPremiumEntitlementActive(entitlement)
					) || null
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
				if (!cachedIapModule || !isIapConnected) {
					return;
				}

				const RNIap = getIapModuleSync();
				await RNIap.endConnection();
				isIapConnected = false;
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
			onError: (error: any, purchase?: any) => void
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
						onError(err, purchase);
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
