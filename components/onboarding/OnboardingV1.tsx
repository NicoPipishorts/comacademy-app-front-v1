import { colorPurple, primaryBackground } from "@/constants/colors";
import React, { useState } from "react";
import {
	Dimensions,
	Image,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_VERTICAL_OFFSET = 20;

const OnboardingV1 = ({ onComplete }: { onComplete?: () => void }) => {
	const slides = [
		{ id: "1", image: require("@/assets/imgs/onboarding/v1/Screen1.png") },
		{ id: "2", image: require("@/assets/imgs/onboarding/v1/Screen2.png") },
		{ id: "3", image: require("@/assets/imgs/onboarding/v1/Screen3.png") },
		{ id: "4", image: require("@/assets/imgs/onboarding/v1/Screen4.png") },
	];

	const [currentSlide, setCurrentSlide] = useState(0);

	// Animated style for the "Finish" button
	const finishButtonStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX:
						currentSlide === slides.length - 1
							? withTiming(0, { duration: 500 }) // Slide in when on the last slide
							: withTiming(SCREEN_WIDTH, { duration: 500 }), // Slide out otherwise
				},
			],
		};
	});

	const renderSlide = ({ item }) => (
		<View
			style={[styles.slide, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
			<Image
				source={item.image}
				style={styles.slideImage}
				resizeMode='cover'
			/>
		</View>
	);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<Animated.View
					style={[
						finishButtonStyle,
						{ backgroundColor: "rgba(255, 0, 0, 0.2)", zIndex: 10 },
					]}>
					<TouchableOpacity onPress={onComplete} style={styles.finishedButton}>
						{/* <Text style={styles.finishedButtonText}>Entrer</Text> */}
						<Image
							source={require("@/assets/imgs/icons/arrow-onboarding.png")}
							style={{ width: 45, height: 25 }}
						/>
					</TouchableOpacity>
				</Animated.View>
				<FlatList
					data={slides}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					keyboardShouldPersistTaps='handled' // Important for tap handling
					renderItem={renderSlide}
					keyExtractor={(item) => item.id}
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
				{/* Breadcrumbs */}
				<View style={styles.breadcrumbs}>
					{slides.map((_, index) => (
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
	slide: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
	},
	slideImage: {
		position: "absolute",
		top: -IMAGE_VERTICAL_OFFSET,
		left: 0,
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT + IMAGE_VERTICAL_OFFSET,
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
	finishedButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	breadcrumbs: {
		flexDirection: "row",
		justifyContent: "center",
		padding: 10,
		position: "absolute",
		bottom: 20,
		width: SCREEN_WIDTH,
	},
	breadcrumb: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#ccc",
		margin: 5,
	},
	activeBreadcrumb: {
		backgroundColor: "#000",
	},
});

export default OnboardingV1;
