import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { SecretAttributes } from "@/types/secrets";
import { LinearGradient } from "expo-linear-gradient";
import { Dispatch, SetStateAction } from "react";
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface Props {
	data: SecretAttributes;
	setSecretData: Dispatch<SetStateAction<SecretAttributes>>;
}

export default function SecretsDetails({ data, setSecretData }: Props) {
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = screenWidth * 0.8; // Each card takes 80% of screen width

	return (
		<View style={styles.cardsWrapper}>
			<ScrollView
				horizontal
				decelerationRate='fast'
				snapToInterval={cardWidth + 35} // card width + padding/margin
				snapToAlignment='center'
				contentContainerStyle={styles.scrollViewWrapper}
				showsHorizontalScrollIndicator={false}>
				<View style={[styles.titleCardWrapper, { width: cardWidth }]}>
					<Text style={styles.titleCardText}>{data.Title}</Text>
				</View>
				{/* Additional Cards */}
				{Array.from({ length: 3 }).map((_, i) => {
					const a = data[`Key${i + 1}`].split(":");
					const title = a[0];
					const text = a[1];

					return (
						<LinearGradient
							key={i}
							colors={["#CA87E9", "#F0ADAE"]} // Adjust these colors to match your gradient
							style={[styles.keyCardWrapper, { width: cardWidth }]}
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

			<TouchableOpacity
				onPress={() => setSecretData(null)}
				style={styles.backButton}>
				<Text
					style={{
						color: colorWhite,
						fontSize: FontSize16,
						fontWeight: "bold",
					}}>
					Retour
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	cardsWrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollViewWrapper: {
		alignItems: "center",
		paddingHorizontal: 18, // Some padding around the scroll view
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
		marginHorizontal: 13, // Adds spacing between cards
	},
	keyCardWrapper: {
		position: "relative",
		justifyContent: "flex-start",
		alignItems: "flex-start",
		minHeight: "80%",
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingTop: 40,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
		marginHorizontal: 13, // Adds spacing between cards
	},
	titleCardText: {
		color: colorWhite,
		fontSize: 42,
		fontWeight: "bold",
		lineHeight: 44,
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: 36,
		fontWeight: "bold",
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize14,
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
		marginBottom: 20,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
});
