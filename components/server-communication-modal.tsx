import {
	colorBlack,
	colorBlue,
	colorLightGrey,
	colorOrange,
	colorWhite,
} from "@/constants/colors";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ServerCommunicationModalProps {
	visible: boolean;
	onClose: () => void;
}

export function ServerCommunicationModal({
	visible,
	onClose,
}: ServerCommunicationModalProps) {
	return (
		<Modal
			animationType='fade'
			onRequestClose={onClose}
			transparent
			visible={visible}>
			<View style={styles.backdrop}>
				<View accessibilityViewIsModal style={styles.card}>
					<View style={styles.iconContainer}>
						<Text accessibilityElementsHidden style={styles.icon}>
							!
						</Text>
					</View>
					<Text selectable style={styles.title}>
						Communication perturbée
					</Text>
					<Text selectable style={styles.message}>
						Nous rencontrons un problème temporaire avec le serveur. Une connexion
						de secours est utilisée. Si nécessaire, réessayez dans quelques instants.
					</Text>
					<Pressable
						accessibilityRole='button'
						onPress={onClose}
						style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
						<Text style={styles.buttonText}>J’ai compris</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		alignItems: "center",
		backgroundColor: "rgba(39, 39, 39, 0.48)",
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	card: {
		alignItems: "center",
		backgroundColor: colorWhite,
		borderCurve: "continuous",
		borderRadius: 24,
		boxShadow: "0 14px 38px rgba(0, 0, 0, 0.22)",
		gap: 16,
		maxWidth: 380,
		padding: 24,
		width: "100%",
	},
	iconContainer: {
		alignItems: "center",
		backgroundColor: colorLightGrey,
		borderCurve: "continuous",
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		width: 44,
	},
	icon: {
		color: colorOrange,
		fontSize: 26,
		fontWeight: "800",
	},
	title: {
		color: colorBlack,
		fontSize: 21,
		fontWeight: "800",
		textAlign: "center",
	},
	message: {
		color: colorBlack,
		fontSize: 16,
		lineHeight: 23,
		opacity: 0.78,
		textAlign: "center",
	},
	button: {
		alignItems: "center",
		alignSelf: "stretch",
		backgroundColor: colorBlue,
		borderRadius: 14,
		justifyContent: "center",
		minHeight: 48,
		paddingHorizontal: 20,
	},
	buttonPressed: {
		opacity: 0.82,
	},
	buttonText: {
		color: colorWhite,
		fontSize: 16,
		fontWeight: "800",
	},
});
