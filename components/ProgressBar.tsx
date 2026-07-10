import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH1, FontSizeH3 } from "@/constants/fontsizes";
import { resolveEntityAttributes } from "@/helpers/strapi";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { ScoreByCategory } from "@/hooks/useGetUsersScore";
import { CategoriesAttributes } from "@/types/categories";
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

interface ProgressBarProps {
	progression: number;
	backgroundColor?: string;
}

const sanitizeHexColor = (value?: string, fallback = "EDBE00") => {
	if (!value) {
		return fallback;
	}

	const trimmed = value.trim();
	const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

	return withoutHash || fallback;
};

const ProgressBar = ({ progression, backgroundColor }: ProgressBarProps) => {
	const animatedHeight = useSharedValue(0);

	useEffect(() => {
		animatedHeight.value = withTiming(progression, { duration: 1000 });
	}, [animatedHeight, progression]);

	const animatedStyle = useAnimatedStyle(() => ({
		height: `${animatedHeight.value}%`,
	}));

	return (
		<View style={styles.wrapperProgressBar}>
			<Animated.View
				style={[
					styles.contentProgressBar,
					{
						backgroundColor: `#${sanitizeHexColor(backgroundColor)}`,
					},
					animatedStyle,
				]}
			/>
		</View>
	);
};

const getCategoryAttributes = (cat: any): CategoriesAttributes | undefined => {
	return (
		resolveEntityAttributes<CategoriesAttributes>(cat) ??
		(cat?.attributes as CategoriesAttributes | undefined)
	);
};

export default function StatsBar({
	categoriesScore,
	title,
	shadowOpacity,
	totalPoints,
}: Props) {
	const { data: categories } = useCategoriesFull();

	if (!categories?.data?.length) {
		return null;
	}

	return (
		<View
			style={[
				styles.wrapper,
				{
					shadowOpacity,
				},
			]}>
			<View style={styles.containerProgressBars}>
				{categories.data.map((cat) => {
					const categoryScore = categoriesScore?.[cat.id];
					const progression = Math.round(categoryScore?.percentageCorrect ?? 0);
					const attrs = getCategoryAttributes(cat);

					return (
						<View
							key={cat.id}
							style={{
								flexDirection: "column",
								alignItems: "center",
							}}>
							<ProgressBar
								progression={progression}
								backgroundColor={attrs?.backgroundColor}
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
				{categories.data.map((cat) => {
					const categoryScore = categoriesScore?.[cat.id];
					const progression = Math.round(categoryScore?.percentageCorrect ?? 0);
					const attrs = getCategoryAttributes(cat);

					return (
						<View
							key={cat.id}
							style={[
								styles.cardContainer,
								{
									backgroundColor: `#${sanitizeHexColor(
										attrs?.backgroundColor,
									)}`,
								},
							]}>
							<View>
								<Text style={styles.cardText}>
									{attrs?.Title ?? attrs?.Name ?? ""}
								</Text>
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
		paddingVertical: 20,
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
		width: 23,
		height: 160,
		borderRadius: 14,
		padding: 4,
		backgroundColor: colorWhite,
	},
	contentProgressBar: {
		width: "100%",
		borderRadius: 10,
	},

	cardsWrapper: {
		marginTop: 35,
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
		fontWeight: "600",
		marginLeft: 4,
	},
});
