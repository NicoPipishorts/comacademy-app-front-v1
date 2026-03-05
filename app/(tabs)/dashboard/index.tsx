import bonusCard from "@/assets/imgs/cards/dashboardCards/Bonus.png";
import feedbackCard from "@/assets/imgs/cards/dashboardCards/Feedback.png";
import playlistsCard from "@/assets/imgs/cards/dashboardCards/Playlists.png";
import statsCard from "@/assets/imgs/cards/dashboardCards/Stats.png";
import tropheesCard from "@/assets/imgs/cards/dashboardCards/Trophées.png";
import tutosCard from "@/assets/imgs/cards/dashboardCards/Tutos.png";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import useAuthSession from "@/hooks/useAuthSession";
import { resetOnboardingStatus } from "@/services/onboarding/Onboarding";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
	Image,
	ImageSourcePropType,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DashboardCard = {
	id: string;
	source: ImageSourcePropType;
	onPress?: () => void;
};

export default function DashboardScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { width } = useWindowDimensions();
	const { auth } = useAuthSession();

	const horizontalPadding = 10;
	const cardsGap = 8;
	const cardWidth = useMemo(
		() => (width - horizontalPadding * 2 - cardsGap * 2) / 3,
		[width],
	);
	const cardHeight = useMemo(() => cardWidth * (230 / 120), [cardWidth]);

	const handleReplayOnboarding = async () => {
		if (auth?.user?.id) {
			await resetOnboardingStatus(auth.user.id);
		}
		router.replace("/");
	};

	const cards: DashboardCard[] = [
		{ id: "trophees", source: tropheesCard },
		{ id: "bonus", source: bonusCard },
		{
			id: "playlists",
			source: playlistsCard,
			onPress: () => router.push("/playlists"),
		},
		{
			id: "stats",
			source: statsCard,
			onPress: () => router.push("/user/leaderBoard"),
		},
		{
			id: "feedback",
			source: feedbackCard,
			onPress: () => router.push("/feedback"),
		},
		{
			id: "tutos",
			source: tutosCard,
			onPress: () => void handleReplayOnboarding(),
		},
	];

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Board'
				containerStyle={styles.headerContainer}
			/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}>
				<View style={styles.grid}>
					{cards.map((card) => (
						<TouchableOpacity
							key={card.id}
							activeOpacity={card.onPress ? 0.85 : 1}
							onPress={card.onPress}
							disabled={!card.onPress}
							style={[
								styles.cardButton,
								{
									width: cardWidth,
									height: cardHeight,
								},
							]}>
							<Image source={card.source} style={styles.cardImage} />
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		paddingHorizontal: 10,
	},
	scrollContent: {
		paddingTop: 20,
		paddingBottom: 120,
	},
	headerContainer: {
		paddingHorizontal: 14,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		rowGap: 12,
	},
	cardButton: {
		borderRadius: 11,
		overflow: "hidden",
	},
	cardImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
});
