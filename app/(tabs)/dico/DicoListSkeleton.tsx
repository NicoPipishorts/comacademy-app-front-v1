import { colorGrey, searchbarBackground } from "@/constants/colors";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

type Props = {
	lines?: number;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

const DicoListSkeleton = ({ lines = 18 }: Props) => {
	const placeholders = Array.from({ length: lines });
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const shimmer = Animated.loop(
			Animated.sequence([
				Animated.timing(shimmerAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(shimmerAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		);
		shimmer.start();
		return () => shimmer.stop();
	}, [shimmerAnim]);

	const shimmerOpacity = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.5, 1],
	});

	return (
		<>
			<View style={styles.contentContainer}>
				<ScrollView
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}>
					{placeholders.map((_, index) => (
						<Animated.View
							key={index}
							style={[
								styles.lineSkeleton,
								index % 4 === 0 ? styles.shortLine : undefined,
								{ opacity: shimmerOpacity },
							]}
						/>
					))}
				</ScrollView>
				<View style={styles.sidebar}>
					{alphabet.map((letter) => (
						<Animated.View
							key={letter}
							style={[styles.sidebarDot, { opacity: shimmerOpacity }]}
						/>
					))}
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	searchContainer: {
		paddingTop: 30,
	},
	searchSkeleton: {
		height: 48,
		borderRadius: 12,
		backgroundColor: searchbarBackground,
	},
	contentContainer: {
		flexDirection: "row",
		flex: 1,
		marginTop: 50,
		marginBottom: 80,
	},
	listWrapper: {
		flex: 1,
	},
	listContainer: {
		paddingBottom: 80,
	},
	lineSkeleton: {
		width: "100%",
		height: 20,
		borderRadius: 10,
		marginBottom: 16,
		backgroundColor: colorGrey,
	},
	shortLine: {
		width: "70%",
	},
	sidebar: {
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	sidebarDot: {
		width: 9,
		height: 9,
		borderRadius: 5,
		backgroundColor: colorGrey,
		marginVertical: 4,
	},
});

export default DicoListSkeleton;
