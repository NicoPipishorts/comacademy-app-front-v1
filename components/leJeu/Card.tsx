import { colorWhite, colorYellow } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Assets
import Cat1 from "@/assets/imgs/icons/cat_1.png";

const Card = () => {
	return (
		<View style={styles.cardsWrapper}>
			<View style={styles.cardContainer}>
				<View style={styles.containerTopRow}>
					<View style={styles.containerStars}>
						<MaterialCommunityIcons
							name='star-outline'
							size={30}
							color={colorWhite}
							style={styles.iconStars}
						/>
						<MaterialCommunityIcons
							name='star-outline'
							size={30}
							color={colorWhite}
							style={styles.iconStars}
						/>
						<MaterialCommunityIcons
							name='star-outline'
							size={30}
							color={colorWhite}
							style={styles.iconStars}
						/>
					</View>
					<View style={styles.containerCatIcon}>
						<Image source={Cat1} style={styles.catIcon}></Image>
					</View>
				</View>
				<View style={styles.containerText}>
					<Text style={styles.textText}>
						La marque, c’est le logo d’une entreprise ou d’une organisation.
					</Text>
				</View>
				<View style={styles.containerCardIcons}>
					<TouchableOpacity>
						<MaterialCommunityIcons
							name='thumb-down-outline'
							size={30}
							color={colorWhite}
							style={styles.cardIcon}
						/>
					</TouchableOpacity>
					<TouchableOpacity>
						<MaterialCommunityIcons
							name='thumb-up-outline'
							size={30}
							color={colorWhite}
							style={styles.cardIcon}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	cardsWrapper: {
		paddingTop: "25%",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	cardContainer: {
		minHeight: "45%",
		minWidth: "100%",
		padding: 20,
		paddingTop: 0,
		backgroundColor: colorYellow,
		borderRadius: 25,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	containerTopRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	containerStars: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 20,
	},
	iconStars: {
		paddingRight: 2,
	},
	containerCatIcon: {
		paddingVertical: 10,
	},
	catIcon: {
		width: 55,
		height: 55,
	},
	containerText: {},
	textText: {
		fontSize: FontSizeH1,
		color: colorWhite,
		fontWeight: "bold",
	},
	containerCardIcons: {
		width: "100%",
		position: "absolute",
		bottom: 20,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	cardIcon: {
		padding: 10,
		borderColor: colorWhite,
		borderWidth: 4,
		borderRadius: 30,
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Card;
