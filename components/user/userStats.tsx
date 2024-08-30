import ScreenHeaders from "@/components/ScreenHeaders";
import { colorBlack, colorLightGrey, colorWhite } from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import { CategorieColors } from "@/types/categories";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ResultAccumulator } from "../../app/(tabs)/user";

interface Props {
	categories: CategorieColors;
	result: ResultAccumulator;
}

export default function UserStats({ categories, result }: Props) {
	return (
		<>
			<ScreenHeaders content='Mes Stats' />
			<View style={styles.cardWrapper}>
				<View>
					<Text style={{ fontSize: FontSize16, fontWeight: "bold" }}>
						Stats
					</Text>
					<Text style={{ fontSize: FontSize22, fontWeight: "bold" }}>
						Tes résultats par catégories
					</Text>
				</View>
				<View style={styles.wrapperProgressBars}>
					{categories.data.map((cat) => {
						const barProgression = () => {
							const categoryResult = result[cat.id];
							if (!categoryResult || categoryResult.total === 0) {
								return 0; // Return 0% if there's no result or if total is 0 to avoid division by zero
							}
							return (categoryResult.trueCount / categoryResult.total) * 100;
						};

						const progression = barProgression();
						return (
							<View key={cat.id} style={styles.wrapperProgressBar}>
								<View
									style={[
										styles.contentProgressBar,
										{
											backgroundColor: `#${cat.attributes.backgroundColor}`,
											height: `${progression}%`,
										},
									]}
								/>
							</View>
						);
					})}
				</View>
				<View style={styles.cardTextContainer}>
					<Text style={styles.cardText}>
						Découvre tes résultats selon les catégories
					</Text>
					<TouchableOpacity style={styles.buttonBlack}>
						<Text style={styles.buttonText}>Voir</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: 40,
		width: "100%",
		borderRadius: 20,
		paddingHorizontal: 20,
		paddingVertical: 30,
		backgroundColor: colorWhite,
	},
	cardTextContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		maxWidth: "100%",
	},
	cardText: {
		width: "60%",
		fontSize: FontSize16,
		fontWeight: "bold",
		flexGrow: 1,
	},
	wrapperProgressBars: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 40,
		marginBottom: 60,
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
	buttonBlack: {
		backgroundColor: colorBlack,
		paddingVertical: 10,
		paddingHorizontal: 35,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
