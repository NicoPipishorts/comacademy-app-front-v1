import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/icons/SmallCategroieIcons";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { NavigationType } from "@/types/general";
import { FavoriteMetier } from "@/types/metiers";
import { useNavigation } from "expo-router";
import { View } from "react-native";
import FavoriteCard, { favoriteCardStyles } from "./FavoriteCard";

interface Props {
	data: FavoriteMetier;
}

/** Category icons come from the bundled assets, like the detail screens. */
const renderCategoryIcons = (categories?: string | null) =>
	(categories ?? "")
		.split(",")
		.map((cat) => Number(cat.trim()))
		.filter((cat) => Number.isFinite(cat) && cat > 0)
		.map((cat) => (
			<View key={cat} style={favoriteCardStyles.icon}>
				<SmallCategroieIcons cats={cat} />
			</View>
		));

export default function CardFavoriteMetier({ data }: Props) {
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
			icons={renderCategoryIcons(data.attributes.CATEGORIE)}
		/>
	);
}
