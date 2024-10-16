import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { useGetUsersScore } from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderBoard() {
	const { token } = useJwtToken();
	const { userId: currentUser } = useUserId();
	const insets = useSafeAreaInsets();
	const { isAndroid } = useDeviceTypeCheckers();

	const { data: allScores } = useGetUsersScore(token);

	if (!allScores) {
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
					{allScores.data.map((user) => {
						const isSelected =
							currentUser === Number(user.attributes.user.userId);

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
