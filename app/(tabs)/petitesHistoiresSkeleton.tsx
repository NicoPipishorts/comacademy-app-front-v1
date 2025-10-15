import { colorGrey } from "@/constants/colors";
import React, { useEffect, useRef } from "react";
import {
	Animated,
	Dimensions,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";

type Props = {
	paddingTop?: number;
};

const PetitesHistoiresSkeleton = ({ paddingTop = 0 }: Props) => {
	const { width } = Dimensions.get("window");
	const cardWidth = Math.floor(width * 0.8);
	const cardHeight = Math.floor((cardWidth / 9) * 16);

	const placeholders = Array.from({ length: 4 });
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const shimmer = Animated.loop(
			Animated.sequence([
				Animated.timing(shimmerAnim, {
					toValue: 1,
					duration: 500,
					useNativeDriver: true,
				}),
				Animated.timing(shimmerAnim, {
					toValue: 0,
					duration: 500,
					useNativeDriver: true,
				}),
			])
		);
		shimmer.start();
		return () => shimmer.stop();
	}, [shimmerAnim]);

	const shimmerOpacity = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.3, 1],
	});

	return (
		<View style={[styles.wrapper, { paddingTop }]}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.contentPadding}
				style={styles.list}>
				{placeholders.map((_, index) => (
					<Animated.View
						key={index}
						style={[
							styles.cardSkeleton,
							{ width: cardWidth, height: cardHeight, opacity: shimmerOpacity },
						]}
					/>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},

	headerSkeleton: {
		width: 220,
		height: 32,
		borderRadius: 8,
		backgroundColor: colorGrey,
	},
	list: {
		marginTop: 30,
		paddingHorizontal: 30,
	},
	contentPadding: {
		paddingRight: 25,
	},
	cardSkeleton: {
		marginLeft: 10,
		marginRight: 24,
		borderRadius: 10,
		backgroundColor: colorGrey,
	},
});

export default PetitesHistoiresSkeleton;
