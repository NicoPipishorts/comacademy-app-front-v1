import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Animated,
	Dimensions,
	PanResponder,
	PanResponderGestureState,
	StyleProp,
	StyleSheet,
	Text,
	View,
	ViewStyle,
} from "react-native";

interface OverlayLabels {
	left?: string;
	right?: string;
}

export interface DeckSwiperHandle {
	swipeLeft: () => void;
	swipeRight: () => void;
}

interface DeckSwiperProps<T> {
	data: T[];
	renderCard: (item: T, index: number, isTopCard: boolean) => React.ReactNode;
	onSwipeLeft?: (index: number) => void;
	onSwipeRight?: (index: number) => void;
	onSwipedAll?: () => void;
	stackDepth?: number;
	stackSeparation?: number;
	scaleStep?: number;
	cardStyle?: StyleProp<ViewStyle>;
	containerStyle?: StyleProp<ViewStyle>;
	overlayLabels?: OverlayLabels;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const OFFSCREEN_DISTANCE = SCREEN_WIDTH * 1.2;

function DeckSwiperInner<T>(
	{
		data,
		renderCard,
		onSwipeLeft,
		onSwipeRight,
		onSwipedAll,
		stackDepth = 4,
		stackSeparation = 18,
		scaleStep = 0.04,
		cardStyle,
		containerStyle,
		overlayLabels,
	}: DeckSwiperProps<T>,
	ref: React.Ref<DeckSwiperHandle>
) {
	const position = useRef(new Animated.ValueXY()).current;
	const [currentIndex, setCurrentIndex] = useState(0);
	const isAnimating = useRef(false);

	useEffect(() => {
		setCurrentIndex(0);
		position.setValue({ x: 0, y: 0 });
	}, [data, position]);

	const resetPosition = useCallback(() => {
		Animated.spring(position, {
			toValue: { x: 0, y: 0 },
			friction: 6,
			tension: 50,
			useNativeDriver: true,
		}).start();
	}, [position]);

	const onSwipeComplete = useCallback(
		(direction: "left" | "right") => {
			const index = currentIndex;
			setCurrentIndex((prev) => prev + 1);
			position.setValue({ x: 0, y: 0 });
			isAnimating.current = false;

			if (direction === "left") {
				onSwipeLeft?.(index);
			} else {
				onSwipeRight?.(index);
			}

			if (index + 1 >= data.length) {
				onSwipedAll?.();
			}
		},
		[data.length, currentIndex, onSwipeLeft, onSwipeRight, onSwipedAll, position]
	);

	const forceSwipe = useCallback(
		(direction: "left" | "right", velocityY = 0) => {
			if (isAnimating.current || currentIndex >= data.length) return;
			isAnimating.current = true;

			const toValue = {
				x: direction === "right" ? OFFSCREEN_DISTANCE : -OFFSCREEN_DISTANCE,
				y: velocityY,
			};

			Animated.timing(position, {
				toValue,
				duration: 220,
				useNativeDriver: true,
			}).start(() => onSwipeComplete(direction));
		},
		[currentIndex, data.length, onSwipeComplete, position]
	);

	const handleRelease = useCallback(
		(gesture: PanResponderGestureState) => {
			const { dx, vx, dy } = gesture;
			if (dx > SWIPE_THRESHOLD || vx > 0.9) {
				forceSwipe("right", dy);
			} else if (dx < -SWIPE_THRESHOLD || vx < -0.9) {
				forceSwipe("left", dy);
			} else {
				resetPosition();
			}
		},
		[forceSwipe, resetPosition]
	);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onPanResponderMove: (_, gesture) => {
					if (isAnimating.current) return;
					position.setValue({ x: gesture.dx, y: gesture.dy });
				},
				onPanResponderRelease: (_, gesture) => {
					if (isAnimating.current) return;
					handleRelease(gesture);
				},
			}),
		[handleRelease, position]
	);

	useImperativeHandle(
		ref,
		() => ({
			swipeLeft: () => forceSwipe("left"),
			swipeRight: () => forceSwipe("right"),
		}),
		[forceSwipe]
	);

	const rotate = position.x.interpolate({
		inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
		outputRange: ["-18deg", "0deg", "18deg"],
	});

	const cardStyleAnimated = {
		transform: [
			{ translateX: position.x },
			{ translateY: position.y },
			{ rotate },
		],
	};

	const likeOpacity = position.x.interpolate({
		inputRange: [SCREEN_WIDTH * 0.1, SCREEN_WIDTH * 0.4],
		outputRange: [0, 1],
		extrapolate: "clamp",
	});

	const nopeOpacity = position.x.interpolate({
		inputRange: [-SCREEN_WIDTH * 0.4, -SCREEN_WIDTH * 0.1],
		outputRange: [1, 0],
		extrapolate: "clamp",
	});

	const cardsToRender = useMemo(() => {
		return data
			.slice(currentIndex, currentIndex + stackDepth)
			.map((item, idx) => ({
				item,
				index: currentIndex + idx,
				position: idx,
			}))
			.reverse();
	}, [currentIndex, data, stackDepth]);

	if (!data.length || currentIndex >= data.length) {
		return <View style={[styles.container, containerStyle]} />;
	}

	return (
		<View style={[styles.container, containerStyle]}>
			{cardsToRender.map(({ item, index, position: stackPosition }) => {
				const isTopCard = stackPosition === 0;
				const translateY = stackPosition * stackSeparation;
				const scale = 1 - stackPosition * scaleStep;

				const style = isTopCard
					? [styles.card, cardStyleAnimated, cardStyle]
					: [
						styles.card,
						{
							transform: [
								{ translateY },
								{ scale },
							],
							zIndex: -stackPosition,
						},
						cardStyle,
					];

				return (
					<Animated.View
						key={index}
						style={style}
						{...(isTopCard ? panResponder.panHandlers : undefined)}>
						{isTopCard && (
							<>
								{overlayLabels?.right && (
									<Animated.View
										style={[
											styles.overlayLabel,
											styles.overlayRight,
											{ opacity: likeOpacity },
										]}>
										<Text style={styles.overlayText}>{overlayLabels.right}</Text>
									</Animated.View>
								)}
								{overlayLabels?.left && (
									<Animated.View
										style={[
											styles.overlayLabel,
											styles.overlayLeft,
											{ opacity: nopeOpacity },
										]}>
										<Text style={styles.overlayText}>{overlayLabels.left}</Text>
									</Animated.View>
								)}
							</>
						)}
						{renderCard(item, index, isTopCard)}
					</Animated.View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	card: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	overlayLabel: {
		position: "absolute",
		top: 30,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
	},
	overlayLeft: {
		left: 24,
	},
	overlayRight: {
		right: 24,
	},
	overlayText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export const DeckSwiper = forwardRef(DeckSwiperInner) as <T>(
	props: DeckSwiperProps<T> & { ref?: React.Ref<DeckSwiperHandle> }
) => ReturnType<typeof DeckSwiperInner>;

export default DeckSwiper;
