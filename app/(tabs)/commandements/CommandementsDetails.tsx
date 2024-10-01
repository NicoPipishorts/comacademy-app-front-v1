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

// Commandement Title Card Component
const CommandementTitleCard = ({ cardWidth, theme }) => (
	<View style={[styles.titleCardWrapper, { width: cardWidth }]}>
		<Text style={styles.titleCardText}>{theme}</Text>
	</View>
);

// Commandement Card Component
const CommandementCard = ({ title, text, index, cardWidth, cardMargin }) => (
	<LinearGradient
		colors={["#0CA2CC", "#8BF699"]}
		style={[
			styles.keyCardWrapper,
			{ width: cardWidth, marginHorizontal: cardMargin / 2 },
		]}
		start={{ x: 0, y: 0 }}
		end={{ x: 1, y: 1 }}>
		<Text style={styles.keyCardTitle}>{title} :</Text>
		<View style={styles.cardContent}>
			<Text style={styles.keyCardText}>{text}</Text>
		</View>
		<View style={styles.cardNumberWrapper}>
			<Text style={styles.keyCardNum}>{index + 1}</Text>
		</View>
	</LinearGradient>
);

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
	titleCardText: {
		color: colorWhite,
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		lineHeight: 44,
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
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	cardContent: {
		marginTop: 20,
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	cardNumberWrapper: {
		marginTop: 20,
		position: "absolute",
		bottom: 10,
		left: 30,
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
	backButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
