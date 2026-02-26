import { UseAuth } from "@/auth/AuthContext";
import Loader from "@/components/experience/loader";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import OnboardingV1 from "@/components/onboarding/OnboardingV1";
import ScreenHeaders from "@/components/ScreenHeaders";
import ChangeAvatar from "@/components/user/changeAvatar";
import ShowNiveaux from "@/components/user/niveaux";
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

	const { data: scores, refetch } = useGetUserScore(token, auth?.user.id);

	// Subscription prompt hook
	const totalAnsweredQuestions =
		scores?.data?.[0]?.attributes?.totalAnsweredQuestions ?? 0;
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

	const subscriptionStateLabel =
		subscriptionStatus ??
		entitlementSubscription?.status ??
		(hasPremiumAccess ? "active" : "none");
	const currentProductId =
		auth?.user?.subscription?.productId ??
		entitlementSubscription?.productId ??
		"—";
	const expirationDate = formatDate(auth?.user?.subscription?.expiresAt);

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

					<View style={styles.subscriptionCard}>
						<Text style={styles.subscriptionTitle}>Mon abonnement</Text>
						<Text
							style={[
								styles.subscriptionState,
								{
									color: hasPremiumAccess ? "#2E7D32" : colorBlack,
								},
							]}>
							{hasPremiumAccess
								? "Premium actif"
								: "Vous êtes en version gratuite"}
						</Text>
						<Text style={styles.subscriptionMeta}>
							État: {subscriptionStateLabel}
						</Text>
						<Text style={styles.subscriptionMeta}>
							Produit: {currentProductId || "—"}
						</Text>
						<Text style={styles.subscriptionMeta}>
							Expiration: {expirationDate}
						</Text>
						{subscriptionError ? (
							<Text style={styles.subscriptionWarning}>
								Échec de la récupération des infos abonnement.
							</Text>
						) : null}
						<TouchableOpacity
							style={buttonBlack}
							onPress={() => router.push("/subscription")}>
							<Text style={styles.buttonText}>
								{hasPremiumAccess
									? "Gérer mon abonnement"
									: "Voir les offres Premium"}
							</Text>
						</TouchableOpacity>
					</View>

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
				visible={shouldShowModal}
				onClose={dismissModal}
				message='Félicitations ! Tu as atteint le niveau 1 ! Continue ton aventure avec un abonnement Premium pour débloquer tout le contenu.'
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
	subscriptionCard: {
		display: "flex",
		flexDirection: "column",
		gap: 8,
		marginBottom: 30,
		width: "100%",
		borderRadius: 25,
		paddingHorizontal: 20,
		paddingVertical: 24,
		backgroundColor: colorWhite,
	},
	subscriptionTitle: {
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
	},
	subscriptionState: {
		fontSize: FontSize16,
		fontWeight: "700",
		marginBottom: 2,
	},
	subscriptionMeta: {
		fontSize: 13,
		color: colorBlack,
	},
	subscriptionWarning: {
		fontSize: 12,
		color: "#b45309",
		marginVertical: 4,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
