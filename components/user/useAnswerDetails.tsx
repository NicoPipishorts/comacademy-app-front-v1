import {
	colorBlack,
	colorGreen,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { truncateString } from "@/helpers/truncateText";
import { CategoriePayload } from "@/types/categories";
import { GameSessionQuestion } from "@/types/game";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	categories: CategoriePayload;
	answer: GameSessionQuestion;
}

export default function UserAnswerDetails({ categories, answer }: Props) {
	return (
		<>
			<TouchableOpacity
				style={[
					styles.cardWrapper,
					{
						borderColor: answer.attributes.answer ? colorGreen : colorPink,
					},
				]}>
				<View style={styles.cardContentWrapper}>
					<Text>
						{truncateString(
							answer.attributes.questionId.data.attributes.QUESTION,
							100
						)}
					</Text>
				</View>
				<View style={styles.cardButtonWrapper}>
					<View style={styles.cardButton}>
						<Text style={{ color: colorWhite }}>voir</Text>
					</View>
				</View>

				{/* Place the icon here */}
				<View style={styles.iconWrapper}>
					<Image
						source={{
							uri: `${process.env.EXPO_PUBLIC_URL}${
								categories.data[answer.attributes.categorie].attributes
									.smallIcon.data.attributes.url
							}`,
						}}
						style={[
							styles.icon,
							{
								backgroundColor: `#${
									categories.data[answer.attributes.categorie].attributes
										.backgroundColor
								}`,
							},
						]}
					/>
				</View>
			</TouchableOpacity>
		</>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		position: "relative",
		flexDirection: "row",
		borderRadius: 15,
		padding: 15,
		backgroundColor: colorWhite,
		borderLeftWidth: 10,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	cardContentWrapper: {
		position: "relative",
		width: "84%",
		paddingBottom: 15,
		flexDirection: "column",
	},
	cardButtonWrapper: {
		width: "100%",
		alignItems: "flex-end",
		position: "absolute",
		bottom: 10,
		right: 10,
	},
	cardButton: {
		backgroundColor: colorBlack,
		borderRadius: 50,
		paddingHorizontal: 15,
		paddingVertical: 4,
	},
	iconWrapper: {
		position: "absolute",
		top: 10,
		right: 10,
		width: 24,
		height: 24,
		borderRadius: 50,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 5,
	},
	icon: {
		width: 24,
		height: 24,
		borderRadius: 50,
	},
});
