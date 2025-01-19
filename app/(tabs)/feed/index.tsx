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
import useGetFeed from "@/hooks/Feed/useGetAllFeed";
import useUserId from "@/hooks/useUserId";
import useGetUserInfo from "@/hooks/useUserInfo";
import React from "react";
import {
	ActivityIndicator,
	FlatList,
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

	// console.log(userInfo.firstName);
	// Infinite scroll data hook
	const {
		data,
		isLoading,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useGetFeed({ limit: 10 });

	// Footer loader to show during fetching of the next page
	const renderFooter = () => {
		if (isFetchingNextPage) {
			return (
				<View style={styles.loader}>
					<ActivityIndicator size='large' color={colorGrey} />
				</View>
			);
		}
		return null;
	};

	// Render each feed item
	const renderItem = ({ item }: { item: any }) => <FeedWrapper feed={item} />;

	if (isLoading || !isFetchedUserData) {
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
				<Text style={styles.title}>Feed</Text>
				<AvatarInitials
					firstName={userData.firstName}
					lastName={userData.lastName}
					size={68}
				/>
			</View>
			<FlatList
				data={data?.pages.flatMap((page) => page.data)} // Flatten pages to get all items
				extraData={data?.pages.flatMap((page) => page.data)} // Ensures FlatList rerenders on data change
				renderItem={renderItem} // Render individual feed items
				keyExtractor={(item) => item.id.toString()} // Unique key for each item
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					} else {
						console.log("No more pages to fetch or already fetching");
					}
				}}
				onEndReachedThreshold={0.1} // Trigger when 10% away from the end
				ListFooterComponent={renderFooter} // Loader at the bottom
				contentContainerStyle={styles.scrollContent}
				refreshing={isLoading} // Indicate whether the list is currently refreshing
				onRefresh={() => {
					// Add logic to refresh the data here
					refetch(); // Assuming you have a refetch function to reload the data
				}}
			/>
		</View>
	);
};

// Wrapper for rendering a single feed item
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
	headerWrapper: {
		flexDirection: "row",
		justifyContent: "space-between",
		minWidth: "100%",
		alignItems: "center",
		paddingBottom: 20,
		paddingHorizontal: 20,
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
	loader: {
		paddingVertical: 20,
		alignItems: "center",
	},
});

export default Feed;
