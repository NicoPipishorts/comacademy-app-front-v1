import Card from "@/components/leJeu/Card";
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationType } from ".";

const Jeu = () => {
	const navigation = useNavigation<NavigationType>();
	const cards = [1, 2, 3, 4, 5];

	const renderCard = (cardIndex: React.Key | null | undefined) => {
		return <Card key={cardIndex} />;
	};

	const handlePress = () => {
		navigation.navigate("index");
	};

	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				<Card />
				{/* <Swiper
					cards={cards}
					renderCard={renderCard}
					onSwiped={(cardIndex) => console.log("Card swiped:", cardIndex)}
					onSwipedLeft={(cardIndex) => console.log("Swiped left:", cardIndex)}
					onSwipedRight={(cardIndex) => console.log("Swiped right:", cardIndex)}
					infinite // Loop through cards
					backgroundColor={"transparent"}
					cardVerticalMargin={80}
					stackSize={3} // Number of cards shown in stack
				/> */}
			</View>
			<View style={styles.containerBackButton}>
				<TouchableOpacity onPress={handlePress} style={styles.backButton}>
					<Text style={styles.textBackButton}>Quitter</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	container: {
		flex: 1,
		backgroundColor: "#f2f2f2",
	},
	containerBackButton: {
		position: "absolute",
		bottom: 60,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	backButton: {
		paddingHorizontal: 50,
		paddingVertical: 20,
		borderRadius: 50,
		backgroundColor: colorWhite,
	},
	textBackButton: {
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});

export default Jeu;
