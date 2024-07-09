import {
	colorBlack,
	colorLightGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSizeH4 } from "@/constants/fontsizes";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FloatingTabBar = () => {
	const [selectedTab, setSelectedTab] = useState("all");

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={selectedTab === "all" ? styles.buttonBlack : styles.buttonWhite}
				onPress={() => setSelectedTab("all")}>
				<Text
					style={selectedTab === "all" ? styles.textBlack : styles.textWhite}>
					Voir tout
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={selectedTab === "cat" ? styles.buttonBlack : styles.buttonWhite}
				onPress={() => setSelectedTab("cat")}>
				<Text
					style={selectedTab === "cat" ? styles.textBlack : styles.textWhite}>
					Catégories
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: primaryBackground,
		flexDirection: "row",
		justifyContent: "center",
		borderRadius: 50,
		padding: 7,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.45,
		shadowRadius: 17,
		elevation: 5,
		zIndex: 1,
	},
	buttonWhite: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 50,
		backgroundColor: colorLightGrey,
	},
	buttonBlack: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 50,
		backgroundColor: colorBlack,
	},
	textWhite: {
		fontSize: FontSizeH4,
		fontWeight: "bold",
		color: colorBlack,
	},
	textBlack: {
		fontSize: FontSizeH4,
		fontWeight: "bold",
		color: colorWhite,
	},
});

export default FloatingTabBar;
