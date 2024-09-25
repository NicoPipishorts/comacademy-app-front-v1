import { colorBlack, colorWhite } from "@/constants/colors";
import {
	FontSize16,
	FontSizeH1,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import { useCommandements } from "@/context/contextCommandements";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function CommandementsDetails() {
	const { data } = useCommandements();
	const { itemId } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = screenWidth * 0.78;
	const cardMargin = 34;
	const commandementId = Number(itemId);

	const commandementData = data.data[commandementId].attributes;

	return (
		<View
			style={[
				styles.cardsWrapper,
				{
					paddingTop: isAndroid ? 40 : 20,
				},
			]}>
			<View
				style={{
					padding: 30,
					paddingBottom: 20,
				}}>
				<Text style={{ fontSize: FontSizeScreenTitles, fontWeight: "bold" }}>
					10 Commandements
				</Text>
			</View>

			<ScrollView
				horizontal
				decelerationRate='fast'
				snapToInterval={cardWidth + cardMargin} // Snap based on card width + margin
				snapToAlignment='center' // Ensure snapping to the center
				contentContainerStyle={styles.scrollViewWrapper}
				showsHorizontalScrollIndicator={false}>
				<View style={[styles.titleCardWrapper, { width: cardWidth }]}>
					<Text style={styles.titleCardText}>{commandementData.Theme}</Text>
				</View>
				{Array.from({ length: 11 }).map((_, i) => {
					const astuceKey = `Astuce_${i + 1}`;
					const astuceValue = commandementData[astuceKey];

					if (!astuceValue) return null;

					const [title, text] = astuceValue.split(":");

					return (
						<LinearGradient
							key={i}
							colors={["#0CA2CC", "#8BF699"]}
							style={[
								styles.keyCardWrapper,
								{ width: cardWidth, marginHorizontal: cardMargin / 2 },
							]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}>
							<Text style={styles.keyCardTitle}>{title} :</Text>
							<View style={{ marginTop: 20 }}>
								<Text style={styles.keyCardText}>{text}</Text>
							</View>

							<View
								style={{
									marginTop: 20,
									position: "absolute",
									bottom: 10,
									left: 30,
								}}>
								<Text style={styles.keyCardNum}>{i + 1}</Text>
							</View>
						</LinearGradient>
					);
				})}
			</ScrollView>

			{isAndroid && (
				<TouchableOpacity
					style={[
						styles.backButton,
						{
							marginBottom: isAndroid ? 120 : 20,
						},
					]}>
					<Text
						style={{
							color: colorWhite,
							fontSize: FontSize16,
							fontWeight: "bold",
						}}>
						Retour
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	cardsWrapper: {
		flexShrink: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollViewWrapper: {
		alignItems: "center",
		padding: 18,
	},
	titleCardWrapper: {
		justifyContent: "center",
		alignItems: "center",
		minHeight: "80%",
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
		marginHorizontal: 13,
	},
	keyCardWrapper: {
		position: "relative",
		justifyContent: "flex-start",
		minHeight: "80%",
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingTop: 40,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
		marginHorizontal: 13,
	},
	titleCardText: {
		color: colorWhite,
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		lineHeight: 44,
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	keyCardNum: {
		color: colorWhite,
		fontSize: 148,
		opacity: 0.2,
		fontWeight: "bold",
	},
	backButton: {
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
});
