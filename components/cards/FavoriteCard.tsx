import { colorBlack, colorWhite } from "@/constants/colors";
import { ReactNode } from "react";
import {
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	View,
} from "react-native";

interface Props {
	title: string;
	titleStyle?: StyleProp<TextStyle>;
	icons?: ReactNode;
	onPress: () => void;
}

/**
 * Shared shell for favorite cards (citations, dico, metiers, questions):
 * white rounded card with an icons row, a truncated title and a "Voir" button.
 */
export default function FavoriteCard({
	title,
	titleStyle,
	icons,
	onPress,
}: Props) {
	return (
		<View style={styles.wrapper}>
			<TouchableOpacity onPress={onPress}>
				<View style={styles.cardContainer}>
					<View style={styles.cardIcons}>{icons}</View>
					<View style={styles.cardRowContent}>
						<View style={{ flexShrink: 1 }}>
							<Text style={titleStyle}>{title}</Text>
						</View>
						<View style={styles.button}>
							<Text style={{ color: colorWhite }}>Voir</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}

export const favoriteCardStyles = StyleSheet.create({
	icon: {
		marginRight: 5,
		width: 24,
		height: 24,
		borderRadius: 50,
		resizeMode: "contain",
	},
});

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colorWhite,
		borderRadius: 15,
		marginBottom: 15,
		overflow: "hidden",
	},
	cardContainer: {
		flexDirection: "column",
		justifyContent: "space-between",
		padding: 15,
	},
	cardIcons: {
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingRight: 10,
		paddingBottom: 10,
	},
	cardRowContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	button: {
		justifyContent: "center",
		marginLeft: 20,
		backgroundColor: colorBlack,
		paddingHorizontal: 15,
		paddingVertical: 4,
		borderRadius: 50,
	},
});
