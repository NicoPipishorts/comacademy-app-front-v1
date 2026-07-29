import Loader from "@/components/experience/loader";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { FavoriteCitationItemFull } from "@/hooks/Citations/useGetFavoriteCitationsFull";
import { router } from "expo-router";
import { Text } from "react-native";
import FavoriteCard from "./FavoriteCard";

interface Props {
	data: FavoriteCitationItemFull;
}

export default function CardFavoriteCitation({ data }: Props) {
	if (!data) {
		return <Loader />;
	}

	return (
		<FavoriteCard
			title={truncateString(data.citation, 50)}
			titleStyle={{ fontSize: FontSizeH3, fontWeight: "bold" }}
			onPress={() =>
				router.push({
					pathname: "/citations",
					params: { citationCategory: data.category },
				})
			}
			icons={<Text>{data.category}</Text>}
		/>
	);
}
