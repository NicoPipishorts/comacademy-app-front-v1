import AvatarInitials from "@/components/avatars/initials";
import CardLesCitations from "@/components/cards/CardLesCitations";
import Loader from "@/components/experience/loader";
import { colorDarkGrey, primaryBackground } from "@/constants/colors";
import {
	FontSize14,
	FontSizeH2,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useLesCitations from "@/hooks/useGetLesCitations";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import useGetUserInfo from "@/hooks/useUserInfo";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Feed = () => {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);
	const { token } = useJwtToken();
	const { data: CitationsData, isLoading } = useLesCitations(token);

	if (!userData || !CitationsData) {
		return <Loader />;
	}
	return (
		<View style={[styles.wrapper, { marginTop: insets.top + 10 }]}>
			<View style={{ marginBottom: 15 }}>
				<Image
					source={require("@/assets/imgs/logos/Login.png")}
					style={{ width: 100, height: 30 }}
					resizeMode='contain'
				/>
			</View>
			<ScrollView contentContainerStyle={{ paddingTop: 25 }}>
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

				<View style={{ marginTop: 40 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "flex-start",
							alignItems: "center",
							minWidth: "100%",
						}}>
						<Image
							source={require("@/assets/imgs/icons/feed/citations.png")}
							style={{ width: 48, height: 48, marginRight: 10 }}
							resizeMode='contain'
						/>
						<View
							style={{
								flexGrow: 1,
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
								paddingRight: 10,
							}}>
							<Text style={{ fontSize: FontSizeH2, fontWeight: "bold" }}>
								Feed
							</Text>
							<Text
								style={{
									fontSize: FontSize14,
									fontWeight: "bold",
									color: colorDarkGrey,
								}}>
								21mn
							</Text>
						</View>
					</View>
				</View>

				<View>
					<CardLesCitations citation={CitationsData.data[0]} />
				</View>

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
