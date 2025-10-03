import { UseAuth } from "@/auth/AuthContext";
import { useCallback, useState } from "react";

type SubscriptionLimitConfig = {
	freeLimit: number;
};

type SubscriptionLimitReturn = {
	isItemLocked: (index: number) => boolean;
	showUpgradeModal: boolean;
	handleLockedItemPress: () => void;
	closeUpgradeModal: () => void;
	isFreeUser: boolean;
};

/**
 * Hook to manage subscription-based content limits
 * @param config - Configuration object with freeLimit (number of items available to free users)
 * @returns Object with lock checking functions and modal state
 */
export const useSubscriptionLimit = (
	config: SubscriptionLimitConfig
): SubscriptionLimitReturn => {
	const { session } = UseAuth();
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);

	const isFreeUser =
		session?.user?.subscription?.typeKey === "free" ||
		!session?.user?.subscription?.typeKey;

	const isItemLocked = useCallback(
		(index: number): boolean => {
			if (!isFreeUser) return false;
			return index >= config.freeLimit;
		},
		[isFreeUser, config.freeLimit]
	);

	const handleLockedItemPress = useCallback(() => {
		setShowUpgradeModal(true);
	}, []);

	const closeUpgradeModal = useCallback(() => {
		setShowUpgradeModal(false);
	}, []);

	return {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	};
};
