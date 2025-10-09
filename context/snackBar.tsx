import { colorGreen, colorPink, colorWhite } from "@/constants/colors"; // Add more colors
import { FontSize16 } from "@/constants/fontsizes";
import React, { createContext, useCallback, useContext, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Snackbar } from "react-native-paper";

// Define the types for the Snackbar (success, error, etc.)
type SnackbarContextType = (message: string, type: "success" | "error") => void;

const SnackbarContext = createContext<SnackbarContextType>(() => {});

export const SnackbarProvider = ({ children }) => {
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarType, setSnackbarType] = useState<"success" | "error">(
		"success"
	); // Default to "success"

	const showSnackbar = useCallback(
		(message: string, type: "success" | "error" = "success") => {
			setSnackbarMessage(message);
			setSnackbarType(type); // Set the type
			setSnackbarVisible(true);
		},
		[]
	);

	const hideSnackbar = () => {
		setSnackbarVisible(false);
	};

	return (
		<SnackbarContext.Provider value={showSnackbar}>
			{children}
			<Snackbar
				visible={snackbarVisible}
				onDismiss={hideSnackbar}
				duration={3000}
				action={{
					label: "Dismiss",
					onPress: () => hideSnackbar(),
					textColor: colorWhite,
				}}
				style={[
					styles.snackbarStyle,
					{
						backgroundColor:
							snackbarType === "success" ? colorGreen : colorPink,
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
