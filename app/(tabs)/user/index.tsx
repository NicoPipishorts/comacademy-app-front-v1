import { UseAuth } from "@/auth/AuthContext";
import AvatarInitials from "@/components/avatars/initials";
import ProfileAvatarSheet from "@/components/user/ProfileAvatarSheet";
import ResetPasswordCard from "@/components/user/ResetPasswordCard";
import SubscriptionStatusCard from "@/components/user/SubscriptionStatusCard";
import UserAccount from "@/components/user/userAccount";
import { colorRed, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import { useSubscription } from "@/src/hooks/useSubscription";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function User() {
	const router = useRouter();
	const { logout } = UseAuth();
	const { auth } = useAuthSession();
	const insets = useSafeAreaInsets();
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const [showAvatarSheet, setShowAvatarSheet] = useState(false);
	const {
		subscription: entitlementSubscription,
		hasPremiumAccess: backendHasPremiumAccess,
		hasActiveSubscription,
		error: subscriptionError,
	} = useSubscription();

	useTrackPageMetrics({ page: "User" });

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				setKeyboardVisible(true);
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardVisible(false);
			},
		);

		return () => {
			keyboardDidHideListener.remove();
			keyboardDidShowListener.remove();
		};
	}, []);

	const dynamicPadding = keyboardVisible ? 30 : 100;
	const subscriptionStatus = auth?.user?.subscription?.status;
	const hasPremiumAccess = useMemo(() => {
		if (backendHasPremiumAccess) return true;
		if (hasActiveSubscription) return true;
		if (auth?.user?.manualPremium) return true;
		if (auth?.user?.hasPremiumAccess) return true;
		return (
			subscriptionStatus === "active" ||
			subscriptionStatus === "grace_period" ||
			subscriptionStatus === "billing_retry"
		);
	}, [
		auth?.user?.hasPremiumAccess,
		auth?.user?.manualPremium,
		backendHasPremiumAccess,
		hasActiveSubscription,
		subscriptionStatus,
	]);

	const formatDate = (value?: string | null) => {
		if (!value) return "—";
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) return value;
		return parsed.toLocaleDateString("fr-FR");
	};

	const resolvedExpirationDateRaw =
		auth?.user?.subscription?.expiresAt ??
		entitlementSubscription?.expiresAt ??
		null;
	const renewalLine = useMemo(() => {
		if (!hasPremiumAccess) return null;
		if (resolvedExpirationDateRaw) {
			return `Renouvellement le ${formatDate(resolvedExpirationDateRaw)}`;
		}
		return "Renouvellement actif";
	}, [hasPremiumAccess, resolvedExpirationDateRaw]);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
			<View
				style={[
					styles.innerWrapper,
					{ paddingTop: insets.top, paddingBottom: dynamicPadding },
				]}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.headerRow}>
						<Text style={styles.headerTitle}>Compte</Text>
						<AvatarInitials
							size={86}
							showBorder
							showEditBadge
							onPress={() => setShowAvatarSheet(true)}
						/>
					</View>
					<UserAccount />

					{/* <View style={styles.logoutContainer}>
						<TouchableOpacity
							onPress={() => navigation.navigate("iapBarebone")}
							style={styles.logoutButton}>
							<Text
								style={{
									color: "#F0F",
									fontSize: FontSize16,
									fontWeight: "bold",
								}}>
								IAP Barebones
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.logoutContainer}>
						<TouchableOpacity
							onPress={() => navigation.navigate("iapRawDebug")}
							style={styles.logoutButton}>
							<Text
								style={{
									color: "#F0F",
									fontSize: FontSize16,
									fontWeight: "bold",
								}}>
								IAP Barebones
							</Text>
						</TouchableOpacity>
					</View> */}

					<SubscriptionStatusCard
						hasPremiumAccess={hasPremiumAccess}
						priceLine={hasPremiumAccess ? "Premium individuel" : null}
						renewalLine={renewalLine}
						subscriptionError={subscriptionError}
						onPressSubscribe={() => router.push("/subscription")}
					/>
					<ResetPasswordCard />

					<View style={styles.logoutContainer}>
						<TouchableOpacity
							onPress={() => logout()}
							style={styles.logoutButton}>
							<Text
								style={{
									color: colorWhite,
									fontSize: FontSize16,
									fontWeight: "bold",
								}}>
								Déconnexion
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>
			<ProfileAvatarSheet
				visible={showAvatarSheet}
				onClose={() => setShowAvatarSheet(false)}
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	innerWrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
	},
	headerRow: {
		paddingTop: 12,
		paddingBottom: 28,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerTitle: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	logoutContainer: {
		display: "flex",
		marginBottom: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	logoutButton: {
		backgroundColor: colorRed,
		marginBottom: 20,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
});
