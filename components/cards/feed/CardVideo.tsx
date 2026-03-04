import ThumbLikeButton from "@/components/buttons/thumbLike";
import ExpoVideo, {
	CompatVideoStatus,
	ManagedVideoHandle,
} from "@/components/media/ExpoVideo";
import { primaryBackground } from "@/constants/colors";
import { FeedItem } from "@/types/feed";
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
	const video = React.useRef<ManagedVideoHandle | null>(null);
	const [status, setStatus] = React.useState<CompatVideoStatus | null>(null);
	const [videoDimensions, setVideoDimensions] = useState({
		width: 0,
		height: 0,
	});

	useEffect(() => {
		if (status?.didJustFinish && video.current) {
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
				<ExpoVideo
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
					isScreenFocused={true}
					isLooping={false}
					useNativeControls={true}
					resizeMode='contain' // Maintain aspect ratio
					onPlaybackStatusUpdate={(nextStatus) => setStatus(nextStatus)}
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
	container: {
		width: "86%",
		borderRadius: 10,
		overflow: "hidden",
		position: "relative",
	},
});
