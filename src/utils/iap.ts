import type {
	ProductSubscriptionIOS,
	Product,
	ProductSubscription,
	ProductSubscriptionAndroid,
	ProductSubscriptionAndroidOfferDetails,
	SubscriptionOfferIOS,
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

export const getAndroidBasePlanId = (
	product: SubscriptionProduct
): string | undefined => {
	const directBasePlanId = (product as SubscriptionProduct & {
		basePlanId?: string | null;
	}).basePlanId;

	if (directBasePlanId) {
		return directBasePlanId;
	}

	const details = getAndroidOfferDetails(product);
	return details?.basePlanId ?? undefined;
};

export const getAndroidOfferId = (
	product: SubscriptionProduct
): string | undefined => {
	const directOfferId = (product as SubscriptionProduct & {
		offerId?: string | null;
	}).offerId;

	if (directOfferId) {
		return directOfferId;
	}

	const details = getAndroidOfferDetails(product);
	return details?.offerId ?? undefined;
};

export const getAndroidOfferTags = (
	product: SubscriptionProduct
): string[] => {
	const directTags = (product as SubscriptionProduct & {
		offerTags?: string[] | null;
	}).offerTags;

	if (Array.isArray(directTags)) {
		return directTags.filter((tag): tag is string => typeof tag === "string");
	}

	const details = getAndroidOfferDetails(product);
	return Array.isArray(details?.offerTags)
		? details.offerTags.filter((tag): tag is string => typeof tag === "string")
		: [];
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

export const isIosSubscriptionProduct = (
	product: SubscriptionProduct
): product is ProductSubscriptionIOS =>
	"subscriptionInfoIOS" in product;

export const getIosPromotionalOffers = (
	product: SubscriptionProduct
): SubscriptionOfferIOS[] => {
	if (!isIosSubscriptionProduct(product)) {
		return [];
	}

	const offers = product.subscriptionInfoIOS?.promotionalOffers;
	return Array.isArray(offers) ? offers : [];
};

export const getPreferredIosPromotionalOffer = (
	product: SubscriptionProduct,
	preferredOfferId?: string | null
): SubscriptionOfferIOS | null => {
	const offers = getIosPromotionalOffers(product);
	if (!offers.length) {
		return null;
	}

	if (preferredOfferId) {
		const exactMatch = offers.find((offer) => offer.id === preferredOfferId);
		if (exactMatch) {
			return exactMatch;
		}
	}

	return offers[0] ?? null;
};
