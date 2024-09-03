import { colorLightGrey } from "@/constants/colors";
import useCategories from "@/hooks/useCategories";
import { CategoryScore } from "@/hooks/useGetScore";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	categoriesScore: Record<number, CategoryScore>;
}

export default function StatsBar({ categoriesScore }: Props) {
	const { data: categories } = useCategories();

	if (!categories || !categories.data) {
		return null; // Handle the case where categories are not loaded
	}

	return (
		<View style={styles.wrapperProgressBars}>
			{categories.data.map((cat) => {
				const categoryScore = categoriesScore[cat.id];
				const progression = categoryScore ? categoryScore.percentage : 0;

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
						<Text style={styles.categoryLabel}>
							{`${cat.attributes.name}: ${progression}%`}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
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
		alignItems: "center",
		overflow: "hidden",
		width: 40,
		height: 160,
		borderRadius: 5,
		backgroundColor: colorLightGrey,
		marginHorizontal: 5,
	},
	contentProgressBar: {
		width: "100%",
		borderRadius: 5,
	},
	categoryLabel: {
		marginTop: 5,
		fontSize: 12,
		color: "#000",
		textAlign: "center",
	},
});
