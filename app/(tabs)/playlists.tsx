import { primaryBackground } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import ScreenHeaders from "../../components/ScreenHeaders";

const Playlist = () => {
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Playlist' />
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		backgroundColor: primaryBackground,
	},
});

export default Playlist;
