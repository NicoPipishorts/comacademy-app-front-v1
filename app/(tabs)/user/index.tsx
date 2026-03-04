import { UseAuth } from "@/auth/AuthContext";
import Loader from "@/components/experience/loader";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import OnboardingV1 from "@/components/onboarding/OnboardingV1";
import ScreenHeaders from "@/components/ScreenHeaders";
import ChangeAvatar from "@/components/user/changeAvatar";
import ShowNiveaux from "@/components/user/niveaux";
import SubscriptionStatusCard from "@/components/user/SubscriptionStatusCard";
import UserAccount from "@/components/user/userAccount";
import UserStats from "@/components/user/userStats";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize16 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import { useGetUserScore } from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import { useSubscriptionPrompt } from "@/hooks/useSubscriptionPrompt";
import { useSubscription } from "@/src/hooks/useSubscription";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CategoryResult {
	total: number;
	trueCount: number;
}

export type ResultAccumulator = Record<number, CategoryResult>;

const PROFILE_PLAN_PRICE_LABELS: Record<string, string> = {
	fullAccess100: "5,99 € par mois",
	fullAccess1200: "49,99 € par an",
};

export default function User() {
	const router = useRouter();
	const { openModal, timestamp } = useLocalSearchParams();
	const { logout } = UseAuth();
	const { auth } = useAuthSession();
	const insets = useSafeAreaInsets();
	const [refreshing, setRefreshing] = useState(false);
	const { token, loading: tokenLoading } = useJwtToken();
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const {
		subscription: entitlementSubscription,
		hasPremiumAccess: backendHasPremiumAccess,
		hasActiveSubscription,
		refresh: refreshSubscription,
		error: subscriptionError,
	} = useSubscription();

	useTrackPageMetrics({ page: "User" });

	useEffect(() => {
		if (openModal === "leaderBoard" && timestamp) {
			setTimeout(() => {
				router.push("/user/leaderBoard");
			}, 100);
		}
	}, [openModal, timestamp, router]); // timestamp will always be different

	const {
		data: scores,
		refetch,
		status: scoreStatus,
		fetchStatus: scoreFetchStatus,
		isLoading: scoreIsLoading,
		isFetching: scoreIsFetching,
		isError: scoreIsError,
		error: scoreError,
	} = useGetUserScore(token, auth?.user.id);

	// Subscription prompt hook
	const totalAnsweredQuestions =
		scores?.data?.[0]?.attributes?.totalAnsweredQuestions ?? 0;
	const totalScore = scores?.data?.[0]?.attributes?.totalScore ?? 0;
	const totalPercentageCorrect =
		scores?.data?.[0]?.attributes?.totalPercentageCorrect ?? 0;
	const computedLevel = Math.floor(totalAnsweredQuestions / 150);
	const { shouldShowModal, dismissModal } = useSubscriptionPrompt(
		totalAnsweredQuestions
	);

	const lastFetchTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				setKeyboardVisible(true);
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardVisible(false);
			}
		);

		return () => {
			keyboardDidHideListener.remove();
			keyboardDidShowListener.remove();
		};
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		Promise.allSettled([refetch(), refreshSubscription()]).finally(() => {
			lastFetchTimeRef.current = Date.now();
			setTimeout(() => {
				setRefreshing(false);
			}, 2000);
		});
	};

	useEffect(() => {
		if (token && !tokenLoading) {
			refetch();
			lastFetchTimeRef.current = Date.now();
		}
	}, [refetch, token, tokenLoading]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			const currentTime = Date.now();
			if (currentTime - lastFetchTimeRef.current > 30000) {
				refetch();
				lastFetchTimeRef.current = currentTime;
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [refetch]);

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

	const resolvedProductId =
		auth?.user?.subscription?.productId ??
		entitlementSubscription?.productId ??
		null;
	const resolvedExpirationDateRaw =
		auth?.user?.subscription?.expiresAt ?? entitlementSubscription?.expiresAt ?? null;
	const expirationDate = useMemo(() => {
		if (resolvedExpirationDateRaw) {
			return formatDate(resolvedExpirationDateRaw);
		}
		if (!hasPremiumAccess) {
			return "—";
		}
		if (auth?.user?.manualPremium) {
			return "Accès manuel";
		}
		return "Non communiquée";
	}, [
		auth?.user?.manualPremium,
		hasPremiumAccess,
		resolvedExpirationDateRaw,
	]);
	const profilePriceLine = useMemo(() => {
		if (!hasPremiumAccess) return null;
		if (!resolvedProductId) return "Premium individuel";

		const normalized = String(resolvedProductId).trim();
		if (PROFILE_PLAN_PRICE_LABELS[normalized]) {
			return PROFILE_PLAN_PRICE_LABELS[normalized];
		}

		if (normalized === "full.access") {
			return "Premium individuel";
		}

		return "Premium individuel";
	}, [hasPremiumAccess, resolvedProductId]);
	const profileRenewalLine = useMemo(() => {
		if (!hasPremiumAccess) return null;
		if (auth?.user?.manualPremium) return "Accès manuel";
		if (resolvedExpirationDateRaw) {
			return `Renouvellement le ${expirationDate}`;
		}
		return "Renouvellement actif";
	}, [
		auth?.user?.manualPremium,
		expirationDate,
		hasPremiumAccess,
		resolvedExpirationDateRaw,
	]);
	const shouldShowUpgradeModal = shouldShowModal && !hasPremiumAccess;

	useEffect(() => {
		if (!__DEV__) return;

		console.log("[UserProfile] auth user id:", auth?.user?.id ?? null);
		console.log("[UserProfile] token present:", Boolean(token), {
			tokenLoading,
		});
		console.log("[UserProfile] score query:", {
			status: scoreStatus,
			fetchStatus: scoreFetchStatus,
			isLoading: scoreIsLoading,
			isFetching: scoreIsFetching,
			isError: scoreIsError,
		});
		if (scoreError) {
			console.log("[UserProfile] score query error:", scoreError);
		}
		console.log("[UserProfile] score payload present:", Boolean(scores?.data?.[0]));
		console.log("[UserProfile] score values:", {
			totalScore,
			totalAnsweredQuestions,
			totalPercentageCorrect,
			computedLevel,
		});
		console.log("[UserProfile] subscription status:", {
			authSubscriptionStatus: auth?.user?.subscription?.status ?? null,
			backendHasPremiumAccess,
			hasActiveSubscription,
			hasPremiumAccess,
			resolvedProductId,
			resolvedExpirationDateRaw,
		});
	}, [
		auth?.user?.id,
		auth?.user?.subscription?.status,
		backendHasPremiumAccess,
		computedLevel,
		hasActiveSubscription,
		hasPremiumAccess,
		resolvedExpirationDateRaw,
		resolvedProductId,
		scoreError,
		scoreFetchStatus,
		scoreIsError,
		scoreIsFetching,
		scoreIsLoading,
		scoreStatus,
		scores?.data,
		token,
		tokenLoading,
		totalAnsweredQuestions,
		totalPercentageCorrect,
		totalScore,
	]);

	if (!scores) {
		return <Loader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
			<View
				style={[
					styles.innerWrapper,
					{ paddingTop: insets.top, paddingBottom: dynamicPadding },
				]}>
				<ScreenHeaders content='Mon profil' />
				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}>
					<ShowNiveaux totalPoints={totalAnsweredQuestions} />

					{scores?.data?.length ? <UserStats categoriesScore={scores} /> : null}

					<SubscriptionStatusCard
						hasPremiumAccess={hasPremiumAccess}
						priceLine={profilePriceLine}
						renewalLine={profileRenewalLine}
						subscriptionError={subscriptionError}
						onPressSubscribe={() => router.push("/subscription")}
					/>

					<View style={styles.cardWrapper}>
						<View style={styles.cardTextContainer}>
							<Text style={styles.cardText}>
								Revoir la visite guidée de l’appli
							</Text>
							<TouchableOpacity
								style={buttonBlack}
								onPress={() => {
									setShowOnboarding(true);
									hideTabBar();
								}}>
								<Text style={styles.buttonText}>Voir</Text>
							</TouchableOpacity>
						</View>
					</View>

					<ChangeAvatar />

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

			{showOnboarding && (
				<View style={{ flex: 1, position: "absolute", top: 0, left: 0 }}>
					{/* Conditionally render onboarding or your main content */}
					<OnboardingV1
						onComplete={() => {
							setShowOnboarding(false);
							showTabBar();
						}}
					/>
				</View>
			)}

			<UpgradeSubscriptionModal
				visible={shouldShowUpgradeModal}
				onClose={dismissModal}
				message='Tu peux aller encore plus loin avec l’abonnement Premium pour débloquer tout le contenu.'
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	filterWrapper: {
		width: "100%",
		borderRadius: 20,
		backgroundColor: colorWhite,
		paddingBottom: 20,
		marginBottom: 30,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 20,
		minHeight: "60%",
	},
	innerWrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
	},
	logoutContainer: {
		display: "flex",
		marginTop: 100,
		marginBottom: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	logoutButton: {
		backgroundColor: colorBlack,
		marginBottom: 20,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
	cardWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: 40,
		width: "100%",
		borderRadius: 25,
		paddingHorizontal: 20,
		paddingVertical: 30,
		backgroundColor: colorWhite,
	},
	cardTextContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
	},
	cardText: {
		flexShrink: 1,
		marginRight: 20,
		fontSize: FontSize16,
		fontWeight: "bold",
		flexGrow: 1,
		maxWidth: "50%",
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
