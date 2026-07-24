import Loader from "@/components/experience/loader";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { NavigationType } from "@/types/general";
import { FavoriteMetier } from "@/types/metiers";
import { useNavigation } from "expo-router";
import { Image } from "react-native";
import FavoriteCard, { favoriteCardStyles } from "./FavoriteCard";

interface Props {
	data: FavoriteMetier;
	categoriesColors: { [key: number]: string };
	categoriesIcons: { [key: number]: string };
}

export default function CardFavoriteMetier({
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
			title={truncateString(data.attributes.METIER, 70)}
			titleStyle={{ fontSize: FontSizeH3, fontWeight: "bold" }}
			onPress={() =>
				navigation.navigate("favoriteMetierDetails", { metierId: data.id })
			}
			icons={data.attributes.CATEGORIE?.split(",").map((cat, index) => (
				<Image
					key={index}
					style={[
						favoriteCardStyles.icon,
						{ backgroundColor: `${categoriesColors}` },
					]}
					source={{
						uri: `${process.env.EXPO_PUBLIC_URL}/${categoriesIcons}`,
					}}
				/>
			))}
		/>
	);
}
