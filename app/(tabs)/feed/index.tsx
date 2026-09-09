import CardRenderer from "@/components/cards/feed/CardRenderer";
import { useMarkFeedsSeen } from "@/api/feed/markSeen";
import FeedSkeleton from "@/components/experience/FeedSkeleton";
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
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import useAuthSession from "@/hooks/useAuthSession";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	AppState,
	AppStateStatus,
	FlatList,
	ListRenderItem,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedItem } from "@/types/feed";

const isGenericLeJeuFeedCard = (item: FeedItem): boolean =>
	item.type === "question" ||
	(item.type === "feed-post" && item.payload?.Type === "question");

const Feed = () => {
	useTrackRubricOpened("feed");
	const insets = useSafeAreaInsets();
	const { auth } = useAuthSession();
	const [visibleItems, setVisibleItems] = useState<number[]>([]);
	const [isPullRefreshing, setIsPullRefreshing] = useState(false);
	const sessionSeenIdsRef = useRef<Set<number>>(new Set());
	const flushedSeenIdsRef = useRef<Set<number>>(new Set());
	const flushInFlightRef = useRef<Promise<void> | null>(null);

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
		isError,
		error,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useGetFeed({ limit: 10 });
	const { mutateAsync: markFeedsSeen } = useMarkFeedsSeen();

	// Sends the ids seen during this session to the server. Never throws: a
	// failed flush keeps its ids pending so the next flush retries them, and the
	// callers (blur, background, pull-to-refresh) keep going regardless.
	const flushSeenFeedIds = useCallback((): Promise<void> => {
		if (flushInFlightRef.current) {
			return flushInFlightRef.current;
		}

		const pendingFeedIds = Array.from(sessionSeenIdsRef.current).filter(
			(id) => !flushedSeenIdsRef.current.has(id)
		);

		if (!pendingFeedIds.length) {
			return Promise.resolve();
		}

		const flush = (async () => {
			try {
				await markFeedsSeen({ feedIds: pendingFeedIds });
				pendingFeedIds.forEach((id) => {
					flushedSeenIdsRef.current.add(id);
				});
			} catch (error) {
				console.warn("Failed to mark feed items as seen", error);
			} finally {
				flushInFlightRef.current = null;
			}
		})();
		flushInFlightRef.current = flush;
		return flush;
	}, [markFeedsSeen]);

	useFocusEffect(
		useCallback(() => {
			let cancelled = false;
			// Wait for the flush started on the previous blur so the refetch
			// reflects the freshly recorded seen markers.
			void (async () => {
				await flushInFlightRef.current;
				if (!cancelled) {
					await refetch();
				}
			})();
			return () => {
				cancelled = true;
				void flushSeenFeedIds();
			};
		}, [flushSeenFeedIds, refetch])
	);

	// Also flush when the app leaves the foreground, so items seen right before
	// the app is backgrounded or killed still land in the history.
	useEffect(() => {
		const subscription = AppState.addEventListener(
			"change",
			(state: AppStateStatus) => {
				if (state === "background" || state === "inactive") {
					void flushSeenFeedIds();
				}
			}
		);
		return () => {
			subscription.remove();
		};
	}, [flushSeenFeedIds]);

	useEffect(() => {
		sessionSeenIdsRef.current = new Set();
		flushedSeenIdsRef.current = new Set();
	}, [auth?.user?.id]);

	useEffect(() => {
		if (!auth?.user?.id || visibleItems.length === 0) {
			return;
		}

		visibleItems.forEach((id) => {
			sessionSeenIdsRef.current.add(id);
		});
	}, [auth?.user?.id, visibleItems]);

	const feedItems = useMemo(() => {
		const items = data?.pages.flatMap((page) => page.data) ?? [];
		if (items.length <= 1 || !isGenericLeJeuFeedCard(items[0])) {
			return items;
		}

		const firstNonGenericIndex = items.findIndex(
			(item, index) => index > 0 && !isGenericLeJeuFeedCard(item)
		);
		if (firstNonGenericIndex === -1) {
			return items;
		}

		const reordered = [...items];
		[reordered[0], reordered[firstNonGenericIndex]] = [
			reordered[firstNonGenericIndex],
			reordered[0],
		];
		return reordered;
	}, [data?.pages]);

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

	const handleRefresh = useCallback(async () => {
		if (isPullRefreshing) {
			return;
		}

		setIsPullRefreshing(true);
		try {
			await flushSeenFeedIds();
			await refetch();
		} finally {
			setIsPullRefreshing(false);
		}
	}, [flushSeenFeedIds, isPullRefreshing, refetch]);

	if (isLoading) {
		return <FeedSkeleton />;
	}

	if (isError) {
		return (
			<View style={styles.statusWrapper}>
				<Text style={styles.statusTitle}>errorTitle de charger le feed</Text>
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
				style={styles.feedList}
				data={feedItems}
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
				refreshControl={
					<RefreshControl
						refreshing={isPullRefreshing}
						onRefresh={handleRefresh}
						tintColor={colorDarkGrey}
						colors={[colorDarkGrey]}
						progressBackgroundColor={primaryBackground}
						progressViewOffset={8}
					/>
				}
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
	feedList: {
		flex: 1,
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
