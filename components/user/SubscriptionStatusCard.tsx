import { colorWhite } from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SubscriptionStatusCardProps = {
	hasPremiumAccess: boolean;
	priceLine?: string | null;
	renewalLine?: string | null;
	subscriptionError?: string | null;
	onPressSubscribe: () => void;
};

export default function SubscriptionStatusCard({
	hasPremiumAccess,
	priceLine,
	renewalLine,
	subscriptionError,
	onPressSubscribe,
}: SubscriptionStatusCardProps) {
	return (
		<View style={styles.subscriptionCard}>
			<View style={styles.subscriptionHeaderRow}>
				<View style={styles.subscriptionLogoWrap}>
					<Image
						source={require("@/assets/imgs/icons/favicon.png")}
						style={styles.subscriptionLogo}
						resizeMode='contain'
					/>
				</View>
				<View style={styles.subscriptionHeaderTextWrap}>
					<Text style={styles.subscriptionBrandTitle}>Com Academy</Text>
					<Text style={styles.subscriptionBrandSubtitle}>
						Premium individuel
					</Text>
				</View>
			</View>

			{hasPremiumAccess ? (
				<View style={styles.subscriptionActiveDetails}>
					<Text style={styles.subscriptionActivePrice}>
						{priceLine || "Premium individuel"}
					</Text>
					<Text style={styles.subscriptionActiveRenewal}>
						{renewalLine || "Renouvellement actif"}
					</Text>
				</View>
			) : (
				<TouchableOpacity
					style={styles.subscriptionCtaTouchable}
					activeOpacity={0.9}
					onPress={onPressSubscribe}>
					<LinearGradient
						colors={["#6F44E8", "#24C2F5"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.subscriptionCtaGradient}>
						<Text style={styles.subscriptionCtaText}>M'abonner</Text>
						<View style={styles.subscriptionCtaArrowCircle}>
							<Text style={styles.subscriptionCtaArrow}>›</Text>
						</View>
					</LinearGradient>
				</TouchableOpacity>
			)}

			{subscriptionError ? (
				<Text style={styles.subscriptionWarning}>
					Échec de la récupération des infos abonnement.
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	subscriptionCard: {
		display: "flex",
		flexDirection: "column",
		marginVertical: 40,
		width: "100%",
		borderRadius: 25,
		paddingHorizontal: 16,
		paddingVertical: 14,
		backgroundColor: colorWhite,
		gap: 12,
	},
	subscriptionHeaderRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	subscriptionLogoWrap: {
		width: 44,
		height: 44,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#D1D1D1",
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	subscriptionLogo: {
		width: "100%",
		height: "100%",
	},
	subscriptionHeaderTextWrap: {
		flex: 1,
	},
	subscriptionBrandTitle: {
		fontSize: FontSize16,
		fontWeight: "700",
		color: "#2B2E34",
		lineHeight: 20,
	},
	subscriptionBrandSubtitle: {
		fontSize: FontSize14,
		fontWeight: "600",
		color: "#2B2E34",
		opacity: 0.95,
		lineHeight: 18,
	},
	subscriptionCtaTouchable: {
		alignSelf: "center",
		marginTop: 2,
	},
	subscriptionCtaGradient: {
		minWidth: 172,
		height: 44,
		borderRadius: 22,
		paddingLeft: 18,
		paddingRight: 6,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	subscriptionCtaText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "700",
	},
	subscriptionCtaArrowCircle: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: "#EAFBFF",
		alignItems: "center",
		justifyContent: "center",
	},
	subscriptionCtaArrow: {
		color: "#1AA9DE",
		fontSize: 24,
		lineHeight: 26,
		fontWeight: "700",
		marginTop: -1,
	},
	subscriptionActiveDetails: {
		marginTop: 4,
	},
	subscriptionActivePrice: {
		fontSize: FontSize14,
		fontWeight: "700",
		color: "#2B2E34",
	},
	subscriptionActiveRenewal: {
		fontSize: FontSize14,
		fontWeight: "600",
		color: "#2B2E34",
	},
	subscriptionWarning: {
		fontSize: 12,
		color: "#b45309",
		marginVertical: 4,
	},
});
