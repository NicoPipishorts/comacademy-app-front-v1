import BackgroundImg from "@/assets/imgs/cards/citationsBg.png";
import Loader from "@/components/experience/loader";
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import useGetLesCitations from "@/hooks/useGetLesCitations";
import useJwtToken from "@/hooks/useJwtToken";
import React from "react";
import {
	ImageBackground,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import ScreenHeaders from "../../components/ScreenHeaders";

const LesCitations = () => {
	const { data, isLoading } = useGetLesCitations();
	const { token } = useJwtToken();

	if (isLoading) {
		return <Loader />;
	}

	if (!data) {
		return (
			<View style={styles.noDataContainer}>
				<Text>No data available</Text>
			</View>
		);
	}

	return (
		<View style={styles.wrapper}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='Les Citations' />
			</View>
			<ScrollView
				style={styles.citationsWrapper}
				horizontal={true}
				showsHorizontalScrollIndicator={false}>
				<View style={styles.citationsContainer}>
					{data.data.map((citation) => {
						return (
							<View key={citation.id} style={styles.cardContainer}>
								<ImageBackground
									source={BackgroundImg}
									style={styles.cardBackgroundImage}
									resizeMode='contain'>
									<View style={styles.cardContent}>
										<Text style={styles.cardTextCitation}>
											{citation.attributes.CITATION}
										</Text>
									</View>
									<View style={styles.containerTextAuteur}>
										<Text style={styles.cardTextAuteur}>
											{citation.attributes.AUTEUR}
										</Text>
									</View>
								</ImageBackground>
							</View>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingTop: 80,
		backgroundColor: primaryBackground,
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	citationsWrapper: {
		flexGrow: 0,
		height: "80%",
	},
	citationsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		minWidth: "100%",
		marginBottom: 40,
	},
	cardContainer: {
		width: 350,
		height: 330,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.35,
		shadowRadius: 15,
		elevation: 5,
	},
	cardBackgroundImage: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	cardContent: {
		position: "relative",
		padding: 20,
		borderRadius: 10,
	},
	cardTextCitation: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
	},
	containerTextAuteur: {
		position: "absolute",
		bottom: 80,
		left: 40,
	},
	cardTextAuteur: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});

export default LesCitations;
