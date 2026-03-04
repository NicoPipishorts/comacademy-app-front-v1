import { colorBlue, colorGreen, colorPink, colorWhite } from "@/constants/colors"; // Add more colors
import { FontSize16 } from "@/constants/fontsizes";
import React, { createContext, useCallback, useContext, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Snackbar } from "react-native-paper";

// Define the types for the Snackbar (success, error, etc.)
type SnackbarVariant = "success" | "error" | "info";

interface SnackbarOptions {
	debugInfo?: {
		url?: string;
		[key: string]: any;
	};
}

type SnackbarContextType = (
	message: string,
	type?: SnackbarVariant,
	options?: SnackbarOptions
) => void;

const SnackbarContext = createContext<SnackbarContextType>(() => {});

export const SnackbarProvider = ({ children }) => {
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarType, setSnackbarType] = useState<SnackbarVariant>("success"); // Default to "success"
	const [debugInfo, setDebugInfo] = useState<SnackbarOptions["debugInfo"]>(
		undefined
	);

	const showSnackbar = useCallback(
		(
			message: string,
			type: SnackbarVariant = "success",
			options?: SnackbarOptions
		) => {
			setSnackbarMessage(message);
			setSnackbarType(type); // Set the type
			setDebugInfo(options?.debugInfo);
			setSnackbarVisible(true);
		},
		[]
	);

	const showDebugModal = useCallback(() => {
		if (!debugInfo) return;

		const debugDetails = Object.entries(debugInfo)
			.map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
			.join("\n\n");

		Alert.alert("Connection Details", debugDetails, [
			{
				text: "Close",
				style: "cancel",
			},
		]);
	}, [debugInfo]);

	const hideSnackbar = () => {
		setSnackbarVisible(false);
		setDebugInfo(undefined);
	};

	return (
		<SnackbarContext.Provider value={showSnackbar}>
			{children}
			<Snackbar
				visible={snackbarVisible}
				onDismiss={hideSnackbar}
				duration={1000}
				action={
					snackbarType === "error" && debugInfo
						? {
								label: "Details",
								onPress: () => showDebugModal(),
								textColor: colorWhite,
						  }
						: {
								label: "Dismiss",
								onPress: () => hideSnackbar(),
								textColor: colorWhite,
						  }
				}
				style={[
					styles.snackbarStyle,
					{
						backgroundColor:
							snackbarType === "success"
								? colorGreen
								: snackbarType === "error"
								? colorPink
								: colorBlue,
						zIndex: 9999,
						elevation: 9999,
					}, // Dynamic background based on type
				]}>
				<Text style={styles.snackbarText}>{snackbarMessage} </Text>
			</Snackbar>
		</SnackbarContext.Provider>
	);
};

export const useSnackbar = () => useContext(SnackbarContext);

// Custom styles
const styles = StyleSheet.create({
	snackbarStyle: {
		marginBottom: 50,
		marginHorizontal: 20,
		borderRadius: 15,
	},
	snackbarText: {
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorWhite,
	},
});
