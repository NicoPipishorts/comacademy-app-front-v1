// app/(whatever)/subscription/index.tsx
import { UseAuth } from "@/auth/AuthContext";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import SubscriptionPlanCard from "@/components/subscription/SubscriptionPlanCard";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useSubscription } from "@/src/hooks/useSubscription";
import {
	formatSubscriptionPrice,
	getSubscriptionProductId,
	type SubscriptionProduct,
} from "@/src/utils/iap";
import { isUserCancelledError } from "@/src/utils/iapErrors";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Linking,
	Platform,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import type { PurchaseError } from "react-native-iap";

// ===== Helpers =====
const isExpoGo = Constants.appOwnership === "expo";
const PRIVACY_POLICY_URL =
	process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
	"https://comacademy.fr/politique-de-confidentialite";
const TERMS_OF_SERVICE_URL =
	process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL ??
	"https://comacademy.fr/conditions-generales-d-utilisation";

const FORCED_EURO_PLAN_DISPLAY: Record<
	string,
	{ price: string; duration: string; durationDays: number }
> = {
	fullAccess100: { price: "5,99 €", duration: "/ mois", durationDays: 30 },
	fullAccess1200: { price: "49,99 €", duration: "/ an", durationDays: 365 },
};

type PurchaseFeedbackState = {
	title: string;
	message: string;
	action: "close" | "navigate";
};

// Safe wrapper so a weird product shape can’t blow up formatting
const safeFormatPrice = (p: any, fallback = "") => {
	try {
		return (
			formatSubscriptionPrice?.(p, fallback) ??
			p?.priceString ??
			p?.localizedPrice ??
			p?.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]
				?.formattedPrice ??
			fallback
		);
	} catch {
		return fallback;
	}
};

type DurationInfo = {
	label: string;
	days: number;
};

const isoPeriodPattern = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/i;

const isoPeriodToDurationInfo = (
	period?: string | null
): DurationInfo | null => {
	if (!period) return null;

	const matches = isoPeriodPattern.exec(period);
	if (!matches) return null;

	const parse = (value?: string) =>
		value ? Math.max(parseInt(value, 10), 0) : 0;

	const years = parse(matches[1]);
	if (years > 0) {
		return {
			label: years > 1 ? `/ ${years} ans` : "/ an",
			days: years * 365,
		};
	}

	const months = parse(matches[2]);
	if (months > 0) {
		return {
			label: months > 1 ? `/ ${months} mois` : "/ mois",
			days: months * 30,
		};
	}

	const weeks = parse(matches[3]);
	if (weeks > 0) {
		return {
			label: weeks > 1 ? `/ ${weeks} semaines` : "/ semaine",
			days: weeks * 7,
		};
	}

	const days = parse(matches[4]);
	if (days > 0) {
		return {
			label: days > 1 ? `/ ${days} jours` : "/ jour",
			days,
		};
	}

	return null;
};

const iosDurationInfo = (product: SubscriptionProduct): DurationInfo | null => {
	const anyProduct = product as unknown as {
		subscriptionPeriodNumberIOS?: string | number;
		subscriptionPeriodUnitIOS?: string;
	};

	const unit = anyProduct.subscriptionPeriodUnitIOS;

	if (!unit) return null;

	const countRaw = anyProduct.subscriptionPeriodNumberIOS;
	const count =
		typeof countRaw === "string" ? parseInt(countRaw, 10) : countRaw;

	if (!count || Number.isNaN(count)) {
		return null;
	}

	const normalizedUnit = unit.toUpperCase();

	switch (normalizedUnit) {
		case "DAY":
		case "DAYS":
			return {
				label: count > 1 ? `/ ${count} jours` : "/ jour",
				days: count,
			};
		case "WEEK":
		case "WEEKS":
			return {
				label: count > 1 ? `/ ${count} semaines` : "/ semaine",
				days: count * 7,
			};
		case "MONTH":
		case "MONTHS":
			return {
				label: count > 1 ? `/ ${count} mois` : "/ mois",
				days: count * 30,
			};
		case "YEAR":
		case "YEARS":
			return {
				label: count > 1 ? `/ ${count} ans` : "/ an",
				days: count * 365,
			};
		default:
			return null;
	}
};

const androidDurationInfo = (
	product: SubscriptionProduct
): DurationInfo | null => {
	const androidProduct = product as unknown as {
		subscriptionOfferDetailsAndroid?: {
			pricingPhases?: {
				pricingPhaseList?: { billingPeriod?: string | null }[];
			};
		}[];
		subscriptionPeriodAndroid?: string | null;
	};

	if (Array.isArray(androidProduct.subscriptionOfferDetailsAndroid)) {
		for (const offer of androidProduct.subscriptionOfferDetailsAndroid) {
			const phases = offer?.pricingPhases?.pricingPhaseList;
			if (!Array.isArray(phases)) continue;

			const phaseWithPeriod = phases.find((phase) => !!phase?.billingPeriod);
			const info = isoPeriodToDurationInfo(
				phaseWithPeriod?.billingPeriod ?? undefined
			);
			if (info) return info;
		}
	}

	if (androidProduct.subscriptionPeriodAndroid) {
		return isoPeriodToDurationInfo(androidProduct.subscriptionPeriodAndroid);
	}

	return null;
};

const getDurationInfoForProduct = (
	product: SubscriptionProduct
): DurationInfo | null =>
	iosDurationInfo(product) ?? androidDurationInfo(product);

const matchesActivePlan = (
	planId: string,
	activeProductId: string | undefined
): boolean => {
	if (!activeProductId) return false;
	if (planId === activeProductId) return true;

	// Android plan cards may be expanded as "productId_basePlanId" while backend
	// entitlements can store only the base productId.
	if (planId.startsWith(`${activeProductId}_`)) return true;
	if (activeProductId.startsWith(`${planId}_`)) return true;

	return false;
};

const PLAN_FEATURES = [
	"Accès illimité à tout le contenu",
	"Annulation à tout moment",
	"Mises à jour régulières de la bibliothèque",
];

export default function SubscriptionScreen() {
	const router = useRouter();
	const { from } = useLocalSearchParams<{ from?: string | string[] }>();
	const { session } = UseAuth();
	const purchaseFeedbackSheetRef = useRef<BottomSheetModal>(null);
	const purchaseFeedbackSnapPoints = useMemo(() => ["36%"], []);
	const [purchaseFeedback, setPurchaseFeedback] =
		useState<PurchaseFeedbackState | null>(null);

	const {
		products,
		subscription,
		loading,
		purchasing,
		error,
		purchase,
		checkSubscription,
		restore,
		cancelSubscription,
		refresh,
		refreshing,
		hasPremiumAccess: backendHasPremiumAccess,
		hasActiveSubscription,
	} = useSubscription();

	const { hideTabBar, showTabBar } = useTabBarVisibility();

	// Debug: quick sanity logs to catch missing IAP methods in dev
	useFocusEffect(
		useCallback(() => {
			console.log("[SubscriptionScreen] appOwnership:", Constants.appOwnership);
			if (__DEV__ && Platform.OS === "android") {
				console.log(
					"[SubscriptionScreen] ⚠️ Installez la build via la piste interne Play pour tester les achats réels."
				);
			}
			console.log(
				"[SubscriptionScreen] products length:",
				Array.isArray(products) ? products.length : "n/a"
			);

			const maybeIap = (() => {
				if (isExpoGo) return null;
				try {
					return require("react-native-iap");
				} catch {
					return null;
				}
			})();

			if (maybeIap) {
				console.log(
					"[SubscriptionScreen] IAP methods:",
					"fetchProducts:",
					typeof maybeIap.fetchProducts,
					"requestPurchase:",
					typeof maybeIap.requestPurchase,
					"initConnection:",
					typeof maybeIap.initConnection
				);
			} else {
				console.log(
					"[SubscriptionScreen] react-native-iap not available (mock/Expo Go?)"
				);
			}

			hideTabBar();
			return () => showTabBar();
			// we only want this on screen focus
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [hideTabBar, showTabBar])
	);

	const returnDestination = useMemo(() => {
		if (!from) return undefined;
		return Array.isArray(from) ? from[0] : from;
	}, [from]);

	const hasManualPremium = session?.user?.manualPremium ?? false;
	const hasPremiumAccess = useMemo(() => {
		if (backendHasPremiumAccess) return true;
		if (hasManualPremium) return true;
		if (session?.user?.hasPremiumAccess) return true;
		const status = session?.user?.subscription?.status;
		return (
			status === "active" ||
			status === "grace_period" ||
			status === "billing_retry"
		);
	}, [
		backendHasPremiumAccess,
		hasManualPremium,
		session?.user?.hasPremiumAccess,
		session?.user?.subscription?.status,
	]);
	const isFreeUser = !hasPremiumAccess;

	const plans = useMemo(() => {
		const seen = new Set<string>();

		const mapped = products
			.map((product) => {
				const rawId =
					getSubscriptionProductId(product) ||
					(product as unknown as { productId?: string }).productId ||
					(product as unknown as { id?: string }).id;

				if (!rawId) {
					return null;
				}

				const id = String(rawId);
				if (seen.has(id)) {
					return null;
				}
				seen.add(id);

				const durationInfo = getDurationInfoForProduct(product);
				const forcedPlanDisplay = FORCED_EURO_PLAN_DISPLAY[id];

				return {
					id,
					product,
					title: product.title || "Accès Com’Academy",
					price: forcedPlanDisplay?.price ?? safeFormatPrice(product, "—"),
					duration: forcedPlanDisplay?.duration ?? durationInfo?.label ?? "",
					durationDays:
						forcedPlanDisplay?.durationDays ?? durationInfo?.days ?? 0,
				};
			})
			.filter(Boolean) as {
			id: string;
			product: SubscriptionProduct;
			title: string;
			price: string;
			duration: string;
			durationDays: number;
		}[];

		if (mapped.length > 1) {
			mapped.sort((a, b) => b.durationDays - a.durationDays);
		}

		return mapped;
	}, [products]);

	const activeProductId = useMemo(() => {
		const candidates = [
			subscription?.productId,
			subscription?.product?.productId,
			subscription?.sku,
		];

		const match = candidates.find(
			(value) => typeof value === "string" && value.length > 0
		);

		return match ? String(match) : undefined;
	}, [subscription]);

	const navigateAfterPurchase = useCallback(() => {
		if (returnDestination && returnDestination !== "/subscription") {
			router.replace(returnDestination as any);
			return;
		}
		router.replace("/activity");
	}, [returnDestination, router]);

	const openPurchaseFeedbackSheet = useCallback(
		(payload: PurchaseFeedbackState) => {
			setPurchaseFeedback(payload);
			purchaseFeedbackSheetRef.current?.present();
		},
		[]
	);

	const closePurchaseFeedbackSheet = useCallback(() => {
		const action = purchaseFeedback?.action;
		purchaseFeedbackSheetRef.current?.dismiss();
		setPurchaseFeedback(null);
		if (action === "navigate") {
			navigateAfterPurchase();
		}
	}, [navigateAfterPurchase, purchaseFeedback?.action]);

	const waitForActivation = useCallback(async () => {
		const maxAttempts = 8;
		for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
			const entitlement = await checkSubscription();
			if (entitlement) {
				return true;
			}
			await new Promise((resolve) => setTimeout(resolve, 1200));
		}
		return false;
	}, [checkSubscription]);

	const handlePurchase = async (product: SubscriptionProduct) => {
		const selectedProductId = getSubscriptionProductId(product);
		const isDowngradeFromYearlyToMonthly =
			Platform.OS === "ios" &&
			hasActiveSubscription &&
			activeProductId === "fullAccess1200" &&
			selectedProductId === "fullAccess100";

		if (isDowngradeFromYearlyToMonthly) {
			Alert.alert(
				"Changement d'abonnement",
				"Sur iOS, le passage de l'abonnement annuel au mensuel est gere par l'App Store et prend effet au prochain renouvellement.",
				[
					{
						text: "Ouvrir App Store",
						onPress: () =>
							void openExternalLink("https://apps.apple.com/account/subscriptions"),
					},
					{ text: "OK", style: "cancel" },
				]
			);
			return;
		}

		try {
			await purchase(product);
			const isActivated = await waitForActivation();
			await refresh();

			if (!isActivated) {
				openPurchaseFeedbackSheet({
					title: "Achat en cours de confirmation",
					message:
						"Votre achat a ete recu. L'activation peut prendre quelques instants. Ouvrez la page plus tard ou utilisez 'Restaurer mes achats'.",
					action: "close",
				});
				return;
			}

			openPurchaseFeedbackSheet({
				title: "Succès !",
				message:
					"Votre abonnement a ete active avec succes. Profitez de tous les contenus premium !",
				action: "navigate",
			});
		} catch (err) {
			const purchaseError = err as PurchaseError;
			if (isUserCancelledError(purchaseError)) return;
			console.warn("[SubscriptionScreen] purchase error:", err);
			Alert.alert(
				"Erreur",
				typeof purchaseError?.message === "string"
					? purchaseError.message
					: "Une erreur est survenue lors de l'achat. Veuillez reessayer."
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
			console.warn("[SubscriptionScreen] restore error:", err);
			Alert.alert(
				"Erreur",
				"Impossible de restaurer vos achats. Assurez-vous d'être connecté avec le même compte."
			);
		}
	};

	const openExternalLink = useCallback(async (url: string) => {
		try {
			const supported = await Linking.canOpenURL(url);
			if (!supported) {
				throw new Error(`Cannot open URL: ${url}`);
			}
			await Linking.openURL(url);
		} catch (err) {
			console.warn("[SubscriptionScreen] external link error:", err);
			Alert.alert("Erreur", "Impossible d'ouvrir ce lien pour le moment.");
		}
	}, []);

	const handlePrivacyPolicy = () => {
		void openExternalLink(PRIVACY_POLICY_URL);
	};

	const handleTermsOfService = () => {
		void openExternalLink(TERMS_OF_SERVICE_URL);
	};

	const handleManageSubscription = () => {
		if (isExpoGo) {
			Alert.alert(
				"Gérer l'abonnement (Test)",
				"Voulez-vous annuler votre abonnement de test ?",
				[
					{ text: "Annuler", style: "cancel" },
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
			if (Platform.OS === "ios") {
				void openExternalLink("https://apps.apple.com/account/subscriptions");
			} else if (Platform.OS === "android") {
				void openExternalLink(
					"https://play.google.com/store/account/subscriptions"
				);
			}
		}
	};

	const handleRefresh = useCallback(() => {
		refresh().catch((err) => {
			console.error("Failed to refresh subscriptions:", err);
		});
	}, [refresh]);

	if (loading) {
		return <Loader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
				<View style={[styles.innerWrapper, { paddingTop: 20 }]}>
					<ReturnButton />
					<ScreenHeaders content='Abonnement Premium' paddingTop={0} />

				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={colorBlack}
						/>
					}
					contentContainerStyle={styles.scrollContent}>
					{/* Header Section */}
					<View style={styles.headerSection}>
						{hasPremiumAccess ? (
							<>
								<View style={styles.activeSubscriptionBanner}>
									<Text style={styles.activeSubscriptionText}>
										✓ Vous êtes abonné Premium
									</Text>
									<Text style={styles.activeSubscriptionSubtext}>
										Profitez de tous les contenus sans limite
									</Text>
								</View>
								{hasActiveSubscription ? (
									<TouchableOpacity
										style={styles.manageButton}
										onPress={handleManageSubscription}>
										<Text style={styles.manageButtonText}>
											Gérer mon abonnement
										</Text>
									</TouchableOpacity>
								) : (
									hasManualPremium && (
										<Text style={styles.manualPremiumNote}>
											Accès Premium accordé manuellement par l'équipe
											Com'Academy.
										</Text>
									)
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

					{isExpoGo && (
						<View style={styles.mockWarning}>
							<Text style={styles.mockWarningText}>
								⚠️ Mode test : les achats sont simulés dans Expo Go. Créez une
								build de développement pour tester les achats réels.
							</Text>
						</View>
					)}

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
								<Text className='benefit-text' style={styles.benefitText}>
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
						{plans.length > 0 ? (
							plans.map((plan, index) => (
								<SubscriptionPlanCard
									key={plan.id}
									title={plan.title}
									price={plan.price}
									duration={plan.duration}
									features={PLAN_FEATURES}
									isPopular={plans.length > 1 && index === 0}
									isCurrentPlan={
										hasActiveSubscription &&
										matchesActivePlan(plan.id, activeProductId)
									}
									onPress={() => handlePurchase(plan.product)}
									disabled={purchasing}
								/>
							))
						) : (
							<View style={styles.noProductsContainer}>
								<Text style={styles.noProductsText}>
									Les abonnements ne sont pas disponibles pour le moment.
								</Text>
								<Text style={styles.noProductsSubtext}>
									Vérifiez la configuration App Store / Play Console ou
									réessayez plus tard.
								</Text>
							</View>
						)}
					</View>

					{/* Error Display */}
					{error && (
						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>
								⚠️{" "}
								{typeof error === "string" ? error : "Une erreur est survenue."}
							</Text>
						</View>
					)}

					{/* Restore Purchases Button */}
					<TouchableOpacity
						style={styles.restoreButton}
						onPress={handleRestore}
						disabled={purchasing}>
						<Text style={styles.restoreButtonText}>Restaurer mes achats</Text>
					</TouchableOpacity>

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
						<Text style={styles.legalText}>En vous abonnant, vous acceptez nos</Text>
						<View style={styles.legalLinks}>
							<TouchableOpacity onPress={handleTermsOfService}>
								<Text style={styles.legalLink}>Conditions d'utilisation</Text>
							</TouchableOpacity>
							<Text style={styles.legalSeparator}> et notre </Text>
							<TouchableOpacity onPress={handlePrivacyPolicy}>
								<Text style={styles.legalLink}>Politique de confidentialité</Text>
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

				<BottomSheetModal
					ref={purchaseFeedbackSheetRef}
					index={0}
					snapPoints={purchaseFeedbackSnapPoints}
					enablePanDownToClose
					backgroundStyle={styles.feedbackSheetBackground}>
					<BottomSheetView style={styles.feedbackSheetContent}>
						<Text style={styles.feedbackSheetTitle}>
							{purchaseFeedback?.title ?? ""}
						</Text>
						<Text style={styles.feedbackSheetMessage}>
							{purchaseFeedback?.message ?? ""}
						</Text>
						<TouchableOpacity
							style={styles.feedbackSheetButton}
							onPress={closePurchaseFeedbackSheet}>
							<Text style={styles.feedbackSheetButtonText}>OK</Text>
						</TouchableOpacity>
					</BottomSheetView>
				</BottomSheetModal>
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
	manualPremiumNote: {
		marginTop: 16,
		fontSize: FontSize14,
		color: "#2E7D32",
		textAlign: "center",
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
	feedbackSheetBackground: {
		backgroundColor: colorWhite,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	feedbackSheetContent: {
		paddingHorizontal: 20,
		paddingBottom: 22,
		paddingTop: 8,
	},
	feedbackSheetTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 10,
	},
	feedbackSheetMessage: {
		fontSize: FontSize16,
		lineHeight: 24,
		color: colorBlack,
		marginBottom: 18,
	},
	feedbackSheetButton: {
		backgroundColor: colorBlack,
		borderRadius: 50,
		minHeight: 48,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	feedbackSheetButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "700",
	},
});
