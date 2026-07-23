import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as Haptics from "expo-haptics";
import {
	Animated,
	Dimensions,
	PanResponder,
	Platform,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { colorBlack, colorWhite } from "@/constants/colors";
import Card from "@/components/leJeu/Card";
import { CategorieColors } from "@/types/categories";
import { QuestionData } from "@/types/userGameSessionStatus";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const MAX_VISIBLE_STACK_POSITION = 4;
const STACK_CARD_OFFSET = 18;
const STACK_CARD_SCALE_STEP = 0.04;
const STACK_VERTICAL_OFFSET = -44;

type SwipeableCardProps = {
	data: QuestionData;
	catColors: CategorieColors;
	stackPosition: number;
	isTopCard: boolean;
	onSwipe: (isRight: boolean) => void;
};

function SwipeableCard({
	data,
	catColors,
	stackPosition,
	isTopCard,
	onSwipe,
}: SwipeableCardProps) {
	const translateX = useRef(new Animated.Value(0)).current;
	const stackProgress = useRef(
		new Animated.Value(
			Math.min(stackPosition, MAX_VISIBLE_STACK_POSITION)
		)
	).current;
	const isSwipingRef = useRef(false);

	const rotate = useMemo(
		() =>
			translateX.interpolate({
				inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
				outputRange: ["-18deg", "0deg", "18deg"],
			}),
		[translateX]
	);

	const leftOpacity = useMemo(
		() =>
			translateX.interpolate({
				inputRange: [-SWIPE_THRESHOLD, 0],
				outputRange: [1, 0],
				extrapolate: "clamp",
			}),
		[translateX]
	);

	const rightOpacity = useMemo(
		() =>
			translateX.interpolate({
				inputRange: [0, SWIPE_THRESHOLD],
				outputRange: [0, 1],
				extrapolate: "clamp",
			}),
		[translateX]
	);

	const triggerSwipe = useCallback(
		(direction: "left" | "right") => {
			if (!isTopCard || isSwipingRef.current) return;
			isSwipingRef.current = true;
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			const toValue = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
			Animated.timing(translateX, {
				toValue,
				duration: 200,
				useNativeDriver: true,
			}).start(() => {
				onSwipe(direction === "right");
			});
		},
		[isTopCard, onSwipe, translateX]
	);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => isTopCard,
				onMoveShouldSetPanResponder: () => isTopCard,
				onPanResponderMove: Animated.event([null, { dx: translateX }], {
					useNativeDriver: false,
				}),
				onPanResponderRelease: (_, gesture) => {
					if (!isTopCard) return;
					if (
						Math.abs(gesture.dx) > SWIPE_THRESHOLD ||
						Math.abs(gesture.vx) > 0.9
					) {
						triggerSwipe(gesture.dx > 0 ? "right" : "left");
					} else {
						Animated.spring(translateX, {
							toValue: 0,
							friction: 6,
							useNativeDriver: true,
						}).start();
					}
				},
			}),
		[isTopCard, translateX, triggerSwipe]
	);

	const effectivePosition = Math.min(
		stackPosition,
		MAX_VISIBLE_STACK_POSITION
	);
	const scale = useMemo(
		() =>
			stackProgress.interpolate({
				inputRange: [0, MAX_VISIBLE_STACK_POSITION],
				outputRange: [
					1,
					1 - MAX_VISIBLE_STACK_POSITION * STACK_CARD_SCALE_STEP,
				],
				extrapolate: "clamp",
			}),
		[stackProgress]
	);
	const translateY = useMemo(
		() =>
			stackProgress.interpolate({
				inputRange: [0, MAX_VISIBLE_STACK_POSITION],
				outputRange: [
					0,
					MAX_VISIBLE_STACK_POSITION * STACK_CARD_OFFSET,
				],
				extrapolate: "clamp",
			}),
		[stackProgress]
	);

	useEffect(() => {
		Animated.spring(stackProgress, {
			toValue: effectivePosition,
			speed: 18,
			bounciness: 3,
			useNativeDriver: true,
		}).start();
	}, [effectivePosition, stackProgress]);

	useEffect(() => {
		isSwipingRef.current = false;
		if (!isTopCard) {
			translateX.setValue(0);
		}
	}, [isTopCard, translateX]);

	const transform = useMemo(() => {
		const baseTransform = [{ translateY }, { scale }];
		if (isTopCard) {
			return [{ translateX }, { rotate }, ...baseTransform];
		}
		return baseTransform;
	}, [isTopCard, rotate, scale, translateX, translateY]);

	const handleSwipeTrue = useCallback(() => {
		if (isTopCard) triggerSwipe("right");
	}, [isTopCard, triggerSwipe]);

	const handleSwipeFalse = useCallback(() => {
		if (isTopCard) triggerSwipe("left");
	}, [isTopCard, triggerSwipe]);

	return (
		<Animated.View
			style={[
				styles.cardWrapper,
				{
					transform: transform as any,
					zIndex: 100 - stackPosition,
				},
			]}
			{...(isTopCard ? panResponder.panHandlers : undefined)}>
			{isTopCard ? (
				<>
					<Animated.View
						style={[
							styles.overlayLabel,
							styles.overlayLeft,
							{ opacity: leftOpacity },
						]}>
						<Text style={styles.overlayText}>FAUX</Text>
					</Animated.View>
					<Animated.View
						style={[
							styles.overlayLabel,
							styles.overlayRight,
							{ opacity: rightOpacity },
						]}>
						<Text style={styles.overlayText}>VRAI</Text>
					</Animated.View>
				</>
			) : null}

			<View style={styles.cardContentWrapper}>
				<Card
					data={data}
					catColors={catColors}
					onSwipeFalse={handleSwipeFalse}
					onSwipeTrue={handleSwipeTrue}
					variant="parcours"
				/>
			</View>
		</Animated.View>
	);
}

export default function QuestionSwipeStack({
	questions,
	catColors,
	onSwipe,
}: {
	questions: QuestionData[];
	catColors: CategorieColors;
	onSwipe: (question: QuestionData, isRight: boolean) => void;
}) {
	return (
		<View style={styles.cardContainer}>
			{questions.map((card, idx) => {
				const stackPosition = questions.length - 1 - idx;
				const isTopCard = idx === questions.length - 1;
				return (
					<SwipeableCard
						key={card.id}
						data={card}
						catColors={catColors}
						stackPosition={stackPosition}
						isTopCard={isTopCard}
						onSwipe={(isRight) => {
							onSwipe(card, isRight);
						}}
					/>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
		transform: [{ translateY: STACK_VERTICAL_OFFSET }],
	},
	cardWrapper: {
		position: "absolute",
		width: "100%",
		height: "94%",
		borderRadius: 24,
		...Platform.select({
			ios: {
				shadowColor: "rgba(0,0,0,0.25)",
				shadowOffset: { width: 0, height: 12 },
				shadowOpacity: 0.35,
				shadowRadius: 16,
			},
			android: {
				elevation: 0,
			},
		}),
	},
	cardContentWrapper: {
		flex: 1,
		borderRadius: 24,
		overflow: Platform.OS === "android" ? "visible" : "hidden",
	},
	overlayLabel: {
		position: "absolute",
		top: -20,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: colorBlack,
		backgroundColor: colorBlack,
	},
	overlayLeft: {
		right: 40,
	},
	overlayRight: {
		left: 40,
	},
	overlayText: {
		fontSize: 24,
		fontWeight: "bold",
		color: colorWhite,
	},
});
