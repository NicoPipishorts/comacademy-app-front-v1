import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import {
	AllUsersScoreResponse,
	useGetUsersScore,
	UserScoreData,
} from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import useGetUserInfo from "@/hooks/useUserInfo";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderBoard() {
	const { token } = useJwtToken();
	const { userId: currentUser } = useUserId();
	const insets = useSafeAreaInsets();
	const { isAndroid } = useDeviceTypeCheckers();

	useTrackPageMetrics({ page: "LeaderBoard", token });

	const { data: userData } = useGetUserInfo(currentUser);
	const { data: allScores } = useGetUsersScore(token);

	if (!userData || !allScores) {
		return <Loader />;
	}

	function filterUsersByRole(
		allScores: AllUsersScoreResponse,
		currentRole: string
	): UserScoreData[] {
		// If the current role is "Authenticated", return the entire list
		if (currentRole === "Authenticated") {
			return allScores.data;
		}

		// If the current role is "EducationPro", return all roles that start with "Education"
		if (currentRole === "EducationPro") {
			return allScores.data.filter((user) =>
				user.attributes.user.role.startsWith("Education")
			);
		}

		// Otherwise, filter users by the currentRole
		return allScores.data.filter(
			(user) => user.attributes.user.role === currentRole
		);
	}

	// Find the current user's role
	const currentUserInfo = allScores.data.find(
		(user) => user.attributes.user.userId === currentUser
	);

	const currentRole = currentUserInfo?.attributes.user.role;

	// Get the filtered list of users
	const filteredUsers = filterUsersByRole(allScores, currentRole);

	return (
		<>
			<View
				style={[
					styles.wrapper,
					{
						paddingTop: isAndroid ? insets.top : 20,
						paddingBottom: isAndroid ? 20 : 60,
					},
				]}>
				<ScreenHeaders content='Classement' />
				<ScrollView
					showsVerticalScrollIndicator={false}
					style={{
						marginTop: 20,
						backgroundColor: colorWhite,
						borderRadius: 20,
						flex: 1,
					}}>
					{filteredUsers.map((user) => {
						const isSelected = currentUser === user.attributes.user.userId;

						return (
							<View
								key={user.attributes.user.userId}
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
												{user.attributes.user.firstName}{" "}
												{user.attributes.user.lastName}
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={[styles.resultsText, { color: colorWhite }]}>
												{user.attributes.totalScore}
											</Text>
										</View>
									</LinearGradient>
								) : (
									<View style={styles.resultRow}>
										<View style={{ flexDirection: "row", paddingLeft: 5 }}>
											<Text style={styles.resultsText}>
												{user.attributes.user.firstName}{" "}
												{user.attributes.user.lastName}
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={styles.resultsText}>
												{user.attributes.totalScore}
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
		marginTop: 5,
	},
	resultsText: {
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
