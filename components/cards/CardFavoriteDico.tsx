import Loader from "@/components/experience/loader";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { DicoFavoritesWord } from "@/types/dico";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { Image } from "react-native";
import FavoriteCard, { favoriteCardStyles } from "./FavoriteCard";

interface Props {
	data: DicoFavoritesWord;
	categoriesColors: { [key: number]: string };
	categoriesIcons: { [key: number]: string };
}

export default function CardFavoriteDico({
	data,
	categoriesColors,
	categoriesIcons,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	if (!data) {
		return <Loader />;
	}

	return (
		<FavoriteCard
			title={truncateString(data.attributes.Word, 70)}
			titleStyle={{ fontSize: FontSizeH3, fontWeight: "bold" }}
			onPress={() =>
				navigation.navigate("favoriteDicoDetails", { dicoId: data.id })
			}
			icons={data.attributes.Categories?.split(",").map((cat, index) => {
				if (!cat) return null;
				return (
					<Image
						key={index}
						style={[
							favoriteCardStyles.icon,
							{ backgroundColor: `${categoriesColors}` },
						]}
						source={{
							uri: `${process.env.EXPO_PUBLIC_URL}${categoriesIcons}`,
						}}
					/>
				);
			})}
		/>
	);
}
