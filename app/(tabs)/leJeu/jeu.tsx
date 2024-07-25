import Card from "@/components/leJeu/Card";
import { colorWhite, colorYellow, primaryBackground } from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { CategorieColors } from "@/types/categories";
import { GameData, GameDataPayload } from "@/types/game";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { NavigationType } from ".";

const Jeu = () => {
	const swiperRef = useRef<Swiper<GameData>>(null);
	const navigation = useNavigation<NavigationType>();

	const { hideTabBar, showTabBar } = useTabBarVisibility();

	useEffect(() => {
		hideTabBar();
	}, []);

	const { data: dataGame, isLoading } = useQuery<GameDataPayload>({
		queryKey: ["GameQuestions"],
		queryFn: () =>
			fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/questions?random=true&pagination[limit]=30`
			).then((res) => res.json()),
	});

	const { data: catData } = useQuery<CategorieColors>({
		queryKey: ["Categories"],
		queryFn: () =>
			fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/categories?fields[0]=backgroundColor&populate[smallIcon][fields][0]=url`
			).then((res) => res.json()),
	});

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={colorYellow} />
			</View>
		);
	}

	if (!dataGame || !dataGame.data) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.noDataText}>No game data available</Text>
			</View>
		);
	}

	const dataArray: GameData[] = Object.keys(dataGame.data).map(
		(key) => dataGame.data[key] as GameData
	);

	const cards = dataArray;

	const onSwipeLeft = () => {
		swiperRef.current?.swipeLeft();
	};

	const onSwipeRight = () => {
		swiperRef.current?.swipeRight();
	};

	if (!catData) return;
	const renderCard = (card: GameData) => {
		return (
			<Card
				key={card.id}
				catColors={catData}
				data={card}
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
			<Swiper
				ref={swiperRef}
				cards={cards}
				renderCard={renderCard}
				verticalSwipe={false}
				onSwipedLeft={(cardIndex) => console.log("Swiped left:", cardIndex)}
				onSwipedRight={(cardIndex) => console.log("Swiped right:", cardIndex)}
				backgroundColor={"transparent"}
				cardVerticalMargin={120}
				cardHorizontalMargin={30}
				stackSize={5}
				stackScale={5}
				stackSeparation={20}
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
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noDataText: {
		fontSize: FontSize20,
		color: colorYellow,
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
