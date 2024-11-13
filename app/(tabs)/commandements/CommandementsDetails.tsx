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
				<CommandementTitleCard
					cardMargin={cardMargin}
					cardWidth={cardWidth}
					theme={item.theme}
					screenWidth={screenWidth}
				/>
			</Animated.View>
		);
	}
	if (item.type === "CommandementCard") {
		return (
			<Animated.View style={[animatedStyle]}>
				<CommandementCard
					key={item.index}
					index={item.index}
					title={item.title}
					text={item.text}
					cardWidth={cardWidth}
					cardMargin={cardMargin}
				/>
			</Animated.View>
		);
	}
	return null;
};

export default function CommandementsDetails() {
	const { data } = useCommandements();
	const { itemId } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();

	// Screen and layout calculations
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = screenWidth * 0.8; // 80% of screen width for the card
	const cardMargin = Math.floor((screenWidth - cardWidth) / 3); // Adjust the margin for smoother centering

	const commandementId = Number(itemId);

	// Shared value to keep track of the scroll position
	const scrollX = useSharedValue(0);

	// Use hooks outside of conditions
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	// Get the current commandement based on the itemId
	const commandementData = useMemo(
		() => data.data.filter(({ id }) => id === commandementId),
		[data, commandementId]
	);

	// Early return in case of no data found (make sure hooks are already defined)
	if (!commandementData.length) return null;

	const { Theme, ...commandements } = commandementData[0].attributes;

	// Prepare the data for FlatList
	const cardsData = [
		{ type: "TitleCard", theme: Theme },
		...Object.keys(commandements)
			.filter((key) => key.startsWith("Astuce_"))
			.map((key, index) => {
				const astuceValue = commandements[key];
				if (!astuceValue) return null;
				const [title, text] = astuceValue.split(/\r?\n/, 2); // Split at the first line break
				return { type: "CommandementCard", title, text, index };
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
				<Text style={styles.headerText}>10 Commandements</Text>
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
	flatListWrapper: {
		alignItems: "center",
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
