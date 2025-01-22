import ThumbLikeButton from "@/components/buttons/thumbLike";
import { FeedItem } from "@/types/feed";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

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
			: 490;

	return (
		<View>
			<View style={styles.container}>
				<Video
					ref={video}
					source={{
						uri: `${process.env.EXPO_PUBLIC_URL}${data.payload.Media.url}`,
					}}
					style={{
						width: 275, // Fixed width
						height: videoHeight, // Proportional height
					}}
					shouldPlay={visibleItems.includes(data.id)}
					isLooping={false}
					useNativeControls={true}
					resizeMode={ResizeMode.CONTAIN} // Maintain aspect ratio
					onPlaybackStatusUpdate={(status) => setStatus(status)}
					onReadyForDisplay={({ naturalSize }) => {
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
	container: { width: "86%", borderRadius: 10, overflow: "hidden" },
});
