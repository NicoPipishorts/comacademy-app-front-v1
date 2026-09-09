import { colorPurple, colorWhite, primaryBackground } from "@/constants/colors";
import { useAssets } from "expo-asset";
import React, { useState } from "react";
import {
	Dimensions,
	Image,
	LayoutChangeEvent,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Figma artboard the slides were exported from.
const ARTBOARD_WIDTH = 390;
const ARTBOARD_HEIGHT = 844;
// Breathing room at the top of the bottom-anchored slides. Capped by the tightest
// artboard: slides 2 and 5 keep only 18.3pt of white under their caption (x1.031
// at 100% width), so anything past 18pt starts hiding caption text behind the
// breadcrumb strip. Raising the strip does not buy room - the artwork hangs from
// it, so both move together.
const SLIDE_DROP = 18;

const slideSources = [
	require("@/assets/imgs/onboarding/v2/Screen1.svg"),
	require("@/assets/imgs/onboarding/v2/Screen2.svg"),
	require("@/assets/imgs/onboarding/v2/Screen3.svg"),
	require("@/assets/imgs/onboarding/v2/Screen4.svg"),
	require("@/assets/imgs/onboarding/v2/Screen5.svg"),
	require("@/assets/imgs/onboarding/v2/Screen6.svg"),
	require("@/assets/imgs/onboarding/v2/Screen7.svg"),
	require("@/assets/imgs/onboarding/v2/Screen8.svg"),
];

const OnboardingV1 = ({ onComplete }: { onComplete?: () => void }) => {
	const insets = useSafeAreaInsets();
	const [assets] = useAssets(slideSources);
	const [areaHeight, setAreaHeight] = useState(0);
	const [currentSlide, setCurrentSlide] = useState(0);

	// Every artboard but the first keeps ~130pt of empty space above its content,
	// which already clears the status bar. Slide 1's logo sits at 49pt, so it needs
	// a nudge down or the Dynamic Island eats it.
	const firstSlideShift = Math.max(0, insets.top - 38);

	// Artwork always renders at 100% of the screen width - never shrunk to fit.
	// What does not fit vertically is cropped, and each slide picks which end.
	const scale = SCREEN_WIDTH / ARTBOARD_WIDTH;
	const artWidth = SCREEN_WIDTH;
	const artHeight = ARTBOARD_HEIGHT * scale;
	// Slides 2-8 carry ~130pt of dead space above their content, so they hang from
	// the bottom: the overflow is cropped off the top and their caption lands just
	// above the breadcrumbs. Slide 1's logo sits at 49pt, so it is anchored to the
	// top instead and pushed down clear of the Dynamic Island.
	const bottomAlignedTop = Math.min(0, areaHeight - artHeight + SLIDE_DROP);

	// Animated style for the "Finish" button
	const finishButtonStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX:
						currentSlide === slideSources.length - 1
							? withTiming(0, { duration: 500 }) // Slide in when on the last slide
							: withTiming(SCREEN_WIDTH, { duration: 500 }), // Slide out otherwise
				},
			],
		};
	});

	const handleAreaLayout = (event: LayoutChangeEvent) => {
		setAreaHeight(event.nativeEvent.layout.height);
	};

	const renderSlide = ({ item, index }) => {
		const uri = item?.localUri ?? item?.uri;
		const top = index === 0 ? firstSlideShift : bottomAlignedTop;

		return (
			<View style={[styles.slide, { width: SCREEN_WIDTH }]}>
				{uri && areaHeight > 0 ? (
					<SvgUri
						uri={uri}
						width={artWidth}
						height={artHeight}
						style={{ position: "absolute", left: 0, top }}
					/>
				) : null}
			</View>
		);
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<Animated.View style={[finishButtonStyle, { zIndex: 10 }]}>
					<TouchableOpacity onPress={onComplete} style={styles.finishedButton}>
						<Image
							source={require("@/assets/imgs/icons/arrow-onboarding.png")}
							style={{ width: 45, height: 25 }}
						/>
					</TouchableOpacity>
				</Animated.View>
				<View style={styles.list} onLayout={handleAreaLayout}>
					<FlatList
						data={assets ?? []}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						keyboardShouldPersistTaps='handled' // Important for tap handling
						renderItem={renderSlide}
						keyExtractor={(item, index) => String(index)}
						onScroll={(e) => {
							const scrollPosition = e.nativeEvent.contentOffset.x;
							const slideIndex = Math.round(scrollPosition / SCREEN_WIDTH);
							setCurrentSlide(slideIndex);
						}}
						scrollEventThrottle={16}
						getItemLayout={(data, index) => ({
							length: SCREEN_WIDTH,
							offset: SCREEN_WIDTH * index,
							index,
						})}
					/>
				</View>
				{/* Breadcrumbs sit in the flow, so the artwork stops just above them
				    instead of being overlaid by them. */}
				<View
					style={[
						styles.breadcrumbs,
						{
							paddingBottom: insets.bottom + 12,
							// Slides 2-8 end on a full-width white card, so the strip
							// continues it to the bottom edge. Slide 1 has no card - its
							// artwork is transparent down there and shows the grey canvas.
							backgroundColor:
								currentSlide === 0 ? primaryBackground : colorWhite,
						},
					]}>
					{slideSources.map((_, index) => (
						<View
							key={index}
							style={[
								styles.breadcrumb,
								currentSlide === index && styles.activeBreadcrumb,
							]}
						/>
					))}
				</View>
			</View>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	list: {
		flex: 1,
	},
	slide: {
		overflow: "hidden",
	},
	finishedButton: {
		position: "absolute",
		top: 60,
		right: 25,
		backgroundColor: colorPurple,
		paddingVertical: 6,
		paddingHorizontal: 20,
		borderRadius: 50,
		zIndex: 100,
		elevation: 10,
	},
	breadcrumbs: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 12,
		// The artwork's bottom edge lands on a fractional point value, which leaves
		// a hairline of canvas showing through; overlap it by 1pt.
		marginTop: -1,
	},
	breadcrumb: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#ccc",
		marginHorizontal: 5,
	},
	activeBreadcrumb: {
		backgroundColor: "#000",
	},
});

export default OnboardingV1;
