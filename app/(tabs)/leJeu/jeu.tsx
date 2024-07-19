import Card from "@/components/leJeu/Card";
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { NavigationType } from ".";

const Jeu = () => {
	const swiperRef = useRef<Swiper<number>>(null);
	const navigation = useNavigation<NavigationType>();

	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const cards = [1, 2, 3, 4, 5];

	useEffect(() => {
		console.log("in the jeu view, hiding tabbar useEffect");
		hideTabBar();
	}, []);

	const onSwipeLeft = () => {
		console.log("Attempting to swipe left");
		swiperRef.current?.swipeLeft();
	};

	const onSwipeRight = () => {
		console.log("Attempting to swipe right");
		swiperRef.current?.swipeRight();
	};

	const renderCard = (cardIndex: number) => {
		return (
			<Card
				key={cardIndex}
				cardIndex={cardIndex}
				onSwipeLeft={onSwipeLeft}
				onSwipeRight={onSwipeRight}
			/>
		);
	};

	const handlePress = () => {
		showTabBar();
		navigation.navigate("index");
	};

	return (
		<View style={styles.wrapper}>
			{/* <Card /> */}
			<Swiper
				cards={cards}
				renderCard={renderCard}
				verticalSwipe={false}
				onSwipedLeft={(cardIndex) => console.log("Swiped left:", cardIndex)}
				onSwipedRight={(cardIndex) => console.log("Swiped right:", cardIndex)}
				infinite
				backgroundColor={"transparent"}
				cardVerticalMargin={120}
				stackSize={5}
			/>
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
