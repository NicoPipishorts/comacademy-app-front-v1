import Constants from "expo-constants";

type MaybePurchaseError = {
	code?: string | number | null;
};

const FALLBACK_USER_CANCELLED_CODES = ["E_USER_CANCELLED", "USER_CANCELLED"];

let cachedUserCancelledCodes: string[] | null = null;

const resolveUserCancelledCodes = (): string[] => {
	if (cachedUserCancelledCodes) {
		return cachedUserCancelledCodes;
	}

	const codes = new Set<string>(FALLBACK_USER_CANCELLED_CODES);

	if (Constants.appOwnership !== "expo") {
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { ErrorCode } = require("react-native-iap");

			if (ErrorCode) {
				["E_USER_CANCELLED", "UserCancelled", "USER_CANCELLED"].forEach(
					(key) => {
						const value = ErrorCode[key];
						if (value != null) {
							codes.add(String(value));
						}
					}
				);
			}
		} catch (error) {
			if (__DEV__) {
				console.warn(
					"[iapErrors] Unable to load react-native-iap ErrorCode, using fallbacks",
					error
				);
			}
		}
	}

	cachedUserCancelledCodes = Array.from(codes);
	return cachedUserCancelledCodes;
};

export const isUserCancelledError = (
	error?: MaybePurchaseError | null
): boolean => {
	if (!error?.code && error?.code !== 0) {
		return false;
	}

	return resolveUserCancelledCodes().includes(String(error.code));
};

export const getUserCancelledCodes = (): string[] => resolveUserCancelledCodes();
