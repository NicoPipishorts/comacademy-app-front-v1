import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import useDailyCitations from "@/hooks/Citations/useGetDailyCitations";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LesCitations: React.FC = () => {
	const { citationCategory } = useLocalSearchParams();
	const { data, isFetched } = useDailyCitations();
	const citation = data?.data;

	useTrackPageMetrics({ page: "Citations" });

	if (!isFetched) {
		return <Loader />;
	}

	return (
		<SafeAreaView style={styles.wrapper}>
			{/* Title stays at the top */}
			<ScreenHeaders content='La citation du jour' />

			{/* Centered card section */}
			<View style={styles.centered}>
				<View style={styles.cardWrapper}>
					<Image
						source={require("@/assets/imgs/icons/quote_open.png")}
						style={styles.openIcon}
					/>
					<View style={styles.cardContent}>
						<Text style={styles.citationText}>{citation.CITATION}</Text>
					</View>
					<Image
						source={require("@/assets/imgs/icons/quote_close.png")}
						style={styles.closeIcon}
					/>
					<Text style={styles.authorText}>{citation.AUTEUR}</Text>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 20,
		flex: 1,
		backgroundColor: primaryBackground,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noDataText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	cardWrapper: {
		width: "90%",
		maxWidth: 350,
		minHeight: 250,
		backgroundColor: colorBlack,
		borderRadius: 20,
		padding: 20,
		shadowColor: colorBlack,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowOffset: { width: 0, height: 2 },
		elevation: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	openIcon: {
		position: "absolute",
		top: 20,
		left: 20,
		width: 45,
		height: 45,
	},
	closeIcon: {
		position: "absolute",
		bottom: 20,
		right: 20,
		width: 45,
		height: 45,
	},
	cardContent: {
		marginBottom: 15,
	},
	citationText: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
		textAlign: "center",
	},
	authorText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		marginTop: 10,
		textAlign: "center",
	},
});

export default LesCitations;
