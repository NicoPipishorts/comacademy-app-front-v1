import type {
	Product,
	ProductSubscription,
	ProductSubscriptionAndroid,
	ProductSubscriptionAndroidOfferDetails,
} from "react-native-iap";

export type SubscriptionProduct = Product | ProductSubscription;

export const getSubscriptionProductId = (
	product?: SubscriptionProduct | null
): string | undefined => {
	if (!product) return undefined;

	const legacyId = (product as SubscriptionProduct & {
		productId?: string | null;
	}).productId;

	return legacyId ?? product.id;
};

export const formatSubscriptionPrice = (
	product: SubscriptionProduct | undefined,
	fallback: string
): string => {
	if (!product) return fallback;

	if (product.displayPrice) {
		return product.displayPrice;
	}

	const legacyLocalized = (product as {
		localizedPrice?: string | null;
	}).localizedPrice;

	if (legacyLocalized) {
		return legacyLocalized;
	}

	if (product.price != null) {
		return `${product.price} ${product.currency}`.trim();
	}

	return fallback;
};

const getAndroidOfferDetails = (
	product: SubscriptionProduct
): ProductSubscriptionAndroidOfferDetails | undefined => {
	if (
		"subscriptionOfferDetailsAndroid" in product &&
		Array.isArray(product.subscriptionOfferDetailsAndroid) &&
		product.subscriptionOfferDetailsAndroid.length > 0
	) {
		return product.subscriptionOfferDetailsAndroid.find(
			(offer) => !!offer.offerToken
		);
	}

	return undefined;
};

export const getAndroidOfferToken = (
	product: SubscriptionProduct
): string | undefined => {
	const details = getAndroidOfferDetails(product);
	return details?.offerToken ?? undefined;
};

export const isAndroidSubscriptionProduct = (
	product: SubscriptionProduct
): product is ProductSubscriptionAndroid =>
	"subscriptionOfferDetailsAndroid" in product;
