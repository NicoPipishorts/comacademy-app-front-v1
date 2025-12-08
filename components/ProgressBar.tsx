import { colorBlack, colorLightGrey, colorWhite } from "@/constants/colors";
import { FontSizeH1, FontSizeH3 } from "@/constants/fontsizes";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { ScoreByCategory } from "@/hooks/useGetUsersScore";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import SmallCategroieIcons from "./icons/SmallCategroieIcons";

interface Props {
	categoriesScore: Record<number, ScoreByCategory>;
	title: string;
	shadowOpacity: number;
	totalPoints?: number;
}

const ProgressBar = ({ progression, backgroundColor }) => {
	const animatedHeight = useSharedValue(0);

	// Animate the height when the progression changes
	useEffect(() => {
		animatedHeight.value = withTiming(progression, { duration: 1000 });
	}, [animatedHeight, progression]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			height: `${animatedHeight.value}%`,
		};
	});

	return (
		<View style={styles.wrapperProgressBar}>
			<Animated.View
				style={[
					styles.contentProgressBar,
					{
						backgroundColor: `#${backgroundColor}`,
					},
					animatedStyle,
				]}
			/>
		</View>
	);
};

export default function StatsBar({
	categoriesScore,
	title,
	shadowOpacity,
	totalPoints,
}: Props) {
	const { data: categories } = useCategoriesFull();

	if (!categories || !categories.data) {
		return null;
	}

	return (
		<View
			style={[
				styles.wrapper,
				{
					shadowOpacity: shadowOpacity,
				},
			]}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "flex-end",
					padding: 20,
					paddingBottom: 40,
				}}>
				<Text style={styles.headerText}>{title}</Text>
				<Text style={styles.scoreText}>Ton score: {totalPoints}</Text>
			</View>
			<View style={styles.containerProgressBars}>
				{categories.data.map((cat, index) => {
					const categoryScore = categoriesScore?.[cat.id];
					const progression = Math.round(
						categoryScore?.percentageCorrect ?? 0
					);

					return (
						<View
							key={cat.id}
							style={{
								flexDirection: "column",
								alignItems: "center",
							}}>
							<ProgressBar
								progression={progression}
								backgroundColor={cat.attributes.backgroundColor}
							/>
							<View
								style={{
									display: "flex",
									paddingTop: 20,
									alignItems: "center",
									justifyContent: "center",
									alignContent: "center",
								}}>
								<SmallCategroieIcons key={cat.id} cats={cat.id} />
							</View>
						</View>
					);
				})}
			</View>

			<View style={styles.cardsWrapper}>
				{categories.data.map((cat, index) => {
					const categoryScore = categoriesScore?.[cat.id];
					const progression = Math.round(
						categoryScore?.percentageCorrect ?? 0
					);

					return (
						<View
							key={cat.id}
							style={[
								styles.cardContainer,
								{
									backgroundColor: `#${cat.attributes.backgroundColor}`,
								},
							]}>
							<View>
								<Text style={styles.cardText}>{cat.attributes.Title}</Text>
							</View>
							<View style={styles.containerScore}>
								<Text style={styles.textScore}>{Math.round(progression)}</Text>
								<Text style={styles.textPercentage}>%</Text>
							</View>
						</View>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		borderRadius: 20,
		backgroundColor: colorWhite,
		paddingBottom: 20,
		marginBottom: 30,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 20,
	},
	headerText: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	scoreText: {
		fontSize: FontSizeH3,
		fontWeight: "bold",
	},
	containerProgressBars: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-evenly",
	},
	wrapperProgressBar: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end",
		alignItems: "flex-end",
		overflow: "hidden",
		width: 15,
		height: 160,
		borderRadius: 5,
		backgroundColor: colorLightGrey,
	},
	contentProgressBar: {
		width: "100%",
		borderRadius: 5,
	},

	cardsWrapper: {
		marginTop: 50,
		flexDirection: "row",
		justifyContent: "space-evenly",
		flexWrap: "wrap",
	},
	cardContainer: {
		justifyContent: "flex-start",
		alignItems: "flex-start",
		width: "28%",
		maxWidth: "28%",
		borderRadius: 10,
		padding: 8,
		marginBottom: 10,
	},
	cardText: {
		color: colorWhite,
		fontSize: 12,
		fontWeight: "bold",
	},
	containerScore: {
		flexDirection: "row",
		width: "100%",
		alignItems: "flex-end",
		justifyContent: "center",
		marginTop: 10,
	},
	textScore: {
		color: colorWhite,
		fontSize: 40,
		fontWeight: "bold",
		letterSpacing: -2,
	},
	textPercentage: {
		color: colorWhite,
		fontSize: 14,
		fontWeight: "bold",
		paddingBottom: 6,
	},
});
