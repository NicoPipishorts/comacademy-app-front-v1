import FloatingTabBar from "@/components/FloatingTabBar";
import UserStatsSkeleton from "@/components/experience/UserStatsSkeleton";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import UserStats from "@/components/user/userStats";
import { primaryBackground } from "@/constants/colors";
import useAuthSession from "@/hooks/useAuthSession";
import { useGetUserScore } from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyStatsScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const userId = auth?.user?.id ?? 0;

	const {
		data: userScore,
		isLoading,
		isFetching,
	} = useGetUserScore(token, userId);

	const handleStatsTabPress = (tabIndex: number) => {
		if (tabIndex === 0) {
			router.replace("/user/leaderBoard");
			return false;
		}
		return 1;
	};

	return (
		<View
			style={[
				styles.wrapper,
				{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
			]}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.content}>
				<PageTitleAvatarHeader title='Mes Stats' />

				{(isLoading || isFetching) && <UserStatsSkeleton />}

				{!isLoading && !isFetching && userScore && (
					<UserStats categoriesScore={userScore} />
				)}

				{!isLoading && !isFetching && !userScore && (
					<Text style={styles.emptyText}>Aucune statistique disponible.</Text>
				)}
			</ScrollView>

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={1}
					setActiveTab={() => {}}
					handlePress={handleStatsTabPress}
					values={{ btn1: "Classement", btn2: "Stats" }}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 24,
		backgroundColor: primaryBackground,
	},
	content: {
		paddingBottom: 190,
	},
	emptyText: {
		paddingTop: 20,
		fontSize: 16,
		fontWeight: "600",
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 145,
		justifyContent: "center",
		alignItems: "center",
	},
});
