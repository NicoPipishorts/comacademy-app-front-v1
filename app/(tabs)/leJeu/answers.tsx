import { primaryBackground } from "@/constants/colors";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const Jeu = () => {
	const { hideTabBar, showTabBar } = useTabBarVisibility();

	useEffect(() => {
		hideTabBar();
		return () => showTabBar(); // Ensure tab bar is shown again when component unmounts
	}, [hideTabBar, showTabBar]); // Define onSuccess and onError handlers

	return (
		<View style={styles.wrapper}>
			<Text>Reponses</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
});

export default Jeu;
