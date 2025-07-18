// File: src/components/SecretsDetails.tsx
import SecretCard from "@/components/cards/SecretCard";
import TitleCard from "@/components/cards/SecretTitle";
import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useGetSecretById from "@/hooks/Secrets/useGetSecretById";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
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

// Layout constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_MARGIN = Math.floor((SCREEN_WIDTH - CARD_WIDTH) / 2.6);
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

const AnimatedCard = ({
	item,
	index,
	scrollX,
}: {
	item: any;
	index: number;
	scrollX: Animated.SharedValue<number>;
}) => {
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

	// wrap each card so we can give it width + spacing
	const wrapperStyle = {
		width: CARD_WIDTH,
		marginRight: CARD_MARGIN * 2,
		alignItems: "center" as const,
		justifyContent: "center" as const,
	};

	if (item.type === "TitleCard") {
		return (
			<Animated.View style={[animatedStyle, wrapperStyle]}>
				<TitleCard
					cardWidth={CARD_WIDTH}
					title={item.title}
					screenWidth={SCREEN_WIDTH}
				/>
			</Animated.View>
		);
	}

	return (
		<Animated.View style={[animatedStyle, wrapperStyle]}>
			<SecretCard
				key={item.index}
				title={item.title}
				text={item.text}
				cardWidth={CARD_WIDTH}
				index={item.index}
				cardMargin={CARD_MARGIN}
			/>
		</Animated.View>
	);
};

interface SecretsDetailsProps {
	itemId: number;
}

export default function SecretsDetails({ itemId }: SecretsDetailsProps) {
	const { isAndroid } = useDeviceTypeCheckers();
	const { itemId: paramId } = useLocalSearchParams();
	const secretsId = paramId ? Number(paramId) : itemId;

	const { data: secretsData, isFetched } = useGetSecretById(secretsId);

	// track scroll offset
	const scrollX = useSharedValue(0);
	const scrollHandler = useAnimatedScrollHandler((e) => {
		scrollX.value = e.contentOffset.x;
	});

	// for our little peek animation
	const listRef = useRef<Animated.FlatList<any>>(null);
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

	if (!secretsData || !isFetched) {
		return <Loader />;
	}

	const { Title, ...keys } = secretsData.data.attributes;
	const cardsData = [
		{ type: "TitleCard", title: Title },
		...Object.keys(keys)
			.filter((key) => key.startsWith("Key"))
			.map((key, index) => {
				const [title, text] = keys[key].split(/\r?\n/, 2);
				return { type: "SecretCard", title, text, index };
			}),
	];

	return (
		<View style={[styles.cardsWrapper, { paddingTop: isAndroid ? 40 : 20 }]}>
			<View style={styles.header}>
				<Text style={styles.headerText}>3 Secrets du Succès</Text>
			</View>

			<Animated.FlatList
				ref={listRef}
				data={cardsData}
				horizontal
				renderItem={({ item, index }) => (
					<AnimatedCard item={item} index={index} scrollX={scrollX} />
				)}
				keyExtractor={(item, index) => `${item.type}-${index}`}
				showsHorizontalScrollIndicator={false}
				decelerationRate='fast'
				snapToInterval={SNAP_INTERVAL}
				snapToAlignment='start'
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				contentContainerStyle={{
					paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
				}}
				bounces
				alwaysBounceHorizontal
				overScrollMode='always'
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

const styles = StyleSheet.create({
	cardsWrapper: {
		flexShrink: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colorWhite,
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
