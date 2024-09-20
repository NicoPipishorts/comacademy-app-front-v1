import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useGetAllUsers from "@/hooks/useGetAllUsers";
import useGetUsersScore from "@/hooks/useGetUsersScore";
import useUserId from "@/hooks/useUserId";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

export default function LeaderBoard() {
	const { userId: currentUser } = useUserId();
	const insets = useSafeAreaInsets();
	const { isAndroid } = useDeviceTypeCheckers();

	const { data: allScores } = useGetUsersScore();
	const { data: allUsers } = useGetAllUsers();

	if (!allScores || !allUsers) {
		return <Loader />;
	}

	return (
		<>
			<View
				style={[
					styles.wrapper,
					{
						paddingTop: isAndroid ? insets.top : 20,
						paddingBottom: isAndroid ? 120 : 60,
					},
				]}>
				<ScreenHeaders content='Classement' />
				<ScrollView
					style={{
						marginTop: 40,
						paddingTop: 20,
						paddingBottom: 40,
						backgroundColor: colorWhite,
						borderRadius: 20,
					}}>
					{Object.entries(allUsers).map(([userId, userInfo]) => {
						// Find the score for the current userId
						const userScore = allScores.find(
							(score) => score.userId === userId
						);

						const isSelected = currentUser === Number(userId);

						return (
							<View
								key={userId}
								style={{
									borderBottomColor: colorGrey,
									borderBottomWidth: 1,
									marginHorizontal: 20,
								}}>
								{isSelected ? (
									<LinearGradient
										colors={["#D683EF", "#FCA9AC"]}
										start={{ x: 0, y: 0 }} // Start from the left
										end={{ x: 1, y: 0 }} // End at the right
										style={styles.resultRowSelected}>
										<View style={{ flexDirection: "row", paddingLeft: 5 }}>
											<Text style={[styles.resultsText, { color: colorWhite }]}>
												{userInfo.firstName} {userInfo.lastName}
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={[styles.resultsText, { color: colorWhite }]}>
												{userScore ? userScore.count : 0}
											</Text>
										</View>
									</LinearGradient>
								) : (
									<View style={styles.resultRow}>
										<View style={{ flexDirection: "row", paddingLeft: 5 }}>
											<Text style={styles.resultsText}>
												{userInfo.firstName} {userInfo.lastName}
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={styles.resultsText}>
												{userScore ? userScore.count : 0}
											</Text>
										</View>
									</View>
								)}
							</View>
						);
					})}
				</ScrollView>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flexGrow: 1,
		paddingHorizontal: 30,
	},
	resultRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 15,
	},
	resultRowSelected: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 15,
		borderRadius: 10,
		paddingHorizontal: 5,
		marginBottom: 5,
	},
	resultsText: {
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
