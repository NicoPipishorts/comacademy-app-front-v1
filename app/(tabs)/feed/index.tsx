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
import React, { useRef, useState } from "react";
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
	const [visibleItems, setVisibleItems] = useState<number[]>([]);

	// Viewability config
	const viewabilityConfig = {
		itemVisiblePercentThreshold: 50, // At least 50% of the item must be visible
		minimumViewTime: 100, // Minimum time (ms) an item must be visible to count
	};

	// Handle viewable items change
	const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
		const visibleIds = viewableItems.map((item: any) => item.item.id);
		setVisibleItems(visibleIds);
	}).current;

	// Combine config and callback
	const viewabilityConfigCallbackPairs = useRef([
		{ viewabilityConfig, onViewableItemsChanged },
	]);

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
	const renderItem = ({ item }: { item: any }) => {
		return <FeedWrapper feed={item} visibleItems={visibleItems} />;
	};

	if (isLoading) {
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
				<AvatarInitials size={68} />
			</View>
			<FlatList
				data={data?.pages.flatMap((page) => page.data)}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderItem}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.1} // Trigger when 10% away from the end
				ListFooterComponent={renderFooter} // Loader at the bottom
				viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
				contentContainerStyle={styles.scrollContent}
				refreshing={isLoading} // Indicate whether the list is currently refreshing
				onRefresh={() => {
					refetch();
				}}
			/>
		</View>
	);
};

// Wrapper for rendering a single feed item
const FeedWrapper = ({
	feed,
	visibleItems,
}: {
	feed: any;
	visibleItems: number[];
}) => (
	<View style={styles.feedWrapper}>
		<FeedCardHeader data={feed} />
		<View style={styles.cardWrapper}>
			<CardRenderer
				type={feed.type}
				data={feed}
				elementId={feed.id}
				visibleItems={visibleItems}
			/>
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
