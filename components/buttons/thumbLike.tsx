import { useLikePost } from "@/api/feed/likePost";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import * as Haptics from "expo-haptics";
import { Image, Pressable, StyleSheet } from "react-native";

interface Props {
	elementId: number;
	userLiked: boolean;
}

export default function ThumbLikeButton({ elementId, userLiked }: Props) {
	const { auth } = useAuthSession();
	const { token: authToken } = useJwtToken();
	const onSuccess = () => {
		queryClient.refetchQueries({
			queryKey: ["Feed"],
		});
	};

	const { mutate: likePost } = useLikePost(onSuccess);

	const handleLikePost = () => {
		// Trigger haptic feedback
		if (userLiked) {
			// Light haptic for unlike
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		} else {
			// Medium haptic for like
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}

		likePost({ elementId, userId: auth?.user.id, authToken });
	};

	return (
		<Pressable style={{ marginTop: 20 }} onPress={() => handleLikePost()}>
			<Image
				source={
					userLiked
						? require("@/assets/imgs/icons/thumb-full.png")
						: require("@/assets/imgs/icons/thumb.png")
				}
				style={styles.icon}
				resizeMode='contain'
			/>
		</Pressable>
	);
}
const styles = StyleSheet.create({
	icon: {
		width: 32,
		height: 32,
		marginLeft: 8,
	},
});
