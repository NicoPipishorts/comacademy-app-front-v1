import ThumbLikeButton from "@/components/buttons/thumbLike";
import { colorYellow, primaryBackground } from "@/constants/colors";
import { FeedItem } from "@/types/feed";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
	visibleItems: number[];
}

export default function FeedCardVideo({
	data,
	elementId,
	visibleItems,
}: Props) {
	const video = React.useRef<Video | null>(null);
	const [status, setStatus] = React.useState<any>({});
	const [videoDimensions, setVideoDimensions] = useState({
		width: 0,
		height: 0,
	});
	const [isLoading, setIsLoading] = useState(true); // Loading state

	useEffect(() => {
		if (status?.didJustFinish && video.current) {
			// Reset video position to the start
			video.current.setPositionAsync(0);
		}
	}, [status]);

	// Dynamically calculate height based on the fixed width and aspect ratio
	const videoHeight =
		videoDimensions.width > 0 && videoDimensions.height > 0
			? 275 * (videoDimensions.height / videoDimensions.width)
			: 275;

	return (
		<View>
			<View style={styles.container}>
				{isLoading && (
					<View style={styles.loaderContainer}>
						<ActivityIndicator
							size='large'
							color={colorYellow}
							style={{ backgroundColor: primaryBackground }}
						/>
					</View>
				)}
				<Video
					ref={video}
					source={{
						uri: `${data.payload.Media.url}`,
					}}
					style={{
						width: 275,
						height: videoHeight,
						backgroundColor: primaryBackground,
					}}
					shouldPlay={visibleItems.includes(data.id)}
					isLooping={false}
					useNativeControls={true}
					resizeMode={ResizeMode.CONTAIN} // Maintain aspect ratio
					onPlaybackStatusUpdate={(status) => setStatus(status)}
					onLoadStart={() => setIsLoading(true)} // Show loader when loading starts
					onReadyForDisplay={({ naturalSize }) => {
						setIsLoading(false); // Hide loader when ready
						const { width, height } = naturalSize || { width: 0, height: 0 };
						if (width > 0 && height > 0) {
							setVideoDimensions({ width, height });
						}
					}}
				/>
			</View>
			<ThumbLikeButton elementId={elementId} userLiked={data.userLiked} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "86%",
		borderRadius: 10,
		overflow: "hidden",
		position: "relative",
	},
	loaderContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: primaryBackground,
		zIndex: 1,
	},
});
