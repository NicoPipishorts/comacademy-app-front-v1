import Loader from "@/components/experience/loader";
import { FontSize12, FontSize18, FontSizeH1 } from "@/constants/fontsizes";
import useGetPlaylistById from "@/hooks/Playlistss/useGetPlaylistById";
import { NavigationType } from "@/types/general";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import ReturnButton from "@/utils/returnButton";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const PlaylistList = () => {
	const { playlistId } = useLocalSearchParams();
	const navigation = useNavigation<NavigationType>();
	const playlistIdNumber = playlistId ? Number(playlistId) : null;

	const { data: playlistData, isFetched } =
		useGetPlaylistById(playlistIdNumber);

	if (!playlistData && !isFetched) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<Loader />
			</View>
		);
	}

	const playlistContents = playlistData.data.attributes.playlist_contents;

	const handlePress = (type: string, value: number) => {
		switch (type) {
			case "métier":
				navigation.navigate("favoriteMetierDetails", {
					metierId: value,
				});
				break;
			case "dico":
				navigation.navigate("favoriteDicoDetails", {
					dicoId: value,
				});
				break;
			case "question":
				navigation.navigate("favoriteQuestionDetails", {
					questionId: value,
				});
				break;
		}
	};

	return (
		<View style={styles.wrapper}>
			<ReturnButton />

			<View style={styles.headerContainer}>
				<View>
					<PlaylistDisplayImage
						title={playlistData.data.attributes.name}
						image={playlistData.data.attributes.selectedColor}
						width={70}
						height={70}
					/>
				</View>
				<View style={styles.headerTextContainer}>
					<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
						Playlist
					</Text>
					<Text style={{ fontSize: FontSizeH1, fontWeight: "bold" }}>
						{playlistData.data.attributes.name}
					</Text>
					<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
						{playlistContents.length} éléments
					</Text>
				</View>
			</View>

			<View style={styles.contentContainer}>
				{playlistContents.length <= 0 && (
					<View style={styles.contentContainerEmpty}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							Ta playlist est vide.
						</Text>
					</View>
				)}
				{playlistContents.length > 0 && (
					<ScrollView
						contentContainerStyle={{
							paddingTop: 50,
							paddingBottom: 30,
							gap: 25,
						}}
						showsVerticalScrollIndicator={false}>
						{playlistContents.map((content) => {
							return (
								<Pressable
									key={content.id}
									style={{
										flexDirection: "row",
										alignItems: "center",
									}}
									onPress={() => handlePress(content.group, content.itemId)}>
									<View>
										<PlaylistDisplayImage
											image={playlistData.data.attributes.selectedColor}
											width={70}
											height={70}
										/>
									</View>
									<View style={{ gap: 6 }}>
										<Text
											style={{
												fontSize: FontSize18,
												fontWeight: "bold",
												textTransform: "capitalize",
											}}>
											{content.group}
										</Text>
										<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
											{content.value}
										</Text>
									</View>
								</Pressable>
							);
						})}
					</ScrollView>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		padding: 20,
		paddingHorizontal: 25,
		flex: 1,
		alignItems: "flex-start",
		justifyContent: "flex-start",
	},
	returnContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	returnText: {
		marginLeft: 6,
		fontSize: FontSize12,
		fontWeight: "bold",
	},
	headerContainer: {
		display: "flex",
		flexDirection: "row",
		paddingTop: 20,
		paddingBottom: 20,
	},
	headerTextContainer: {
		flexShrink: 1,
		gap: 10,
	},
	contentContainer: {
		flex: 1,
		paddingBottom: 70,
	},
	contentContainerEmpty: {
		flexGrow: 1,
		minWidth: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
});

export default PlaylistList;
