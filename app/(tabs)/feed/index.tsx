import AvatarInitials from "@/components/avatars/initials";
import FeedCard10Commandements from "@/components/cards/feed/Card10Commandements";
import FeedCard3Secrets from "@/components/cards/feed/Card3Secrets";
import FeedCardArgh from "@/components/cards/feed/CardArgh";
import FeedCardCitations from "@/components/cards/feed/CardCitations";
import FeedCardDico from "@/components/cards/feed/CardDico";
import FeedCardJeu from "@/components/cards/feed/CardJeu";
import FeedCardMetier from "@/components/cards/feed/CardMetier";
import FeedCardNumber from "@/components/cards/feed/CardNumber";
import Loader from "@/components/experience/loader";
import FeedCardFooter from "@/components/footers/Feed/CardFooter";
import FeedCardHeader from "@/components/headers/Feed/CardHeader";
import {
	colorDarkGrey,
	colorGrey,
	primaryBackground,
} from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import useGetInfiniteFeed from "@/hooks/Feed/useGetAllFeed";
import useUserId from "@/hooks/useUserId";
import useGetUserInfo from "@/hooks/useUserInfo";
import { FeedItem } from "@/types/feed";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Image,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Feed = () => {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { data: userData, isFetched: isFetchedUserData } =
		useGetUserInfo(userId);

	const {
		data: feedData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isFetched,
		refetch,
	} = useGetInfiniteFeed();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refetch(); // Trigger refetch of feed data
		} catch (error) {
			console.error("Error refreshing feed:", error);
		} finally {
			setRefreshing(false);
		}
	};

	const handleScroll = (event: any) => {
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const isBottom =
			layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

		if (isBottom && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	if (isLoading || !isFetched || !isFetchedUserData) {
		return <Loader />;
	}

	const ShowProperCard = (type: string, data: FeedItem, elementId: number) => {
		switch (type) {
			case "citation":
				return <FeedCardCitations data={data} elementId={elementId} />;
			case "commandement":
				return <FeedCard10Commandements data={data} elementId={elementId} />;
			case "dico":
				return <FeedCardDico data={data} elementId={elementId} />;
			case "question": // le jeu
				return <FeedCardJeu data={data} elementId={elementId} />;
			case "secret":
				return <FeedCard3Secrets data={data} elementId={elementId} />;
			case "metier":
				return <FeedCardMetier data={data} elementId={elementId} />;
			case "feed-post":
				switch (data.payload.Icon.split(".")[0]) {
					case "chiffre":
						return <FeedCardNumber data={data} elementId={elementId} />;
					case "argh":
						return <FeedCardArgh data={data} elementId={elementId} />;
					default:
						return null;
				}
			default:
				return null;
		}
	};

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top + 10 }]}>
			<View style={{ marginBottom: 15 }}>
				<Image
					source={require("@/assets/imgs/logos/Login.png")}
					style={{ width: 100, height: 30 }}
					resizeMode='contain'
				/>
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				onScroll={handleScroll}
				contentContainerStyle={{ paddingTop: 25, paddingBottom: 120 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
				<View style={[styles.headerContainer, { alignItems: "center" }]}>
					<Text style={{ fontSize: FontSizeScreenTitles, fontWeight: "bold" }}>
						Feed
					</Text>
					<AvatarInitials
						size={68}
						firstName={userData.firstName}
						lastName={userData.lastName}
					/>
				</View>

				{/* Card Components */}
				{feedData?.pages.map((page) =>
					page.data.map((feed) => {
						return (
							<View
								key={feed.id}
								style={{
									width: "100%",
									borderBottomWidth: 1,
									borderBottomColor: colorGrey,
									paddingVertical: 40,
								}}>
								<FeedCardHeader data={feed} />
								<View style={styles.cardWrapper}>
									{ShowProperCard(feed.type, feed, feed.id)}
								</View>
								<FeedCardFooter data={feed} />
							</View>
						);
					})
				)}

				{/* Loading Indicator for Fetching Next Page */}
				{isFetchingNextPage && (
					<View style={{ marginVertical: 20 }}>
						<ActivityIndicator size='large' />
					</View>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		paddingHorizontal: 25,
		backgroundColor: primaryBackground,
	},
	headerContainer: {
		width: "100%",
		flexShrink: 0,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	cardWrapper: {
		flexShrink: 0,
		alignItems: "center",
		marginTop: 20,
		borderLeftColor: colorDarkGrey,
		borderLeftWidth: 1,
		marginLeft: 23,
	},
});

export default Feed;
