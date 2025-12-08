import { LoginUser } from "@/types/login";
import {
	AuthResponse,
	AuthUser,
	ClientInfo,
	SubscriptionPayload,
	UserPreference,
} from "@/types/credentials/auth";

type StrapiEntity<T> = {
	data: T;
	meta?: Record<string, unknown>;
} & Record<string, unknown>;

const isStrapiEntity = (value: unknown): value is StrapiEntity<unknown> => {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		Object.prototype.hasOwnProperty.call(value, "data")
	);
};

const toBoolean = (value: unknown, fallback = false): boolean => {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true" || normalized === "1") return true;
		if (normalized === "false" || normalized === "0") return false;
	}
	if (typeof value === "number") {
		return value !== 0;
	}
	return fallback;
};

const toString = (value: unknown, fallback = ""): string => {
	if (typeof value === "string") return value;
	if (typeof value === "number") return value.toString();
	return fallback;
};

export const unwrapStrapiResponse = <T>(payload: unknown): T | undefined => {
	if (payload === null || payload === undefined) {
		return undefined;
	}

	let current: unknown = payload;
	while (isStrapiEntity(current)) {
		current = current.data;
	}

	if (current === null || current === undefined) {
		return undefined;
	}

	return current as T;
};

export const resolveEntityAttributes = <
	T extends Record<string, unknown>
>(
	entity: unknown
): (T & { id?: number }) | undefined => {
	const maybeValue = unwrapStrapiResponse<Record<string, unknown>>(entity);
	if (!maybeValue || typeof maybeValue !== "object") {
		return undefined;
	}

	if (
		Object.prototype.hasOwnProperty.call(maybeValue, "attributes") &&
		typeof maybeValue.attributes === "object" &&
		maybeValue.attributes !== null
	) {
		const mergedAttributes = {
			...(maybeValue.attributes as object),
		} as Record<string, unknown>;

		if (
			!Object.prototype.hasOwnProperty.call(mergedAttributes, "id") &&
			Object.prototype.hasOwnProperty.call(maybeValue, "id")
		) {
			mergedAttributes.id = maybeValue.id;
		}

		return mergedAttributes as T & { id?: number };
	}

	return maybeValue as T & { id?: number };
};

const normalizeClientInfo = (client: unknown): ClientInfo => {
	const attrs = resolveEntityAttributes<Record<string, unknown>>(client) ?? {};
	return {
		id:
			typeof attrs.id === "number"
				? attrs.id
				: typeof attrs.id === "string"
				? Number(attrs.id) || undefined
				: undefined,
		name: typeof attrs.name === "string" ? attrs.name : undefined,
		nom: typeof attrs.nom === "string" ? attrs.nom : undefined,
	};
};

const normalizeClients = (value: unknown): ClientInfo[] => {
	if (!value) return [];

	if (Array.isArray(value)) {
		return value.map(normalizeClientInfo);
	}

	const unwrapped = unwrapStrapiResponse<unknown>(value);
	if (Array.isArray(unwrapped)) {
		return unwrapped.map(normalizeClientInfo);
	}

	const single = normalizeClientInfo(value);
	if (single.id === undefined && !single.name && !single.nom) {
		return [];
	}

	return [single];
};

const normalizeUserPreference = (value: unknown): UserPreference | null => {
	const attrs = resolveEntityAttributes<Record<string, unknown>>(value);
	if (!attrs) return null;

	const avatar =
		toString(attrs.avatarBackgroundColor, "") ||
		toString(attrs.avatar_background_color, "");

	if (!avatar) return null;

	return {
		avatarBackgroundColor: avatar,
	};
};

const normalizeSubscription = (
	value: unknown
): SubscriptionPayload | null => {
	const attrs = resolveEntityAttributes<SubscriptionPayload>(value);
	if (!attrs) return null;

	const autoRenewing =
		typeof attrs.autoRenewing === "boolean"
			? attrs.autoRenewing
			: typeof attrs.auto_renewing === "boolean"
			? attrs.auto_renewing
			: toBoolean(attrs.autoRenewing, false);

	return {
		id:
			typeof attrs.id === "number"
				? attrs.id
				: typeof attrs.id === "string"
				? Number(attrs.id) || undefined
				: undefined,
		productId:
			attrs.productId ??
			(attrs.product_id as string | undefined) ??
			null,
		status: (attrs.status as SubscriptionPayload["status"]) ?? null,
		expiresAt:
			(attrs.expiresAt as string | undefined) ??
			(attrs.expires_at as string | undefined) ??
			null,
		autoRenewing,
		platform: attrs.platform,
		environment: attrs.environment,
	};
};

const normalizeSessionUser = (raw: unknown): AuthUser => {
	const attributes = resolveEntityAttributes<Record<string, unknown>>(raw) ?? {};

	return {
		id:
			typeof attributes.id === "number"
				? attributes.id
				: typeof attributes.id === "string"
				? Number(attributes.id) || 0
				: 0,
		username: toString(
			attributes.username ?? attributes.email ?? attributes.name ?? "",
			""
		),
		firstName:
			typeof attributes.firstName === "string"
				? attributes.firstName
				: typeof attributes.first_name === "string"
				? attributes.first_name
				: null,
		lastName:
			typeof attributes.lastName === "string"
				? attributes.lastName
				: typeof attributes.last_name === "string"
				? attributes.last_name
				: null,
		email: toString(attributes.email ?? ""),
		confirmed: toBoolean(attributes.confirmed, false),
		blocked: toBoolean(attributes.blocked, false),
		clients: normalizeClients(attributes.clients),
		user_preference: normalizeUserPreference(attributes.user_preference),
		profile:
			typeof attributes.profile === "string"
				? attributes.profile
				: null,
		subscription: normalizeSubscription(attributes.subscription),
		manualPremium: toBoolean(attributes.manualPremium, false),
		hasPremiumAccess: toBoolean(attributes.hasPremiumAccess, false),
	};
};

export const normalizeAuthResponse = (raw: unknown): AuthResponse => {
	const payload = unwrapStrapiResponse<Record<string, unknown>>(raw) ?? {};
	const jwt = toString(payload.jwt ?? payload?.data?.jwt ?? "", "");
	return {
		jwt,
		user: normalizeSessionUser(payload.user ?? undefined),
	};
};

export const normalizeLoginUser = (raw: unknown): LoginUser => {
	const entity = unwrapStrapiResponse<Record<string, unknown>>(raw) ?? {};
	const attributes =
		resolveEntityAttributes<Record<string, unknown>>(entity) ?? entity;
	const roleAttributes = resolveEntityAttributes<Record<string, unknown>>(
		attributes.role
	);

	return {
		id:
			typeof attributes.id === "number"
				? attributes.id
				: typeof attributes.id === "string"
				? Number(attributes.id) || 0
				: 0,
		username: toString(attributes.username ?? attributes.email ?? "", ""),
		email: toString(attributes.email ?? ""),
		provider: toString(attributes.provider ?? "local"),
		confirmed: toBoolean(attributes.confirmed, false),
		blocked: toBoolean(attributes.blocked, false),
		createdAt: toString(attributes.createdAt ?? attributes.created_at ?? ""),
		updatedAt: toString(attributes.updatedAt ?? attributes.updated_at ?? ""),
		firstName:
			typeof attributes.firstName === "string"
				? attributes.firstName
				: "",
		lastName:
			typeof attributes.lastName === "string"
				? attributes.lastName
				: "",
		profile: toString(attributes.profile ?? ""),
		role: {
			id:
				typeof roleAttributes?.id === "number"
					? roleAttributes.id
					: typeof roleAttributes?.id === "string"
					? Number(roleAttributes.id) || 0
					: 0,
			name: toString(roleAttributes?.name ?? ""),
			description: toString(roleAttributes?.description ?? ""),
			type: toString(roleAttributes?.type ?? ""),
			createdAt: toString(roleAttributes?.createdAt ?? ""),
			updatedAt: toString(roleAttributes?.updatedAt ?? ""),
		},
	};
};
