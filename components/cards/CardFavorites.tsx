import FavoritePlaylist from "@/assets/imgs/icons/FavoritePlaylist.png";
import { Image, View } from "react-native";

export default function CardFavorites() {
	return (
		<View>
			<Image source={FavoritePlaylist} />
		</View>
	);
}
