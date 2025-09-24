import { useLikePost } from "@/api/feed/likePost";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
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
