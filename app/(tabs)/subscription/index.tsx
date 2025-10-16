import { UseAuth } from "@/auth/AuthContext";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import SubscriptionPlanCard from "@/components/subscription/SubscriptionPlanCard";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useSubscription } from "@/src/hooks/useSubscription";
import Constants from "expo-constants";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

export default function SubscriptionScreen() {
	const router = useRouter();
	const { from } = useLocalSearchParams<{ from?: string | string[] }>();
	const insets = useSafeAreaInsets();
	const { session } = UseAuth();
	const {
		products,
		subscription,
		loading,
		purchasing,
		error,
		purchase,
		restore,
		cancelSubscription,
		hasActiveSubscription,
	} = useSubscription();

	const { hideTabBar, showTabBar } = useTabBarVisibility();

	const returnDestination = useMemo(() => {
		if (!from) return undefined;
		return Array.isArray(from) ? from[0] : from;
	}, [from]);

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	// Get subscription type from user session
	const currentSubscriptionType =
		session?.user?.subscription?.typeKey?.toLowerCase();
	const isFreeUser =
		!currentSubscriptionType ||
		currentSubscriptionType === "free" ||
		currentSubscriptionType === "trial";

	// Map products to plan cards
	const monthlyProduct = useMemo(
		() => products.find((p) => p.productId.includes("monthly")),
		[products]
	);
	const yearlyProduct = useMemo(
		() =>
			products.find(
				(p) => p.productId.includes("yearly") || p.productId.includes("year")
			),
		[products]
	);

	const handlePurchase = async (productId: string) => {
		try {
			await purchase(productId);
			Alert.alert(
				"Succès!",
				"Votre abonnement a été activé avec succès. Profitez de tous les contenus premium!",
				[
					{
						text: "OK",
						onPress: () => router.back(),
					},
				]
			);
		} catch (err) {
			Alert.alert(
				"Erreur",
				"Une erreur est survenue lors de l'achat. Veuillez réessayer."
			);
		}
	};

	const handleRestore = async () => {
		try {
			Alert.alert("Restauration", "Recherche de vos achats précédents...", [
				{ text: "OK" },
			]);
			await restore();
			Alert.alert("Succès!", "Vos achats ont été restaurés avec succès.", [
				{ text: "OK" },
			]);
		} catch (err) {
			Alert.alert(
				"Erreur",
				"Impossible de restaurer vos achats. Assurez-vous d'être connecté avec le même compte."
			);
		}
	};

	const handlePrivacyPolicy = () => {
		// TODO: Replace with your actual privacy policy URL
		Linking.openURL("https://yourwebsite.com/privacy-policy");
	};

	const handleTermsOfService = () => {
		// TODO: Replace with your actual terms of service URL
		Linking.openURL("https://yourwebsite.com/terms-of-service");
	};

	const handleManageSubscription = () => {
		if (isExpoGo) {
			// Mock: Show cancel option for testing
			Alert.alert(
				"Gérer l'abonnement (Test)",
				"Voulez-vous annuler votre abonnement de test ?",
				[
					{
						text: "Annuler",
						style: "cancel",
					},
					{
						text: "Résilier l'abonnement",
						style: "destructive",
						onPress: async () => {
							const success = await cancelSubscription();
							if (success) {
								Alert.alert(
									"Abonnement résilié",
									"Votre abonnement de test a été annulé. Vous êtes maintenant en version gratuite.",
									[{ text: "OK" }]
								);
							}
						},
					},
				]
			);
		} else {
			// Production: Open native subscription management
			if (Platform.OS === "ios") {
				Linking.openURL("https://apps.apple.com/account/subscriptions");
			} else if (Platform.OS === "android") {
				Linking.openURL("https://play.google.com/store/account/subscriptions");
			}
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
			<View style={[styles.innerWrapper, { paddingTop: 20 }]}>
				<ReturnButton destination={returnDestination} />
				<ScreenHeaders content='Abonnement Premium' paddingTop={0} />

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}>
					{/* Header Section */}
					<View style={styles.headerSection}>
						{hasActiveSubscription ? (
							<>
								<View style={styles.activeSubscriptionBanner}>
									<Text style={styles.activeSubscriptionText}>
										✓ Vous êtes abonné Premium
									</Text>
									<Text style={styles.activeSubscriptionSubtext}>
										Profitez de tous les contenus sans limite
									</Text>
								</View>
								<TouchableOpacity
									style={styles.manageButton}
									onPress={handleManageSubscription}>
									<Text style={styles.manageButtonText}>
										Gérer mon abonnement
									</Text>
								</TouchableOpacity>
								{isExpoGo && (
									<View style={styles.mockWarning}>
										<Text style={styles.mockWarningText}>
											⚠️ Mode Test: Le bouton ci-dessus permet de tester
											l'annulation
										</Text>
									</View>
								)}
							</>
						) : (
							<>
								<Text style={styles.headerTitle}>
									Passez à Premium et déverrouillez tout le contenu
								</Text>
								<Text style={styles.headerSubtitle}>
									Accédez à l'intégralité de Com'Academy sans restrictions
								</Text>
							</>
						)}
					</View>

					{/* Benefits Section */}
					<View style={styles.benefitsSection}>
						<Text style={styles.benefitsTitle}>Ce que vous obtenez:</Text>
						<View style={styles.benefitsList}>
							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>🔓</Text>
								<Text style={styles.benefitText}>
									Accès illimité à tous les dicos
								</Text>
							</View>
							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>📚</Text>
								<Text style={styles.benefitText}>
									Tous les métiers et professions
								</Text>
							</View>
							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>💡</Text>
								<Text style={styles.benefitText}>
									Citations et secrets en illimité
								</Text>
							</View>
							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>⚡</Text>
								<Text style={styles.benefitText}>
									Nouveau contenu ajouté régulièrement
								</Text>
							</View>
							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>🎯</Text>
								<Text style={styles.benefitText}>
									Tous les commandements débloqués
								</Text>
							</View>
						</View>
					</View>

					{/* Subscription Plans */}
					<View style={styles.plansSection}>
						{/* Monthly Plan */}
						{monthlyProduct && (
							<SubscriptionPlanCard
								title='Abonnement Mensuel'
								price={monthlyProduct.localizedPrice || "4,99 €"}
								duration='/ mois'
								features={[
									"Accès illimité à tout le contenu",
									"Annulation à tout moment",
									"Facturation mensuelle",
								]}
								isCurrentPlan={
									hasActiveSubscription &&
									monthlyProduct.productId === subscription?.productId
								}
								onPress={() => handlePurchase(monthlyProduct.productId)}
								disabled={purchasing}
							/>
						)}

						{!yearlyProduct && !monthlyProduct && (
							<View style={styles.noProductsContainer}>
								<Text style={styles.noProductsText}>
									Les abonnements ne sont pas disponibles pour le moment.
								</Text>
								<Text style={styles.noProductsSubtext}>
									Veuillez réessayer plus tard.
								</Text>
							</View>
						)}
					</View>

					{/* Error Display */}
					{error && (
						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>⚠️ {error}</Text>
						</View>
					)}

					{/* Restore Purchases Button */}
					{Platform.OS === "ios" && (
						<TouchableOpacity
							style={styles.restoreButton}
							onPress={handleRestore}
							disabled={purchasing}>
							<Text style={styles.restoreButtonText}>Restaurer mes achats</Text>
						</TouchableOpacity>
					)}

					{/* Free Plan Info */}
					{isFreeUser && (
						<View style={styles.freePlanInfo}>
							<Text style={styles.freePlanTitle}>Version gratuite</Text>
							<Text style={styles.freePlanText}>
								Vous utilisez actuellement la version gratuite avec un accès
								limité au contenu.
							</Text>
						</View>
					)}

					{/* Legal Links */}
					<View style={styles.legalSection}>
						<Text style={styles.legalText}>
							En vous abonnant, vous acceptez nos
						</Text>
						<View style={styles.legalLinks}>
							<TouchableOpacity onPress={handleTermsOfService}>
								<Text style={styles.legalLink}>Conditions d'utilisation</Text>
							</TouchableOpacity>
							<Text style={styles.legalSeparator}> et notre </Text>
							<TouchableOpacity onPress={handlePrivacyPolicy}>
								<Text style={styles.legalLink}>
									Politique de confidentialité
								</Text>
							</TouchableOpacity>
						</View>
						<Text style={styles.legalNote}>
							L'abonnement se renouvelle automatiquement. Vous pouvez annuler à
							tout moment depuis les paramètres de votre compte App Store ou
							Google Play.
						</Text>
					</View>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	innerWrapper: {
		flex: 1,
		paddingHorizontal: 20,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	headerSection: {
		marginBottom: 30,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 10,
		lineHeight: 32,
	},
	headerSubtitle: {
		fontSize: FontSize16,
		color: "#666666",
		lineHeight: 24,
	},
	activeSubscriptionBanner: {
		backgroundColor: "#E8F5E9",
		padding: 20,
		borderRadius: 15,
		borderWidth: 2,
		borderColor: "#4CAF50",
	},
	activeSubscriptionText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#2E7D32",
		marginBottom: 4,
	},
	activeSubscriptionSubtext: {
		fontSize: FontSize14,
		color: "#2E7D32",
	},
	manageButton: {
		backgroundColor: colorWhite,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 12,
		marginTop: 16,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	manageButtonText: {
		fontSize: FontSize16,
		fontWeight: "600",
		color: colorBlack,
	},
	mockWarning: {
		backgroundColor: "#FFF3E0",
		padding: 12,
		borderRadius: 8,
		marginTop: 12,
		borderWidth: 1,
		borderColor: "#FFB74D",
	},
	mockWarningText: {
		fontSize: 12,
		color: "#E65100",
		textAlign: "center",
		lineHeight: 16,
	},
	benefitsSection: {
		marginBottom: 30,
		backgroundColor: colorWhite,
		padding: 20,
		borderRadius: 15,
	},
	benefitsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 16,
	},
	benefitsList: {
		gap: 14,
	},
	benefitItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	benefitIcon: {
		fontSize: 24,
		marginRight: 12,
	},
	benefitText: {
		fontSize: FontSize16,
		color: colorBlack,
		flex: 1,
	},
	plansSection: {
		marginBottom: 20,
	},
	plansTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 20,
	},
	noProductsContainer: {
		backgroundColor: colorWhite,
		padding: 30,
		borderRadius: 15,
		alignItems: "center",
	},
	noProductsText: {
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 8,
		textAlign: "center",
	},
	noProductsSubtext: {
		fontSize: FontSize14,
		color: "#666666",
		textAlign: "center",
	},
	errorContainer: {
		backgroundColor: "#FFEBEE",
		padding: 15,
		borderRadius: 10,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#EF5350",
	},
	errorText: {
		fontSize: FontSize14,
		color: "#C62828",
		textAlign: "center",
	},
	restoreButton: {
		paddingVertical: 14,
		paddingHorizontal: 20,
		marginBottom: 20,
		alignItems: "center",
	},
	restoreButtonText: {
		fontSize: FontSize16,
		color: colorBlack,
		fontWeight: "600",
		textDecorationLine: "underline",
	},
	freePlanInfo: {
		backgroundColor: "#FFF3E0",
		padding: 16,
		borderRadius: 10,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#FFB74D",
	},
	freePlanTitle: {
		fontSize: FontSize16,
		fontWeight: "bold",
		color: "#E65100",
		marginBottom: 6,
	},
	freePlanText: {
		fontSize: FontSize14,
		color: "#E65100",
		lineHeight: 20,
	},
	legalSection: {
		marginTop: 20,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: "#E0E0E0",
	},
	legalText: {
		fontSize: 12,
		color: "#999999",
		textAlign: "center",
		marginBottom: 6,
	},
	legalLinks: {
		flexDirection: "row",
		justifyContent: "center",
		flexWrap: "wrap",
		marginBottom: 10,
	},
	legalLink: {
		fontSize: 12,
		color: colorBlack,
		textDecorationLine: "underline",
		fontWeight: "600",
	},
	legalSeparator: {
		fontSize: 12,
		color: "#999999",
	},
	legalNote: {
		fontSize: 11,
		color: "#999999",
		textAlign: "center",
		lineHeight: 16,
		marginTop: 10,
	},
});
