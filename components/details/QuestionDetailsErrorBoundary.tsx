import { logDevice } from "@/helpers/logDevice";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colorBlack, colorWhite } from "@/constants/colors";

type Props = {
	children: React.ReactNode;
	onBack: () => void;
};

type State = {
	hasError: boolean;
};

export default class QuestionDetailsErrorBoundary extends React.Component<Props, State> {
	state: State = {
		hasError: false,
	};

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		logDevice(
			"[QuestionDetailsErrorBoundary] render failure",
			{
				message: error?.message ?? "unknown",
				stack: error?.stack ?? null,
				componentStack: info?.componentStack ?? null,
			},
			"error"
		);
	}

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.wrapper}>
					<View style={styles.card}>
						<Text style={styles.title}>Impossible d'afficher la reponse</Text>
						<Text style={styles.text}>
							Une erreur de rendu a ete interceptee. Ouvre les logs puis reviens a
							l'ecran precedent.
						</Text>
						<Pressable style={styles.button} onPress={this.props.onBack}>
							<Text style={styles.buttonText}>Retour</Text>
						</Pressable>
					</View>
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	card: {
		width: "100%",
		borderRadius: 20,
		backgroundColor: colorWhite,
		padding: 24,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 12,
	},
	text: {
		fontSize: 16,
		lineHeight: 22,
		color: colorBlack,
		marginBottom: 18,
	},
	button: {
		alignSelf: "flex-start",
		backgroundColor: colorBlack,
		borderRadius: 999,
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "700",
	},
});
