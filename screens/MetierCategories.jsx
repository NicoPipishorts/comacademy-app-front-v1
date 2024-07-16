import Cat1 from "@/assets/imgs/icons/cat_1.png";
import Cat2 from "@/assets/imgs/icons/cat_2.png";
import Cat3 from "@/assets/imgs/icons/cat_3.png";
import Cat4 from "@/assets/imgs/icons/cat_4.png";
import Cat5 from "@/assets/imgs/icons/cat_5.png";
import Cat6 from "@/assets/imgs/icons/cat_6.png";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
	colorBlue,
	colorGreen,
	colorOrange,
	colorPurple,
	colorTurquoise,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "../constants/colors";
import { FontSize22 } from "../constants/fontsizes";

const MetierCategories = ({ setFilterByCat }) => {
	return (
		<>
			<View style={styles.cardContainer}>
				<TouchableOpacity
					onPress={() => setFilterByCat(1)}
					style={[styles.card, { backgroundColor: colorYellow }]}>
					<Image source={Cat1} style={styles.icon} />
					<Text style={styles.cardText}>Stratégie {"\n"}de Marque</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setFilterByCat(2)}
					style={[styles.card, { backgroundColor: colorOrange }]}>
					<Image source={Cat2} style={styles.icon} />
					<Text style={styles.cardText}>Stratégie {"\n"}de Com</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setFilterByCat(3)}
					style={[styles.card, { backgroundColor: colorPurple }]}>
					<Image source={Cat3} style={styles.icon} />
					<Text style={styles.cardText}>Création {"\n"} & design</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setFilterByCat(4)}
					style={[styles.card, { backgroundColor: colorBlue }]}>
					<Image source={Cat4} style={styles.icon} />
					<Text style={styles.cardText}>Marketing Digital</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setFilterByCat(5)}
					style={[styles.card, { backgroundColor: colorTurquoise }]}>
					<Image source={Cat5} style={styles.icon} />
					<Text style={styles.cardText}>Event / RP / Influence</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setFilterByCat(6)}
					style={[styles.card, { backgroundColor: colorGreen }]}>
					<Image source={Cat6} style={styles.icon} />
					<Text style={styles.cardText}>Culture Publicitaire</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	cardContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	card: {
		backgroundColor: colorYellow,
		width: "47%",
		minHeight: 150,
		marginVertical: 10,
		alignItems: "flex-start",
		justifyContent: "flex-start",
		borderRadius: 10,
		padding: 5,
	},
	icon: {
		width: 55,
		height: 55,
		marginBottom: 15,
	},
	cardText: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
		paddingHorizontal: 10,
	},
});

export default MetierCategories;
