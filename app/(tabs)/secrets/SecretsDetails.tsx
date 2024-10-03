import SecretCard from "@/components/cards/SecretCard";
import TitleCard from "@/components/cards/SecretTitle";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import { useSecrets } from "@/context/contextSecrets";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SecretsDetails() {
	const insets = useSafeAreaInsets();
	const { data } = useSecrets();
	const { itemId } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = screenWidth * 0.8;
	const secretsId = Number(itemId);

	// Filter the secrets data using useMemo for performance optimization
	const secretsData = useMemo(
		() => data.data.find(({ id }) => id === secretsId),
		[data, secretsId]
	);

	// Early return if no secrets data found
	if (!secretsData) return null;

	const { Title, ...keys } = secretsData.attributes;

	return (
		<View style={[styles.cardsWrapper, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<Text style={styles.headerText}>3 Secrets du Succès</Text>
			</View>

			<ScrollView
				horizontal
				decelerationRate='fast'
				snapToInterval={cardWidth + 35} // card width + padding/margin
				snapToAlignment='center'
				contentContainerStyle={styles.scrollViewWrapper}
				showsHorizontalScrollIndicator={false}>
				<TitleCard cardWidth={cardWidth} title={Title} />

				{Object.keys(keys)
					.filter((key) => key.startsWith("Key"))
					.map((key, index) => {
						const [title, text] = keys[key].split(":");
						return (
							<SecretCard
								key={index}
								title={title}
								text={text}
								cardWidth={cardWidth}
								index={index}
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
