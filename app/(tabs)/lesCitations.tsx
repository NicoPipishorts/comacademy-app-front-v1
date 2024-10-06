import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize16, FontSize22 } from "@/constants/fontsizes";
import useLesCitations from "@/hooks/useGetLesCitations";
import useJwtToken from "@/hooks/useJwtToken";
import moment from "moment";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const LesCitations = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useLesCitations(token);

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
							<View key={citation.id} style={styles.cardWrapper}>
								<View
									style={{
										paddingRight: 50,
										paddingBottom: 5,
										alignItems: "flex-end",
									}}>
									<Text style={{ fontSize: FontSize14, fontWeight: "bold" }}>
										{" "}
										{moment(citation.attributes.updatedAt).format("DD/MM/YYYY")}
									</Text>
								</View>
								<View style={styles.cardContainer}>
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
								</View>
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
	cardWrapper: {
		maxHeight: 350,
	},
	cardContainer: {
		flex: 1,
		justifyContent: "center",
		maxWidth: 350,
		minHeight: 250,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		elevation: 5,
		backgroundColor: colorBlack,
		marginHorizontal: 20,
		borderRadius: 20,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	cardContent: {
		padding: 20,
		borderRadius: 10,
	},
	cardTextCitation: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
	},
	containerTextAuteur: {
		width: "100%",
		justifyContent: "flex-start",
		paddingHorizontal: 20,
		paddingBottom: 15,
	},
	cardTextAuteur: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});

export default LesCitations;
