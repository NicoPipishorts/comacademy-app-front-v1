import { UseAuth } from "@/auth/AuthContext";
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
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);

	const subscriptionType = useMemo(() => {
		const raw = session?.user?.subscription?.typeKey;
		if (typeof raw !== "string" || raw.trim() === "") return "free"; // fallback
		return raw.toLowerCase();
	}, [session?.user?.subscription?.typeKey]);

	const isFreeUser =
		subscriptionType === "free" || subscriptionType === "trial"; // include trial if you want

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
