// File: src/components/CommandementsDetails.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
	Dimensions,
	ListRenderItem,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	interpolate,
	SharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

import CommandementCard from "@/components/cards/CommandementCard";
import CommandementTitleCard from "@/components/cards/CommandementTitle";
import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useGetCommandementById from "@/hooks/Commandements/useGetCommandementById";

// Layout constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 20;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

// Types
type CardType = "TitleCard" | "CommandementCard";
interface CardItem {
	type: CardType;
	title: string;
	text: string;
	index: number; // only meaningful for CommandementCard
	cta: string;
	headerCard: boolean; // flag from API
	theme: string; // overall theme
}

// Animated card component
const AnimatedCard: React.FC<{
	item: CardItem;
	index: number; // flat list position
	scrollX: SharedValue<number>;
}> = ({ item, index, scrollX }) => {
	const inputRange = [
		(index - 1) * SNAP_INTERVAL,
		index * SNAP_INTERVAL,
		(index + 1) * SNAP_INTERVAL,
	];

	const animatedStyle = useAnimatedStyle(() => {
		const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92]);
		const opacity = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7]);
		return { transform: [{ scale }], opacity };
	});

	const cardStyle = {
		width: CARD_WIDTH,
		alignItems: "center" as const,
		justifyContent: "center" as const,
		paddingHorizontal: 10,
		marginRight: CARD_SPACING,
	};

	if (item.type === "TitleCard") {
		// first card uses theme; any headerCard flag (if you ever want per-card titles) can be passed in item.title
		const textToShow = item.headerCard ? item.title : item.theme;
		return (
			<Animated.View style={[animatedStyle, cardStyle]}>
				<CommandementTitleCard
					cardMargin={0}
					cardWidth={CARD_WIDTH}
					theme={textToShow}
				/>
			</Animated.View>
		);
	}

	// CommandementCard: uses its own index (sequential, ignoring title cards)
	return (
		<Animated.View style={[animatedStyle, cardStyle]}>
			<CommandementCard
				index={item.index}
				title={item.title}
				text={item.text}
				cardWidth={CARD_WIDTH}
				cardMargin={0}
			/>
		</Animated.View>
	);
};

export default function CommandementsDetails() {
	const { itemId: paramId } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();
	const commandementId = paramId ? Number(paramId) : undefined;
	const { data: commandementData, isFetched } = useGetCommandementById(
		commandementId!
	);

	const scrollX = useSharedValue(0);
	const scrollHandler = useAnimatedScrollHandler((e) => {
		scrollX.value = e.contentOffset.x;
	});

	const listRef = useRef<Animated.FlatList<CardItem>>(null);
	useEffect(() => {
		const peek = SNAP_INTERVAL * 0.1;
		const overshoot = peek * 1.5;
		const t1 = setTimeout(() => {
			listRef.current?.scrollToOffset({ offset: overshoot, animated: true });
		}, 200);
		const t2 = setTimeout(() => {
			listRef.current?.scrollToOffset({ offset: 0, animated: true });
		}, 500);
		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	}, []);

	if (!commandementData || !isFetched) {
		return <Loader />;
	}

	const { Theme, cards } = commandementData.data.attributes;

	// Build cardsData so that only CommandementCards increment an internal counter
	let commandIndex = 0;
	const cardsData: CardItem[] = [
		{
			type: "TitleCard", // TS knows this matches CardType
			theme: Theme,
			title: "", // ignored for overall theme
			text: "",
			index: -1,
			cta: "",
			headerCard: false,
		},
		...cards.map((card) => {
			if (card.headerCard) {
				return {
					type: "TitleCard" as CardType,
					theme: Theme,
					title: card.titre,
					text: "",
					index: -1,
					cta: card.cta || "",
					headerCard: true,
				};
			} else {
				// normal cards increment their own index
				const idx = commandIndex++;
				return {
					type: "CommandementCard" as CardType,
					theme: Theme,
					title: card.titre,
					text: card.contenus,
					index: idx,
					cta: card.cta || "",
					headerCard: false,
				};
			}
		}),
	];

	const renderItem: ListRenderItem<CardItem> = ({ item, index }) => (
		<AnimatedCard item={item} index={index} scrollX={scrollX} />
	);

	return (
		<View style={[styles.container, { paddingTop: isAndroid ? 40 : 20 }]}>
			<Text style={styles.headerText}>Tips and tactics</Text>
			<Animated.FlatList
				ref={listRef}
				data={cardsData}
				horizontal
				keyExtractor={(_, i) => String(i)}
				showsHorizontalScrollIndicator={false}
				decelerationRate='fast'
				snapToInterval={SNAP_INTERVAL}
				snapToAlignment='start'
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				contentContainerStyle={{
					paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
				}}
				renderItem={renderItem}
				bounces
				alwaysBounceHorizontal
				overScrollMode='always'
			/>
			{isAndroid && (
				<TouchableOpacity style={styles.backButton}>
					<Text style={styles.backButtonText}>Retour</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		backgroundColor: colorWhite,
	},
	headerText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		marginVertical: 20,
	},
	backButton: {
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
		marginTop: 20,
	},
	backButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
