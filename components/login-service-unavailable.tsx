import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { refreshApiAvailability } from "@/services/api-failover";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export function LoginServiceUnavailable() {
	const [isRetrying, setIsRetrying] = useState(false);

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			await refreshApiAvailability();
		} finally {
			setIsRetrying(false);
		}
	};

	return (
		<View accessibilityRole='alert' style={styles.card}>
			<MaterialCommunityIcons
				name='server-network-off'
				size={38}
				color={colorBlack}
			/>
			<Text selectable style={styles.title}>
				Service temporairement indisponible
			</Text>
			<Text selectable style={styles.message}>
				Nous ne parvenons pas à communiquer avec le serveur pour le moment. Réessaie
				dans quelques instants.
			</Text>
			<Pressable
				accessibilityRole='button'
				disabled={isRetrying}
				onPress={handleRetry}
				style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
				{isRetrying ? (
					<ActivityIndicator color={colorWhite} />
				) : (
					<Text style={styles.buttonText}>Réessayer</Text>
				)}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		alignItems: "center",
		backgroundColor: colorWhite,
		borderCurve: "continuous",
		borderRadius: 22,
		gap: 16,
		padding: 24,
		width: "100%",
	},
	title: {
		color: colorBlack,
		fontSize: 22,
		fontWeight: "800",
		textAlign: "center",
	},
	message: {
		color: colorBlack,
		fontSize: FontSize16,
		lineHeight: 23,
		opacity: 0.75,
		textAlign: "center",
	},
	button: {
		alignItems: "center",
		backgroundColor: colorBlack,
		borderRadius: 24,
		justifyContent: "center",
		minHeight: 48,
		paddingHorizontal: 28,
	},
	buttonPressed: {
		opacity: 0.82,
	},
	buttonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "800",
	},
});
