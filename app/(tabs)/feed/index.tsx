import AvatarInitials from "@/components/avatars/initials";
import FeedCard10Commandements from "@/components/cards/feed/Card10Commandements";
import FeedCard3Secrets from "@/components/cards/feed/Card3Secrets";
import FeedCardCitations from "@/components/cards/feed/CardCitations";
import FeedCardDico from "@/components/cards/feed/CardDico";
import FeedCardJeu from "@/components/cards/feed/CardJeu";
import FeedCardMetier from "@/components/cards/feed/CardMetier";
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
import { FeedAttributes } from "@/types/feed";
import React from "react";
import {
	ActivityIndicator,
	Image,
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
	} = useGetInfiniteFeed();

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

	const ShowProperCard = (type: string, data: FeedAttributes) => {
		switch (type) {
			case "citation":
				return <FeedCardCitations data={data} />;
			case "commandement":
				return <FeedCard10Commandements data={data} />;
			case "dico":
				return <FeedCardDico data={data} />;
			case "question": // le jeu
				return <FeedCardJeu data={data} />;
			case "secret":
				return <FeedCard3Secrets data={data} />;
			case "metier":
				return <FeedCardMetier data={data} />;
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
				scrollEventThrottle={16}
				contentContainerStyle={{ paddingTop: 25, paddingBottom: 120 }}>
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
					page.data.map((feed) => (
						<View
							key={feed.id}
							style={{
								width: "100%",
								borderBottomWidth: 1,
								borderBottomColor: colorGrey,
								paddingVertical: 40,
							}}>
							<FeedCardHeader data={feed.attributes} />
							<View style={styles.cardWrapper}>
								{ShowProperCard(feed.attributes.type, feed.attributes)}
							</View>
							<FeedCardFooter data={feed.attributes} />
						</View>
					))
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
