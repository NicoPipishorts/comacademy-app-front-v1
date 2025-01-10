import AvatarInitials from "@/components/avatars/initials";
import FeedCardCitations from "@/components/cards/feed/CardCitations";
import Loader from "@/components/experience/loader";
import FeedCardHeader from "@/components/hreaders/FeedCardHeader";
import { colorDarkGrey, primaryBackground } from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import useGetAllFeed from "@/hooks/Feed/useGetAllFeed";
import useUserId from "@/hooks/useUserId";
import useGetUserInfo from "@/hooks/useUserInfo";
import { FeedAttributes } from "@/types/feed";
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
	const {
		data: feedData,
		isFetched: isFetchedFeedData,
		refetch,
	} = useGetAllFeed();
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

	if (!userData || !feedData || !isFetchedUserData || !isFetchedFeedData) {
		return <Loader />;
	}

	const ShowProperCard = (type: string, data: FeedAttributes) => {
		switch (type) {
			case "citation":
				return <FeedCardCitations data={data} />;

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

				{/* Start of card component */}
				{feedData.data.map((feed) => {
					return (
						<View key={feed.id}>
							<FeedCardHeader data={feed.attributes} />

							<View
								style={{
									flexShrink: 0,
									alignItems: "center",
									marginTop: 20,
									borderLeftColor: colorDarkGrey,
									borderLeftWidth: 1,
									marginLeft: 25,
								}}>
								{ShowProperCard(feed.attributes.type, feed.attributes)}
							</View>
						</View>
					);
				})}

				<View></View>

				{/* End of card component */}
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
});

export default Feed;
