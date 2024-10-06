import SmallCategroieIconsNoImage from "@/components/icons/SmallCategroieIconsNoImage";
import {
	colorBlack,
	colorGreen,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { GameSessionAttributes } from "@/types/game";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	id: number;
	data: GameSessionAttributes;
	postGame: boolean;
	userAnswer?: boolean;
}

export default function AnswersCard({ id, data, postGame, userAnswer }: Props) {
	const navigation = useNavigation<NavigationType>();

	// Navigate to the answersDetails screen
	const handlePress = () => {
		navigation.navigate("answersDetails", {
			questionId: id,
			postGame,
		});
	};

	return (
		<TouchableOpacity
			style={[
				styles.cardWrapper,
				{
					borderLeftWidth: postGame ? 0 : 10,
					borderColor: userAnswer ? colorGreen : colorPink,
				},
			]}
			onPress={handlePress}>
			<Text>{data.QUESTION}</Text>
			<View style={styles.containerIcons}>
				{data.CATEGORIE !== undefined && data.CATEGORIE !== null
					? String(data.CATEGORIE)
							.split(",")
							.map((cat, index) => {
								const categoryNumber = parseInt(cat, 10);
								return (
									<View key={index} style={{ marginRight: 8 }}>
										<SmallCategroieIconsNoImage
											key={categoryNumber}
											cats={categoryNumber}
										/>
									</View>
								);
							})
					: ""}
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		minWidth: "100%",
		marginBottom: 30,
		borderRadius: 15,
		padding: 15,
		backgroundColor: colorWhite,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	cardContentWrapper: {
		position: "relative",
		flexDirection: "column",
	},
	containerIcons: {
		flexDirection: "row",
		marginTop: 15,
	},
});
