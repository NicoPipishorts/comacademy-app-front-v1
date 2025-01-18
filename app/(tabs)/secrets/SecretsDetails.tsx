import SecretCard from "@/components/cards/SecretCard";
import TitleCard from "@/components/cards/SecretTitle";
import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useGetSecretById from "@/hooks/Secrets/useGetSecretById";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

// Separate functional component to render each card
const AnimatedCard = ({
	item,
	index,
	cardWidth,
	cardMargin,
	scrollX,
	screenWidth,
}) => {
	const inputRange = [
		(index - 1) * (cardWidth + cardMargin * 2),
		index * (cardWidth + cardMargin * 2),
		(index + 1) * (cardWidth + cardMargin * 2),
	];

	// Hook to calculate animated scale
	const animatedStyle = useAnimatedStyle(() => {
		const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92]);
		return { transform: [{ scale }] };
	});

	if (item.type === "TitleCard") {
		return (
			<Animated.View style={[animatedStyle]}>
				<TitleCard
					cardWidth={cardWidth}
					title={item.title}
					screenWidth={screenWidth}
				/>
			</Animated.View>
		);
	}
	if (item.type === "SecretCard") {
		return (
			<Animated.View style={[animatedStyle]}>
				<SecretCard
					key={item.index}
					title={item.title}
					text={item.text}
					cardWidth={cardWidth}
					index={item.index}
					cardMargin={cardMargin}
				/>
			</Animated.View>
		);
	}
	return null;
};

export default function SecretsDetails() {
	const { isAndroid } = useDeviceTypeCheckers();

	const { itemId } = useLocalSearchParams();

	// Screen and layout calculations
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = screenWidth * 0.8; // 80% of the screen width
	const cardMargin = Math.floor((screenWidth - cardWidth) / 2.6); // Adjust the margin for better centering

	const secretsId = Number(itemId);

	const { data: secretsData, isFetched } = useGetSecretById(secretsId);

	// Shared value to keep track of the scroll position
	const scrollX = useSharedValue(0);

	// Use hooks outside of conditions
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	if (!secretsData || !isFetched) {
		return <Loader />;
	}

	const { Title, ...keys } = secretsData?.data.attributes;

	const cardsData = [
		{ type: "TitleCard", title: Title },
		...Object.keys(keys)
			.filter((key) => key.startsWith("Key"))
			.map((key, index) => {
				const [title, text] = keys[key].split(/\r?\n/, 2); // Split at the first line break
				return { type: "SecretCard", title, text, index };
			}),
	];

	// Render each card in FlatList
	const renderItem = ({ item, index }) => (
		<AnimatedCard
			item={item}
			index={index}
			cardWidth={cardWidth}
			cardMargin={cardMargin}
			scrollX={scrollX}
			screenWidth={screenWidth}
		/>
	);

	return (
		<View style={[styles.cardsWrapper, { paddingTop: isAndroid ? 40 : 20 }]}>
			<View style={styles.header}>
				<Text style={styles.headerText}>3 Secrets du Succès</Text>
			</View>

			<Animated.FlatList
				data={cardsData}
				horizontal
				renderItem={renderItem}
				keyExtractor={(item, index) => `${item.type}-${index}`}
				showsHorizontalScrollIndicator={false}
				decelerationRate='fast'
				snapToInterval={cardWidth + cardMargin * 2} // Ensure snapping to each card
				snapToAlignment='center'
				onScroll={scrollHandler}
				scrollEventThrottle={16}
			/>

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
