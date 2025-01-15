import AvatarInitials from "@/components/avatars/initials";
import CardRenderer from "@/components/cards/feed/CardRenderer";
import FeedLoader from "@/components/experience/loader";
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
		return <FeedLoader />;
	}

	return (
		<View style={styles.wrapper}>
			<View
				style={[
					styles.headerWrapper,
					{
						paddingTop: insets.top + 10,
					},
				]}>
				<Image
					source={require("@/assets/imgs/logos/Login.png")}
					style={styles.logo}
					resizeMode='contain'
				/>
				<View style={styles.headerRow}>
					<Text style={styles.title}>Feed</Text>
					<AvatarInitials
						size={68}
						firstName={userData.firstName}
						lastName={userData.lastName}
					/>
				</View>
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
				onScroll={handleScroll} // Add this line
				scrollEventThrottle={16} // Set for smooth scroll events
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
				{feedData?.pages.map((page) =>
					page.data.map((feed) => {
						if (feed.payload.Icon === null) {
							return null;
						}
						return <FeedWrapper key={feed.id} feed={feed} />;
					})
				)}
				{isFetchingNextPage && (
					<View style={styles.loadingIndicator}>
						<ActivityIndicator size='large' />
					</View>
				)}
			</ScrollView>
		</View>
	);
};

const FeedWrapper = ({ feed }: { feed: any }) => (
	<View style={styles.feedWrapper}>
		<FeedCardHeader data={feed} />
		<View style={styles.cardWrapper}>
			<CardRenderer type={feed.type} data={feed} elementId={feed.id} />
		</View>
		<FeedCardFooter data={feed} />
	</View>
);

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	scrollContent: {
		paddingBottom: 120,
		paddingHorizontal: 25,
	},
	loadingIndicator: {
		marginVertical: 20,
		alignItems: "center",
	},
	headerWrapper: {
		minWidth: "100%",
		alignItems: "center",
		paddingBottom: 20,
		paddingHorizontal: 25,
	},
	logo: {
		width: 100,
		height: 30,
		marginBottom: 20,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		alignItems: "center",
	},
	title: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	feedWrapper: {
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: colorGrey,
		paddingVertical: 30,
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
