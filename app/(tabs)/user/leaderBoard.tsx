import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useGetAllUsers from "@/hooks/useGetAllUsers";
import useGetUsersScore from "@/hooks/useGetUsersScore";
import useUserId from "@/hooks/useUserId";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderBoard() {
	const { userId: currentUser } = useUserId();
	const insets = useSafeAreaInsets();
	const { isAndroid } = useDeviceTypeCheckers();

	const { data: allScores } = useGetUsersScore();
	const { data: allUsers } = useGetAllUsers();

	if (!allScores || !allUsers) {
		return <Loader />;
	}

	// Step 1: Extract users from allScores with count > 0, preserving the order
	const usersWithScores = allScores
		.filter((score) => score.count > 0) // Only users with count > 0
		.map((score) => ({
			userId: score.userId,
			...allUsers[score.userId], // Get the user data from allUsers
			count: score.count, // Add the count to the user object
		}));

	// Step 2: Get remaining users not included in allScores and sort them by userId
	const remainingUsers = Object.entries(allUsers)
		.filter(([userId]) => !allScores.some((score) => score.userId === userId)) // Exclude users with scores
		.sort(([userIdA], [userIdB]) => Number(userIdA) - Number(userIdB)) // Sort by userId
		.map(([userId, userInfo]) => ({
			userId,
			...userInfo,
			count: 0, // Default count to 0 for users without scores
		}));

	// Step 3: Combine the two lists, users with scores first, then the remaining users
	const orderedUsers = [...usersWithScores, ...remainingUsers];

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
					{orderedUsers.map((user) => {
						const isSelected = currentUser === Number(user.userId);

						return (
							<View
								key={user.userId}
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
												{user.firstName} {user.lastName}
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={[styles.resultsText, { color: colorWhite }]}>
												{user.count}
											</Text>
										</View>
									</LinearGradient>
								) : (
									<View style={styles.resultRow}>
										<View style={{ flexDirection: "row", paddingLeft: 5 }}>
											<Text style={styles.resultsText}>
												{user.firstName} {user.lastName}
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={styles.resultsText}>{user.count}</Text>
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
		marginTop: 5,
	},
	resultsText: {
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
