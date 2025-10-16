import { colorBlack, colorWhite, colorYellow } from "@/constants/colors";
import {
	FontSize14,
	FontSize16,
	FontSize18,
	FontSize22,
} from "@/constants/fontsizes";
import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface SubscriptionPlanCardProps {
	title: string;
	price: string;
	duration: string;
	features: string[];
	isPopular?: boolean;
	isCurrentPlan?: boolean;
	onPress: () => void;
	disabled?: boolean;
}

export default function SubscriptionPlanCard({
	title,
	price,
	duration,
	features,
	isPopular = false,
	isCurrentPlan = false,
	onPress,
	disabled = false,
}: SubscriptionPlanCardProps) {
	return (
		<View style={[styles.container, isPopular && styles.popularContainer]}>
			{isPopular && (
				<View style={styles.popularBadge}>
					<Text style={styles.popularBadgeText}>⭐ Recommandé</Text>
				</View>
			)}

			<View style={styles.content}>
				<Text style={styles.title}>{title}</Text>

				<View style={styles.priceContainer}>
					<Text style={styles.price}>{price}</Text>
					<Text style={styles.duration}>{duration}</Text>
				</View>

				<View style={styles.featuresContainer}>
					{features.map((feature, index) => (
						<View key={index} style={styles.featureRow}>
							<Text style={styles.checkmark}>✓</Text>
							<Text style={styles.featureText}>{feature}</Text>
						</View>
					))}
				</View>

				{isCurrentPlan ? (
					<View style={styles.currentPlanButton}>
						<Text style={styles.currentPlanText}>Abonnement actif</Text>
					</View>
				) : (
					<TouchableOpacity
						style={[
							styles.subscribeButton,
							isPopular && styles.popularButton,
							disabled && styles.disabledButton,
						]}
						onPress={onPress}
						disabled={disabled}>
						{disabled ? (
							<ActivityIndicator color={colorWhite} />
						) : (
							<Text
								style={[
									styles.subscribeButtonText,
									isPopular && styles.popularButtonText,
								]}>
								S'abonner
							</Text>
						)}
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colorWhite,
		borderRadius: 20,
		marginBottom: 20,
		overflow: "visible",
	},
	popularContainer: {
		borderWidth: 2,
		borderColor: colorYellow,
		transform: [{ scale: 1.02 }],
	},
	popularBadge: {
		position: "absolute",
		top: -12,
		right: 20,
		backgroundColor: colorYellow,
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		zIndex: 10,
	},
	popularBadgeText: {
		color: colorBlack,
		fontSize: FontSize14,
		fontWeight: "bold",
	},
	content: {
		padding: 24,
	},
	title: {
		fontSize: FontSize22,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 12,
	},
	priceContainer: {
		flexDirection: "row",
		alignItems: "baseline",
		marginBottom: 20,
	},
	price: {
		fontSize: FontSize22,
		fontWeight: "bold",
		color: colorBlack,
		marginRight: 8,
	},
	duration: {
		fontSize: FontSize16,
		color: "#666666",
	},
	featuresContainer: {
		marginBottom: 20,
		gap: 12,
	},
	featureRow: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	checkmark: {
		fontSize: FontSize18,
		color: colorYellow,
		fontWeight: "bold",
		marginRight: 10,
		marginTop: 2,
	},
	featureText: {
		fontSize: FontSize16,
		color: colorBlack,
		flex: 1,
		lineHeight: 22,
	},
	subscribeButton: {
		backgroundColor: colorBlack,
		paddingVertical: 14,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 48,
	},
	popularButton: {
		backgroundColor: colorYellow,
	},
	disabledButton: {
		opacity: 0.6,
	},
	subscribeButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	popularButtonText: {
		color: colorBlack,
	},
	currentPlanButton: {
		backgroundColor: "#E8E8E8",
		paddingVertical: 14,
		borderRadius: 50,
		alignItems: "center",
	},
	currentPlanText: {
		color: "#666666",
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
