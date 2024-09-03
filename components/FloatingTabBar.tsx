import {
	colorBlack,
	colorLightGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSizeH4 } from "@/constants/fontsizes";
import React, { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
	selectedTab?: boolean;
	setSelectedTab: Dispatch<SetStateAction<boolean>>;
	values: {
		btn1: string;
		btn2: string;
	};
};

const FloatingTabBar = ({ selectedTab, setSelectedTab, values }: Props) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={!selectedTab ? styles.buttonBlack : styles.buttonWhite}
				onPress={() => setSelectedTab(false)}>
				<Text style={!selectedTab ? styles.textBlack : styles.textWhite}>
					{values.btn1}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={selectedTab ? styles.buttonBlack : styles.buttonWhite}
				onPress={() => setSelectedTab(true)}>
				<Text style={selectedTab ? styles.textBlack : styles.textWhite}>
					{values.btn2}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
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
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 5,
		zIndex: 1000, // High zIndex to ensure it stays on top
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
