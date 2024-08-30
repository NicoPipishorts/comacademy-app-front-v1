import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorLightGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import useCategories from "@/hooks/useCategories";
import useGetAllAnswers from "@/hooks/useGetAllAnswers";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import React, { useEffect, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import ScreenHeaders from "../../components/ScreenHeaders";

export default function UserProfile() {
	const { userId } = useUserId();
	const { token, loading: tokenLoading } = useJwtToken();
	const { data: categories } = useCategories();
	const {
		data: answers,
		isFetching,
		refetch,
	} = useGetAllAnswers(userId, token); // Destructure refetch and isFetching from the hook
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = () => {
		setRefreshing(true);
		refetch().finally(() => {
			setTimeout(() => {
				setRefreshing(false);
			}, 2000);
		});
	};

	useEffect(() => {
		// Refetch data every time the component is focused or rendered,
		// but only when the token is available and the token loading is complete
		if (token && !tokenLoading) {
			refetch();
		}
	}, [refetch, token, tokenLoading]);

	const result = answers?.data.reduce((acc, current) => {
		const { categorie, answer } = current.attributes;

		// Initialize the category if it doesn't exist
		if (!acc[categorie]) {
			acc[categorie] = {
				total: 0,
				trueCount: 0,
			};
		}

		// Increment total count for this category
		acc[categorie].total += 1;

		// Increment true count if the answer is true
		if (answer) {
			acc[categorie].trueCount += 1;
		}

		return acc;
	}, {});

	if (!categories || !answers || !result) {
		return <Loader />; // Show Loader while fetching data
	}

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Mon Profil' />
			<ScrollView
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
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

				<View style={styles.cardWrapper}>
					<View style={styles.cardTextContainer}>
						<Text style={styles.cardText}>
							Découvre tes résultats selon les catégories
						</Text>
						<TouchableOpacity style={styles.buttonBlack}>
							<Text style={styles.buttonText}>Voir</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
	},
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
