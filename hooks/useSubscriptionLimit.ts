import { UseAuth } from "@/auth/AuthContext";
import { useSubscription } from "@/src/hooks/useSubscription";
import { useCallback, useMemo, useState } from "react";

type SubscriptionLimitConfig = { freeLimit: number };

type SubscriptionLimitReturn = {
	isItemLocked: (index: number) => boolean;
	showUpgradeModal: boolean;
	handleLockedItemPress: () => void;
	closeUpgradeModal: () => void;
	isFreeUser: boolean;
};

export const useSubscriptionLimit = (
	config: SubscriptionLimitConfig
): SubscriptionLimitReturn => {
	const { session } = UseAuth();
	const { hasPremiumAccess: backendHasPremiumAccess } = useSubscription();
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);

	const hasPremiumAccess = useMemo(() => {
		if (backendHasPremiumAccess) return true;
		if (session?.user?.manualPremium) return true;
		if (session?.user?.hasPremiumAccess) return true;

		const status = session?.user?.subscription?.status;
		return (
			status === "active" ||
			status === "grace_period" ||
			status === "billing_retry"
		);
	}, [
		backendHasPremiumAccess,
		session?.user?.manualPremium,
		session?.user?.hasPremiumAccess,
		session?.user?.subscription?.status,
	]);

	const isFreeUser = !hasPremiumAccess;

	const isItemLocked = useCallback(
		(index: number) => isFreeUser && index >= config.freeLimit, // 0-based
		[isFreeUser, config.freeLimit]
	);

	const handleLockedItemPress = useCallback(
		() => setShowUpgradeModal(true),
		[]
	);
	const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

	return {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	};
};
