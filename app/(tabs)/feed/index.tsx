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
import useGetAllFeed from "@/hooks/Feed/useGetAllFeed";
import useUserId from "@/hooks/useUserId";
import useGetUserInfo from "@/hooks/useUserInfo";
import React, { useState } from "react";
import {
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

	const { data: feedData, isLoading, isFetched, refetch } = useGetAllFeed();
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
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
				{feedData?.data.map((feed) => {
					if (feed.payload.Type === null) {
						return null;
					}
					return <FeedWrapper key={feed.id} feed={feed} />;
				})}
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
