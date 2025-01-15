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
			await refetch();
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
		<View style={[styles.wrapper, { paddingTop: insets.top + 10 }]}>
			{/* Header */}
			<Header userData={userData} />

			{/* Feed Content */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				onScroll={handleScroll}
				contentContainerStyle={{ paddingTop: 25, paddingBottom: 120 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
				{feedData?.pages.map((page) =>
					page.data.map((feed) => <FeedWrapper key={feed.id} feed={feed} />)
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

const Header = ({ userData }: { userData: any }) => (
	<View style={{ marginBottom: 15 }}>
		<Image
			source={require("@/assets/imgs/logos/Login.png")}
			style={{ width: 100, height: 30 }}
			resizeMode='contain'
		/>
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
	</View>
);

const FeedWrapper = ({ feed }: { feed: any }) => (
	<View
		style={{
			width: "100%",
			borderBottomWidth: 1,
			borderBottomColor: colorGrey,
			paddingVertical: 40,
		}}>
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
