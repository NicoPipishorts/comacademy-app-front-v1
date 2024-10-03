import CommandementCard from "@/components/cards/CommandementCard";
import CommandementTitleCard from "@/components/cards/CommandementTitle";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import { useCommandements } from "@/context/contextCommandements";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
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

	// Screen and layout calculations
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = screenWidth * 0.78;
	const cardMargin = 34;

	// Get the current commandement based on the itemId
	const commandementId = Number(itemId);
	const commandementData = useMemo(
		() => data.data.filter(({ id }) => id === commandementId),
		[data, commandementId]
	);

	// Early return in case of no data found
	if (!commandementData.length) return null;

	const { Theme, ...commandements } = commandementData[0].attributes;

	return (
		<View style={[styles.cardsWrapper, { paddingTop: isAndroid ? 40 : 20 }]}>
			<View style={styles.header}>
				<Text style={styles.headerText}>10 Commandements</Text>
			</View>

			<ScrollView
				horizontal
				decelerationRate='fast'
				snapToInterval={cardWidth + cardMargin}
				snapToAlignment='center'
				contentContainerStyle={styles.scrollViewWrapper}
				showsHorizontalScrollIndicator={false}>
				<CommandementTitleCard cardWidth={cardWidth} theme={Theme} />

				{Object.keys(commandements)
					.filter((key) => key.startsWith("Astuce_"))
					.map((key, index) => {
						const astuceValue = commandements[key];
						if (!astuceValue) return null;
						const [title, text] = astuceValue.split(":");
						return (
							<CommandementCard
								key={index}
								index={index}
								title={title}
								text={text}
								cardWidth={cardWidth}
								cardMargin={cardMargin}
							/>
						);
					})}
			</ScrollView>

			{isAndroid && (
				<TouchableOpacity
					style={[styles.backButton, { marginBottom: isAndroid ? 120 : 20 }]}>
					<Text style={styles.backButtonText}>Retour</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

// Styles
const styles = StyleSheet.create({
	cardsWrapper: {
		flexShrink: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		padding: 30,
		paddingBottom: 20,
	},
	headerText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	scrollViewWrapper: {
		alignItems: "center",
		padding: 18,
	},
	backButton: {
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
	backButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
