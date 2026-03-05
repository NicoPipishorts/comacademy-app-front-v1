import CardRenderer from "@/components/cards/feed/CardRenderer";
import FeedLoader from "@/components/experience/loader";
import FeedCardFooter from "@/components/footers/Feed/CardFooter";
import FeedCardHeader from "@/components/headers/Feed/CardHeader";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import {
	colorDarkGrey,
	colorGrey,
	primaryBackground,
} from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import useGetFeed from "@/hooks/Feed/useGetAllFeed";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import React, { useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	ListRenderItem,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedItem } from "@/types/feed";

const Feed = () => {
	const insets = useSafeAreaInsets();
	const [visibleItems, setVisibleItems] = useState<number[]>([]);

	useTrackPageMetrics({ page: "Feed" });

	// Viewability config
	const viewabilityConfig = {
		itemVisiblePercentThreshold: 50, // At least 50% of the item must be visible
		minimumViewTime: 100, // Minimum time (ms) an item must be visible to count
	};

	// Handle viewable items change
	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			const visibleIds = viewableItems
				.map((item) => item.item as FeedItem)
				.filter((item) => typeof item?.id === "number")
				.map((item) => item.id);
			setVisibleItems(visibleIds);
		}
	).current;

	// Combine config and callback
	const viewabilityConfigCallbackPairs = useRef([
		{ viewabilityConfig, onViewableItemsChanged },
	]);

	// Infinite scroll data hook
	const {
		data,
		isLoading,
		isRefetching,
		isError,
		error,
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
	const renderItem: ListRenderItem<FeedItem> = ({ item }) => {
		return <FeedWrapper feed={item} visibleItems={visibleItems} />;
	};

	if (isLoading) {
		return <FeedLoader />;
	}

	if (isError) {
		return (
			<View style={styles.statusWrapper}>
				<Text style={styles.statusTitle}>Impossible de charger le feed</Text>
				<Text style={styles.statusText}>
					{error?.message || "Une erreur est survenue."}
				</Text>
				<TouchableOpacity
					onPress={() => {
						refetch();
					}}
					style={styles.retryButton}
				>
					<Text style={styles.retryButtonText}>Réessayer</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.wrapper}>
			<PageTitleAvatarHeader
				title='Feed'
				containerStyle={[
					styles.headerWrapper,
					{
						paddingTop: insets.top,
					},
				]}
			/>
			<FlatList
				data={data?.pages.flatMap((page) => page.data) ?? []}
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
				refreshing={isRefetching}
				onRefresh={() => {
					refetch();
				}}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>Aucun contenu pour le moment.</Text>
					</View>
				}
			/>
		</View>
	);
};

// Wrapper for rendering a single feed item
const FeedWrapper = ({
	feed,
	visibleItems,
}: {
	feed: FeedItem;
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
		paddingHorizontal: 24,
	},
	headerWrapper: {
		paddingHorizontal: 24,
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
	statusWrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	statusTitle: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 8,
	},
	statusText: {
		color: colorDarkGrey,
		textAlign: "center",
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: colorDarkGrey,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 20,
	},
	retryButtonText: {
		color: primaryBackground,
		fontWeight: "700",
	},
	emptyState: {
		paddingTop: 40,
		alignItems: "center",
	},
	emptyText: {
		color: colorDarkGrey,
		fontWeight: "600",
	},
});

export default Feed;
